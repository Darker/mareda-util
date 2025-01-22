import { T_HOURS, T_MINUTES } from "../../../time/time_const.js";
import { formatClockTime, formatDuration } from "../../../time/time_formatting.js";

describe("time_formatting_test", ()=>{
    it("formats zero duration", ()=>{
        expect(formatDuration(0)).toEqual("00:00:00");
    });
    it("formats negative duration", ()=>{
        expect(formatDuration(-1)).toEqual("-00:00:01");
        expect(formatDuration(-3600)).toEqual("-01:00:00");
    });
    it("formats normal duration values", ()=>{
        expect(formatDuration(T_HOURS*3+T_MINUTES*10+15)).toEqual("03:10:15");
        expect(formatDuration(T_HOURS*300+T_MINUTES*10+15)).toEqual("300:10:15");
        expect(formatDuration(T_HOURS*1+T_MINUTES*59+59)).toEqual("01:59:59");
    });

    it("formats clock times", ()=>{
        expect(formatClockTime(new Date(2024, 0, 5, 12, 0, 0))).toBe("12:00:00");
        expect(formatClockTime(new Date(2024, 0, 5, 23, 59, 59))).toBe("23:59:59");
        expect(formatClockTime(new Date(2024, 0, 5, 0, 0, 0))).toBe("00:00:00");
        expect(formatClockTime(new Date(2024, 0, 5, 23, 59, 59), false)).toBe("23:59");
    });
});