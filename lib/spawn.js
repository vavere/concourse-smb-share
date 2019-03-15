const Writable = require('stream').Writable;
const sp = require('child_process');

module.exports = async function spawn(cmd, args = [], secret) {
  const result = [];
  const stdout = new Writable({
    encoding: 'utf8',
    write: (chunk, encoding, cb) => {
      result.push(chunk);
      cb();
    }
  });
  return new Promise((resolve, reject) => {
    debug(cmd, args, secret);
    sp.spawn(cmd, args, {stdio: [null, 'pipe', 'inherit']})
    .on('exit', (code) => {
      const output = result.join('');
      console.debug(output)
      if (code) return reject(new Error(`ERROR: spawn exit code: ${code}`));
      resolve(output);
    })
    .on('error', reject)
    .stdout.pipe(stdout);
  });
};

function debug(cmd, args, secret) {
  console.debug(cmd, args.map(a => a === secret ? '******' : a).join(' '));
}
