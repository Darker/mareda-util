// fileURLToPath.js

// Detect Node.js without breaking bundlers
const isNode =
  typeof process !== "undefined" &&
  process.versions != null &&
  process.versions.node != null;

let fileURLToPathImpl;

if (isNode) {
  // Use the real Node implementation
  ({ fileURLToPath: fileURLToPathImpl } = await import("node:url"));
} else {
  // Browser-safe polyfill
  /**
   * @param {string | URL} url
   */
  fileURLToPathImpl = function fileURLToPathPolyfill(url) {
    if(typeof url == "string") {
        if(!url.startsWith("file://") && !url.startsWith("http://") && !url.startsWith("https://")) {
            // already a path
            return url;
        }
    }
    const u = typeof url === "string" ? new URL(url) : url;
    if (u.protocol !== "file:") {
        console.log(u);
        throw new TypeError("Only file:// URLs can be converted");
    }

    // Decode percent escapes
    let path = decodeURIComponent(u.pathname);

    // Windows handling
    if (path.startsWith("/") && /^[A-Za-z]:/.test(path.slice(1))) {
      path = path.slice(1); // remove leading slash
    }

    return path;
  };
}

export const fileURLToPath = fileURLToPathImpl;
