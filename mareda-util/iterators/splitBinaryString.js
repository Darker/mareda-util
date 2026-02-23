
/**
 * 
 * @param {IterableBytes} data 
 * @param {string | RegExp} delimiter 
 */
export default async function * splitBinaryString(data, delimiter=/\r?\n/) {
    let currentText = "";
    const useRegex = typeof delimiter != "string";
    const decoder = new TextDecoder("utf-8", {ignoreBOM: true});
    for await(const bytes of data) {
        currentText += decoder.decode(bytes, {stream: true});

        let lastIndex = 0;
        let lastIndexSize = 0;
        while(true) {
            let index = -1;
            let indexSize = 1;
            const offset = lastIndex+lastIndexSize;
            if(useRegex) {
                const reIndexMatch = delimiter.exec(currentText.slice(offset));
                if(reIndexMatch) {
                    index = reIndexMatch.index + offset;
                    indexSize = reIndexMatch[0].length;
                }
            }
            else {
                index = currentText.indexOf(delimiter, offset);
                indexSize = delimiter.length;
            }
            
            if(index < 0) {
                break;
            }

            yield currentText.slice(offset, index);
            lastIndex = index;
            lastIndexSize = indexSize;
        }
        currentText = currentText.slice(lastIndex+lastIndexSize);
    }
    yield currentText;
}