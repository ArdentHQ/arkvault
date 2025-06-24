/* eslint-disable sonarjs/no-duplicate-string */

import { describe, expect, it } from "vitest";
import { DateTime } from "./datetime";

describe("DateTime", () => {
	it("should create an instance with make and fromUnix", () => {
		const now = Date.now();
		const dt1 = DateTime.make(now);
		const dt2 = DateTime.fromUnix(Math.floor(now / 1000));
		expect(dt1).toBeInstanceOf(DateTime);
		expect(dt2).toBeInstanceOf(DateTime);

		// Test invalid dates
		const invalidDate = DateTime.make("invalid date");
		expect(invalidDate.isValid()).toBe(false);
	});

	it("should get and set date parts", () => {
		const dt = DateTime.make("2023-01-02T03:04:05.006Z");
		expect(dt.getYear()).toBe(2023);
		expect(dt.getMonth()).toBe(0); // January is 0 in dayjs
		expect(dt.getDayOfMonth()).toBe(2);
		expect(dt.getHour()).toBe(3);
		expect(dt.getMinute()).toBe(4);
		expect(dt.getSecond()).toBe(5);
		expect(dt.getMillisecond()).toBe(6);
		expect(dt.getDay()).toBe(2); // Day of year
		expect(dt.getWeek()).toBe(1); // Week of year
		expect(dt.getQuarter()).toBe(1); // Quarter of year

		// Setters
		const dt2 = dt
			.setYear(2022)
			.setMonth(5)
			.setDayOfMonth(10)
			.setHour(8)
			.setMinute(9)
			.setSecond(10)
			.setMillisecond(11);
		expect(dt2.getYear()).toBe(2022);
		expect(dt2.getMonth()).toBe(5);
		expect(dt2.getDayOfMonth()).toBe(10);
		expect(dt2.getHour()).toBe(8);
		expect(dt2.getMinute()).toBe(9);
		expect(dt2.getSecond()).toBe(10);
		expect(dt2.getMillisecond()).toBe(11);

		expect(dt.setDay(180).getYear()).toBe(2023);
	});

	it("should set week and quarter", () => {
		const dt = DateTime.make("2023-01-01T00:00:00.000Z");
		expect(dt.setWeek(26).getWeek()).toBe(26);
		expect(dt.setQuarter(3).getQuarter()).toBe(3);
	});

	it("should add and subtract time without values", () => {
		const dt = DateTime.make("2023-01-01T00:00:00.000Z");
		expect(dt.addYear().getYear()).toBe(2024);
		expect(dt.addMonth().getMonth()).toBe(1);
		expect(dt.addDay().getDayOfMonth()).toBe(2);
		expect(dt.addHour().getHour()).toBe(1);
		expect(dt.addMinute().getMinute()).toBe(1);
		expect(dt.addSecond().getSecond()).toBe(1);
		expect(dt.addMillisecond().getMillisecond()).toBe(1);
		expect(dt.addQuarter().getMonth()).toBe(3);
		expect(dt.addWeek().getDayOfMonth()).toBe(8);

		const dt2 = DateTime.make("2023-01-01T00:00:00.000Z");
		expect(dt2.subYear().getYear()).toBe(2022);
		expect(dt2.subMonth().getMonth()).toBe(11);
		expect(dt2.subDay().getDayOfMonth()).toBe(31);
		expect(dt2.subHour().getHour()).toBe(23);
		expect(dt2.subMinute().getMinute()).toBe(59);
		expect(dt2.subSecond().getSecond()).toBe(59);
		expect(dt2.subMillisecond().getMillisecond()).toBe(999);
		expect(dt2.subQuarter().getMonth()).toBe(9);
		expect(dt2.subWeek().getDayOfMonth()).toBe(25);
	});

	it("should add and subtract time with multiple values", () => {
		const dt = DateTime.make("2023-01-01T00:00:00.000Z");

		// Add multiple units
		expect(dt.addYears(2).getYear()).toBe(2025);
		expect(dt.addMonths(3).getMonth()).toBe(3);
		expect(dt.addWeeks(2).getDayOfMonth()).toBe(15);
		expect(dt.addDays(5).getDayOfMonth()).toBe(6);
		expect(dt.addHours(12).getHour()).toBe(12);
		expect(dt.addMinutes(30).getMinute()).toBe(30);
		expect(dt.addSeconds(45).getSecond()).toBe(45);
		expect(dt.addMilliseconds(500).getMillisecond()).toBe(500);
		expect(dt.addQuarters(2).getMonth()).toBe(6);

		// Subtract multiple units
		const dtSub = DateTime.make("2023-01-01T00:00:00.000Z");
		expect(dtSub.subYears(2).getYear()).toBe(2021);
		expect(dtSub.subMonths(3).getMonth()).toBe(9);
		expect(dtSub.subWeeks(2).getDayOfMonth()).toBe(18);
		expect(dtSub.subDays(5).getDayOfMonth()).toBe(27);
		expect(dtSub.subHours(12).getHour()).toBe(12);
		expect(dtSub.subMinutes(30).getMinute()).toBe(30);
		expect(dtSub.subSeconds(45).getSecond()).toBe(15);
		expect(dtSub.subMilliseconds(500).getMillisecond()).toBe(500);
		expect(dtSub.subQuarters(2).getMonth()).toBe(6);
	});

	it("should compare dates", () => {
		const dt1 = DateTime.make("2023-01-01T00:00:00.000Z");
		const dt2 = DateTime.make("2023-01-02T00:00:00.000Z");
		expect(dt1.isBefore(dt2)).toBe(true);
		expect(dt2.isAfter(dt1)).toBe(true);
		expect(dt1.isSame(dt1)).toBe(true);

		// Compare with different types
		expect(dt1.isBefore(dt2.valueOf())).toBe(true);
		expect(dt1.isBefore(dt2.toDate().getTime())).toBe(true);
		expect(dt1.isBefore(dt2.toString())).toBe(true);
	});

	it("should format and convert with various formats", () => {
		const dt = DateTime.make("2023-01-01T12:34:56.789Z");

		// Test different format strings
		expect(dt.format("YYYY-MM-DD HH:mm:ss")).toBe("2023-01-01 12:34:56");
		expect(dt.format("MMM Do, YYYY")).toBe("Jan 1st, 2023");
		expect(dt.format("H:mm A")).toBe("12:34 PM");

		// Test conversions
		expect(dt.toJSON()).toBe(dt.toISOString());
		expect(dt.toString()).not.toBe(dt.toISOString());
		expect(dt.toUNIX()).toBe(Math.floor(dt.valueOf() / 1000));

		const obj = dt.toObject();
		expect(obj).toEqual({
			date: 1,
			hours: 12,
			milliseconds: 789,
			minutes: 34,
			months: 0,
			seconds: 56,
			years: 2023,
		});

		const dtWithTimezone = DateTime.make("2023-01-01T12:34:56.789Z", "en", "America/New_York");
		expect(dtWithTimezone.format("YYYY-MM-DD HH:mm:ssZ")).not.toBe(dt.format("YYYY-MM-DD HH:mm:ssZ"));
	});

	it("should handle locale and timezone with various formats", () => {
		const dt = DateTime.make("2023-01-01T00:00:00.000Z", "en", "America/New_York");
		const dt2 = dt.setLocale("fr");
		expect(dt2).toBeInstanceOf(DateTime);
		// Test invalid locale
		const dt3 = dt.setLocale("invalid-locale");
		expect(dt3).toBeInstanceOf(DateTime);
		expect(dt3.format("MMMM")).toBe(dt.format("MMMM")); // Should fallback to default locale
		const dt4 = DateTime.make("2023-01-01T00:00:00.000Z");
		const dt5 = DateTime.make("2023-01-01T00:00:00.000Z", "en", "America/New_York");
		expect(dt4.isSame(dt5)).toBe(true);
		expect(dt4.toISOString()).toBe("2023-01-01T00:00:00.000Z");
	});

	it("should support startOf and endOf for all units", () => {
		const dt = DateTime.make("2023-06-15T12:34:56.789Z");

		// Test startOf
		expect(dt.startOf("year").format("YYYY-MM-DD HH:mm:ss.SSS")).toBe("2023-01-01 00:00:00.000");
		expect(dt.startOf("month").format("YYYY-MM-DD HH:mm:ss.SSS")).toBe("2023-06-01 00:00:00.000");
		expect(dt.startOf("day").format("YYYY-MM-DD HH:mm:ss.SSS")).toBe("2023-06-15 00:00:00.000");
		expect(dt.startOf("hour").format("YYYY-MM-DD HH:mm:ss.SSS")).toBe("2023-06-15 12:00:00.000");

		// Test endOf
		expect(dt.endOf("year").format("YYYY-MM-DD HH:mm:ss.SSS")).toBe("2023-12-31 23:59:59.999");
		expect(dt.endOf("month").format("YYYY-MM-DD HH:mm:ss.SSS")).toBe("2023-06-30 23:59:59.999");
		expect(dt.endOf("day").format("YYYY-MM-DD HH:mm:ss.SSS")).toBe("2023-06-15 23:59:59.999");
		expect(dt.endOf("hour").format("YYYY-MM-DD HH:mm:ss.SSS")).toBe("2023-06-15 12:59:59.999");
	});

	it("should support from and fromNow with options", () => {
		const dt = DateTime.make();
		expect(dt.from(Date.now())).toBe("a few seconds ago");
		expect(dt.from(Date.now(), true)).not.toContain("ago");
		expect(dt.fromNow()).toBe("a few seconds ago");
		expect(dt.fromNow(true)).not.toContain("ago");
	});

	it("should support diff methods with accurate values", () => {
		const dt1 = DateTime.make("2023-01-01T00:00:00.000Z");
		const dt2 = DateTime.make("2024-02-15T12:30:45.500Z");

		expect(dt1.diffInYears(dt2)).toBe(-1);
		expect(dt1.diffInQuarters(dt2)).toBe(-4);
		expect(dt1.diffInMonths(dt2)).toBe(-13);
		expect(dt1.diffInWeeks(dt2)).toBe(-58);
		expect(dt1.diffInDays(dt2)).toBe(-410);
		expect(dt1.diffInHours(dt2)).toBe(-9852);
		expect(dt1.diffInMinutes(dt2)).toBe(-591_150);
		expect(dt1.diffInSeconds(dt2)).toBe(-35_469_045);
		expect(dt1.diffInMilliseconds(dt2)).toBe(-35_469_045_500);
	});
});
