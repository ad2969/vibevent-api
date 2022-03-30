// "requireDir" needs to be called directly
// cannot have any intermediate import/exports
// keep this file in the root of "utils"

const fs = require('fs');
const path = require('path');

// Get the absolute path of the caller file
const { parent } = module;
const callerFile = parent.filename;
const callerDir = path.dirname(callerFile);
// "path" saves the first importer's path into cache
// Therefore, we need to "refresh" the module cache
delete require.cache[__filename];
/**
 * Returns a map of the files that are found in a given path as the argument
 * If no given directory is provided, assumes the path of the caller itself
 * @param dir - the directory path to "include" - similar to "require(dir)")
 */
module.exports = (dir = '.') => {

  // create absolute path
  const absoluteDir = path.resolve(callerDir, dir);

  // read the directory's files
  const dirFiles = fs.readdirSync(absoluteDir);
  const fileMap = {};

  dirFiles.forEach((file) => {

    const extension = path.extname(file);
    const filename = path.basename(file, extension);

    const abs = path.resolve(absoluteDir, file);

    // ignore if the file is the caller itself
    if (abs === callerFile) return null;
    // ignore directories
    if (fs.statSync(abs).isDirectory()) return null;
    // ignore typescript declaration files (no need for now)
    // if (/\.d\.ts$/.test(abs)) return null;

    // do the "requiring"
    // eslint-disable-next-line
    fileMap[filename] = require(abs);

    return null;

  });

  return fileMap;

};
