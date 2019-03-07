const tap = require('tap');
const parseInput = require('../lib/parse-path');

tap.test('test parse input', function (tap) {

  tap.throws(() => parseInput(null), 'null input');
  tap.throws(() => parseInput(''), 'epmty path');
  tap.throws(() => parseInput('server'), 'wrong path');
  tap.throws(() => parseInput('server/share'), 'wrong path 2');
  tap.throws(() => parseInput('server/share/glob'), 'wrong path 3');
  tap.throws(() => parseInput('/server/share/glob'), 'wrong path 4');

  tap.same(parseInput('//server/share'), {service: '//server/share', dir: null, file: null});
  tap.same(parseInput('//server/share/file'), {service: '//server/share', dir: null, file: 'file'});
  tap.same(parseInput('//server/share/dir/file'), {service: '//server/share', dir: 'dir', file: 'file'});
  tap.same(parseInput('//server/share/dir1/dir2/file'), {service: '//server/share', dir: 'dir1/dir2', file: 'file'});
  tap.same(parseInput('//server/share/dir1/dir2/dir3/file'), {service: '//server/share', dir: 'dir1/dir2/dir3', file: 'file'});
  tap.end()
});


