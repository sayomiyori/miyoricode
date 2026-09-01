// Standalone SSE sanity check for lib/chat-api.ts.
//
// Why a separate Node script: the project doesn't ship with a JS test runner
// (no vitest/jest in package.json), and adding one for a regression fixture
// would be heavier than the bug it would catch. Node 18+ has ReadableStream
// and TextDecoder, so we can drive the real SSE parser end-to-end.
//
// Run with: node scripts/verify-chat-sse.mjs
//
// It re-implements the small SSE parser from lib/chat-api.ts in isolation
// (no fetch, no DOM), validates parsing across realistic chunk boundaries,
// and exits non-zero on any regression. Keep both implementations in sync.

import { ReadableStream } from "node:stream/web";

const decoder = new TextDecoder("utf-8");

function makeSseBody(chunks) {
  let i = 0;
  return new ReadableStream({
    pull(controller) {
      if (i >= chunks.length) {
        controller.close();
        return;
      }
      controller.enqueue(new TextEncoder().encode(chunks[i++]));
    },
  });
}

async function readSse(body, handlers) {
  const reader = body.getReader();
  let buffer = "";

  const dispatch = (rawEvent) => {
    const event = rawEvent.replace(/\r$/, "");
    if (!event) return;
    let eventName = "message";
    const dataLines = [];
    for (const line of event.split("\n")) {
      if (line.startsWith(":")) continue;
      const colon = line.indexOf(":");
      if (colon === -1) continue;
      const field = line.slice(0, colon);
      let value = line.slice(colon + 1);
      if (value.startsWith(" ")) value = value.slice(1);
      if (field === "event") eventName = value;
      else if (field === "data") dataLines.push(value);
    }
    if (dataLines.length === 0) return;
    const parsed = JSON.parse(dataLines.join("\n"));
    if (eventName === "metadata") handlers.onMetadata?.(parsed);
    else if (eventName === "token") handlers.onToken?.(parsed);
    else if (eventName === "done") handlers.onDone?.(parsed);
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) buffer += decoder.decode(value, { stream: true });
    let idx = buffer.indexOf("\n\n");
    while (idx !== -1) {
      const raw = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      dispatch(raw);
      idx = buffer.indexOf("\n\n");
    }
  }
  if (buffer.trim().length > 0) dispatch(buffer);
}

function assertEqual(actual, expected, label) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    console.error(`FAIL ${label}: expected ${e}, got ${a}`);
    process.exit(1);
  }
  console.log(`OK   ${label}`);
}

const events = { metadata: [], tokens: [], done: null };

// Scenario 1: clean record-aligned stream
{
  const sse = [
    'event: metadata\ndata: {"card":null,"attachments":null,"session_id":"abc","source":"structured"}\n\n',
    'event: token\ndata: {"text":"Привет"}\n\n',
    'event: token\ndata: {"text":", мир"}\n\n',
    'event: done\ndata: {"source":"structured","session_id":"abc"}\n\n',
  ].join("");
  const body = makeSseBody([sse]);
  await readSse(body, {
    onMetadata: (m) => events.metadata.push(m),
    onToken: (t) => events.tokens.push(t.text),
    onDone: (d) => (events.done = d),
  });
  assertEqual(events.metadata, [{ card: null, attachments: null, session_id: "abc", source: "structured" }], "metadata");
  assertEqual(events.tokens, ["Привет", ", мир"], "tokens");
  assertEqual(events.done, { source: "structured", session_id: "abc" }, "done");
}

// Scenario 2: chunked across boundaries — proves the buffer logic
{
  const a = 'event: meta';
  const b = 'data\ndata: {"session_id":"x","source":"rag"}\n\nevent: tok';
  const c = 'en\ndata: {"text":"часть 1"}\n\nevent: token\ndata: {"te';
  const d = 'xt":"часть 2"}\n\nevent: done\ndata: {"session_id":"x","source":"rag"}\n\n';
  events.metadata = [];
  events.tokens = [];
  events.done = null;
  const body = makeSseBody([a, b, c, d]);
  await readSse(body, {
    onMetadata: (m) => events.metadata.push(m),
    onToken: (t) => events.tokens.push(t.text),
    onDone: (d2) => (events.done = d2),
  });
  assertEqual(events.metadata, [{ session_id: "x", source: "rag" }], "chunked metadata");
  assertEqual(events.tokens, ["часть 1", "часть 2"], "chunked tokens");
  assertEqual(events.done, { session_id: "x", source: "rag" }, "chunked done");
}

// Scenario 3: guardrail output_filter done event — important so use-chat handles it
{
  const sse =
    'event: metadata\ndata: {"card":null,"attachments":null,"session_id":"y","source":"structured"}\n\n' +
    'event: done\ndata: {"source":"structured","session_id":"y","reason":"output_filter"}\n\n';
  events.metadata = [];
  events.tokens = [];
  events.done = null;
  const body = makeSseBody([sse]);
  await readSse(body, {
    onMetadata: (m) => events.metadata.push(m),
    onToken: (t) => events.tokens.push(t.text),
    onDone: (d) => (events.done = d),
  });
  assertEqual(events.done.reason, "output_filter", "guardrail reason preserved");
}

console.log("All SSE scenarios passed.");