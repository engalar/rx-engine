import { PlatformTools } from "typeorm/platform/PlatformTools";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const glob = require('glob');

function requireUncached(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}

export function importJsonsFromDirectories(
  directories: string[],
  format = ".json"
): any[] {
  const allFiles = directories.reduce((allDirs, dir) => {
    return allDirs.concat(glob.sync(PlatformTools.pathNormalize(dir)));
  }, [] as string[]);

  return allFiles
    .filter((file) => PlatformTools.pathExtname(file) === format)
    .map((file) => requireUncached(PlatformTools.pathResolve(file)));
}
