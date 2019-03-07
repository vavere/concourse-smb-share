const tap = require('tap');
const resource = require('../lib/resource');

tap.test('test resource', async function (tap) {
  const validInput = {source:{path:'//server/share/glob'}};
  // check modes
  await tap.resolves(resource('check', validInput), 'test mode: check');
  await tap.resolves(resource('in', validInput), 'test mode: in');
  await tap.resolves(resource('out', validInput), 'test mode: out');
  await tap.rejects(resource('index.js', validInput), 'test wrong mode: index.js');

}).catch(tap.threw);


