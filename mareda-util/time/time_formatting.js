import { padNum } from "../internal_helpers/string_helpers.js";

/**
 * Expects duration in seconds, returns split into time units
 * Second fractions are rounded to MS
 * @param {number} secs
 */
function splitDuration(secs) {
    const h = Math.floor(secs / 3600);
    secs -= h*3600;
    const m = Math.floor(secs / 60);
    secs -= m*60;
    const s = Math.floor(secs);
    const ms = Math.round((secs - s)*1000)
    return {h,m,s,ms};
}

/**
 * Returns duration as would appear on a stopwatch. If addMillis is true,
 * the format is HH:mm:ss.xxx
 * @param {number} durationSeconds 
 * @param {boolean} addMillis 
 * @returns 
 */
export function formatDuration(durationSeconds, addMillis=false) {
    let negative = false;
    if(durationSeconds < 0) {
        negative = true;
        durationSeconds = -1*durationSeconds;
    }
    const components = splitDuration(durationSeconds);
    return (negative ? "-" : "")
            + padNum(components.h, 2) 
            + ":" + padNum(components.m, 2)
            + ":" + padNum(components.s, 2)
            + (addMillis? "." + padNum(components.ms, 3):"");
}

/**
 * Returns time of the given date in the format HH:mm:ss, as it would appear on a clock
 * @param {Date} date 
 * @param {boolean} seconds if seconds should be included
 * @returns {string}
 */
export function formatClockTime(date, seconds = true) {
    return padNum(date.getHours(), 2)+":"+padNum(date.getMinutes(), 2)
         + (seconds ? ":"+padNum(date.getSeconds(), 2) : "");
}

/**
 * Returns date in the human readable format YYYY-MM-DD HH:mm:ss
 * @param {Date} date 
 * @param {boolean} seconds if seconds should be included
 * @returns {string}
 */
export function formatDateTimeHuman(date, seconds = false) {
    return padNum(date.getFullYear(),4)+"-"+padNum(date.getMonth()+1, 2)+"-"+padNum(date.getDate(), 2)
         + " " + formatClockTime(date, seconds);
}
