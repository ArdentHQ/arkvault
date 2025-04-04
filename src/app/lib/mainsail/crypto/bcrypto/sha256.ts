// @ts-nocheck

/*!
 * sha256.js - SHA256 implementation for bcrypto
 * Copyright (c) 2016-2019, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcrypto
 *
 * Parts of this software are based on indutny/hash.js:
 *   Copyright (c) 2014, Fedor Indutny (MIT License).
 *   https://github.com/indutny/hash.js
 *
 * Resources:
 *   https://en.wikipedia.org/wiki/SHA-2
 *   https://tools.ietf.org/html/rfc4634
 *   https://github.com/indutny/hash.js/blob/master/lib/hash/sha/256.js
 */

"use strict";

import { assert } from "./assert";
import { HMAC } from "./hmac";

/*
 * Constants
 */

const FINALIZED = -1;
const DESC = Buffer.alloc(8, 0x00);
const PADDING = Buffer.alloc(64, 0x00);

PADDING[0] = 0x80;

const K = new Uint32Array([
	0x42_8A_2F_98, 0x71_37_44_91, 0xB5_C0_FB_CF, 0xE9_B5_DB_A5, 0x39_56_C2_5B, 0x59_F1_11_F1, 0x92_3F_82_A4, 0xAB_1C_5E_D5, 0xD8_07_AA_98,
	0x12_83_5B_01, 0x24_31_85_BE, 0x55_0C_7D_C3, 0x72_BE_5D_74, 0x80_DE_B1_FE, 0x9B_DC_06_A7, 0xC1_9B_F1_74, 0xE4_9B_69_C1, 0xEF_BE_47_86,
	0x0F_C1_9D_C6, 0x24_0C_A1_CC, 0x2D_E9_2C_6F, 0x4A_74_84_AA, 0x5C_B0_A9_DC, 0x76_F9_88_DA, 0x98_3E_51_52, 0xA8_31_C6_6D, 0xB0_03_27_C8,
	0xBF_59_7F_C7, 0xC6_E0_0B_F3, 0xD5_A7_91_47, 0x06_CA_63_51, 0x14_29_29_67, 0x27_B7_0A_85, 0x2E_1B_21_38, 0x4D_2C_6D_FC, 0x53_38_0D_13,
	0x65_0A_73_54, 0x76_6A_0A_BB, 0x81_C2_C9_2E, 0x92_72_2C_85, 0xA2_BF_E8_A1, 0xA8_1A_66_4B, 0xC2_4B_8B_70, 0xC7_6C_51_A3, 0xD1_92_E8_19,
	0xD6_99_06_24, 0xF4_0E_35_85, 0x10_6A_A0_70, 0x19_A4_C1_16, 0x1E_37_6C_08, 0x27_48_77_4C, 0x34_B0_BC_B5, 0x39_1C_0C_B3, 0x4E_D8_AA_4A,
	0x5B_9C_CA_4F, 0x68_2E_6F_F3, 0x74_8F_82_EE, 0x78_A5_63_6F, 0x84_C8_78_14, 0x8C_C7_02_08, 0x90_BE_FF_FA, 0xA4_50_6C_EB, 0xBE_F9_A3_F7,
	0xC6_71_78_F2,
]);

/**
 * SHA256
 */

class SHA256 {
	constructor() {
		this.state = new Uint32Array(8);
		this.msg = new Uint32Array(64);
		this.block = Buffer.alloc(64);
		this.size = FINALIZED;
	}

	init() {
		this.state[0] = 0x6A_09_E6_67;
		this.state[1] = 0xBB_67_AE_85;
		this.state[2] = 0x3C_6E_F3_72;
		this.state[3] = 0xA5_4F_F5_3A;
		this.state[4] = 0x51_0E_52_7F;
		this.state[5] = 0x9B_05_68_8C;
		this.state[6] = 0x1F_83_D9_AB;
		this.state[7] = 0x5B_E0_CD_19;
		this.size = 0;
		return this;
	}

	update(data) {
		assert(Buffer.isBuffer(data));
		this._update(data, data.length);
		return this;
	}

	final() {
		return this._final(Buffer.alloc(32));
	}

	_update(data, len) {
		assert(this.size !== FINALIZED, "Context is not initialized.");

		let pos = this.size & 63;
		let off = 0;

		this.size += len;

		if (pos > 0) {
			let want = 64 - pos;

			if (want > len) {want = len;}

			data.copy(this.block, pos, off, off + want);

			pos += want;
			len -= want;
			off += want;

			if (pos < 64) {return;}

			this._transform(this.block, 0);
		}

		while (len >= 64) {
			this._transform(data, off);
			off += 64;
			len -= 64;
		}

		if (len > 0) {data.copy(this.block, 0, off, off + len);}
	}

	_final(out) {
		assert(this.size !== FINALIZED, "Context is not initialized.");

		const pos = this.size & 63;
		const len = this.size * 8;

		writeU32(DESC, (len * (1 / 0x1_00_00_00_00)) >>> 0, 0);
		writeU32(DESC, len >>> 0, 4);

		this._update(PADDING, 1 + ((119 - pos) & 63));
		this._update(DESC, 8);

		for (let index = 0; index < 8; index++) {
			writeU32(out, this.state[index], index * 4);
			this.state[index] = 0;
		}

		for (let index = 0; index < 64; index++) {this.msg[index] = 0;}

		for (let index = 0; index < 64; index++) {this.block[index] = 0;}

		this.size = FINALIZED;

		return out;
	}

	_transform(chunk, pos) {
		const W = this.msg;

		let a = this.state[0];
		let b = this.state[1];
		let c = this.state[2];
		let d = this.state[3];
		let e = this.state[4];
		let f = this.state[5];
		let g = this.state[6];
		let h = this.state[7];
		let index = 0;

		for (; index < 16; index++) {W[index] = readU32(chunk, pos + index * 4);}

		for (; index < 64; index++) {W[index] = sigma1(W[index - 2]) + W[index - 7] + sigma0(W[index - 15]) + W[index - 16];}

		for (index = 0; index < 64; index++) {
			const t1 = h + Sigma1(e) + Ch(e, f, g) + K[index] + W[index];
			const t2 = Sigma0(a) + Maj(a, b, c);

			h = g;
			g = f;
			f = e;

			e = (d + t1) >>> 0;

			d = c;
			c = b;
			b = a;

			a = (t1 + t2) >>> 0;
		}

		this.state[0] += a;
		this.state[1] += b;
		this.state[2] += c;
		this.state[3] += d;
		this.state[4] += e;
		this.state[5] += f;
		this.state[6] += g;
		this.state[7] += h;
	}

	static hash() {
		return new SHA256();
	}

	static hmac() {
		return new HMAC(SHA256, 64);
	}

	static digest(data) {
		return SHA256.ctx.init().update(data).final();
	}

	static root(left, right) {
		assert(Buffer.isBuffer(left) && left.length === 32);
		assert(Buffer.isBuffer(right) && right.length === 32);
		return SHA256.ctx.init().update(left).update(right).final();
	}

	static multi(x, y, z) {
		const { ctx } = SHA256;

		ctx.init();
		ctx.update(x);
		ctx.update(y);

		if (z) {ctx.update(z);}

		return ctx.final();
	}

	static mac(data, key) {
		return SHA256.hmac().init(key).update(data).final();
	}
}

/*
 * Static
 */

SHA256.native = 0;
SHA256.id = "SHA256";
SHA256.size = 32;
SHA256.bits = 256;
SHA256.blockSize = 64;
SHA256.zero = Buffer.alloc(32, 0x00);
SHA256.ctx = new SHA256();

/*
 * Helpers
 */

function Sigma0(x) {
	return ((x >>> 2) | (x << 30)) ^ ((x >>> 13) | (x << 19)) ^ ((x >>> 22) | (x << 10));
}

function Sigma1(x) {
	return ((x >>> 6) | (x << 26)) ^ ((x >>> 11) | (x << 21)) ^ ((x >>> 25) | (x << 7));
}

function sigma0(x) {
	return ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
}

function sigma1(x) {
	return ((x >>> 17) | (x << 15)) ^ ((x >>> 19) | (x << 13)) ^ (x >>> 10);
}

function Ch(x, y, z) {
	return z ^ (x & (y ^ z));
}

function Maj(x, y, z) {
	return (x & y) | (z & (x | y));
}

function readU32(data, off) {
	return data[off++] * 0x1_00_00_00 + data[off++] * 0x1_00_00 + data[off++] * 0x1_00 + data[off];
}

function writeU32(data, number_, off) {
	data[off++] = number_ >>> 24;
	data[off++] = number_ >>> 16;
	data[off++] = number_ >>> 8;
	data[off++] = number_;
	return off;
}

/*
 * Expose
 */

export { SHA256 };
