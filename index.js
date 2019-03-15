#!/usr/bin/env node

const path = require('path');
const resource = require('./lib/resource');

//Thin wrapper arround concourse resource interface
(async () => {
  try {
    console.info = console.warn; // info to stderr, log if debug
    console.log = (...args) => console.debug ? console.info(...args) : null;
    const mode = path.basename(process.argv[1]);
    const input = JSON.parse(await stdin());
    const dest = process.argv[2] || null;
    const output = JSON.stringify(await resource(mode, input, dest) || null);
    console.info(output);  // output o stdout
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  }
})();

// read all from stdin
async function stdin() {
  if (process.stdin.isTTY) return null;
  let buffer = Buffer.alloc(0);
  for await (const chunk of process.stdin)
    buffer = Buffer.concat([buffer, chunk]);
  return buffer.toString('utf8');
}