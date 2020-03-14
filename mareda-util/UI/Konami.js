class Konami {
    constructor(sequence) {
        if (typeof sequence == "string") {
            sequence = sequence.split("").map((x) => x.charCodeAt(0));
        }
        this.sequence = sequence;
        this.step = 0;
        this.disabled = false;
    }
    /** Returns true if correct sequence is entered.
     * @param {KeyboardEvent} event
     */
    handleEvent(event) {
        if (this.sequence.length < 1 || this.disabled) {
            return false;
        }
        if (event.which == this.sequence[this.step]) {
            this.step++;
        }
        else {
            this.step = 0;
        }
        if (this.step >= this.sequence.length) {
            this.step = 0;
            return true;
        }
        return false;
    }
}

export default Konami;