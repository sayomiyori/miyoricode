/*
  Adapted from Pavel Dobryakov — WebGL Fluid Simulation
  https://github.com/PavelDoGreat/WebGL-Fluid-Simulation

  MIT License
  Copyright (c) 2017 Pavel Dobryakov
*/

type GL = WebGLRenderingContext | WebGL2RenderingContext;

type RGB = { r: number; g: number; b: number };

type FBO = {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (id: number) => number;
};

type DoubleFBO = {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FBO;
  write: FBO;
  swap: () => void;
};

type UniformMap = Record<string, WebGLUniformLocation | null>;

const CONFIG = {
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 1440,
  DENSITY_DISSIPATION: 0.5,
  VELOCITY_DISSIPATION: 3,
  PRESSURE: 0.1,
  PRESSURE_ITERATIONS: 20,
  CURL: 3,
  SPLAT_RADIUS: 0.2,
  SPLAT_FORCE: 6000,
  SHADING: true,
  COLOR_UPDATE_SPEED: 10,
};

function hsvToRgb(h: number, s: number, v: number): RGB {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r = 0;
  let g = 0;
  let b = 0;
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    default:
      r = v;
      g = p;
      b = q;
  }
  return { r, g, b };
}

/** Same dye scale as toukoum.fr — trails accumulate because dissipation is low. */
function generateColor(): RGB {
  const c = hsvToRgb(Math.random(), 1, 1);
  return { r: c.r * 0.15, g: c.g * 0.15, b: c.b * 0.15 };
}

const RGBA16F = 0x881a;
const RG16F = 0x822f;
const R16F = 0x822d;
const RG = 0x8227;
const RED = 0x1903;
const HALF_FLOAT = 0x140b;

const inited = new WeakSet<HTMLCanvasElement>();

export function initFluid(inputCanvas: HTMLCanvasElement): () => void {
  if (inited.has(inputCanvas)) {
    return () => undefined;
  }
  inited.add(inputCanvas);

  let hostCanvas: HTMLCanvasElement | null = inputCanvas;
  const params = {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false,
  };

  const gl2 = hostCanvas.getContext("webgl2", params) as WebGL2RenderingContext | null;
  const isWebGL2 = Boolean(gl2);
  const rawGl = (gl2 ??
    hostCanvas.getContext("webgl", params) ??
    hostCanvas.getContext("experimental-webgl", params)) as GL | null;

  if (!rawGl) {
    inputCanvas.style.visibility = "hidden";
    inited.delete(inputCanvas);
    hostCanvas = null;
    return () => undefined;
  }

  const gl: GL = rawGl;
  let glRef: GL | null = gl;
  const shaders: WebGLShader[] = [];
  const programs: WebGLProgram[] = [];

  let halfFloat: OES_texture_half_float | null = null;
  let supportLinearFiltering: unknown = null;

  if (isWebGL2) {
    gl.getExtension("EXT_color_buffer_float");
    supportLinearFiltering = gl.getExtension("OES_texture_float_linear");
  } else {
    halfFloat = gl.getExtension("OES_texture_half_float");
    supportLinearFiltering = gl.getExtension("OES_texture_half_float_linear");
  }

  gl.clearColor(0, 0, 0, 0);

  const halfFloatTexType = isWebGL2
    ? HALF_FLOAT
    : (halfFloat?.HALF_FLOAT_OES ?? 0);

  const ext = {
    formatRGBA: isWebGL2
      ? getSupportedFormat(gl, RGBA16F, gl.RGBA, halfFloatTexType)
      : getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType),
    formatRG: isWebGL2
      ? getSupportedFormat(gl, RG16F, RG, halfFloatTexType)
      : getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType),
    formatR: isWebGL2
      ? getSupportedFormat(gl, R16F, RED, halfFloatTexType)
      : getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType),
    halfFloatTexType,
    supportLinearFiltering: Boolean(supportLinearFiltering),
  };

  if (!ext.formatRGBA || !ext.formatRG || !ext.formatR) {
    if (hostCanvas) hostCanvas.style.visibility = "hidden";
    inited.delete(inputCanvas);
    glRef = null;
    hostCanvas = null;
    return () => undefined;
  }

  const shading = ext.supportLinearFiltering ? CONFIG.SHADING : false;
  const dyeResolution = ext.supportLinearFiltering ? CONFIG.DYE_RESOLUTION : 256;

  function compileShader(
    type: number,
    source: string,
    keywords: string[] | null = null,
  ): WebGLShader {
    let src = source;
    if (keywords) {
      src = `${keywords.map((k) => `#define ${k}`).join("\n")}\n${source}`;
    }
    const shader = gl!.createShader(type);
    if (!shader) throw new Error("Failed to create shader");
    gl!.shaderSource(shader, src);
    gl!.compileShader(shader);
    shaders.push(shader);
    return shader;
  }

  function createProgram(vs: WebGLShader, fs: WebGLShader): WebGLProgram {
    const program = gl!.createProgram();
    if (!program) throw new Error("Failed to create program");
    gl!.attachShader(program, vs);
    gl!.attachShader(program, fs);
    gl!.linkProgram(program);
    programs.push(program);
    return program;
  }

  function getUniforms(program: WebGLProgram): UniformMap {
    const uniforms: UniformMap = {};
    const count = gl!.getProgramParameter(program, gl!.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < count; i += 1) {
      const info = gl!.getActiveUniform(program, i);
      if (!info) continue;
      uniforms[info.name] = gl!.getUniformLocation(program, info.name);
    }
    return uniforms;
  }

  class Program {
    program: WebGLProgram;
    uniforms: UniformMap;

    constructor(vs: WebGLShader, fs: WebGLShader) {
      this.program = createProgram(vs, fs);
      this.uniforms = getUniforms(this.program);
    }

    bind() {
      gl!.useProgram(this.program);
    }
  }

  class Material {
    vertexShader: WebGLShader;
    fragmentShaderSource: string;
    programs: Record<number, WebGLProgram> = {};
    activeProgram: WebGLProgram | null = null;
    uniforms: UniformMap = {};

    constructor(vertexShader: WebGLShader, fragmentShaderSource: string) {
      this.vertexShader = vertexShader;
      this.fragmentShaderSource = fragmentShaderSource;
    }

    setKeywords(keywords: string[]) {
      let hash = 0;
      for (const word of keywords) hash += hashCode(word);
      let program = this.programs[hash];
      if (!program) {
        const fs = compileShader(
          gl!.FRAGMENT_SHADER,
          this.fragmentShaderSource,
          keywords,
        );
        program = createProgram(this.vertexShader, fs);
        this.programs[hash] = program;
      }
      if (program === this.activeProgram) return;
      this.uniforms = getUniforms(program);
      this.activeProgram = program;
    }

    bind() {
      if (this.activeProgram) gl!.useProgram(this.activeProgram);
    }
  }

  const baseVertexShader = compileShader(
    gl.VERTEX_SHADER,
    `
    precision highp float;
    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 texelSize;
    void main () {
      vUv = aPosition * 0.5 + 0.5;
      vL = vUv - vec2(texelSize.x, 0.0);
      vR = vUv + vec2(texelSize.x, 0.0);
      vT = vUv + vec2(0.0, texelSize.y);
      vB = vUv - vec2(0.0, texelSize.y);
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `,
  );

  const copyShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    void main () {
      gl_FragColor = texture2D(uTexture, vUv);
    }
  `,
  );

  const clearShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;
    void main () {
      gl_FragColor = value * texture2D(uTexture, vUv);
    }
  `,
  );

  const displayShaderSource = `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform vec2 texelSize;
    void main () {
      vec3 c = texture2D(uTexture, vUv).rgb;
      #ifdef SHADING
      vec3 lc = texture2D(uTexture, vL).rgb;
      vec3 rc = texture2D(uTexture, vR).rgb;
      vec3 tc = texture2D(uTexture, vT).rgb;
      vec3 bc = texture2D(uTexture, vB).rgb;
      float dx = length(rc) - length(lc);
      float dy = length(tc) - length(bc);
      vec3 n = normalize(vec3(dx, dy, length(texelSize)));
      vec3 l = vec3(0.0, 0.0, 1.0);
      float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
      c *= diffuse;
      #endif
      float a = max(c.r, max(c.g, c.b));
      gl_FragColor = vec4(c, a);
    }
  `;

  const splatShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;
    void main () {
      vec2 p = vUv - point.xy;
      p.x *= aspectRatio;
      vec3 splat = exp(-dot(p, p) / radius) * color;
      vec3 base = texture2D(uTarget, vUv).xyz;
      gl_FragColor = vec4(base + splat, 1.0);
    }
  `,
  );

  const advectionShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform vec2 dyeTexelSize;
    uniform float dt;
    uniform float dissipation;
    vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
      vec2 st = uv / tsize - 0.5;
      vec2 iuv = floor(st);
      vec2 fuv = fract(st);
      vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
      vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
      vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
      vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
      return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
    }
    void main () {
      #ifdef MANUAL_FILTERING
      vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
      vec4 result = bilerp(uSource, coord, dyeTexelSize);
      #else
      vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
      vec4 result = texture2D(uSource, coord);
      #endif
      float decay = 1.0 + dissipation * dt;
      gl_FragColor = result / decay;
    }
  `,
    ext.supportLinearFiltering ? null : ["MANUAL_FILTERING"],
  );

  const divergenceShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).x;
      float R = texture2D(uVelocity, vR).x;
      float T = texture2D(uVelocity, vT).y;
      float B = texture2D(uVelocity, vB).y;
      vec2 C = texture2D(uVelocity, vUv).xy;
      if (vL.x < 0.0) { L = -C.x; }
      if (vR.x > 1.0) { R = -C.x; }
      if (vT.y > 1.0) { T = -C.y; }
      if (vB.y < 0.0) { B = -C.y; }
      float div = 0.5 * (R - L + T - B);
      gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
  `,
  );

  const curlShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).y;
      float R = texture2D(uVelocity, vR).y;
      float T = texture2D(uVelocity, vT).x;
      float B = texture2D(uVelocity, vB).x;
      float vorticity = R - L - T + B;
      gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }
  `,
  );

  const vorticityShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;
    void main () {
      float L = texture2D(uCurl, vL).x;
      float R = texture2D(uCurl, vR).x;
      float T = texture2D(uCurl, vT).x;
      float B = texture2D(uCurl, vB).x;
      float C = texture2D(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force /= length(force) + 0.0001;
      force *= curl * C;
      force.y *= -1.0;
      vec2 velocity = texture2D(uVelocity, vUv).xy;
      velocity += force * dt;
      velocity = min(max(velocity, -1000.0), 1000.0);
      gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
  `,
  );

  const pressureShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      float divergence = texture2D(uDivergence, vUv).x;
      float pressure = (L + R + B + T - divergence) * 0.25;
      gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
  `,
  );

  const gradientSubtractShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      vec2 velocity = texture2D(uVelocity, vUv).xy;
      velocity.xy -= vec2(R - L, T - B);
      gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
  `,
  );

  const vertexBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();
  const blit = (() => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      gl.STATIC_DRAW,
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array([0, 1, 2, 0, 2, 3]),
      gl.STATIC_DRAW,
    );
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    return (target: FBO | null, clear = false) => {
      if (!target) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      }
      if (clear) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };
  })();

  function createFBO(
    w: number,
    h: number,
    internalFormat: number,
    format: number,
    type: number,
    param: number,
  ): FBO {
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    if (!texture) throw new Error("Failed to create texture");
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

    const fbo = gl.createFramebuffer();
    if (!fbo) throw new Error("Failed to create framebuffer");
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0,
    );
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return {
      texture,
      fbo,
      width: w,
      height: h,
      texelSizeX: 1 / w,
      texelSizeY: 1 / h,
      attach(id: number) {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      },
    };
  }

  function createDoubleFBO(
    w: number,
    h: number,
    internalFormat: number,
    format: number,
    type: number,
    param: number,
  ): DoubleFBO {
    let fbo1 = createFBO(w, h, internalFormat, format, type, param);
    let fbo2 = createFBO(w, h, internalFormat, format, type, param);
    return {
      width: w,
      height: h,
      texelSizeX: fbo1.texelSizeX,
      texelSizeY: fbo1.texelSizeY,
      get read() {
        return fbo1;
      },
      set read(value) {
        fbo1 = value;
      },
      get write() {
        return fbo2;
      },
      set write(value) {
        fbo2 = value;
      },
      swap() {
        const tmp = fbo1;
        fbo1 = fbo2;
        fbo2 = tmp;
      },
    };
  }

  const copyProgram = new Program(baseVertexShader, copyShader);
  const clearProgram = new Program(baseVertexShader, clearShader);
  const splatProgram = new Program(baseVertexShader, splatShader);
  const advectionProgram = new Program(baseVertexShader, advectionShader);
  const divergenceProgram = new Program(baseVertexShader, divergenceShader);
  const curlProgram = new Program(baseVertexShader, curlShader);
  const vorticityProgram = new Program(baseVertexShader, vorticityShader);
  const pressureProgram = new Program(baseVertexShader, pressureShader);
  const gradientSubtractProgram = new Program(
    baseVertexShader,
    gradientSubtractShader,
  );
  const displayMaterial = new Material(baseVertexShader, displayShaderSource);
  displayMaterial.setKeywords(shading ? ["SHADING"] : []);

  function resizeFBO(
    target: FBO,
    w: number,
    h: number,
    internalFormat: number,
    format: number,
    type: number,
    param: number,
  ): FBO {
    const next = createFBO(w, h, internalFormat, format, type, param);
    copyProgram.bind();
    gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
    blit(next);
    return next;
  }

  function resizeDoubleFBO(
    target: DoubleFBO,
    w: number,
    h: number,
    internalFormat: number,
    format: number,
    type: number,
    param: number,
  ): DoubleFBO {
    if (target.width === w && target.height === h) return target;
    target.read = resizeFBO(
      target.read,
      w,
      h,
      internalFormat,
      format,
      type,
      param,
    );
    target.write = createFBO(w, h, internalFormat, format, type, param);
    target.width = w;
    target.height = h;
    target.texelSizeX = 1 / w;
    target.texelSizeY = 1 / h;
    return target;
  }

  function getResolution(resolution: number) {
    let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspectRatio < 1) aspectRatio = 1 / aspectRatio;
    const min = Math.round(resolution);
    const max = Math.round(resolution * aspectRatio);
    if (gl.drawingBufferWidth > gl.drawingBufferHeight) {
      return { width: max, height: min };
    }
    return { width: min, height: max };
  }

  let dye!: DoubleFBO;
  let velocity!: DoubleFBO;
  let divergence!: FBO;
  let curl!: FBO;
  let pressure!: DoubleFBO;

  function initFramebuffers() {
    const simRes = getResolution(CONFIG.SIM_RESOLUTION);
    const dyeRes = getResolution(dyeResolution);
    const texType = ext.halfFloatTexType;
    const rgba = ext.formatRGBA!;
    const rg = ext.formatRG!;
    const r = ext.formatR!;
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
    gl.disable(gl.BLEND);

    if (!dye) {
      dye = createDoubleFBO(
        dyeRes.width,
        dyeRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering,
      );
    } else {
      dye = resizeDoubleFBO(
        dye,
        dyeRes.width,
        dyeRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering,
      );
    }

    if (!velocity) {
      velocity = createDoubleFBO(
        simRes.width,
        simRes.height,
        rg.internalFormat,
        rg.format,
        texType,
        filtering,
      );
    } else {
      velocity = resizeDoubleFBO(
        velocity,
        simRes.width,
        simRes.height,
        rg.internalFormat,
        rg.format,
        texType,
        filtering,
      );
    }

    divergence = createFBO(
      simRes.width,
      simRes.height,
      r.internalFormat,
      r.format,
      texType,
      gl.NEAREST,
    );
    curl = createFBO(
      simRes.width,
      simRes.height,
      r.internalFormat,
      r.format,
      texType,
      gl.NEAREST,
    );
    pressure = createDoubleFBO(
      simRes.width,
      simRes.height,
      r.internalFormat,
      r.format,
      texType,
      gl.NEAREST,
    );
  }

  function scaleByPixelRatio(value: number) {
    const ratio = window.devicePixelRatio || 1;
    return Math.floor(value * ratio);
  }

  function resizeCanvas() {
    const node = hostCanvas;
    if (!node) return false;
    const width = Math.max(
      1,
      scaleByPixelRatio(node.clientWidth || window.innerWidth || 1),
    );
    const height = Math.max(
      1,
      scaleByPixelRatio(node.clientHeight || window.innerHeight || 1),
    );
    if (node.width !== width || node.height !== height) {
      node.width = width;
      node.height = height;
      return true;
    }
    return false;
  }

  resizeCanvas();
  try {
    initFramebuffers();
  } catch {
    ext.formatRGBA = { internalFormat: gl.RGBA, format: gl.RGBA };
    ext.formatRG = { internalFormat: gl.RGBA, format: gl.RGBA };
    ext.formatR = { internalFormat: gl.RGBA, format: gl.RGBA };
    ext.halfFloatTexType = gl.UNSIGNED_BYTE;
    ext.supportLinearFiltering = true;
    dye = undefined as unknown as DoubleFBO;
    velocity = undefined as unknown as DoubleFBO;
    initFramebuffers();
  }

  const pointer = {
    texcoordX: 0,
    texcoordY: 0,
    prevTexcoordX: 0,
    prevTexcoordY: 0,
    deltaX: 0,
    deltaY: 0,
    down: false,
    moved: false,
    color: generateColor(),
  };

  function canvasSize() {
    const node = hostCanvas;
    if (!node) return { width: 1, height: 1 };
    return { width: node.width, height: node.height };
  }

  function correctDeltaX(delta: number) {
    const { width, height } = canvasSize();
    const aspectRatio = width / height;
    return aspectRatio < 1 ? delta * aspectRatio : delta;
  }

  function correctDeltaY(delta: number) {
    const { width, height } = canvasSize();
    const aspectRatio = width / height;
    return aspectRatio > 1 ? delta / aspectRatio : delta;
  }

  function correctRadius(radius: number) {
    const { width, height } = canvasSize();
    const aspectRatio = width / height;
    return aspectRatio > 1 ? radius * aspectRatio : radius;
  }

  function eventToCanvasPos(event: MouseEvent) {
    const node = hostCanvas;
    if (!node) return { x: 0, y: 0 };
    const rect = node.getBoundingClientRect();
    return {
      x: scaleByPixelRatio(event.clientX - rect.left),
      y: scaleByPixelRatio(event.clientY - rect.top),
    };
  }

  function updatePointerMoveData(posX: number, posY: number) {
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    const size = canvasSize();
    pointer.texcoordX = posX / size.width;
    pointer.texcoordY = 1 - posY / size.height;
    pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
    pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
    // Sticky until RAF consumes it — a second event at the same point
    // (delta 0) must not clear a real move from earlier in the frame.
    pointer.moved =
      pointer.moved ||
      Math.abs(pointer.deltaX) > 0 ||
      Math.abs(pointer.deltaY) > 0;
  }

  function splat(x: number, y: number, dx: number, dy: number, color: RGB) {
    splatProgram.bind();
    gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
    const { width, height } = canvasSize();
    gl.uniform1f(splatProgram.uniforms.aspectRatio, width / height);
    gl.uniform2f(splatProgram.uniforms.point, x, y);
    gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0);
    gl.uniform1f(
      splatProgram.uniforms.radius,
      correctRadius(CONFIG.SPLAT_RADIUS / 100),
    );
    blit(velocity.write);
    velocity.swap();

    gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
    gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
    blit(dye.write);
    dye.swap();
  }

  function onMouseMove(event: MouseEvent) {
    const { x, y } = eventToCanvasPos(event);
    pointer.down = true;
    updatePointerMoveData(x, y);
  }

  function step(dt: number) {
    gl.disable(gl.BLEND);

    curlProgram.bind();
    gl.uniform2f(
      curlProgram.uniforms.texelSize,
      velocity.texelSizeX,
      velocity.texelSizeY,
    );
    gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(curl);

    vorticityProgram.bind();
    gl.uniform2f(
      vorticityProgram.uniforms.texelSize,
      velocity.texelSizeX,
      velocity.texelSizeY,
    );
    gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
    gl.uniform1f(vorticityProgram.uniforms.curl, CONFIG.CURL);
    gl.uniform1f(vorticityProgram.uniforms.dt, dt);
    blit(velocity.write);
    velocity.swap();

    divergenceProgram.bind();
    gl.uniform2f(
      divergenceProgram.uniforms.texelSize,
      velocity.texelSizeX,
      velocity.texelSizeY,
    );
    gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence);

    clearProgram.bind();
    gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(clearProgram.uniforms.value, CONFIG.PRESSURE);
    blit(pressure.write);
    pressure.swap();

    pressureProgram.bind();
    gl.uniform2f(
      pressureProgram.uniforms.texelSize,
      velocity.texelSizeX,
      velocity.texelSizeY,
    );
    gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
    for (let i = 0; i < CONFIG.PRESSURE_ITERATIONS; i += 1) {
      gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write);
      pressure.swap();
    }

    gradientSubtractProgram.bind();
    gl.uniform2f(
      gradientSubtractProgram.uniforms.texelSize,
      velocity.texelSizeX,
      velocity.texelSizeY,
    );
    gl.uniform1i(
      gradientSubtractProgram.uniforms.uPressure,
      pressure.read.attach(0),
    );
    gl.uniform1i(
      gradientSubtractProgram.uniforms.uVelocity,
      velocity.read.attach(1),
    );
    blit(velocity.write);
    velocity.swap();

    advectionProgram.bind();
    gl.uniform2f(
      advectionProgram.uniforms.texelSize,
      velocity.texelSizeX,
      velocity.texelSizeY,
    );
    if (!ext.supportLinearFiltering) {
      gl.uniform2f(
        advectionProgram.uniforms.dyeTexelSize,
        velocity.texelSizeX,
        velocity.texelSizeY,
      );
    }
    const velocityId = velocity.read.attach(0);
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
    gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
    gl.uniform1f(advectionProgram.uniforms.dt, dt);
    gl.uniform1f(
      advectionProgram.uniforms.dissipation,
      CONFIG.VELOCITY_DISSIPATION,
    );
    blit(velocity.write);
    velocity.swap();

    if (!ext.supportLinearFiltering) {
      gl.uniform2f(
        advectionProgram.uniforms.dyeTexelSize,
        dye.texelSizeX,
        dye.texelSizeY,
      );
    }
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
    gl.uniform1f(
      advectionProgram.uniforms.dissipation,
      CONFIG.DENSITY_DISSIPATION,
    );
    blit(dye.write);
    dye.swap();
  }

  function render() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    displayMaterial.bind();
    if (shading) {
      gl.uniform2f(
        displayMaterial.uniforms.texelSize,
        1 / gl.drawingBufferWidth,
        1 / gl.drawingBufferHeight,
      );
    }
    gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
    blit(null);
  }

  let lastUpdateTime = Date.now();
  let rafId = 0;
  let running = true;
  let colorUpdateTimer = 0;

  function update() {
    if (!running) return;
    const now = Date.now();
    const dt = Math.min((now - lastUpdateTime) / 1000, 0.016666);
    lastUpdateTime = now;

    if (resizeCanvas()) initFramebuffers();
    colorUpdateTimer += dt * CONFIG.COLOR_UPDATE_SPEED;
    if (colorUpdateTimer >= 1) {
      colorUpdateTimer %= 1;
      pointer.color = generateColor();
    }
    if (pointer.moved) {
      pointer.moved = false;
      splat(
        pointer.texcoordX,
        pointer.texcoordY,
        pointer.deltaX * CONFIG.SPLAT_FORCE,
        pointer.deltaY * CONFIG.SPLAT_FORCE,
        pointer.color,
      );
    }
    step(dt);
    render();
    rafId = requestAnimationFrame(update);
  }

  function onResize() {
    if (resizeCanvas()) initFramebuffers();
  }

  const moveOpts: AddEventListenerOptions = { capture: true, passive: true };
  window.addEventListener("pointermove", onMouseMove, moveOpts);
  window.addEventListener("resize", onResize);
  rafId = requestAnimationFrame(update);

  function destroyFBO(target: FBO | undefined) {
    if (!target || !gl) return;
    gl.deleteTexture(target.texture);
    gl.deleteFramebuffer(target.fbo);
  }

  function destroyDoubleFBO(target: DoubleFBO | undefined) {
    if (!target) return;
    destroyFBO(target.read);
    destroyFBO(target.write);
  }

  return () => {
    running = false;
    cancelAnimationFrame(rafId);
    window.removeEventListener("pointermove", onMouseMove, moveOpts);
    window.removeEventListener("resize", onResize);

    if (glRef) {
      glRef.bindFramebuffer(glRef.FRAMEBUFFER, null);
      glRef.bindTexture(glRef.TEXTURE_2D, null);
      glRef.useProgram(null);
      destroyDoubleFBO(dye);
      destroyDoubleFBO(velocity);
      destroyFBO(divergence);
      destroyFBO(curl);
      destroyDoubleFBO(pressure);
      for (const program of programs) {
        glRef.deleteProgram(program);
      }
      for (const shader of shaders) {
        glRef.deleteShader(shader);
      }
      if (vertexBuffer) glRef.deleteBuffer(vertexBuffer);
      if (indexBuffer) glRef.deleteBuffer(indexBuffer);
      // Do not loseContext(): Strict Mode remounts the same canvas, and
      // getContext() then returns the already-lost handle forever.
    }

    dye = undefined as unknown as DoubleFBO;
    velocity = undefined as unknown as DoubleFBO;
    divergence = undefined as unknown as FBO;
    curl = undefined as unknown as FBO;
    pressure = undefined as unknown as DoubleFBO;
    programs.length = 0;
    shaders.length = 0;
    glRef = null;
    hostCanvas = null;
    inited.delete(inputCanvas);
  };
}

function getSupportedFormat(
  gl: GL,
  internalFormat: number,
  format: number,
  type: number,
): { internalFormat: number; format: number } | null {
  if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
    if (internalFormat === R16F) {
      return getSupportedFormat(gl, RG16F, RG, type);
    }
    if (internalFormat === RG16F) {
      return getSupportedFormat(gl, RGBA16F, gl.RGBA, type);
    }
    return null;
  }
  return { internalFormat, format };
}

function supportRenderTextureFormat(
  gl: GL,
  internalFormat: number,
  format: number,
  type: number,
) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0,
  );
  return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
}

function hashCode(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
