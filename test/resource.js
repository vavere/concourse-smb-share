
const tap = require('tap');
const mock = require('mock-require');

const test_str = 'test';
const test_md5 = '098f6bcd4621d373cade4e832627b4f6';
const test_path = '/tmp/test';
const test_cmds = [];

mock('../lib/spawn', (cmd, args) => {
  test_cmds.push(`${cmd} ${args.join(' ')}`);
  return test_str; 
});

const Tar = require('../lib/tar');
mock('../lib/tar', class testTar extends Tar {
  constructor(path) {
    super(path || test_path);  // fix random file name
  }
  remove() {
    test_cmds.push(`rm -f ${this.path}`);  // emulate spawn 
  }
});

const resource = require('../lib/resource');

const tests = [
{
  name: 'simple check',
  mode: 'check',
  input: {source: {path:'//server/share'}},
  cmds: ['smbclient //server/share -N --grepable --debuglevel=0 -c ls'],
  res: [{ref: test_md5}]
},
{
  name: 'check with user',
  mode: 'check',
  input: {source: {path:'//server/share', user: 'username'}},
  cmds: ['smbclient //server/share -N --user=username --grepable --debuglevel=0 -c ls'],
  res: [{ref: test_md5}]
},
{
  name: 'check with user/pass',
  mode: 'check',
  input: {source: {path:'//server/share', user: 'username', pass: 'password'}},
  cmds: ['smbclient //server/share password --user=username --grepable --debuglevel=0 -c ls'],
  res: [{ref: test_md5}]
},
{
  name: 'check with dir',
  mode: 'check',
  input: {source: {path:'//server/share/dir', user: 'username', pass: 'password'}},
  cmds: ['smbclient //server/share password --user=username --grepable --debuglevel=0 -D dir -c ls'],
  res: [{ref: test_md5}]
},
{
  name: 'check with multiple dirs',
  mode: 'check',
  input: {source: {path:'//server/share/dir1/dir2', user: 'username', pass: 'password'}},
  cmds: ['smbclient //server/share password --user=username --grepable --debuglevel=0 -D dir1/dir2 -c ls'],
  res: [{ref: test_md5}]
},
{
  name: 'check with deep dirs',
  mode: 'check',
  input: {source: {path:'//server/share/dir1/dir2/dir3/dir4/dir5/dir6/dir7/dir8/dir9', user: 'username', pass: 'password'}},
  cmds: ['smbclient //server/share password --user=username --grepable --debuglevel=0 -D dir1/dir2/dir3/dir4/dir5/dir6/dir7/dir8/dir9 -c ls'],
  res: [{ref: test_md5}]
},
{
  name: 'simple in',
  mode: 'in',
  input: {source: {path:'//server/share'}},
  dest: 'dest',
  cmds: [
    `smbclient //server/share -N --grepable --debuglevel=0 -Tc ${test_path}`, 
    `tar -xvf ${test_path} -C dest --strip-components=1`,
    `rm -f ${test_path}`,
    'smbclient //server/share -N --grepable --debuglevel=0 -c ls'],
  res: {version: {ref: test_md5}}
},
{
  name: 'in with user',
  mode: 'in',
  input: {source: {path:'//server/share', user: 'username'}},
  dest: 'dest',
  cmds: [
    `smbclient //server/share -N --user=username --grepable --debuglevel=0 -Tc ${test_path}`, 
    `tar -xvf ${test_path} -C dest --strip-components=1`,
    `rm -f ${test_path}`,
    'smbclient //server/share -N --user=username --grepable --debuglevel=0 -c ls'],
  res: {version: {ref: test_md5}}
},
{
  name: 'in with user/pass',
  mode: 'in',
  input: {source: {path:'//server/share', user: 'username', pass: 'password'}},
  dest: 'dest',
  cmds: [
    `smbclient //server/share password --user=username --grepable --debuglevel=0 -Tc ${test_path}`, 
    `tar -xvf ${test_path} -C dest --strip-components=1`,
    `rm -f ${test_path}`,
    'smbclient //server/share password --user=username --grepable --debuglevel=0 -c ls'],
  res: {version: {ref: test_md5}}
},
{
  name: 'in with dir',
  mode: 'in',
  input: {source: {path:'//server/share/dir'}},
  dest: 'dest',
  cmds: [
    `smbclient //server/share -N --grepable --debuglevel=0 -D dir -Tc ${test_path}`, 
    `tar -xvf ${test_path} -C dest --strip-components=2`,
    `rm -f ${test_path}`,
    'smbclient //server/share -N --grepable --debuglevel=0 -D dir -c ls'],
  res: {version: {ref: test_md5}}
},
{
  name: 'in with multiple dirs',
  mode: 'in',
  input: {source: {path:'//server/share/dir1/dir2'}},
  dest: 'dest',
  cmds: [
    `smbclient //server/share -N --grepable --debuglevel=0 -D dir1/dir2 -Tc ${test_path}`, 
    `tar -xvf ${test_path} -C dest --strip-components=3`,
    `rm -f ${test_path}`,
    'smbclient //server/share -N --grepable --debuglevel=0 -D dir1/dir2 -c ls'],
  res: {version: {ref: test_md5}}
},
{
  name: 'in with deep dirs',
  mode: 'in',
  input: {source: {path:'//server/share/dir1/dir2/dir3/dir4/dir5/dir6/dir7/dir8/dir9'}},
  dest: 'dest',
  cmds: [
    `smbclient //server/share -N --grepable --debuglevel=0 -D dir1/dir2/dir3/dir4/dir5/dir6/dir7/dir8/dir9 -Tc ${test_path}`, 
    `tar -xvf ${test_path} -C dest --strip-components=10`,
    `rm -f ${test_path}`,
    'smbclient //server/share -N --grepable --debuglevel=0 -D dir1/dir2/dir3/dir4/dir5/dir6/dir7/dir8/dir9 -c ls'],
  res: {version: {ref: test_md5}}
},
{
  name: 'in with user/pass and dirs',
  mode: 'in',
  input: {source: {path:'//server/share/dir1/dir2', user: 'username', pass: 'password'}},
  dest: 'dest',
  cmds: [
    `smbclient //server/share password --user=username --grepable --debuglevel=0 -D dir1/dir2 -Tc ${test_path}`, 
    `tar -xvf ${test_path} -C dest --strip-components=3`,
    `rm -f ${test_path}`,
    'smbclient //server/share password --user=username --grepable --debuglevel=0 -D dir1/dir2 -c ls'],
  res: {version: {ref: test_md5}}
},
{
  name: 'simple out',
  mode: 'out',
  input: {source: {path:'//server/share'}},
  dest: 'dest',
  cmds: [
    `tar -cvf ${test_path} -C dest .`,
    `smbclient //server/share -N --grepable --debuglevel=0 -Tx ${test_path}`, 
    `rm -f ${test_path}`,
    'smbclient //server/share -N --grepable --debuglevel=0 -c ls'],
  res: {version: {ref: test_md5}}
},
{
  name: 'out with user',
  mode: 'out',
  input: {source: {path:'//server/share', user: 'username'}},
  dest: 'dest',
  cmds: [
    `tar -cvf ${test_path} -C dest .`,
    `smbclient //server/share -N --user=username --grepable --debuglevel=0 -Tx ${test_path}`, 
    `rm -f ${test_path}`,
    'smbclient //server/share -N --user=username --grepable --debuglevel=0 -c ls'],
  res: {version: {ref: test_md5}}
},
{
  name: 'out with user/pass',
  mode: 'out',
  input: {source: {path:'//server/share', user: 'username', pass: 'password'}},
  dest: 'dest',
  cmds: [
    `tar -cvf ${test_path} -C dest .`,
    `smbclient //server/share password --user=username --grepable --debuglevel=0 -Tx ${test_path}`, 
    `rm -f ${test_path}`,
    'smbclient //server/share password --user=username --grepable --debuglevel=0 -c ls'],
  res: {version: {ref: test_md5}}
},
{
  name: 'out with dir',
  mode: 'out',
  input: {source: {path:'//server/share/dir'}},
  dest: 'dest',
  cmds: [
    `tar -cvf ${test_path} -C dest .`,
    `smbclient //server/share -N --grepable --debuglevel=0 -D dir -Tx ${test_path}`, 
    `rm -f ${test_path}`,
    'smbclient //server/share -N --grepable --debuglevel=0 -D dir -c ls'],
  res: {version: {ref: test_md5}}
},
{
  name: 'out with multiple dirs',
  mode: 'out',
  input: {source: {path:'//server/share/dir1/dir2'}},
  dest: 'dest',
  cmds: [
    `tar -cvf ${test_path} -C dest .`,
    `smbclient //server/share -N --grepable --debuglevel=0 -D dir1/dir2 -Tx ${test_path}`, 
    `rm -f ${test_path}`,
    'smbclient //server/share -N --grepable --debuglevel=0 -D dir1/dir2 -c ls'],
  res: {version: {ref: test_md5}}
},
{
  name: 'out with deep dirs',
  mode: 'out',
  input: {source: {path:'//server/share/dir1/dir2/dir3/dir4/dir5/dir6/dir7/dir8/dir9'}},
  dest: 'dest',
  cmds: [
    `tar -cvf ${test_path} -C dest .`,
    `smbclient //server/share -N --grepable --debuglevel=0 -D dir1/dir2/dir3/dir4/dir5/dir6/dir7/dir8/dir9 -Tx ${test_path}`, 
    `rm -f ${test_path}`,
    'smbclient //server/share -N --grepable --debuglevel=0 -D dir1/dir2/dir3/dir4/dir5/dir6/dir7/dir8/dir9 -c ls'],
  res: {version: {ref: test_md5}}
},
{
  name: 'out with user/pass and dirs',
  mode: 'out',
  input: {source: {path:'//server/share/dir1/dir2', user: 'username', pass: 'password'}},
  dest: 'dest',
  cmds: [
    `tar -cvf ${test_path} -C dest .`,
    `smbclient //server/share password --user=username --grepable --debuglevel=0 -D dir1/dir2 -Tx ${test_path}`, 
    `rm -f ${test_path}`,
    'smbclient //server/share password --user=username --grepable --debuglevel=0 -D dir1/dir2 -c ls'],
  res: {version: {ref: test_md5}}
},
];

tests.forEach(({name, mode, input, dest, cmds, res}) => {

  tap.test(name, async (tap) => {
    test_cmds.length = 0;
    const test_res = await resource(mode, input, dest);
    tap.equal(test_cmds.length, cmds.length, 'cmd count ok');
    cmds.forEach((c, i) => {
      tap.equal(test_cmds[i], c, `cmd ${i + 1} ok`);
    });
    tap.same(test_res, res, 'res ok');
  });

});



