
const os = require('os');
const path = require('path');
const fs = require('fs');
const spawn = require('./spawn');

module.exports = class Tar {

  constructor(path) {
    this.path = path || tempFile();
  }

  async extract(dest, strip) {
    await spawn('tar', ['-xvf', this.path, '-C', dest, strip ? `--strip-components=${strip}` : '']);
  }

  async create(dest) {
    await spawn('tar', ['-cvf', this.path, '-C', dest, '.']);
  }

  async remove() {
    return new Promise((resolve, reject) => {
      fs.unlink(this.path, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

};

function tempFile() {
  return path.join(os.tmpdir(), Math.random().toString(36).substring(2));
}