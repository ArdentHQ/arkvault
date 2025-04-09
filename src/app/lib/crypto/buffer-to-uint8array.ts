export type CrossBuffer = Buffer | Uint8Array;

export const toArrayBuffer = (value: CrossBuffer | string): Uint8Array => {
	if (value instanceof Buffer) {
		const buffer = new ArrayBuffer(value.length);
		const result = new Uint8Array(buffer);

		for (const [index, element] of value.entries()) {
			result[index] = element;
		}

		return result;
	}

	if (value instanceof Uint8Array) {
		return value;
	}

	return new TextEncoder().encode(value);
};

export const toArrayBufferList = (values: CrossBuffer[]): Uint8Array[] =>
	values.map((value: Uint8Array | Buffer) => toArrayBuffer(value));
