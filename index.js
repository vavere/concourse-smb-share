#!/usr/bin/env node

const path = require('path');
const getStdin = require('./lib/get-stdin');
const resource = require('./lib/resource');

//Thin wrapper arround concourse resource interface
(async () => {
  try {
    console.log = console.warn; // log to stderr
    const mode = path.basename(process.argv[1]);
    const input = JSON.parse(await getStdin() || null);
    const dest = process.argv[2] || null;
    const output = JSON.stringify(await resource(mode, input, dest) || null);
    console.info(output);  // output o stdout
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  }
})();
