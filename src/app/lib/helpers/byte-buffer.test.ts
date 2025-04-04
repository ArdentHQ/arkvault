import { describe, it, expect } from "vitest";
import { ByteBuffer } from "./byte-buffer";

describe("ByteBuffer", () => {
	it("should return valid result & result length", () => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(1));

		expect(byteBuffer.getResultLength()).toBe(0);
		expect(Buffer.alloc(0).compare(byteBuffer.getResult())).toBe(0);

		byteBuffer.writeInt8(1);

		const comparisonBuffer = Buffer.alloc(1);
		comparisonBuffer.writeInt8(1);
		expect(byteBuffer.getResultLength()).toBe(1);
		expect(comparisonBuffer.compare(byteBuffer.getResult())).toBe(0);
	});

	it("should return valid remainders and remainder length", () => {
		const buffer = Buffer.alloc(1);
		buffer.writeInt8(1);
		const byteBuffer = new ByteBuffer(buffer);

		expect(byteBuffer.getRemainderLength()).toBe(1);
		expect(buffer.compare(byteBuffer.getRemainder())).toBe(0);

		byteBuffer.readInt8();

		expect(byteBuffer.getRemainderLength()).toBe(0);
		expect(Buffer.alloc(0).compare(byteBuffer.getRemainder())).toBe(0);
	});

	it("#jump should change current offset", () => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(1));

		expect(byteBuffer.getResultLength()).toBe(0);

		byteBuffer.jump(1);

		expect(byteBuffer.getResultLength()).toBe(1);

		byteBuffer.jump(-1);

		expect(byteBuffer.getResultLength()).toBe(0);
	});

	it("#jump throw error when jumping outside boundary", () => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(1));

		expect(() => byteBuffer.jump(2)).toThrow("Jump over buffer boundary");
		expect(() => byteBuffer.jump(-1)).toThrow("Jump over buffer boundary");
	});
});

describe("ByteBuffer#Int8", () => {
	const bufferSize = 1;
	const min = -128;
	const max = 127;
	const validValues = [min, max];
	const invalidValues = [min - 1, max + 1];

	it.each(validValues)("should write and read value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));
		byteBuffer.writeInt8(dataset);

		expect(byteBuffer.getResultLength()).toBe(bufferSize);

		byteBuffer.reset();

		expect(byteBuffer.readInt8()).toBe(dataset);
		expect(byteBuffer.getResultLength()).toBe(bufferSize);
	});

	it.each(invalidValues)("should throw RangeError for value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));

		expect(() => byteBuffer.writeInt8(dataset)).toThrowError(RangeError);
		expect(byteBuffer.getResultLength()).toBe(0);
	});
});

describe("ByteBuffer#UInt8", () => {
	const bufferSize = 1;
	const min = 0;
	const max = 255;
	const validValues = [min, max];
	const invalidValues = [min - 1, max + 1];

	it.each(validValues)("should write and read value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));
		byteBuffer.writeUInt8(dataset);

		expect(byteBuffer.getResultLength()).toBe(bufferSize);

		byteBuffer.reset();

		expect(byteBuffer.readUInt8()).toBe(dataset);
		expect(byteBuffer.getResultLength()).toBe(bufferSize);
	});

	it.each(invalidValues)("should throw RangeError for value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));

		expect(() => byteBuffer.writeUInt8(dataset)).toThrowError(RangeError);
		expect(byteBuffer.getResultLength()).toBe(0);
	});
});

describe("ByteBuffer#Int16BE", () => {
	const bufferSize = 2;
	const min = -32768;
	const max = 32767;
	const validValues = [min, max];
	const invalidValues = [min - 1, max + 1];

	it.each(validValues)("should write and read value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));
		byteBuffer.writeInt16BE(dataset);

		expect(byteBuffer.getResultLength()).toBe(bufferSize);

		byteBuffer.reset();

		expect(byteBuffer.readInt16BE()).toBe(dataset);
		expect(byteBuffer.getResultLength()).toBe(bufferSize);
	});

	it.each(invalidValues)("should throw RangeError for value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));

		expect(() => byteBuffer.writeInt16BE(dataset)).toThrowError(RangeError);
		expect(byteBuffer.getResultLength()).toBe(0);
	});
});

describe("ByteBuffer#UInt16BE", () => {
	const bufferSize = 2;
	const min = 0;
	const max = 65535;
	const validValues = [min, max];
	const invalidValues = [min - 1, max + 1];

	it.each(validValues)("should write and read value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));
		byteBuffer.writeUInt16BE(dataset);

		expect(byteBuffer.getResultLength()).toBe(bufferSize);

		byteBuffer.reset();

		expect(byteBuffer.readUInt16BE()).toBe(dataset);
		expect(byteBuffer.getResultLength()).toBe(bufferSize);
	});

	it.each(invalidValues)("should throw RangeError for value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));

		expect(() => byteBuffer.writeUInt16BE(dataset)).toThrowError(RangeError);
		expect(byteBuffer.getResultLength()).toBe(0);
	});
});

describe("ByteBuffer#Int16LE", () => {
	const bufferSize = 2;
	const min = -32768;
	const max = 32767;
	const validValues = [min, max];
	const invalidValues = [min - 1, max + 1];

	it.each(validValues)("should write and read value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));
		byteBuffer.writeInt16LE(dataset);

		expect(byteBuffer.getResultLength()).toBe(bufferSize);

		byteBuffer.reset();

		expect(byteBuffer.readInt16LE()).toBe(dataset);
		expect(byteBuffer.getResultLength()).toBe(bufferSize);
	});

	it.each(invalidValues)("should throw RangeError for value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));

		expect(() => byteBuffer.writeInt16LE(dataset)).toThrowError(RangeError);
		expect(byteBuffer.getResultLength()).toBe(0);
	});
});

describe("ByteBuffer#UInt16LE", () => {
	const bufferSize = 2;
	const min = 0;
	const max = 65535;
	const validValues = [min, max];
	const invalidValues = [min - 1, max + 1];

	it.each(validValues)("should write and read value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));
		byteBuffer.writeUInt16LE(dataset);

		expect(byteBuffer.getResultLength()).toBe(bufferSize);

		byteBuffer.reset();

		expect(byteBuffer.readUInt16LE()).toBe(dataset);
		expect(byteBuffer.getResultLength()).toBe(bufferSize);
	});

	it.each(invalidValues)("should throw RangeError for value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));

		expect(() => byteBuffer.writeUInt16LE(dataset)).toThrowError(RangeError);
		expect(byteBuffer.getResultLength()).toBe(0);
	});
});

describe("ByteBuffer#Int32BE", () => {
	const bufferSize = 4;
	const min = -2147483648;
	const max = 2147483647;
	const validValues = [min, max];
	const invalidValues = [min - 1, max + 1];

	it.each(validValues)("should write and read value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));
		byteBuffer.writeInt32BE(dataset);

		expect(byteBuffer.getResultLength()).toBe(bufferSize);

		byteBuffer.reset();

		expect(byteBuffer.readInt32BE()).toBe(dataset);
		expect(byteBuffer.getResultLength()).toBe(bufferSize);
	});

	it.each(invalidValues)("should throw RangeError for value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));

		expect(() => byteBuffer.writeInt32BE(dataset)).toThrowError(RangeError);
		expect(byteBuffer.getResultLength()).toBe(0);
	});
});

describe("ByteBuffer#UInt32BE", () => {
	const bufferSize = 4;
	const min = 0;
	const max = 4294967295;
	const validValues = [min, max];
	const invalidValues = [min - 1, max + 1];

	it.each(validValues)("should write and read value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));
		byteBuffer.writeUInt32BE(dataset);

		expect(byteBuffer.getResultLength()).toBe(bufferSize);

		byteBuffer.reset();

		expect(byteBuffer.readUInt32BE()).toBe(dataset);
		expect(byteBuffer.getResultLength()).toBe(bufferSize);
	});

	it.each(invalidValues)("should throw RangeError for value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));

		expect(() => byteBuffer.writeUInt32BE(dataset)).toThrowError(RangeError);
		expect(byteBuffer.getResultLength()).toBe(0);
	});
});

describe("ByteBuffer#Int32LE", () => {
	const bufferSize = 4;
	const min = -2147483648;
	const max = 2147483647;
	const validValues = [min, max];
	const invalidValues = [min - 1, max + 1];

	it.each(validValues)("should write and read value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));
		byteBuffer.writeInt32LE(dataset);

		expect(byteBuffer.getResultLength()).toBe(bufferSize);

		byteBuffer.reset();

		expect(byteBuffer.readInt32LE()).toBe(dataset);
		expect(byteBuffer.getResultLength()).toBe(bufferSize);
	});

	it.each(invalidValues)("should throw RangeError for value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));

		expect(() => byteBuffer.writeInt32LE(dataset)).toThrowError(RangeError);
		expect(byteBuffer.getResultLength()).toBe(0);
	});
});

describe("ByteBuffer#UInt32LE", () => {
	const bufferSize = 4;
	const min = 0;
	const max = 4294967295;
	const validValues = [min, max];
	const invalidValues = [min - 1, max + 1];

	it.each(validValues)("should write and read value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));
		byteBuffer.writeUInt32LE(dataset);

		expect(byteBuffer.getResultLength()).toBe(bufferSize);

		byteBuffer.reset();

		expect(byteBuffer.readUInt32LE()).toBe(dataset);
		expect(byteBuffer.getResultLength()).toBe(bufferSize);
	});

	it.each(invalidValues)("should throw RangeError for value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));

		expect(() => byteBuffer.writeUInt32LE(dataset)).toThrowError(RangeError);
		expect(byteBuffer.getResultLength()).toBe(0);
	});
});

describe("ByteBuffer#BigInt64BE", () => {
	const bufferSize = 8;
	const min = -9223372036854775808n;
	const max = 9223372036854775807n;
	const validValues = [min, max];
	const invalidValues = [min - 1n, max + 1n];

	it.each(validValues)("should write and read value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));
		byteBuffer.writeBigInt64BE(dataset);

		expect(byteBuffer.getResultLength()).toBe(bufferSize);

		byteBuffer.reset();

		expect(byteBuffer.readBigInt64BE()).toBe(dataset);
		expect(byteBuffer.getResultLength()).toBe(bufferSize);
	});

	it.each(invalidValues)("should throw RangeError for value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));

		expect(() => byteBuffer.writeBigInt64BE(dataset)).toThrowError(RangeError);
		expect(byteBuffer.getResultLength()).toBe(0);
	});
});

describe("ByteBuffer#BigUInt64BE", () => {
	const bufferSize = 8;
	const min = 0n;
	const max = 18_446_744_073_709_551_615n;
	const validValues = [min, max];
	const invalidValues = [min - 1n, max + 1n];

	it.each(validValues)("should write and read value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));
		byteBuffer.writeBigUInt64BE(dataset);

		expect(byteBuffer.getResultLength()).toBe(bufferSize);

		byteBuffer.reset();

		expect(byteBuffer.readBigUInt64BE()).toBe(dataset);
		expect(byteBuffer.getResultLength()).toBe(bufferSize);
	});

	it.each(invalidValues)("should throw RangeError for value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));

		expect(() => byteBuffer.writeBigUInt64BE(dataset)).toThrowError(RangeError);
		expect(byteBuffer.getResultLength()).toBe(0);
	});
});

describe("ByteBuffer#BigInt64LE", () => {
	const bufferSize = 8;
	const min = -9223372036854775808n;
	const max = 9223372036854775807n;
	const validValues = [min, max];
	const invalidValues = [min - 1n, max + 1n];

	it.each(validValues)("should write and read value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));
		byteBuffer.writeBigInt64LE(dataset);

		expect(byteBuffer.getResultLength()).toBe(bufferSize);

		byteBuffer.reset();

		expect(byteBuffer.readBigInt64LE()).toBe(dataset);
		expect(byteBuffer.getResultLength()).toBe(bufferSize);
	});

	it.each(invalidValues)("should throw RangeError for value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));

		expect(() => byteBuffer.writeBigInt64LE(dataset)).toThrowError(RangeError);
		expect(byteBuffer.getResultLength()).toBe(0);
	});
});

describe("ByteBuffer#BigUInt64LE", () => {
	const bufferSize = 8;
	const min = 0n;
	const max = 18_446_744_073_709_551_615n;
	const validValues = [min, max];
	const invalidValues = [min - 1n, max + 1n];

	it.each(validValues)("should write and read value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));
		byteBuffer.writeBigUInt64LE(dataset);

		expect(byteBuffer.getResultLength()).toBe(bufferSize);

		byteBuffer.reset();

		expect(byteBuffer.readBigUInt64LE()).toBe(dataset);
		expect(byteBuffer.getResultLength()).toBe(bufferSize);
	});

	it.each(invalidValues)("should throw RangeError for value (%s)", (dataset) => {
		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));

		expect(() => byteBuffer.writeBigUInt64LE(dataset)).toThrowError(RangeError);
		expect(byteBuffer.getResultLength()).toBe(0);
	});
});

describe("ByteBuffer#buffer", () => {
	it("should return valid result & result length", () => {
		const bufferSize = 5;
		const bufferToCompare = Buffer.alloc(bufferSize).fill(1);

		const byteBuffer = new ByteBuffer(Buffer.alloc(bufferSize));
		byteBuffer.writeBuffer(bufferToCompare);

		expect(byteBuffer.getResultLength()).toBe(bufferSize);

		byteBuffer.reset();

		expect(bufferToCompare.compare(byteBuffer.readBuffer(bufferSize))).toBe(0);
		expect(byteBuffer.getResultLength()).toBe(bufferSize);
	});

	it("should throw when writing over boundary", () => {
		const buffer = Buffer.alloc(5);
		const byteBuffer = new ByteBuffer(buffer);

		expect(() => byteBuffer.writeBuffer(Buffer.alloc(6))).toThrow("Write over buffer boundary");
	});

	it("should throw reading writing over boundary", () => {
		const buffer = Buffer.alloc(5);
		const byteBuffer = new ByteBuffer(buffer);

		expect(() => byteBuffer.readBuffer(6)).toThrow("Read over buffer boundary");
	});
});
