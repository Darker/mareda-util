import generatorToWebStream from "../iterators/generatorToWebStream.js";

/**
 * 
 * @param {string} filename 
 * @param {IterableBytes} stream 
 * @param {object} [param1]
 * @param {string} [param1.mimeType]
 */
export default async function streamDownload(filename, stream, {mimeType="application/octet-stream"}={}) {
    const streamWrapper = generatorToWebStream(stream);
    const filenameClean = filename.replace(/^[\w_-]/g, "");

    const response = new Response(streamWrapper, {
      headers: {
          "Content-Type": mimeType,
          "Content-Disposition": "attachment; filename="+filenameClean
      }
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filenameClean;
    a.click();
}