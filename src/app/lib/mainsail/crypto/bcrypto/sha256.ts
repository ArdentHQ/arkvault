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
	0x42_8a_2f_98, 0x71_37_44_91, 0xb5_c0_fb_cf, 0xe9_b5_db_a5, 0x39_56_c2_5b, 0x59_f1_11_f1, 0x92_3f_82_a4,
	0xab_1c_5e_d5, 0xd8_07_aa_98, 0x12_83_5b_01, 0x24_31_85_be, 0x55_0c_7d_c3, 0x72_be_5d_74, 0x80_de_b1_fe,
	0x9b_dc_06_a7, 0xc1_9b_f1_74, 0xe4_9b_69_c1, 0xef_be_47_86, 0x0f_c1_9d_c6, 0x24_0c_a1_cc, 0x2d_e9_2c_6f,
	0x4a_74_84_aa, 0x5c_b0_a9_dc, 0x76_f9_88_da, 0x98_3e_51_52, 0xa8_31_c6_6d, 0xb0_03_27_c8, 0xbf_59_7f_c7,
	0xc6_e0_0b_f3, 0xd5_a7_91_47, 0x06_ca_63_51, 0x14_29_29_67, 0x27_b7_0a_85, 0x2e_1b_21_38, 0x4d_2c_6d_fc,
	0x53_38_0d_13, 0x65_0a_73_54, 0x76_6a_0a_bb, 0x81_c2_c9_2e, 0x92_72_2c_85, 0xa2_bf_e8_a1, 0xa8_1a_66_4b,
	0xc2_4b_8b_70, 0xc7_6c_51_a3, 0xd1_92_e8_19, 0xd6_99_06_24, 0xf4_0e_35_85, 0x10_6a_a0_70, 0x19_a4_c1_16,
	0x1e_37_6c_08, 0x27_48_77_4c, 0x34_b0_bc_b5, 0x39_1c_0c_b3, 0x4e_d8_aa_4a, 0x5b_9c_ca_4f, 0x68_2e_6f_f3,
	0x74_8f_82_ee, 0x78_a5_63_6f, 0x84_c8_78_14, 0x8c_c7_02_08, 0x90_be_ff_fa, 0xa4_50_6c_eb, 0xbe_f9_a3_f7,
	0xc6_71_78_f2,
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
		this.state[0] = 0x6a_09_e6_67;
		this.state[1] = 0xbb_67_ae_85;
		this.state[2] = 0x3c_6e_f3_72;
		this.state[3] = 0xa5_4f_f5_3a;
		this.state[4] = 0x51_0e_52_7f;
		this.state[5] = 0x9b_05_68_8c;
		this.state[6] = 0x1f_83_d9_ab;
		this.state[7] = 0x5b_e0_cd_19;
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

			if (want > len) {
				want = len;
			}

			data.copy(this.block, pos, off, off + want);

			pos += want;
			len -= want;
			off += want;

			if (pos < 64) {
				return;
			}

			this._transform(this.block, 0);
		}

		while (len >= 64) {
			this._transform(data, off);
			off += 64;
			len -= 64;
		}

		if (len > 0) {
			data.copy(this.block, 0, off, off + len);
		}
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

		for (let index = 0; index < 64; index++) {
			this.msg[index] = 0;
		}

		for (let index = 0; index < 64; index++) {
			this.block[index] = 0;
		}

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

		for (; index < 16; index++) {
			W[index] = readU32(chunk, pos + index * 4);
		}

		for (; index < 64; index++) {
			W[index] = sigma1(W[index - 2]) + W[index - 7] + sigma0(W[index - 15]) + W[index - 16];
		}

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

		if (z) {
			ctx.update(z);
		}

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
