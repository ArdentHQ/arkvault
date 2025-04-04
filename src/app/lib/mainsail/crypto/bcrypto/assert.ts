// @ts-nocheck

/*!
 * assert.js - assert for bcrypto
 * Copyright (c) 2020, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcrypto
 */

"use strict";

/*
 * Assert
 */

export function assert(value, message) {
	if (!value) {
		const err = new Error(message || "Assertion failed");

		if (Error.captureStackTrace) {Error.captureStackTrace(err, assert);}

		throw err;
	}
}
