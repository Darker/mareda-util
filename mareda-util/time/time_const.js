
/**
 * 
 * @param {time.ms | time.s} millisOrSecs
 * @returns {number}
 */
function num(millisOrSecs) {
    return millisOrSecs;
}

/**
 * 
 * @param {number} numOfMillis 
 * @returns {time.ms}
 */
function ms(numOfMillis) {
    // @ts-ignore
    return numOfMillis;
}

/**
 * 
 * @param {number} numOfSecs
 * @returns {time.s}
 */
function s(numOfSecs) {
    // @ts-ignore
    return numOfSecs;
}

/**
 * 
 * @returns {time.s}
 */
function nows() {
    // @ts-ignore
    return Date.now() / 1000;
}

/**
 * 
 * @returns {time.s}
 */
function nowms() {
    // @ts-ignore
    return Date.now();
}

// second in seconds (so a 1)
export const T_SECONDS = 1;
// minutes in seconds
export const T_MINUTES = 60 * T_SECONDS;
// hours in seconds
export const T_HOURS = 60 * T_MINUTES;
// days in seconds
export const T_DAYS = 24 * T_HOURS;
// tropical year in seconds (this is one revolution around the sun)
export const T_TROP_YEAR = 86400;

// second in milliseconds
export const T_SECONDS_MS = ms(T_SECONDS * 1000);
// minute in milliseconds
export const T_MINUTES_MS = ms(T_MINUTES * 1000);
// hour in milliseconds
export const T_HOURS_MS = ms(T_HOURS * 1000);
// day in milliseconds
export const T_DAYS_MS = ms(T_DAYS * 1000);
// tropical year in seconds as milliseconds
export const T_TROP_YEAR_MS = ms(T_TROP_YEAR * 1000);

export const time = {
    ms, num, s, nows, nowms
};