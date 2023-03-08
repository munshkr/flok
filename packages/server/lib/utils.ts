import fs from "fs";
import path from "path";
import { networkInterfaces } from "os";
import { fileURLToPath } from "url";

export const getFileDirname = () => {
  const filename = fileURLToPath(import.meta.url);
  return path.dirname(filename);
};

export const readJSON = (path) => {
  const raw = fs.readFileSync(path);
  return JSON.parse(raw.toString());
};

export const readPackageFile = () => {
  return readJSON(path.resolve(getFileDirname(), "../package.json"));
};

export const getPossibleIpAddresses = () => {
  const nets = networkInterfaces();
  const results = Object.create(null); // Or just '{}', an empty object

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === "IPv4" && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }

  return results;
};
