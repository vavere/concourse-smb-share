const path = require('path');
const crypto = require('crypto');
const SmbClient = require('./smbclient');
const Tar = require('./tar');

module.exports = async function resource(mode, input, dest) {
  if (!input || !input.source)
    throw new Error('ERROR: wrong input format');

  switch (mode) {
      case 'check': return await docheck(input.source, input.version);
      case 'in': return await doin(input.source, input.params, input.version, dest);
      case 'out': return await doout(input.source, input.params, dest);
      default:
        throw new Error('ERROR: unknown access mode');
  }
};

// CHECK
async function docheck(source) {
  const smbclient = new SmbClient(source);
  return [{ref: md5sum(await smbclient.ls())}];
}

// IN
async function doin(source, {files = [], skip = false} = {}, {ref = null} = {}, dest) {  
  if (!dest)
    throw new Error('ERROR: destination is mandatory');
  if (skip) return response(ref); // after put control implicit get with get_params: {skip: true}
  files = Array.isArray(files) ? files : !files ? [] : [files];
  const tar = new Tar();
  const smbclient = new SmbClient(source);
  await smbclient.getTar(tar.path, files);
  await tar.extract(dest, smbclient.strip);
  await tar.remove();
  return response(md5sum(await smbclient.ls()));
}

// OUT
async function doout(source, {dir = null, files = []} = {}, dest) {
  if (!dest)
    throw new Error('ERROR: destination is mandatory');
  dest = !dir ? dest : path.join(dest, dir);
  files = Array.isArray(files) ? files : !files ? [] : [files];
  const tar = new Tar();
  const smbclient = new SmbClient(source);
  await tar.create(dest);
  await smbclient.putTar(tar.path, files);
  await tar.remove();
  return response(md5sum(await smbclient.ls()));
}

function response(ref) {
  return {version: {ref}};
}

function md5sum(data) {
  return crypto.createHash('md5').update(data).digest("hex");
}