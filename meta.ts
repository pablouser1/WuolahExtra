import metablock from "rollup-plugin-userscript-metablock";
import type { Plugin } from "rollup";
import { readFileSync } from "fs";
import { join } from "path";

const pkg = JSON.parse(readFileSync('package.json').toString("utf-8"));
// Required external resources from npm
const PKG_RESOURCES = {
  gulagcleaner_wasm: "gulagcleaner_wasm_bg.wasm",
};

// Requiered js files from npm
const PKG_REQS = {
  "pdf-lib": "dist/pdf-lib.min.js",
  "jszip": "dist/jszip.min.js"
};

// Static required js files
const EXTERNAL_REQS = ["https://openuserjs.org/src/libs/sizzle/GM_config.js"];

// Get dependency version
const getPkgVer = (pkg: string): string => {
  const jsonStr = readFileSync(join("node_modules", pkg, "package.json"));

  const json = JSON.parse(jsonStr.toString("utf-8"));
  return json.version;
};

// Build map from PKG_RESOURCES
const getResources = (): Record<string, string> => {
  let entries: Record<string, string> = {};
  const arr = Object.entries(PKG_RESOURCES);

  for (const el of arr) {
    const [pkgName, fileName] = el;
    if (pkgName === "gulagcleaner_wasm") {
      // always serve gulagcleaner_wasm lastest
      entries[pkgName] = `https://cdn.jsdelivr.net/npm/${pkgName}/${fileName}`;
    } else {
      const ver = getPkgVer(pkgName);
      entries[pkgName] = `https://cdn.jsdelivr.net/npm/${pkgName}@${ver}/${fileName}`;
    }
  }

  return entries;
};

// Build array from PKG_RQS and EXTERNAL_REQS
const getRequires = (): string[] => {
  const arr = Object.entries(PKG_REQS);

  const els: string[] = EXTERNAL_REQS;

  for (const el of arr) {
    const ver = getPkgVer(el[0]);
    els.push(`https://cdn.jsdelivr.net/npm/${el[0]}@${ver}/${el[1]}`);
  }

  return els;
};

const getMetablock = (): Plugin => {
  return metablock({
    file: "meta.json",
    override: {
      name: pkg.displayName,
      version: pkg.version,
      description: pkg.description,
      homepage: pkg.homepage,
      author: pkg.author,
      license: pkg.license,
      // @ts-expect-error dependency typing not configed properly
      require: getRequires(),
      resource: getResources(),
    },
  });
};

export default getMetablock;
