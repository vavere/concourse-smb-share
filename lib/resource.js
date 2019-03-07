
const crypto = require('crypto');
const SmbClient = require('./smbclient');
const Tar = require('./tar');

module.exports = async function resource(mode, input, dest) {
  if (!input || !input.source)
    throw new Error('ERROR: wrong input format');

  switch (mode) {
      case 'check': return await docheck(input.source);
      case 'in': return await doin(input.source, input.params || {}, dest);
      case 'out': return await doout(input.source, input.params || {}, dest);
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
async function doin(source, params, dest) {
  const files = (params || {}).files || [];  // optional
  const tar = new Tar();
  const smbclient = new SmbClient(source);
  const strip = await smbclient.getTar(tar.path, files);
  await tar.extract(dest, strip);
  await tar.remove();
  return {version: {ref: md5sum(await smbclient.ls())}}; 
}

// OUT
async function doout(source, params, dest) {
  const files = (params || {}).files || [];  // optional
  const tar = new Tar();
  const smbclient = new SmbClient(source);
  await tar.create(dest);
  await smbclient.putTar(tar.path, files);
  await tar.remove();
  return {version: {ref: md5sum(await smbclient.ls())}}; 
}

function md5sum(data) {
  return crypto.createHash('md5').update(data).digest("hex");
}