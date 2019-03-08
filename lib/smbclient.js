
const spawn = require('./spawn');

module.exports = class SmbClient {

  get args() {
    const args = [this.service];
    args.push(this.pass ? this.pass : '-N');
    if (this.user) args.push(`--user=${this.user}`);
    args.push('--grepable');
    args.push('--debuglevel=0');
    if (this.dir) args.push('-D', this.dir);
    return args;
  }

  constructor(source) {
    if (!source || !source.path) throw new Error('ERROR: source path is mandatory');
    Object.assign(this, source, this._parsePath(source.path));
  }

  async ls() {
    return await spawn('smbclient', this.args.concat('-c', 'ls'), this.pass);
  }

  async getTar(tarPath, files) {
    if (!tarPath) throw new Error('ERROR: tar path is mandatory');
    await spawn('smbclient', this.args.concat('-Tc', tarPath).concat(files), this.pass);
    return this.dir ? this.dir.split('/').length + 1 : 1;  //dir depth
  }

  async putTar(tarPath, files) {
    if (!tarPath) throw new Error('ERROR: tar path is mandatory');
    await spawn('smbclient', this.args.concat('-Tx', tarPath).concat(files), this.pass);
  }

  // path format:  //server/share/[dir(s)]'
  _parsePath(path) {
    const parts = path.toString().replace(/\\/g, '/').split('/');
    if (parts.length < 4 || parts[0] != '' || parts[1] != '')
      throw new Error('ERROR: wrong path format');
    const service = `//${parts[2]}/${parts[3]}`;
    const dir = parts.length > 4 ? parts.slice(4).join('/') : '';
    return {service, dir};
  }

};

