
const spawn = require('./spawn');

module.exports = class SmbClient {

  constructor(source) {
    if (!source || !source.path) 
      throw new Error('ERROR: source path is mandatory');
    this.path = source.path; 
    this.user = source.user;
    this.pass = source.pass;

    // path format:  //server/share/[dir(s)]'
    const parts = this.path.toString().replace(/\\/g, '/').split('/');
    if (parts.length < 4 || parts[0] != '' || parts[1] != '')
      throw new Error('ERROR: wrong path format');
    this.service = `//${parts[2]}/${parts[3]}`;
    this.dir = parts.length > 4 ? parts.slice(4).join('/') : '';
    this.strip =  this.dir ? this.dir.split('/').length + 1 : 1;  //dir depth

    // pre populated args
    this.args = [this.service];
    this.args.push(this.pass ? this.pass : '-N');
    if (this.user) this.args.push(`--user=${this.user}`);
    this.args.push('--grepable');
    this.args.push('--debuglevel=0');
    if (this.dir) this.args.push('-D', this.dir);
  }

  async ls() {
    return await spawn('smbclient', this.args.concat('-c', 'ls'), this.pass);
  }

  async getTar(tarPath, files) {
    if (!tarPath) throw new Error('ERROR: tar path is mandatory');
    await spawn('smbclient', this.args.concat('-Tc', tarPath).concat(files), this.pass);
  }

  async putTar(tarPath, files) {
    if (!tarPath) throw new Error('ERROR: tar path is mandatory');
    await spawn('smbclient', this.args.concat('-Tx', tarPath).concat(files), this.pass);
  }

};

