const Writable = require('stream').Writable;
const sp = require('child_process');

module.exports = async function spawn(cmd, args = [], secret) {
  const result = [];
  const stdout = new Writable({
    encoding : 'utf8',
    write: (chunk, encoding, cb) => {
      result.push(chunk);
      cb();
    }
  });
  return new Promise((resolve, reject) => {
    log(cmd, args, secret);
    sp.spawn(cmd, args, {stdio: [null, 'pipe', 'inherit']})
    .on('exit', (code) => {
      if (code) return reject(new Error(`ERROR: spawn exit code: ${code}`));
      resolve(result.join(''));
    })
    .on('error', reject)
    .stdout.pipe(stdout);
  });
};

function log(cmd, args, secret) {
  console.log(cmd, args.map(a => a === secret ? '******' : a).join(' '));
}
