export class CryptoError extends Error {
	public constructor(message: string) {
		super(message);

		Object.defineProperty(this, "message", {
			enumerable: false,
			value: message,
		});

		Object.defineProperty(this, "name", {
			enumerable: false,
			value: this.constructor.name,
		});

		Error.captureStackTrace(this, this.constructor);
	}
}

export class NetworkVersionError extends CryptoError {
	public constructor(expected: string | number, given: string | number) {
		super(`Expected version to be ${expected}, but got ${given}.`);
	}
}

export class PrivateKeyLengthError extends CryptoError {
	public constructor(expected: string | number, given: string | number) {
		super(`Expected length to be ${expected}, but got ${given}.`);
	}
}

export class PublicKeyError extends CryptoError {
	public constructor(given: string) {
		super(`Expected ${given} to be a valid public key.`);
	}
}

export class AddressNetworkError extends CryptoError {
	public constructor(what: string) {
		super(what);
	}
}

export class InvalidMultiSignatureAssetError extends CryptoError {
	public constructor() {
		super(`The multi signature asset is invalid.`);
	}
}

export class InvalidBase58ChecksumError extends CryptoError {
	public constructor() {
		super("Invalid checksum for base58 string.");
	}
}
