const Environment = require("jest-environment-jsdom");
const crypto = require("crypto");

/**
 * A custom environment to set TextEncoder and TextDecoder.
 */
module.exports = class CustomTestEnvironment extends Environment {
	constructor(config) {
		super(
			Object.assign({}, config, {
				globals: Object.assign({}, config.globals, {
					Uint8Array: Uint8Array,
					ArrayBuffer: ArrayBuffer,
				}),
			}),
		);
	}

	async setup() {
		await super.setup();

		this.global.crypto = {
			...crypto,
			getRandomValues: crypto.randomFillSync,
		};

		if (typeof this.global.TextEncoder === "undefined") {
			const { TextEncoder, TextDecoder } = require("util");
			this.global.TextEncoder = TextEncoder;
			this.global.TextDecoder = TextDecoder;
		}

		this.global.CSS = {
			supports: () => true,
		};
	}
};
