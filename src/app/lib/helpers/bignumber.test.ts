import { BigNumber } from "./bignumber";

describe("BigNumber", () => {
	let subject: BigNumber;

	beforeEach(() => {
		subject = BigNumber.make(1);
	});

	it("#toString should not use the exponential notation up to the 35th number", () => {
		expect(BigNumber.make("33653665000000000000000000000000000").toString()).toBe(
			"33653665000000000000000000000000000",
		);
	});

	it("#toString should use the exponential notation above the 35th number", () => {
		expect(BigNumber.make("336536650000000000000000000000000000").toString()).toBe("3.3653665e+35");
	});

	it("#toString should succeed when input is provided as string", () => {
		expect(BigNumber.make("0").toString()).toBe("0");
		expect(BigNumber.make("1").toString()).toBe("1");
		expect(BigNumber.make("1.5").toString()).toBe("1.5");
		expect(BigNumber.make("1.500000000001").toString()).toBe("1.500000000001");
	});

	it("#toString should succeed when input is provided as number", () => {
		expect(BigNumber.make(0).toString()).toBe("0");
		expect(BigNumber.make(1).toString()).toBe("1");
		expect(BigNumber.make(1.5).toString()).toBe("1.5");
		expect(BigNumber.make(1.500_000_000_001).toString()).toBe("1.500000000001");
	});

	it("#toString should succeed when input is provided as bigint", () => {
		expect(BigNumber.make(BigInt(0)).toString()).toBe("0");
		expect(BigNumber.make(BigInt(1)).toString()).toBe("1");
		expect(BigNumber.make(BigInt(10)).toString()).toBe("10");
		expect(BigNumber.make(BigInt(1_234_567_890)).toString()).toBe("1234567890");
	});

	it("#toString should succeed when input is provided as BigNumber", () => {
		expect(BigNumber.make(BigNumber.ONE).toString()).toBe("1");
		expect(BigNumber.make(BigNumber.make(1.5)).toString()).toBe("1.5");
		expect(BigNumber.make(BigNumber.make(1.500_000_000_001)).toString()).toBe("1.500000000001");
		expect(BigNumber.make(BigNumber.make("1.5")).toString()).toBe("1.5");
		expect(BigNumber.make(BigNumber.make("1.500000000001")).toString()).toBe("1.500000000001");
	});

	it("#toString should not return a value having more than the specified decimals", () => {
		expect(BigNumber.make("1", 8).toString()).toBe("1");
		expect(BigNumber.make(1, 8).toString()).toBe("1");

		expect(BigNumber.make("1.5", 8).toString()).toBe("1.5");
		expect(BigNumber.make("1.500000000000", 8).toString()).toBe("1.5");
		expect(BigNumber.make(1.5, 8).toString()).toBe("1.5");

		expect(BigNumber.make("1.500000005555", 8).toString()).toBe("1.5");
		expect(BigNumber.make(1.500_000_005_555, 8).toString()).toBe("1.5");

		expect(BigNumber.make("1.500000015555", 8).toString()).toBe("1.50000001");
		expect(BigNumber.make(1.500_000_015_555, 8).toString()).toBe("1.50000001");
	});

	it("#decimalPlaces should succeed", () => {
		expect(BigNumber.make("12.3456789").decimalPlaces(0).valueOf()).toBe("12");
		expect(BigNumber.make("12.3456789").decimalPlaces(2).valueOf()).toBe("12.34");
		expect(BigNumber.make("12.3456789").decimalPlaces(4).valueOf()).toBe("12.3456");
		expect(BigNumber.make("112.3456789").decimalPlaces(6).valueOf()).toBe("112.345678");
	});

	it("#plus", () => {
		expect(BigNumber.make(10).plus(1).valueOf()).toBe("11");
	});

	it("#minus", () => {
		expect(BigNumber.make(10).minus(1).valueOf()).toBe("9");
	});

	it("#divide", () => {
		expect(BigNumber.make(10).divide(2).valueOf()).toBe("5");
		expect(BigNumber.make(5).divide(2).valueOf()).toBe("2.5");
		expect(BigNumber.make(2.5).divide(3).valueOf()).toBe("0.833333333333333333333333333333");

		expect(BigNumber.make("141000").divide("100000000").valueOf()).toBe("0.00141");
		expect(BigNumber.make(141_000).divide(1e8).valueOf()).toBe("0.00141");
	});

	it("#times", () => {
		expect(BigNumber.make(10).times(2).valueOf()).toBe("20");
		expect(BigNumber.make(2.5).times(2).valueOf()).toBe("5");
		expect(BigNumber.make(0.83).times(3).valueOf()).toBe("2.49");
	});

	it("#sum", () => {
		expect(BigNumber.sum([BigNumber.ONE, 1, "2", 3, 5]).valueOf()).toBe("12");
	});

	it("#powerOfTen", () => {
		expect(BigNumber.powerOfTen(0).valueOf()).toBe("1");
		expect(BigNumber.powerOfTen(1).valueOf()).toBe("10");
		expect(BigNumber.powerOfTen(2).valueOf()).toBe("100");
	});

	it("#isPositive", () => {
		expect(subject.isPositive()).toBe(true);
		expect(subject.minus(10).isPositive()).toBe(false);
	});

	it("#isNegative", () => {
		expect(subject.isNegative()).toBe(false);
		expect(subject.minus(10).isNegative()).toBe(true);
	});

	it("#isZero", () => {
		expect(subject.isZero()).toBe(false);
		expect(BigNumber.make(0).isZero()).toBe(true);
	});

	it("#comparedTo", () => {
		expect(subject.comparedTo(BigNumber.make(1))).toBe(0);
		expect(subject.comparedTo(BigNumber.make(0))).toBe(1);
		expect(subject.comparedTo(BigNumber.make(-1))).toBe(1);
		expect(subject.comparedTo(BigNumber.make(2))).toBe(-1);
	});

	it("#isEqualTo", () => {
		expect(subject.isEqualTo(BigNumber.make(1))).toBe(true);
		expect(subject.isEqualTo(BigNumber.make(2))).toBe(false);
	});

	it("#isGreaterThan", () => {
		expect(subject.isGreaterThan(BigNumber.make(0))).toBe(true);
		expect(subject.isGreaterThan(BigNumber.make(2))).toBe(false);
	});

	it("#isGreaterThanOrEqualTo", () => {
		expect(subject.isGreaterThanOrEqualTo(BigNumber.make(0))).toBe(true);
		expect(subject.isGreaterThanOrEqualTo(BigNumber.make(1))).toBe(true);
		expect(subject.isGreaterThanOrEqualTo(BigNumber.make(0))).toBe(true);
		expect(subject.isGreaterThanOrEqualTo(BigNumber.make(3))).toBe(false);
	});

	it("#isLessThan", () => {
		expect(subject.isLessThan(BigNumber.make(2))).toBe(true);
		expect(subject.isLessThan(BigNumber.make(1))).toBe(false);
	});

	it("#isLessThanOrEqualTo", () => {
		expect(subject.isLessThanOrEqualTo(BigNumber.make(1))).toBe(true);
		expect(subject.isLessThanOrEqualTo(BigNumber.make(1))).toBe(true);
		expect(subject.isLessThanOrEqualTo(BigNumber.make(2))).toBe(true);
		expect(subject.isLessThanOrEqualTo(BigNumber.make(0))).toBe(false);
	});

	it("#denominated", () => {
		expect(BigNumber.make(100).denominated().isEqualTo(BigNumber.make(100))).toBe(true);
		expect(
			BigNumber.make(100 * 1e8, 8)
				.denominated()
				.isEqualTo(BigNumber.make(100)),
		).toBe(true);
		expect(
			BigNumber.make(100 * 1e8)
				.denominated(8)
				.isEqualTo(BigNumber.make(100)),
		).toBe(true);

		expect(BigNumber.make(123_456_789, 5).denominated().toString()).toBe(BigNumber.make(1234.567_89).toString());

		expect(BigNumber.make(123_456_789).denominated(5).toString()).toBe(BigNumber.make(1234.567_89).toString());

		expect(BigNumber.make(123_456_789, 5).denominated().isEqualTo(BigNumber.make(1234.567_89))).toBe(true);

		expect(BigNumber.make(123_456_789).denominated(5).isEqualTo(BigNumber.make(1234.567_89))).toBe(true);
	});

	it("#toSatoshi", () => {
		expect(BigNumber.make(100).toSatoshi().toString()).toBe("100");
		expect(BigNumber.make(100).toSatoshi(10).toString()).toBe("1000000000000");
		expect(BigNumber.make(123_456_789, 5).toSatoshi().toString()).toBe("12345678900000");
		expect(BigNumber.make(1, 8).toSatoshi().toString()).toBe("100000000");
		expect(BigNumber.make("0.00000001", 8).toSatoshi().toString()).toBe("1");
	});

	it("#toHuman", () => {
		expect(BigNumber.make(100 * 1e8, 8).toHuman()).toBe(100);
		expect(BigNumber.make(123.456 * 1e8, 8).toHuman()).toBe(123.456);
		expect(BigNumber.make(123.456_789 * 1e8, 8).toHuman()).toBe(123.456_789);
		expect(BigNumber.make(1e8).times(1e8).toHuman(8)).toBe(+`${1e8}`);
		expect(BigNumber.make(123_456).toHuman()).toBe(123_456);
		expect(BigNumber.make(123_456).toHuman(0)).toBe(123_456);
		expect(BigNumber.make(123_456).toHuman(1)).toBe(12_345.6);
		expect(BigNumber.make(123_456, 1).toHuman()).toBe(12_345.6);
		expect(BigNumber.make(123_456).toHuman(6)).toBe(0.123_456);
		expect(BigNumber.make(123_456, 6).toHuman()).toBe(0.123_456);
		expect(BigNumber.make(1, 8).toHuman()).toBe(+`${1e-8}`);
	});

	it("#toFixed", () => {
		expect(subject.toFixed()).toBe("1");

		expect(subject.toFixed(0)).toBe("1");
		expect(subject.toFixed(2)).toBe("1.00");

		expect(BigNumber.make(1.234_567_891).toFixed(5)).toBe("1.23456");
		expect(BigNumber.make(1.234_567_891).toFixed(28)).toBe("1.2345678910000000000000000000");
		expect(BigNumber.make(1.234_567_891).toFixed(32)).toBe("1.23456789100000000000000000000000");

		expect(BigNumber.make(".123").toFixed(5)).toBe("0.12300");
		expect(BigNumber.make("00010.00010").toFixed(0)).toBe("10");
		expect(BigNumber.make("00010.00010").toFixed(4)).toBe("10.0001");

		expect(BigNumber.make(123.456).toFixed()).toBe("123.456");
		expect(BigNumber.make(123.456).toFixed(0)).toBe("123");
		expect(BigNumber.make(123.456).toFixed(5)).toBe("123.45600");
		expect(BigNumber.make(123.456).toFixed(2)).toBe("123.45");

		expect(BigNumber.make(123).toFixed(5)).toBe("123.00000");
		expect(BigNumber.make(123_456).toFixed()).toBe("123456");
		expect(BigNumber.make(123_456).toFixed(0)).toBe("123456");
	});

	it("#toNumber", () => {
		expect(subject.toNumber()).toBe(1);
	});

	it("#toBigInt", () => {
		expect(subject.toBigInt()).toBe(BigInt(1));
	});

	it("#valueOf", () => {
		expect(subject.valueOf()).toBe("1");
	});
});
