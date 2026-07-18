import path from "path"
import url from "url"
import fs from "fs"

/**
 * This helper expects you to pass `import.meta.url` and returns true
 * if this is the "main" node file.
 * 
 * It is an equivalent of pythons if __name__ == "__main__"
 * 
 * @param {URL | string} moduleUrl 
 */
export default function isNodeEntryFile(moduleUrl) {
    const fullEntryName = fs.realpathSync(path.resolve(process.argv[1]));
    const modulePath = url.fileURLToPath(moduleUrl);
    return fullEntryName == modulePath;
};
