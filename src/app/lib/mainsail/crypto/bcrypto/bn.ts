// @ts-nocheck

/*!
 * bn.js - big numbers for bcrypto
 * Copyright (c) 2018-2019, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcrypto
 *
 * Parts of this software are based on indutny/bn.js:
 *   Copyright (c) 2015, Fedor Indutny (MIT License).
 *   https://github.com/indutny/bn.js
 *
 * Parts of this software are based on golang/go:
 *   Copyright (c) 2009, The Go Authors. All rights reserved.
 *   https://github.com/golang/go
 *
 * Parts of this software are based on openssl/openssl:
 *   Copyright (c) 1998-2018, The OpenSSL Project (Apache License v2.0).
 *   Copyright (c) 1995-1998, Eric A. Young, Tim J. Hudson. All rights reserved.
 *   https://github.com/openssl/openssl
 *
 * Parts of this software are based on libgmp:
 *   Copyright (c) 1991-1997, 1999-2014, Free Software Foundation, Inc.
 *   https://gmplib.org/
 *
 * Parts of this software are based on v8/v8:
 *   Copyright (c) 2017, The V8 Project Authors (BSD-Style License).
 *   https://github.com/v8/v8
 *
 * Resources:
 *   https://github.com/indutny/bn.js/blob/master/lib/bn.js
 *   https://github.com/indutny/miller-rabin/blob/master/lib/mr.js
 *   https://github.com/golang/go/blob/master/src/math/big/int.go
 *   https://github.com/golang/go/blob/master/src/math/big/nat.go
 *   https://github.com/golang/go/blob/master/src/math/big/prime.go
 *   https://github.com/openssl/openssl/tree/master/crypto/bn
 *   https://github.com/openssl/openssl/blob/master/crypto/bn/bn_kron.c
 *   https://github.com/gnutls/nettle/blob/master/mini-gmp.c
 *   https://github.com/v8/v8/blob/master/src/objects/bigint.cc
 */

/* eslint valid-typeof: "off" */

"use strict";

import { custom } from "./custom";

/*
 * Constants
 */

const zeros = [
	"",
	"0",
	"00",
	"000",
	"0000",
	"00000",
	"000000",
	"0000000",
	"00000000",
	"000000000",
	"0000000000",
	"00000000000",
	"000000000000",
	"0000000000000",
	"00000000000000",
	"000000000000000",
	"0000000000000000",
	"00000000000000000",
	"000000000000000000",
	"0000000000000000000",
	"00000000000000000000",
	"000000000000000000000",
	"0000000000000000000000",
	"00000000000000000000000",
	"000000000000000000000000",
	"0000000000000000000000000",
];

const groupSizes = [
	0x00, 0x19, 0x10, 0x0C, 0x0B, 0x0A, 0x09, 0x08, 0x08, 0x07, 0x07, 0x07, 0x07, 0x06, 0x06, 0x06, 0x06, 0x06, 0x06,
	0x06, 0x05, 0x05, 0x05, 0x05, 0x05, 0x05, 0x05, 0x05, 0x05, 0x05, 0x05, 0x05, 0x05, 0x05, 0x05, 0x05,
];

const groupBases = [
	0x00_00_00_00, 0x02_00_00_00, 0x02_90_D7_41, 0x01_00_00_00, 0x02_E9_0E_DD, 0x03_9A_A4_00, 0x02_67_BF_47, 0x01_00_00_00, 0x02_90_D7_41,
	0x00_98_96_80, 0x01_29_59_C3, 0x02_22_C0_00, 0x03_BD_77_65, 0x00_72_E4_40, 0x00_AD_CE_A1, 0x01_00_00_00, 0x01_70_4F_61, 0x02_06_FC_40,
	0x02_CD_DC_F9, 0x03_D0_90_00, 0x00_3E_51_85, 0x00_4E_A3_60, 0x00_62_35_F7, 0x00_79_80_00, 0x00_95_02_F9, 0x00_B5_4B_A0, 0x00_DA_F2_6B,
	0x01_06_9C_00, 0x01_38_F9_AD, 0x01_72_C9_E0, 0x01_B4_D8_9F, 0x02_00_00_00, 0x02_55_28_A1, 0x02_B5_4A_20, 0x03_21_6B_93, 0x03_9A_A4_00,
];

const primes = {
	k256: null,
	p192: null,
	p224: null,
	p251: null,
	p25519: null,
	p448: null,
	p521: null,
};

const modes = {
	ALL: 7,
	BOTH: 3,
	EUCLID: 4,
	NONE: 0,
	QUO: 1,
	REM: 2,
};

const WND_WIDTH = 4;
const WND_SIZE = 1 << (WND_WIDTH - 1);

const HAS_BIGINT = typeof BigInt === "function";

/**
 * BN
 */

class BN {
	constructor(number_, base, endian) {
		this.words = [0];
		this.length = 1;
		this.negative = 0;
		this.red = null;
		this.from(number_, base, endian);
	}

	/*
	 * Addition Engine
	 */

	_iadd(a, b) {
		let carry = 0;
		let index = 0;

		// a.length > b.length
		if (a.length < b.length) {[a, b] = [b, a];}

		if (a !== this) {this._alloc(a.length);}

		for (; index < b.length; index++) {
			const r = (a.words[index] | 0) + (b.words[index] | 0) + carry;

			this.words[index] = r & 0x3_FF_FF_FF;

			carry = r >>> 26;
		}

		for (; carry !== 0 && index < a.length; index++) {
			const r = (a.words[index] | 0) + carry;

			this.words[index] = r & 0x3_FF_FF_FF;

			carry = r >>> 26;
		}

		this.length = a.length;

		if (carry !== 0) {
			this._alloc(this.length + 1);
			this.words[this.length++] = carry;
		} else if (a !== this) {
			// Copy the rest of the words.
			for (; index < a.length; index++) {this.words[index] = a.words[index];}
		}

		// Note: we shouldn't need to strip here.
		return this;
	}

	_iaddn(number_) {
		this.words[0] += number_;

		if (this.words[0] < 0x4_00_00_00) {return this;}

		// Carry.
		let index = 0;

		this._alloc(this.length + 1);

		this.words[this.length] = 0;

		for (; index < this.length && this.words[index] >= 0x4_00_00_00; index++) {
			this.words[index] -= 0x4_00_00_00;
			this.words[index + 1] += 1;
		}

		this.length = Math.max(this.length, index + 1);

		// Note: we shouldn't need to strip here.
		return this;
	}

	/*
	 * Addition
	 */

	iadd(number_) {
		enforce(BN.isBN(number_), "num", "bignum");

		if (this.negative === number_.negative) {
			// x + y == x + y
			// (-x) + (-y) == -(x + y)
			this._iadd(this, number_);
		} else {
			// x + (-y) == x - y == -(y - x)
			// (-x) + y == y - x == -(x - y)
			const cmp = this.ucmp(number_);

			// x + (-x) == (-x) + x == 0
			if (cmp === 0) {
				this.words[0] = 0;
				this.length = 1;
				this.negative = 0;
				return this;
			}

			if (cmp < 0) {
				this._isub(number_, this);
				this.negative ^= 1;
			} else {
				this._isub(this, number_);
			}
		}

		return this;
	}

	iaddn(number_) {
		enforce(isSMI(number_), "num", "smi");

		const negative = (number_ < 0) | 0;

		if (negative) {number_ = -number_;}

		if (this.negative === negative) {
			// x + y == x + y
			// (-x) + (-y) == -(x + y)
			this._iaddn(number_);
		} else {
			// x + (-y) == x - y == -(y - x)
			// (-x) + y == y - x == -(x - y)
			if (this.length === 1 && this.words[0] < number_) {
				this.words[0] = number_ - this.words[0];
				this.negative ^= 1;
			} else {
				this._isubn(number_);
			}
		}

		return this;
	}

	add(number_) {
		enforce(BN.isBN(number_), "num", "bignum");

		if (number_.length > this.length) {return number_.clone().iadd(this);}

		return this.clone().iadd(number_);
	}

	addn(number_) {
		return this.clone().iaddn(number_);
	}

	/*
	 * Subtraction Engine
	 */

	_isub(a, b) {
		let carry = 0;
		let index = 0;

		// a > b
		assert(a.length >= b.length);

		if (a !== this) {this._alloc(a.length);}

		for (; index < b.length; index++) {
			const r = (a.words[index] | 0) - (b.words[index] | 0) + carry;

			carry = r >> 26;

			this.words[index] = r & 0x3_FF_FF_FF;
		}

		for (; carry !== 0 && index < a.length; index++) {
			const r = (a.words[index] | 0) + carry;

			carry = r >> 26;

			this.words[index] = r & 0x3_FF_FF_FF;
		}

		assert(carry === 0);

		// Copy rest of the words.
		if (a !== this) {
			for (; index < a.length; index++) {this.words[index] = a.words[index];}
		}

		this.length = Math.max(this.length, index);

		return this._strip();
	}

	_isubn(number_) {
		this.words[0] -= number_;

		if (this.words[0] >= 0) {return this._normalize();}

		assert(this.length !== 1);

		// Carry.
		this._alloc(this.length + 1);

		for (let index = 0; index < this.length && this.words[index] < 0; index++) {
			this.words[index] += 0x4_00_00_00;
			this.words[index + 1] -= 1;
		}

		this.words[this.length] = 0;

		return this._strip();
	}

	/*
	 * Subtraction
	 */

	isub(number_) {
		enforce(BN.isBN(number_), "num", "bignum");

		if (this.negative === number_.negative) {
			// x - y == x - y == -(y - x)
			// (-x) - (-y) == y - x == -(x - y)
			const cmp = this.ucmp(number_);

			// x - x == 0
			if (cmp === 0) {
				this.words[0] = 0;
				this.length = 1;
				this.negative = 0;
				return this;
			}

			if (cmp < 0) {
				this._isub(number_, this);
				this.negative ^= 1;
			} else {
				this._isub(this, number_);
			}
		} else {
			// x - (-y) == x + y
			// (-x) - y == -(x + y)
			this._iadd(this, number_);
		}

		return this;
	}

	isubn(number_) {
		enforce(isSMI(number_), "num", "smi");

		const negative = (number_ < 0) | 0;

		if (negative) {number_ = -number_;}

		if (this.negative === negative) {
			// x - y == x - y == -(y - x)
			// (-x) - (-y) == y - x == -(x - y)
			if (this.length === 1 && this.words[0] < number_) {
				this.words[0] = number_ - this.words[0];
				this.negative ^= 1;
			} else {
				this._isubn(number_);
			}
		} else {
			// x - (-y) == x + y
			// (-x) - y == -(x + y)
			this._iaddn(number_);
		}

		return this;
	}

	sub(number_) {
		return this.clone().isub(number_);
	}

	subn(number_) {
		return this.clone().isubn(number_);
	}

	/*
	 * Multiplication Engine
	 */

	_mul(number_, out) {
		enforce(BN.isBN(number_), "num", "bignum");
		enforce(BN.isBN(out), "out", "bignum");

		if (this.length === 10 && number_.length === 10) {return comb10MulTo(this, number_, out);}

		const len = this.length + number_.length;

		if (len < 63) {return smallMulTo(this, number_, out);}

		if (len < 1024) {return bigMulTo(this, number_, out);}

		return jumboMulTo(this, number_, out);
	}

	/*
	 * Multiplication
	 */

	imul(number_) {
		return this.mul(number_)._move(this);
	}

	imuln(number_) {
		enforce(isSMI(number_), "num", "smi");

		const neg = (number_ < 0) | 0;

		if (neg) {number_ = -number_;}

		// Carry.
		let carry = 0;

		for (let index = 0; index < this.length; index++) {
			const w = this.words[index] * number_;
			const lo = (w & 0x3_FF_FF_FF) + (carry & 0x3_FF_FF_FF);

			carry >>= 26;
			carry += (w / 0x4_00_00_00) | 0;
			carry += lo >>> 26;

			this.words[index] = lo & 0x3_FF_FF_FF;
		}

		this.negative ^= neg;

		if (carry === 0) {
			this._strip();
		} else {
			this._alloc(this.length + 1);
			this.words[this.length++] = carry;
		}

		return this;
	}

	mul(number_) {
		enforce(BN.isBN(number_), "num", "bignum");

		const len = this.length + number_.length;
		const out = new BN();

		out.words = new Array(len);

		for (let index = 0; index < len; index++) {out.words[index] = 0;}

		return this._mul(number_, out);
	}

	muln(number_) {
		return this.clone().imuln(number_);
	}

	/*
	 * Multiplication + Shift
	 */

	mulShift(number_, bits) {
		enforce(BN.isBN(number_), "num", "bignum");
		enforce(bits >>> 0 === bits, "bits", "uint32");

		const r = this.mul(number_);
		const b = r.utestn(bits - 1);

		r.iushrn(bits);

		if (this.negative ^ number_.negative) {return r.isubn(b);}

		return r.iaddn(b);
	}

	/*
	 * Division Engine
	 */

	_div(number_, flags) {
		enforce(BN.isBN(number_), "num", "bignum");
		assert((flags & modes.ALL) === flags);
		assert(flags !== modes.NONE);

		const a = this;
		const b = number_;

		nonzero(!b.isZero());

		if (a.isZero()) {return [new BN(0), new BN(0)];}

		const as = a.negative;
		const bs = b.negative;

		a.negative = 0;
		b.negative = 0;

		let q = null;
		let r = null;

		if (a.ucmp(b) < 0) {
			if (flags & modes.QUO) {q = new BN(0);}

			if (flags & modes.REM) {r = a.clone();}
		} else if (b.length === 1) {
			if (flags & modes.QUO) {q = a.quon(b.words[0]);}

			if (flags & modes.REM) {r = a.remn(b.words[0]);}
		} else {
			[q, r] = a._wordDiv(b, flags);
		}

		a.negative = as;
		b.negative = bs;

		if (flags & modes.QUO) {
			q.negative = a.negative ^ b.negative;
			q._normalize();
		}

		if (flags & modes.REM) {
			r.negative = a.negative;
			r._normalize();
		}

		if (flags & modes.EUCLID) {
			if (flags & modes.QUO) {
				assert((flags & modes.REM) !== 0);

				if (r.negative !== 0) {
					if (b.negative === 0) {q.isubn(1);}
					else {q.iaddn(1);}
				}
			}

			if (flags & modes.REM && r.negative !== 0) {
					if (b.negative === 0) {r.iadd(b);}
					else {r.isub(b);}
				}
		}

		return [q, r];
	}

	_wordDiv(number_, flags) {
		let a = this.clone();
		let b = number_;
		let q = null;
		let hi;

		// Normalize.
		const word = b.words[b.length - 1] | 0;
		const shift = 26 - countBits(word);

		if (shift === 0) {
			hi = word;
		} else {
			b = b.clone();

			a.iushln(shift);
			b.iushln(shift);

			hi = b.words[b.length - 1] | 0;
		}

		// Initialize quotient.
		const m = a.length - b.length;

		assert(m >= 0);

		if (flags & modes.QUO) {
			q = new BN(0);
			q.length = m + 1;
			q.words = Array.from({length: q.length});

			for (let index = 0; index < q.length; index++) {q.words[index] = 0;}
		}

		// Diff.
		const d = a.clone();

		d._ishlnsubmul(b, 1, m);

		if (d.negative === 0) {
			if (q) {q.words[m] = 1;}

			a = d;
		}

		// Divide.
		for (let j = m - 1; j >= 0; j--) {
			const ahi = a.words[b.length + j];
			const alo = a.words[b.length + j - 1];
			const quo = ((ahi * 0x4_00_00_00 + alo) / hi) | 0;

			let qj = Math.min(quo, 0x3_FF_FF_FF);

			a._ishlnsubmul(b, qj, j);

			while (a.negative !== 0) {
				qj -= 1;
				a.negative = 0;
				a._ishlnsubmul(b, 1, j);
				a.ineg();
			}

			if (q) {q.words[j] = qj;}
		}

		// Strip.
		if (q) {q._strip();}

		// Denormalize.
		// Note: we shouldn't need to strip `a` here.
		if (flags & modes.REM && shift !== 0) {a.iushrn(shift);}

		return [q, a];
	}

	_ishlnsubmul(number_, mul, shift) {
		let carry = 0;
		let index = 0;

		this._expand(number_.length + shift);

		for (; index < number_.length; index++) {
			const k = (this.words[index + shift] | 0) + carry;
			const r = number_.words[index] * mul;
			const w = k - (r & 0x3_FF_FF_FF);

			carry = (w >> 26) - ((r / 0x4_00_00_00) | 0);

			this.words[index + shift] = w & 0x3_FF_FF_FF;
		}

		for (; index < this.length - shift; index++) {
			const w = (this.words[index + shift] | 0) + carry;

			carry = w >> 26;

			this.words[index + shift] = w & 0x3_FF_FF_FF;
		}

		if (carry === 0) {return this._strip();}

		// Subtraction overflow.
		assert(carry === -1);

		carry = 0;

		for (let index = 0; index < this.length; index++) {
			const w = -(this.words[index] | 0) + carry;

			carry = w >> 26;

			this.words[index] = w & 0x3_FF_FF_FF;
		}

		this.negative = 1;

		return this._strip();
	}

	/*
	 * Truncation Division + Modulo
	 */

	quorem(number_) {
		return this._div(number_, modes.BOTH);
	}

	/*
	 * Truncation Division
	 */

	iquo(number_) {
		return this.quo(number_)._move(this);
	}

	iquon(number_) {
		enforce(isSMI(number_), "num", "smi");
		nonzero(number_ !== 0);

		const neg = (number_ < 0) | 0;

		if (neg) {number_ = -number_;}

		let carry = 0;

		for (let index = this.length - 1; index >= 0; index--) {
			const w = (this.words[index] | 0) + carry * 0x4_00_00_00;

			this.words[index] = (w / number_) | 0;

			carry = w % number_;
		}

		this.negative ^= neg;

		return this._strip();
	}

	quo(number_) {
		return this._div(number_, modes.QUO)[0];
	}

	quon(number_) {
		return this.clone().iquon(number_);
	}

	/*
	 * Truncation Modulo
	 */

	irem(number_) {
		return this.rem(number_)._move(this);
	}

	iremn(number_) {
		let m = this.remrn(number_);

		if (m < 0) {m = -m;}

		this.words[0] = m;
		this.length = 1;

		return this._normalize();
	}

	rem(number_) {
		return this._div(number_, modes.REM)[1];
	}

	remn(number_) {
		return this.clone().iremn(number_);
	}

	remrn(number_) {
		enforce(isSMI(number_), "num", "smi");
		nonzero(number_ !== 0);

		if (number_ < 0) {number_ = -number_;}

		const p = (1 << 26) % number_;

		let acc = 0;

		for (let index = this.length - 1; index >= 0; index--) {acc = (p * acc + (this.words[index] | 0)) % number_;}

		return this.negative === 0 ? acc : -acc | 0;
	}

	/*
	 * Euclidean Division + Modulo
	 */

	divmod(number_) {
		return this._div(number_, modes.BOTH | modes.EUCLID);
	}

	/*
	 * Euclidean Division
	 */

	idiv(number_) {
		return this.div(number_)._move(this);
	}

	idivn(number_) {
		if (this.negative === 0) {return this.iquon(number_);}

		const r = this.remrn(number_);

		this.iquon(number_);

		if (r < 0) {
			if (number_ < 0) {this.iaddn(1);}
			else {this.isubn(1);}
		}

		return this;
	}

	div(number_) {
		return this._div(number_, modes.BOTH | modes.EUCLID)[0];
	}

	divn(number_) {
		return this.clone().idivn(number_);
	}

	/*
	 * Euclidean Modulo
	 */

	imod(number_) {
		if (this.ucmp(number_) < 0) {
			if (this.negative !== 0) {
				this._isub(number_, this);
				this.negative = 0;
			}
			return this;
		}

		return this.mod(number_)._move(this);
	}

	imodn(number_) {
		this.words[0] = this.modrn(number_);
		this.length = 1;
		this.negative = 0;
		return this;
	}

	mod(number_) {
		return this._div(number_, modes.REM | modes.EUCLID)[1];
	}

	modn(number_) {
		return this.clone().imodn(number_);
	}

	modrn(number_) {
		enforce(isSMI(number_), "num", "smi");

		let r = this.remrn(number_);

		if (r < 0) {
			if (number_ < 0) {r -= number_;}
			else {r += number_;}
		}

		return r;
	}

	/*
	 * Round Division
	 */

	divRound(number_) {
		const [q, r] = this.quorem(number_);

		// Fast case - exact division.
		if (r.isZero()) {return q;}

		const bit = number_.words[0] & 1;

		number_.iushrn(1);

		const cmp = r.ucmp(number_);

		number_.iushln(1);

		number_.words[0] |= bit;

		// Round down.
		if (cmp < 0 || (number_.isOdd() && cmp === 0)) {return q;}

		// Round up.
		if (this.negative ^ number_.negative) {return q.isubn(1);}

		return q.iaddn(1);
	}

	/*
	 * Exponentiation
	 */

	ipow(number_) {
		return this.pow(number_)._move(this);
	}

	ipown(number_) {
		return this.pown(number_)._move(this);
	}

	pow(number_) {
		enforce(BN.isBN(number_), "num", "bignum");

		let b = countBits(number_.words[number_.length - 1]);
		let r = new BN(1);

		for (let index = number_.length - 1; index >= 0; index--) {
			const word = number_.words[index];

			for (let j = b - 1; j >= 0; j--) {
				r = r.sqr();

				if ((word >> j) & 1) {r = r.mul(this);}
			}

			b = 26;
		}

		return r;
	}

	pown(number_) {
		enforce(isSMI(number_), "num", "smi");

		if (number_ < 0) {number_ = -number_;}

		if (number_ === 0) {return new BN(1);}

		if (number_ === 1) {return this.clone();}

		const bits = countBits(number_);

		let r = this;

		for (let index = bits - 2; index >= 0; index--) {
			r = r.sqr();

			if ((number_ >> index) & 1) {r = r.mul(this);}
		}

		return r;
	}

	isqr() {
		return this.imul(this);
	}

	sqr() {
		return this.mul(this);
	}

	/*
	 * Roots Engine
	 */

	_rootrem(pow, rem) {
		enforce(pow >>> 0 === pow, "num", "uint32");

		if (pow === 0) {throw new RangeError("Zeroth root.");}

		if (~pow & this.negative) {throw new RangeError("Negative with even root.");}

		if (this.ucmpn(1) <= 0) {return [this.clone(), new BN(0)];}

		let u = new BN(0);
		let t = BN.shift(1, (this.bitLength() / pow + 1) | 0);
		let v, r;

		if (this.negative !== 0) {t.ineg();}

		if (pow === 2) {
			do {
				u = t;
				t = this.quo(u);
				t.iadd(u);
				t.iushrn(1);
			} while (t.ucmp(u) < 0);
		} else {
			do {
				u = t;
				t = u.pown(pow - 1);
				t = this.quo(t);
				v = u.muln(pow - 1);
				t.iadd(v);
				t = t.quon(pow);
			} while (t.ucmp(u) < 0);
		}

		if (rem) {
			t = u.pown(pow);
			r = this.sub(t);
		}

		return [u, r];
	}

	/*
	 * Roots
	 */

	rootrem(pow) {
		return this._rootrem(pow, 1);
	}

	iroot(pow) {
		return this.root(pow)._move(this);
	}

	root(pow) {
		return this._rootrem(pow, 0)[0];
	}

	isPower(pow) {
		enforce(pow >>> 0 === pow, "num", "uint32");

		if (pow === 0 || ~pow & this.negative) {return false;}

		const [, r] = this.rootrem(pow);

		return r.sign() === 0;
	}

	sqrtrem() {
		return this.rootrem(2);
	}

	isqrt() {
		return this.sqrt()._move(this);
	}

	sqrt() {
		return this.root(2);
	}

	isSquare() {
		return this.isPower(2);
	}

	/*
	 * AND
	 */

	iand(number_) {
		enforce(BN.isBN(number_), "num", "bignum");

		let x = this;
		let y = number_;

		if (x === y) {return x;}

		if ((x.negative | y.negative) === 0) {return x.iuand(y);}

		if ((x.negative & y.negative) === 1) {
			// (-x) & (-y) == ~(x-1) & ~(y-1)
			//             == ~((x-1) | (y-1))
			//             == -(((x-1) | (y-1)) + 1)
			x.iaddn(1);
			y.iaddn(1);
			x.iuor(y);
			x.isubn(1);
			y.isubn(1);
			return x;
		}

		// Assume x is the positive number.
		if (x.negative !== 0) {[x, y] = [y.clone(), x];}

		// x & (-y) == x & ~(y-1)
		//          == x & ~(y-1)
		const width = x.bitLength();

		y.iaddn(1);
		y.inotn(width);
		x.iuand(y);
		y.inotn(width);
		y.isubn(1);

		return x._move(this);
	}

	iandn(number_) {
		enforce(isSMI(number_), "num", "smi");

		if ((this.negative | (number_ < 0)) !== 0) {return this.iand(new BN(number_));}

		this.words[0] &= number_;
		this.length = 1;

		return this;
	}

	and(number_) {
		return this.clone().iand(number_);
	}

	andn(number_) {
		return this.clone().iandn(number_);
	}

	andrn(number_) {
		enforce(isSMI(number_), "num", "smi");

		if ((this.negative | (number_ < 0)) !== 0) {
			const n = this.iand(new BN(number_));

			if (n.length > 1) {throw new RangeError("Number exceeds 26 bits.");}

			return n.negative === 0 ? n.words[0] : -n.words[0];
		}

		return this.words[0] & number_;
	}

	/*
	 * Unsigned AND
	 */

	iuand(number_) {
		enforce(BN.isBN(number_), "num", "bignum");

		this.length = Math.min(this.length, number_.length);

		for (let index = 0; index < this.length; index++) {this.words[index] &= number_.words[index];}

		return this._strip();
	}

	iuandn(number_) {
		enforce(isSMI(number_), "num", "smi");

		this.words[0] &= Math.abs(number_);
		this.length = 1;

		return this._normalize();
	}

	uand(number_) {
		return this.clone().iuand(number_);
	}

	uandn(number_) {
		return this.clone().iuandn(number_);
	}

	uandrn(number_) {
		enforce(isSMI(number_), "num", "smi");

		const n = this.words[0] & Math.abs(number_);

		return this.negative === 0 ? n : -n | 0;
	}

	/*
	 * OR
	 */

	ior(number_) {
		enforce(BN.isBN(number_), "num", "bignum");

		let x = this;
		let y = number_;

		if (x === y) {return x;}

		if ((x.negative | y.negative) === 0) {return x.iuor(y);}

		if ((x.negative & y.negative) === 1) {
			// (-x) | (-y) == ~(x-1) | ~(y-1)
			//             == ~((x-1) & (y-1))
			//             == -(((x-1) & (y-1)) + 1)
			x.iaddn(1);
			y.iaddn(1);
			x.iuand(y);
			x.isubn(1);
			y.isubn(1);
			return x;
		}

		// Assume x is the positive number.
		y = y.clone();

		if (x.negative !== 0) {[x, y] = [y, x];}

		// x | (-y) == x | ~(y-1)
		//          == ~((y-1) & ~x)
		//          == -(((y-1) & ~x) + 1)
		y.iaddn(1);
		x.inotn(y.bitLength());
		y.iuand(x);
		y.isubn(1);

		return y._move(this);
	}

	iorn(number_) {
		enforce(isSMI(number_), "num", "smi");

		if ((this.negative | (number_ < 0)) !== 0) {return this.ior(new BN(number_));}

		this.words[0] |= number_;

		return this;
	}

	or(number_) {
		return this.clone().ior(number_);
	}

	orn(number_) {
		return this.clone().iorn(number_);
	}

	/*
	 * Unsigned OR
	 */

	iuor(number_) {
		enforce(BN.isBN(number_), "num", "bignum");

		this._expand(number_.length);

		for (let index = 0; index < number_.length; index++) {this.words[index] |= number_.words[index];}

		// Note: we shouldn't need to strip here.
		return this;
	}

	iuorn(number_) {
		enforce(isSMI(number_), "num", "smi");

		this.words[0] |= Math.abs(number_);

		return this;
	}

	uor(number_) {
		return this.clone().iuor(number_);
	}

	uorn(number_) {
		return this.clone().iuorn(number_);
	}

	/*
	 * XOR
	 */

	ixor(number_) {
		enforce(BN.isBN(number_), "num", "bignum");

		let x = this;
		let y = number_;

		if (x === y) {
			x.words[0] = 0;
			x.length = 1;
			x.negative = 0;
			return x;
		}

		if ((x.negative | y.negative) === 0) {return x.iuxor(y);}

		if ((x.negative & y.negative) === 1) {
			// (-x) ^ (-y) == ~(x-1) ^ ~(y-1)
			//             == (x-1) ^ (y-1)
			x.iaddn(1);
			y.iaddn(1);
			x.iuxor(y);
			x.ineg();
			y.isubn(1);
			return x;
		}

		// Assume x is the positive number.
		if (x.negative !== 0) {[x, y] = [y.clone(), x];}

		// x ^ (-y) == x ^ ~(y-1)
		//          == ~(x ^ (y-1))
		//          == -((x ^ (y-1)) + 1)
		y.iaddn(1);
		x.iuxor(y);
		x.iaddn(1);
		x.ineg();
		y.isubn(1);

		return x._move(this);
	}

	ixorn(number_) {
		enforce(isSMI(number_), "num", "smi");

		if ((this.negative | (number_ < 0)) !== 0) {return this.ixor(new BN(number_));}

		this.words[0] ^= number_;

		return this;
	}

	xor(number_) {
		return this.clone().ixor(number_);
	}

	xorn(number_) {
		return this.clone().ixorn(number_);
	}

	/*
	 * Unsigned XOR
	 */

	iuxor(number_) {
		enforce(BN.isBN(number_), "num", "bignum");

		let a = this;
		let b = number_;

		if (a.length < b.length) {[a, b] = [b, a];}

		let index = 0;

		for (; index < b.length; index++) {this.words[index] = a.words[index] ^ b.words[index];}

		if (a !== this) {
			this._alloc(a.length);

			for (; index < a.length; index++) {this.words[index] = a.words[index];}
		}

		this.length = a.length;

		return this._strip();
	}

	iuxorn(number_) {
		enforce(isSMI(number_), "num", "smi");

		this.words[0] ^= Math.abs(number_);

		return this._normalize();
	}

	uxor(number_) {
		return this.clone().iuxor(number_);
	}

	uxorn(number_) {
		return this.clone().iuxorn(number_);
	}

	/*
	 * NOT
	 */

	inot() {
		if (this.negative === 0) {
			// ~x == -x-1 == -(x+1)
			this.iaddn(1).ineg();
		} else {
			// ~(-x) == ~(~(x-1)) == x-1
			this.ineg().isubn(1);
		}
		return this;
	}

	not() {
		return this.clone().inot();
	}

	inotn(width) {
		enforce(width >>> 0 === width, "width", "uint32");

		const r = width % 26;

		let s = Math.ceil(width / 26);
		let index = 0;

		// Extend the buffer with leading zeroes.
		this._expand(s);

		if (r > 0) {s -= 1;}

		// Handle complete words.
		for (; index < s; index++) {this.words[index] ^= 0x3_FF_FF_FF;}

		// Handle the residue.
		if (r > 0) {this.words[index] ^= (1 << r) - 1;}

		// And remove leading zeroes.
		return this._strip();
	}

	notn(width) {
		return this.clone().inotn(width);
	}

	/*
	 * Left Shift
	 */

	ishl(number_) {
		enforce(BN.isBN(number_), "bits", "bignum");
		enforce(number_.bitLength() <= 32, "bits", "uint32");
		return this.ishln(number_.toNumber());
	}

	ishln(bits) {
		return this.iushln(bits);
	}

	shl(number_) {
		return this.clone().ishl(number_);
	}

	shln(bits) {
		return this.clone().ishln(bits);
	}

	/*
	 * Unsigned Left Shift
	 */

	iushl(number_) {
		enforce(BN.isBN(number_), "bits", "bignum");
		enforce(number_.bitLength() <= 32, "bits", "uint32");
		return this.iushln(number_.toNumber());
	}

	iushln(bits) {
		enforce(bits >>> 0 === bits, "bits", "uint32");

		const r = bits % 26;
		const s = (bits - r) / 26;
		const mask = ((1 << r) - 1) << (26 - r);

		if (r !== 0) {
			let carry = 0;

			for (let index = 0; index < this.length; index++) {
				const ncarry = this.words[index] & mask;
				const c = ((this.words[index] | 0) - ncarry) << r;

				this.words[index] = c | carry;

				carry = ncarry >>> (26 - r);
			}

			if (carry !== 0) {
				this._alloc(this.length + 1);
				this.words[this.length++] = carry;
			}
		}

		if (s !== 0) {
			this._alloc(this.length + s);

			for (let index = this.length - 1; index >= 0; index--) {this.words[index + s] = this.words[index];}

			for (let index = 0; index < s; index++) {this.words[index] = 0;}

			this.length += s;
		}

		return this._strip();
	}

	ushl(number_) {
		return this.clone().iushl(number_);
	}

	ushln(bits) {
		return this.clone().iushln(bits);
	}

	/*
	 * Right Shift Engine
	 */

	_split(bits, output) {
		const r = bits % 26;
		const s = Math.min((bits - r) / 26, this.length);
		const mask = (1 << r) - 1;

		// Extended mode, copy masked part.
		if (output) {
			output._alloc(s);

			for (let index = 0; index < s; index++) {output.words[index] = this.words[index];}

			output.length = s;
		}

		if (s === 0) {
			// No-op, we should not move anything at all.
		} else if (this.length > s) {
			this.length -= s;
			for (let index = 0; index < this.length; index++) {this.words[index] = this.words[index + s];}
		} else {
			this.words[0] = 0;
			this.length = 1;
		}

		let carry = 0;

		if (r !== 0) {
			for (let index = this.length - 1; index >= 0; index--) {
				const word = this.words[index] | 0;

				this.words[index] = (carry << (26 - r)) | (word >>> r);

				carry = word & mask;
			}
		}

		// Push carried bits as a mask.
		if (output) {
			if (carry === 0) {
				if (output.length === 0) {output.words[output.length++] = 0;}

				output._strip();
			} else {
				output._alloc(output.length + 1);
				output.words[output.length++] = carry;
			}
		}

		return this._strip();
	}

	/*
	 * Right Shift
	 */

	ishr(number_) {
		enforce(BN.isBN(number_), "bits", "bignum");
		enforce(number_.bitLength() <= 32, "bits", "uint32");
		return this.ishrn(number_.toNumber());
	}

	ishrn(bits) {
		enforce(bits >>> 0 === bits, "bits", "uint32");

		if (this.negative !== 0) {
			// (-x) >> y == ~(x-1) >> y
			//           == ~((x-1) >> y)
			//           == -(((x-1) >> y) + 1)
			this.iaddn(1);
			this.iushrn(bits);
			this.isubn(1);
			return this;
		}

		return this.iushrn(bits);
	}

	shr(number_) {
		return this.clone().ishr(number_);
	}

	shrn(bits) {
		return this.clone().ishrn(bits);
	}

	/*
	 * Unsigned Right Shift
	 */

	iushr(number_) {
		enforce(BN.isBN(number_), "bits", "bignum");
		enforce(number_.bitLength() <= 32, "bits", "uint32");
		return this.iushrn(number_.toNumber());
	}

	iushrn(bits) {
		enforce(bits >>> 0 === bits, "bits", "uint32");
		return this._split(bits, null);
	}

	ushr(number_) {
		return this.clone().iushr(number_);
	}

	ushrn(bits) {
		return this.clone().iushrn(bits);
	}

	/*
	 * Bit Manipulation
	 */

	setn(bit, value) {
		enforce(bit >>> 0 === bit, "bit", "uint32");

		if (this.negative !== 0) {
			this.iaddn(1);
			this.usetn(bit, !value);
			this.isubn(1);
			return this;
		}

		return this.usetn(bit, value);
	}

	usetn(bit, value) {
		enforce(bit >>> 0 === bit, "bit", "uint32");

		const r = bit % 26;
		const s = (bit - r) / 26;

		this._expand(s + 1);

		if (value) {this.words[s] |= 1 << r;}
		else {this.words[s] &= ~(1 << r);}

		return this._strip();
	}

	testn(bit) {
		enforce(bit >>> 0 === bit, "bit", "uint32");

		const r = bit % 26;
		const s = (bit - r) / 26;

		// Fast case: bit is much higher than all existing words.
		if (this.length <= s) {return this.negative;}

		// Check bit and return.
		const w = this.words[s];
		const value = (w >> r) & 1;

		if (this.negative !== 0) {
			if (r > 0 && w & ((1 << r) - 1)) {return value ^ 1;}

			let j = s;

			while (j--) {
				if (this.words[j] > 0) {return value ^ 1;}
			}
		}

		return value;
	}

	utestn(bit) {
		enforce(bit >>> 0 === bit, "bit", "uint32");

		const r = bit % 26;
		const s = (bit - r) / 26;

		// Fast case: bit is much higher than all existing words.
		if (this.length <= s) {return 0;}

		// Check bit and return.
		return (this.words[s] >> r) & 1;
	}

	imaskn(bits) {
		enforce(bits >>> 0 === bits, "bits", "uint32");

		if (this.negative !== 0) {
			this.iaddn(1);
			this.inotn(bits + 1);
			this.ineg();
		}

		return this.iumaskn(bits);
	}

	maskn(bits) {
		return this.clone().imaskn(bits);
	}

	iumaskn(bits) {
		enforce(bits >>> 0 === bits, "bits", "uint32");

		const r = bits % 26;

		let s = (bits - r) / 26;

		if (this.length <= s) {return this;}

		if (r !== 0) {s += 1;}

		this.length = Math.min(s, this.length);

		if (r !== 0) {this.words[this.length - 1] &= (1 << r) - 1;}

		if (this.length === 0) {this.words[this.length++] = 0;}

		return this._strip();
	}

	umaskn(bits) {
		return this.clone().iumaskn(bits);
	}

	andln(number_) {
		return this.words[0] & number_;
	}

	bit(pos) {
		return this.utestn(pos);
	}

	bits(pos, width) {
		enforce(pos >>> 0 === pos, "pos", "uint32");
		enforce(width >>> 0 === width, "width", "uint32");
		enforce(width <= 26, "width", "width");

		const shift = pos % 26;
		const index = (pos - shift) / 26;

		if (index >= this.length) {return 0;}

		let bits = (this.words[index] >> shift) & ((1 << width) - 1);

		if (shift + width > 26 && index + 1 < this.length) {
			const more = shift + width - 26;
			const next = this.words[index + 1] & ((1 << more) - 1);

			bits |= next << (26 - shift);
		}

		return bits;
	}

	/*
	 * Negation
	 */

	ineg() {
		if (!this.isZero()) {this.negative ^= 1;}

		return this;
	}

	neg() {
		return this.clone().ineg();
	}

	iabs() {
		this.negative = 0;
		return this;
	}

	abs() {
		return this.clone().iabs();
	}

	/*
	 * Comparison
	 */

	cmp(number_) {
		enforce(BN.isBN(number_), "num", "bignum");

		if (this.negative !== number_.negative) {return number_.negative - this.negative;}

		const res = this.ucmp(number_);

		if (this.negative !== 0) {return -res | 0;}

		return res;
	}

	cmpn(number_) {
		enforce(isSMI(number_), "num", "smi");

		const negative = (number_ < 0) | 0;

		if (this.negative !== negative) {return negative - this.negative;}

		const res = this.ucmpn(number_);

		if (this.negative !== 0) {return -res | 0;}

		return res;
	}

	eq(number_) {
		return this.cmp(number_) === 0;
	}

	eqn(number_) {
		return this.cmpn(number_) === 0;
	}

	gt(number_) {
		return this.cmp(number_) > 0;
	}

	gtn(number_) {
		return this.cmpn(number_) > 0;
	}

	gte(number_) {
		return this.cmp(number_) >= 0;
	}

	gten(number_) {
		return this.cmpn(number_) >= 0;
	}

	lt(number_) {
		return this.cmp(number_) < 0;
	}

	ltn(number_) {
		return this.cmpn(number_) < 0;
	}

	lte(number_) {
		return this.cmp(number_) <= 0;
	}

	lten(number_) {
		return this.cmpn(number_) <= 0;
	}

	sign() {
		if (this.negative !== 0) {return -1;}

		if (this.length === 1 && this.words[0] === 0) {return 0;}

		return 1;
	}

	isZero() {
		return this.length === 1 && this.words[0] === 0;
	}

	isNeg() {
		return this.negative !== 0;
	}

	isPos() {
		return this.negative === 0;
	}

	isOdd() {
		return (this.words[0] & 1) === 1;
	}

	isEven() {
		return (this.words[0] & 1) === 0;
	}

	/*
	 * Unsigned Comparison
	 */

	ucmp(number_) {
		enforce(BN.isBN(number_), "num", "bignum");

		if (this.length < number_.length) {return -1;}

		if (this.length > number_.length) {return 1;}

		for (let index = this.length - 1; index >= 0; index--) {
			const a = this.words[index] | 0;
			const b = number_.words[index] | 0;

			if (a === b) {continue;}

			return (a > b) - (a < b);
		}

		return 0;
	}

	ucmpn(number_) {
		enforce(isSMI(number_), "num", "smi");

		if (this.length > 1) {return 1;}

		const w = this.words[0] | 0;

		if (number_ < 0) {number_ = -number_;}

		return (w > number_) - (w < number_);
	}

	/*
	 * Number Theoretic Functions
	 */

	legendre(number_) {
		const red = HAS_BIGINT ? BN.red(number_) : BN.mont(number_);
		return this.toRed(red).redLegendre();
	}

	jacobi(number_) {
		// See: A Binary Algorithm for the Jacobi Symbol
		//   J. Shallit, J. Sorenson
		//   Page 3, Section 3
		enforce(BN.isBN(number_), "num", "bignum");

		if (number_.isZero() || number_.isEven()) {throw new Error("jacobi: `num` must be odd.");}

		let a = this._cloneNormal();
		let b = number_.clone();
		let j = 1;

		if (b.isNeg()) {
			if (a.isNeg()) {j = -1;}
			b.ineg();
		}

		if (a.isNeg() || a.ucmp(b) >= 0) {a.imod(b);}

		while (!a.isZero()) {
			const bits = a._makeOdd();

			if (bits & 1) {
				const bmod8 = b.andln(7);

				if (bmod8 === 3 || bmod8 === 5) {j = -j;}
			}

			if (a.ucmp(b) < 0) {
				[a, b] = [b, a];

				if (a.andln(3) === 3 && b.andln(3) === 3) {j = -j;}
			}

			a._isub(a, b).iushrn(1);

			const bmod8 = b.andln(7);

			if (bmod8 === 3 || bmod8 === 5) {j = -j;}
		}

		if (b.cmpn(1) !== 0) {return 0;}

		return j;
	}

	kronecker(number_) {
		enforce(BN.isBN(number_), "num", "bignum");

		if (this.isZero()) {return number_.ucmpn(1) === 0 ? 1 : 0;}

		if (number_.isZero()) {return this.ucmpn(1) === 0 ? 1 : 0;}

		if (((this.words[0] | number_.words[0]) & 1) === 0) {return 0;}

		const x = this;
		const y = number_.clone();
		const bits = y._makeOdd();
		const table = [0, 1, 0, -1, 0, -1, 0, 1];

		let k = x.jacobi(y);

		if (bits & 1) {k *= table[x.andln(7)];}

		return k | 0;
	}

	igcd(number_) {
		return this.gcd(number_)._move(this);
	}

	gcd(number_) {
		enforce(BN.isBN(number_), "num", "bignum");

		if (this.isZero()) {return number_.abs();}

		if (number_.isZero()) {return this.abs();}

		let a = this.clone();
		let b = number_.clone();

		a.negative = 0;
		b.negative = 0;

		// Remove common factor of two.
		const shift = a._factor2(b);

		if (shift !== 0) {
			a.iushrn(shift);
			b.iushrn(shift);
		}

		for (;;) {
			a._makeOdd();
			b._makeOdd();

			const cmp = a.ucmp(b);

			if (cmp < 0) {
				// a > b
				[a, b] = [b, a];
			} else if (cmp === 0 || b.ucmpn(1) === 0) {
				// Break if a == b.
				// Break if b == 1 to avoid repeated subtraction.
				break;
			}

			a._isub(a, b);
		}

		return b.iushln(shift);
	}

	ilcm(number_) {
		return this.lcm(number_)._move(this);
	}

	lcm(number_) {
		enforce(BN.isBN(number_), "num", "bignum");

		if (this.isZero() || number_.isZero()) {return new BN(0);}

		return this.quo(this.gcd(number_)).mul(number_).iabs();
	}

	egcd(number_) {
		enforce(BN.isBN(number_), "num", "bignum");

		if (this.isZero()) {
			return [new BN(0), new BN(number_.sign()), number_.abs()];
		}

		if (number_.isZero()) {
			return [new BN(this.sign()), new BN(0), this.abs()];
		}

		const x = this.clone();
		const y = number_.clone();

		x.negative = 0;
		y.negative = 0;

		// A * x + B * y = x
		const A = new BN(1);
		const B = new BN(0);

		// C * x + D * y = y
		const C = new BN(0);
		const D = new BN(1);

		// Remove common factor of two.
		const g = x._factor2(y);

		if (g > 0) {
			x.iushrn(g);
			y.iushrn(g);
		}

		const xp = x.clone();
		const yp = y.clone();

		while (!x.isZero()) {
			let index = x._makeOdd();
			let j = y._makeOdd();

			while (index--) {
				if (A.isOdd() || B.isOdd()) {
					A.iadd(yp);
					B.isub(xp);
				}

				A.iushrn(1);
				B.iushrn(1);
			}

			while (j--) {
				if (C.isOdd() || D.isOdd()) {
					C.iadd(yp);
					D.isub(xp);
				}

				C.iushrn(1);
				D.iushrn(1);
			}

			if (x.cmp(y) >= 0) {
				x.isub(y);
				A.isub(C);
				B.isub(D);
			} else {
				y.isub(x);
				C.isub(A);
				D.isub(B);
			}
		}

		if (this.negative !== 0) {C.ineg();}

		if (number_.negative !== 0) {D.ineg();}

		return [C, D, y.iushln(g)];
	}

	iinvert(number_) {
		return this.invert(number_)._move(this);
	}

	invert(number_) {
		enforce(BN.isBN(number_), "num", "bignum");
		range(number_.sign() > 0, "invert");

		if (number_.isOdd()) {return this._invertp(number_);}

		if (number_.cmpn(1) === 0) {throw new RangeError("Not invertible.");}

		const [s, , g] = this.egcd(number_);

		if (g.cmpn(1) !== 0) {throw new RangeError("Not invertible.");}

		return s.imod(number_);
	}

	ifermat(number_) {
		return this.fermat(number_)._move(this);
	}

	fermat(number_) {
		const red = HAS_BIGINT ? BN.red(number_) : BN.mont(number_);
		return this.toRed(red).redFermat().fromRed();
	}

	ipowm(y, m, mont) {
		return this.powm(y, m, mont)._move(this);
	}

	powm(y, m, mont) {
		const red = !HAS_BIGINT && mont ? BN.mont(m) : BN.red(m);
		return this.toRed(red).redPow(y).fromRed();
	}

	ipowmn(y, m, mont) {
		return this.powmn(y, m, mont)._move(this);
	}

	powmn(y, m, mont) {
		const red = mont ? BN.mont(m) : BN.red(m);
		return this.toRed(red).redPown(y).fromRed();
	}

	isqrtm(p) {
		return this.sqrtm(p)._move(this);
	}

	sqrtm(p) {
		enforce(BN.isBN(p), "p", "bignum");

		let red;

		if (p.andln(3) === 3 || p.andln(7) === 5) {
			// Probably not worth the setup.
			red = BN.red(p);
		} else {
			red = BN.mont(p);
		}

		return this.toRed(red).redSqrt().fromRed();
	}

	isqrtpq(p, q) {
		return this.sqrtpq(p, q)._move(this);
	}

	sqrtpq(p, q) {
		const sp = this.sqrtm(p);
		const sq = this.sqrtm(q);
		const [mp, mq] = p.egcd(q);
		const lhs = sq.mul(mp).mul(p);
		const rhs = sp.mul(mq).mul(q);
		const n = p.mul(q);

		return lhs.iadd(rhs).imod(n);
	}

	/*
	 * Primality Testing
	 */

	isPrime(rng, reps, limit) {
		enforce(reps >>> 0 === reps, "reps", "uint32");

		if (!this.isPrimeMR(rng, reps + 1, true)) {return false;}

		if (!this.isPrimeLucas(limit)) {return false;}

		return true;
	}

	isPrimeMR(rng, reps, force2 = false) {
		enforce(reps >>> 0 === reps, "reps", "uint32");
		enforce(reps > 0, "reps", "integer");
		enforce(typeof force2 === "boolean", "force2", "boolean");

		const n = this;

		if (n.cmpn(7) < 0) {
			return n.cmpn(2) === 0 || n.cmpn(3) === 0 || n.cmpn(5) === 0;
		}

		if (n.isEven()) {return false;}

		const nm1 = n.subn(1);
		const nm3 = nm1.subn(2);
		const k = nm1.zeroBits();
		const q = nm1.ushrn(k);

		const red = BN.red(n);
		const rnm1 = nm1.toRed(red);
		const rone = new BN(1).toRed(red);

		next: for (let index = 0; index < reps; index++) {
			let x;

			if (index === reps - 1 && force2) {
				x = new BN(2);
			} else {
				x = BN.random(rng, 0, nm3);
				x.iaddn(2);
			}

			let y = x.toRed(red).redPow(q);

			if (y.cmp(rone) === 0 || y.cmp(rnm1) === 0) {continue;}

			for (let j = 1; j < k; j++) {
				y = y.redSqr();

				if (y.cmp(rnm1) === 0) {continue next;}

				if (y.cmp(rone) === 0) {return false;}
			}

			return false;
		}

		return true;
	}

	isPrimeLucas(limit = 0) {
		enforce(limit >>> 0 === limit, "limit", "uint32");

		const n = this;

		// Ignore 0 and 1.
		if (n.cmpn(1) <= 0) {return false;}

		// Two is the only even prime.
		if (n.isEven()) {return n.cmpn(2) === 0;}

		let p = 3;

		for (;;) {
			if (p > 10_000) {
				// Thought to be impossible.
				throw new Error(`Cannot find (D/n) = -1 for ${n.toString(10)}.`);
			}

			if (limit !== 0 && p > limit) {
				// Optional DoS limit.
				return false;
			}

			const d = new BN(p * p - 4);
			const j = d.jacobi(n);

			if (j === -1) {break;}

			if (j === 0) {return n.cmpn(p + 2) === 0;}

			if (p === 40 && n.isSquare()) {return false;}

			p += 1;
		}

		const s = n.addn(1);
		const r = s._makeOdd();

		let vk = new BN(2);
		let vk1 = new BN(p);

		for (let index = s.bitLength(); index >= 0; index--) {
			if (s.utestn(index)) {
				vk = vk.mul(vk1).isubn(p).imod(n);
				vk1 = vk1.sqr().isubn(2).imod(n);
			} else {
				vk1 = vk1.mul(vk).isubn(p).imod(n);
				vk = vk.sqr().isubn(2).imod(n);
			}
		}

		if (vk.cmpn(2) === 0 || vk.cmp(n.subn(2)) === 0) {
			const a = vk.muln(p).imod(n);
			const b = vk1.ushln(1).imod(n);

			if (a.cmp(b) === 0) {return true;}
		}

		for (let t = 0; t < r - 1; t++) {
			if (vk.isZero()) {return true;}

			if (vk.cmpn(2) === 0) {return false;}

			vk = vk.sqr().isubn(2).imod(n);
		}

		return false;
	}

	/*
	 * Twos Complement
	 */

	toTwos(width) {
		if (this.negative !== 0) {return this.abs().inotn(width).iaddn(1);}

		return this.clone();
	}

	fromTwos(width) {
		enforce(width >>> 0 === width, "width", "uint32");
		range(width > 0, "width");

		if (this.testn(width - 1)) {return this.notn(width).iaddn(1).ineg();}

		return this.clone();
	}

	/*
	 * Reduction Context
	 */

	toRed(ctx) {
		enforce(ctx instanceof Red, "ctx", "reduction context");

		if (this.red) {throw new Error("Already in reduction context.");}

		return ctx.convertTo(this);
	}

	fromRed() {
		red(this.red, "fromRed");
		return this.red.convertFrom(this);
	}

	forceRed(ctx) {
		enforce(ctx instanceof Red, "ctx", "reduction context");

		if (this.red) {
			if (!ctx.m.eq(this.red.m) || ctx.mont !== this.red.mont) {throw new Error("Already in reduction context.");}
		} else {
			range(this.negative === 0, "red");
			range(this.ucmp(ctx.m) < 0, "red");
		}

		return this.clone()._forceRed(ctx);
	}

	redIAdd(number_) {
		enforce(BN.isBN(number_), "num", "bignum");
		red(this.red, "redIAdd");
		return this.red.iadd(this, number_);
	}

	redAdd(number_) {
		enforce(BN.isBN(number_), "num", "bignum");
		red(this.red, "redAdd");
		return this.red.add(this, number_);
	}

	redIAddn(number_) {
		enforce(isSMI(number_), "num", "smi");
		red(this.red, "redIAddn");
		return this.red.iaddn(this, number_);
	}

	redAddn(number_) {
		enforce(isSMI(number_), "num", "smi");
		red(this.red, "redAddn");
		return this.red.addn(this, number_);
	}

	redISub(number_) {
		enforce(BN.isBN(number_), "num", "bignum");
		red(this.red, "redISub");
		return this.red.isub(this, number_);
	}

	redSub(number_) {
		enforce(BN.isBN(number_), "num", "bignum");
		red(this.red, "redSub");
		return this.red.sub(this, number_);
	}

	redISubn(number_) {
		enforce(isSMI(number_), "num", "smi");
		red(this.red, "redISubn");
		return this.red.isubn(this, number_);
	}

	redSubn(number_) {
		enforce(isSMI(number_), "num", "smi");
		red(this.red, "redSubn");
		return this.red.subn(this, number_);
	}

	redIMul(number_) {
		enforce(BN.isBN(number_), "num", "bignum");
		red(this.red, "redIMul");
		return this.red.imul(this, number_);
	}

	redMul(number_) {
		enforce(BN.isBN(number_), "num", "bignum");
		red(this.red, "redMul");
		return this.red.mul(this, number_);
	}

	redIMuln(number_) {
		enforce(isSMI(number_), "num", "smi");
		red(this.red, "redIMuln");
		return this.red.imuln(this, number_);
	}

	redMuln(number_) {
		enforce(isSMI(number_), "num", "smi");
		red(this.red, "redMuln");
		return this.red.muln(this, number_);
	}

	redIDiv(number_) {
		enforce(BN.isBN(number_), "num", "bignum");
		red(this.red, "redIDiv");
		return this.red.idiv(this, number_);
	}

	redDiv(number_) {
		enforce(BN.isBN(number_), "num", "bignum");
		red(this.red, "redDiv");
		return this.red.div(this, number_);
	}

	redIDivn(number_) {
		enforce(isSMI(number_), "num", "smi");
		red(this.red, "redIDivn");
		return this.red.idivn(this, number_);
	}

	redDivn(number_) {
		enforce(isSMI(number_), "num", "smi");
		red(this.red, "redDivn");
		return this.red.divn(this, number_);
	}

	redIPow(number_) {
		enforce(BN.isBN(number_), "num", "bignum");
		red(this.red, "redIPow");
		nonred(!number_.red, "redIPow");
		return this.red.ipow(this, number_);
	}

	redPow(number_) {
		enforce(BN.isBN(number_), "num", "bignum");
		red(this.red, "redPow");
		nonred(!number_.red, "redPow");
		return this.red.pow(this, number_);
	}

	redIPown(number_) {
		enforce(isSMI(number_), "num", "smi");
		red(this.red, "redIPown");
		return this.red.ipown(this, number_);
	}

	redPown(number_) {
		enforce(isSMI(number_), "num", "smi");
		red(this.red, "redPown");
		return this.red.pown(this, number_);
	}

	redISqr() {
		red(this.red, "redISqr");
		return this.red.isqr(this);
	}

	redSqr() {
		red(this.red, "redSqr");
		return this.red.sqr(this);
	}

	redISqrt() {
		red(this.red, "redISqrt");
		return this.red.isqrt(this);
	}

	redSqrt() {
		red(this.red, "redSqrt");
		return this.red.sqrt(this);
	}

	redIDivSqrt(v) {
		red(this.red, "redIDivSqrt");
		return this.red.idivsqrt(this, v);
	}

	redDivSqrt(v) {
		red(this.red, "redDivSqrt");
		return this.red.divsqrt(this, v);
	}

	redIsSquare() {
		red(this.red, "redIsSquare");
		return this.red.isSquare(this);
	}

	redIShl(number_) {
		enforce(BN.isBN(number_), "num", "bignum");
		red(this.red, "redIShl");
		nonred(!number_.red, "redIShl");
		return this.red.ishl(this, number_);
	}

	redShl(number_) {
		enforce(BN.isBN(number_), "num", "bignum");
		red(this.red, "redShl");
		nonred(!number_.red, "redShl");
		return this.red.shl(this, number_);
	}

	redIShln(number_) {
		enforce(number_ >>> 0 === number_, "num", "uint32");
		red(this.red, "redIShln");
		return this.red.ishln(this, number_);
	}

	redShln(number_) {
		enforce(number_ >>> 0 === number_, "num", "uint32");
		red(this.red, "redShln");
		return this.red.shln(this, number_);
	}

	redINeg() {
		red(this.red, "redINeg");
		return this.red.ineg(this);
	}

	redNeg() {
		red(this.red, "redNeg");
		return this.red.neg(this);
	}

	redEq(number_) {
		enforce(BN.isBN(number_), "num", "bignum");
		red(this.red, "redEq");
		return this.red.eq(this, number_);
	}

	redEqn(number_) {
		enforce(isSMI(number_), "num", "smi");
		red(this.red, "redEqn");
		return this.red.eqn(this, number_);
	}

	redIsHigh() {
		red(this.red, "redIsHigh");
		return this.red.isHigh(this);
	}

	redIsLow() {
		red(this.red, "redIsLow");
		return this.red.isLow(this);
	}

	redIsOdd() {
		red(this.red, "redIsOdd");
		return this.red.isOdd(this);
	}

	redIsEven() {
		red(this.red, "redIsEven");
		return this.red.isEven(this);
	}

	redLegendre() {
		red(this.red, "redLegendre");
		return this.red.legendre(this);
	}

	redJacobi() {
		red(this.red, "redJacobi");
		return this.red.jacobi(this);
	}

	redKronecker() {
		red(this.red, "redKronecker");
		return this.red.kronecker(this);
	}

	redIInvert() {
		red(this.red, "redIInvert");
		return this.red.iinvert(this);
	}

	redInvert() {
		red(this.red, "redInvert");
		return this.red.invert(this);
	}

	redIFermat() {
		red(this.red, "redIFermat");
		return this.red.ifermat(this);
	}

	redFermat() {
		red(this.red, "redFermat");
		return this.red.fermat(this);
	}

	/*
	 * Internal
	 */

	_move(dest) {
		dest.words = this.words;
		dest.length = this.length;
		dest.negative = this.negative;
		dest.red = this.red;
		return dest;
	}

	_alloc(size) {
		while (this.words.length < size) {this.words.push(0);}

		return this;
	}

	_expand(size) {
		this._alloc(size);

		while (this.length < size) {this.words[this.length++] = 0;}

		return this;
	}

	_strip() {
		while (this.length > 1 && this.words[this.length - 1] === 0) {this.length -= 1;}

		return this._normalize();
	}

	_normalize() {
		assert(this.length > 0);

		// -0 = 0
		if (this.length === 1 && this.words[0] === 0) {this.negative = 0;}

		return this;
	}

	_check() {
		// We never have a zero length number.
		assert(this.length > 0);

		// Cannot exceed array bounds.
		assert(this.length <= this.words.length);

		if (this.length === 1) {
			// Must be normalized.
			if (this.words[0] === 0) {assert(this.negative === 0);}
			return this;
		}

		// Must be stripped.
		assert(this.words[this.length - 1] !== 0);

		return this;
	}

	_invertp(p) {
		// Penk's right shift binary EGCD.
		//
		// See: The Art of Computer Programming,
		//      Volume 2, Seminumerical Algorithms
		//   Donald E. Knuth
		//   Exercise 4.5.2.39
		enforce(BN.isBN(p), "p", "bignum");
		range(p.sign() > 0, "invert");
		assert(p.isOdd());

		if (p.cmpn(1) === 0) {throw new RangeError("Not invertible.");}

		const a = this.clone();
		const b = p.clone();
		const u = new BN(1);
		const v = new BN(0);

		if (a.isNeg() || a.ucmp(b) >= 0) {a.imod(b);}

		while (!a.isZero()) {
			let index = a._makeOdd();
			let j = b._makeOdd();

			while (index--) {
				if (u.isOdd()) {u._iadd(u, p);}

				u.iushrn(1);
			}

			while (j--) {
				if (v.isOdd()) {v._iadd(v, p);}

				v.iushrn(1);
			}

			if (a.ucmp(b) >= 0) {
				a._isub(a, b);
				if (u.ucmp(v) < 0) {
					u._isub(v, u);
					u._isub(p, u);
				} else {
					u._isub(u, v);
				}
			} else {
				b._isub(b, a);
				if (v.ucmp(u) < 0) {
					v._isub(u, v);
					v._isub(p, v);
				} else {
					v._isub(v, u);
				}
			}
		}

		if (b.cmpn(1) !== 0) {throw new RangeError("Not invertible.");}

		assert(v.negative === 0);
		assert(v.ucmp(p) < 0);

		return v;
	}

	_makeOdd() {
		const shift = this.zeroBits();

		if (shift > 0) {this.iushrn(shift);}

		return shift;
	}

	_factor2(number_) {
		// Find common factor of two.
		// Expects inputs to be non-zero.
		if ((this.words[0] | number_.words[0]) & 1) {return 0;}

		const len = Math.min(this.length, number_.length);

		let r = 0;

		for (let index = 0; index < len; index++) {
			const b = zeroBits(this.words[index] | number_.words[index]);

			r += b;

			if (b !== 26) {break;}
		}

		return r;
	}

	_cloneNormal() {
		return this.red ? this.fromRed() : this.clone();
	}

	_forceRed(ctx) {
		this.red = ctx;
		return this;
	}

	/*
	 * Helpers
	 */

	clone() {
		const copy = new BN();

		copy.words = Array.from({length: this.length});

		for (let index = 0; index < this.length; index++) {copy.words[index] = this.words[index];}

		copy.length = this.length;
		copy.negative = this.negative;
		copy.red = this.red;

		return copy;
	}

	inject(number_) {
		enforce(BN.isBN(number_), "num", "bignum");

		this._alloc(number_.length);

		for (let index = 0; index < number_.length; index++) {this.words[index] = number_.words[index];}

		this.length = number_.length;
		this.negative = number_.negative;
		this.red = number_.red;

		return this;
	}

	set(number_, endian) {
		return this.fromNumber(number_, endian);
	}

	swap(number_) {
		enforce(BN.isBN(number_), "num", "bignum");

		const x = this;
		const y = number_;

		[x.words, y.words] = [y.words, x.words];
		[x.length, y.length] = [y.length, x.length];
		[x.negative, y.negative] = [y.negative, x.negative];
		[x.red, y.red] = [y.red, x.red];

		return x;
	}

	reverse() {
		const neg = this.negative;

		this.fromBuffer(this.toBuffer("be"), "le");
		this.negative = neg;

		return this;
	}

	byteLength() {
		return Math.ceil(this.bitLength() / 8);
	}

	bitLength() {
		const w = this.words[this.length - 1];
		const hi = countBits(w);
		return (this.length - 1) * 26 + hi;
	}

	zeroBits() {
		if (this.isZero()) {return 0;}

		if (this.isOdd()) {return 0;}

		let r = 0;

		for (let index = 0; index < this.length; index++) {
			const b = zeroBits(this.words[index]);

			r += b;

			if (b !== 26) {break;}
		}

		return r;
	}

	isSafe() {
		if (this.length <= 2) {return true;}

		if (this.length === 3 && this.words[2] === 0x01) {return true;}

		return false;
	}

	word(pos) {
		enforce(pos >>> 0 === pos, "pos", "uint32");

		if (pos >= this.length) {return 0;}

		return this.words[pos];
	}

	[custom]() {
		let prefix = "BN";

		if (this.red) {prefix = "BN-R";}

		return `<${prefix}: ${this.toString(10)}>`;
	}

	/*
	 * Conversion
	 */

	toNumber() {
		let number_ = this.words[0];

		if (this.length === 2) {
			number_ += this.words[1] * 0x4_00_00_00;
		} else if (this.length === 3 && this.words[2] === 0x01) {
			// Note: at this stage it is known that the top bit is set.
			number_ += 0x10_00_00_00_00_00_00 + this.words[1] * 0x4_00_00_00;
		} else if (this.length > 2) {
			throw new RangeError("Number can only safely store up to 53 bits.");
		}

		return this.negative === 0 ? number_ : -number_;
	}

	toDouble() {
		let number_ = 0;

		for (let index = this.length - 1; index >= 0; index--) {number_ = number_ * 0x4_00_00_00 + this.words[index];}

		return this.negative === 0 ? number_ : -number_;
	}

	valueOf() {
		return this.toDouble();
	}

	toBigInt() {
		if (!HAS_BIGINT) {throw new Error("BigInt is not supported!");}

		const s52 = BigInt(52);
		const s26 = BigInt(26);

		let index = this.length - 1;
		let number_ = BigInt(0);

		for (; index >= 1; index -= 2) {
			const hi = this.words[index] * 0x4_00_00_00;
			const lo = this.words[index - 1];

			number_ = (number_ << s52) | BigInt(hi + lo);
		}

		if (index >= 0) {number_ = (number_ << s26) | BigInt(this.words[0]);}

		return this.negative === 0 ? number_ : -number_;
	}

	toBool() {
		return !this.isZero();
	}

	toString(base, padding) {
		base = getBase(base);

		if (padding == null) {padding = 0;}

		if (padding === 0) {padding = 1;}

		enforce(base >>> 0 === base, "base", "uint32");
		enforce(padding >>> 0 === padding, "padding", "uint32");

		if (base < 2 || base > 36) {throw new RangeError("Base ranges between 2 and 36.");}

		this._check();

		if (base === 16) {
			let out = "";
			let off = 0;
			let carry = 0;

			for (let index = 0; index < this.length; index++) {
				const w = this.words[index];
				const word = (((w << off) | carry) & 0xFF_FF_FF).toString(16);

				carry = (w >>> (24 - off)) & 0xFF_FF_FF;

				if (carry !== 0 || index !== this.length - 1) {out = zeros[6 - word.length] + word + out;}
				else {out = word + out;}

				off += 2;

				if (off >= 26) {
					off -= 26;
					index -= 1;
				}
			}

			if (carry !== 0) {out = carry.toString(16) + out;}

			while (out.length % padding !== 0) {out = "0" + out;}

			if (this.negative !== 0) {out = "-" + out;}

			return out;
		}

		const groupSize = groupSizes[base - 1];
		const groupBase = groupBases[base - 1];
		const c = this.clone();

		let out = "";

		c.negative = 0;

		while (!c.isZero()) {
			const r = c.remrn(groupBase).toString(base);

			c.iquon(groupBase);

			if (c.isZero()) {out = r + out;}
			else {out = zeros[groupSize - r.length] + r + out;}
		}

		if (this.isZero()) {out = "0";}

		while (out.length % padding !== 0) {out = "0" + out;}

		if (this.negative !== 0) {out = "-" + out;}

		return out;
	}

	toJSON() {
		return this.toString(16, 2);
	}

	toArray(endian, length) {
		return this.toArrayLike(Array, endian, length);
	}

	toBuffer(endian, length) {
		return this.toArrayLike(Buffer, endian, length);
	}

	toArrayLike(ArrayType, endian, length) {
		if (endian == null) {endian = "be";}

		if (length == null) {length = 0;}

		enforce(typeof ArrayType === "function", "ArrayType", "function");
		enforce(endian === "be" || endian === "le", "endian", "endianness");
		enforce(length >>> 0 === length, "length", "uint32");

		this._check();

		const bytes = this.byteLength();
		const size = length || Math.max(1, bytes);

		if (bytes > size) {throw new RangeError("Byte array longer than desired length.");}

		const res = allocate(ArrayType, size);

		// See: https://github.com/indutny/bn.js/pull/222
		if (endian === "be") {
			let pos = res.length - 1;
			let carry = 0;

			for (let index = 0; index < this.length; index++) {
				const shift = (index & 3) << 1;
				const word = (this.words[index] << shift) | carry;

				res[pos--] = word & 0xFF;

				if (pos >= 0) {res[pos--] = (word >>> 8) & 0xFF;}

				if (pos >= 0) {res[pos--] = (word >>> 16) & 0xFF;}

				if (shift === 6) {
					if (pos >= 0) {res[pos--] = (word >>> 24) & 0xFF;}

					carry = 0;
				} else {
					carry = word >>> 24;
				}
			}

			if (pos >= 0) {
				res[pos--] = carry;

				while (pos >= 0) {res[pos--] = 0;}

				carry = 0;
			}

			assert(carry === 0);
		} else {
			let pos = 0;
			let carry = 0;

			for (let index = 0; index < this.length; index++) {
				const shift = (index & 3) << 1;
				const word = (this.words[index] << shift) | carry;

				res[pos++] = word & 0xFF;

				if (pos < res.length) {res[pos++] = (word >>> 8) & 0xFF;}

				if (pos < res.length) {res[pos++] = (word >>> 16) & 0xFF;}

				if (shift === 6) {
					if (pos < res.length) {res[pos++] = (word >>> 24) & 0xFF;}

					carry = 0;
				} else {
					carry = word >>> 24;
				}
			}

			if (pos < res.length) {
				res[pos++] = carry;

				while (pos < res.length) {res[pos++] = 0;}

				carry = 0;
			}

			assert(carry === 0);
		}

		return res;
	}

	encode(endian, length) {
		return this.toBuffer(endian, length);
	}

	/*
	 * Instantiation
	 */

	of(number_, endian) {
		return this.fromNumber(number_, endian);
	}

	fromNumber(number_, endian) {
		if (endian == null) {endian = "be";}

		enforce(isInteger(number_), "num", "integer");
		enforce(endian === "be" || endian === "le", "endian", "endianness");

		const neg = (number_ < 0) | 0;

		if (neg) {number_ = -number_;}

		if (number_ < 0x4_00_00_00) {
			this.words[0] = number_ & 0x3_FF_FF_FF;
			this.length = 1;
		} else if (number_ < 0x10_00_00_00_00_00_00) {
			this.words = [number_ & 0x3_FF_FF_FF, (number_ / 0x4_00_00_00) & 0x3_FF_FF_FF];
			this.length = 2;
		} else {
			this.words = [number_ & 0x3_FF_FF_FF, (number_ / 0x4_00_00_00) & 0x3_FF_FF_FF, 1];
			this.length = 3;
		}

		this.negative = neg;

		if (endian === "le") {this.reverse();}

		return this;
	}

	fromDouble(number_, endian) {
		if (endian == null) {endian = "be";}

		enforce(typeof number_ === "number", "num", "double");
		enforce(endian === "be" || endian === "le", "endian", "endianness");

		if (!isFinite(number_)) {number_ = 0;}

		const neg = (number_ <= -1) | 0;

		if (number_ < 0) {number_ = -number_;}

		number_ = Math.floor(number_);

		this.words = [];

		while (number_ > 0) {
			const lo = number_ % 0x4_00_00_00;
			const hi = (number_ - lo) / 0x4_00_00_00;

			this.words.push(lo);

			number_ = hi;
		}

		if (this.words.length === 0) {this.words.push(0);}

		this.length = this.words.length;
		this.negative = neg;

		if (endian === "le") {this.reverse();}

		return this;
	}

	fromBigInt(number_, endian) {
		if (endian == null) {endian = "be";}

		enforce(typeof number_ === "bigint", "num", "bigint");
		enforce(endian === "be" || endian === "le", "endian", "endianness");

		if (!HAS_BIGINT) {throw new Error("BigInt is not supported!");}

		// You know the implementation has a
		// problem when strings are twice
		// as fast as bigints.
		const start = (number_ < BigInt(0)) | 0;

		this._fromHex(number_.toString(16), start);
		this.negative = start;

		if (endian === "le") {this.reverse();}

		return this;
	}

	fromBool(value) {
		enforce(typeof value === "boolean", "value", "boolean");

		this.words[0] = value | 0;
		this.length = 1;
		this.negative = 0;

		return this;
	}

	fromString(str, base, endian) {
		if (base === "le" || base === "be") {[base, endian] = [endian, base];}

		base = getBase(base);

		if (endian == null) {endian = "be";}

		enforce(typeof str === "string", "string", "string");
		enforce(base >>> 0 === base, "base", "uint32");
		enforce(endian === "be" || endian === "le", "endian", "endianness");

		if (base < 2 || base > 36) {throw new Error("Base ranges between 2 and 36.");}

		str = str.replaceAll(/\s+/g, "");

		let start = 0;

		if (str.length > 0 && str.charCodeAt(0) === 0x2D) {start = 1;}

		if (base === 16) {this._fromHex(str, start);}
		else {this._fromBase(str, base, start);}

		this.negative = start;

		this._normalize();

		if (endian === "le") {this.reverse();}

		return this;
	}

	_fromHex(str, start) {
		this.length = Math.max(2, Math.ceil((str.length - start) / 6));
		this.words = Array.from({length: this.length});

		for (let index = 0; index < this.length; index++) {this.words[index] = 0;}

		// Scan 24-bit chunks and add them to the number.
		let off = 0;
		let index = str.length - 6;
		let j = 0;

		for (; index >= start; index -= 6) {
			const w = parseHex(str, index, index + 6);

			this.words[j] |= (w << off) & 0x3_FF_FF_FF;

			// `0x3fffff` is intentional here, 26bits max shift + 24bit hex limb.
			this.words[j + 1] |= (w >>> (26 - off)) & 0x3F_FF_FF;

			off += 24;

			if (off >= 26) {
				off -= 26;
				j += 1;
			}
		}

		if (index + 6 !== start) {
			const w = parseHex(str, start, index + 6);

			this.words[j] |= (w << off) & 0x3_FF_FF_FF;
			this.words[j + 1] |= (w >>> (26 - off)) & 0x3F_FF_FF;
		}

		return this._strip();
	}

	_fromBase(str, base, start) {
		// Initialize as zero.
		this.words[0] = 0;
		this.length = 1;
		this.negative = 0;

		// Find length of limb in base.
		let limbLen = 0;
		let limbPow = 1;

		for (; limbPow <= 0x3_FF_FF_FF; limbPow *= base) {limbLen += 1;}

		limbLen -= 1;
		limbPow = (limbPow / base) | 0;

		const total = str.length - start;
		const mod = total % limbLen;
		const end = Math.min(total, total - mod) + start;

		let index = start;

		for (; index < end; index += limbLen) {
			const word = parseBase(str, index, index + limbLen, base);

			this.imuln(limbPow);
			this._iaddn(word);
		}

		if (mod !== 0) {
			const pow = Math.pow(base, mod);
			const word = parseBase(str, index, str.length, base);

			this.imuln(pow);
			this._iaddn(word);
		}

		return this;
	}

	fromJSON(json) {
		if (BN.isBN(json)) {
			if (json.red) {return json.fromRed();}

			return json.clone();
		}

		if (Array.isArray(json)) {
			for (const chunk of json) {enforce(typeof chunk === "string", "chunk", "string");}

			json = json.join("");
		}

		return this.fromString(json, 16);
	}

	fromBN(number_) {
		return this.inject(number_);
	}

	fromArray(data, endian) {
		enforce(Array.isArray(data), "data", "array");
		return this.fromArrayLike(data, endian);
	}

	fromBuffer(data, endian) {
		enforce(Buffer.isBuffer(data), "data", "buffer");
		return this.fromArrayLike(data, endian);
	}

	fromArrayLike(data, endian) {
		if (endian == null) {endian = "be";}

		enforce(data && data.length >>> 0 === data.length, "data", "array-like");
		enforce(endian === "be" || endian === "le", "endian", "endianness");

		if (data.length === 0) {
			this.words[0] = 0;
			this.length = 1;
			this.negative = 0;
			return this;
		}

		this.length = Math.max(2, Math.ceil(data.length / 3));
		this.words = Array.from({length: this.length});
		this.negative = 0;

		for (let index = 0; index < this.length; index++) {this.words[index] = 0;}

		const left = data.length % 3;

		let off = 0;
		let j = 0;
		let w = 0;

		if (endian === "be") {
			for (let index = data.length - 1; index >= 2; index -= 3) {
				const w = data[index] | (data[index - 1] << 8) | (data[index - 2] << 16);

				this.words[j] |= (w << off) & 0x3_FF_FF_FF;
				this.words[j + 1] = (w >>> (26 - off)) & 0x3_FF_FF_FF;

				off += 24;

				if (off >= 26) {
					off -= 26;
					j += 1;
				}
			}

			switch (left) {
				case 2: {
					w = data[1] | (data[0] << 8);
					break;
				}
				case 1: {
					w = data[0];
					break;
				}
			}
		} else {
			const len = data.length - left;

			for (let index = 0; index < len; index += 3) {
				const w = data[index] | (data[index + 1] << 8) | (data[index + 2] << 16);

				this.words[j] |= (w << off) & 0x3_FF_FF_FF;
				this.words[j + 1] = (w >>> (26 - off)) & 0x3_FF_FF_FF;

				off += 24;

				if (off >= 26) {
					off -= 26;
					j += 1;
				}
			}

			switch (left) {
				case 2: {
					w = data[len] | (data[len + 1] << 8);
					break;
				}
				case 1: {
					w = data[len];
					break;
				}
			}
		}

		if (left > 0) {
			this.words[j] |= (w << off) & 0x3_FF_FF_FF;
			this.words[j + 1] = (w >>> (26 - off)) & 0x3_FF_FF_FF;
		}

		return this._strip();
	}

	decode(data, endian) {
		return this.fromBuffer(data, endian);
	}

	from(number_, base, endian) {
		if (number_ == null) {return this;}

		if (base === "le" || base === "be") {[base, endian] = [endian, base];}

		if (typeof number_ === "number") {return this.fromNumber(number_, endian);}

		if (typeof number_ === "bigint") {return this.fromBigInt(number_, endian);}

		if (typeof number_ === "string") {return this.fromString(number_, base, endian);}

		if (typeof number_ === "object") {
			if (BN.isBN(number_)) {return this.fromBN(number_, endian);}

			if (number_.length >>> 0 === number_.length) {return this.fromArrayLike(number_, endian);}
		}

		if (typeof number_ === "boolean") {return this.fromBool(number_);}

		throw new TypeError("Non-numeric object passed to BN.");
	}

	/*
	 * Static Methods
	 */

	static min(...arguments_) {
		let min = null;

		for (const number_ of arguments_) {
			enforce(BN.isBN(number_), "num", "bignum");

			if (!min || number_.cmp(min) < 0) {min = number_;}
		}

		return min || new BN(0);
	}

	static max(...arguments_) {
		let max = null;

		for (const number_ of arguments_) {
			enforce(BN.isBN(number_), "num", "bignum");

			if (!max || number_.cmp(max) > 0) {max = number_;}
		}

		return max || new BN(0);
	}

	static cmp(a, b) {
		enforce(BN.isBN(a), "a", "bignum");
		return a.cmp(b);
	}

	static ucmp(a, b) {
		enforce(BN.isBN(a), "a", "bignum");
		return a.ucmp(b);
	}

	static red(number_) {
		return new Red(number_);
	}

	static barrett(number_) {
		return new Barrett(number_);
	}

	static mont(number_) {
		return new Mont(number_);
	}

	static _prime(name) {
		if (primes[name]) {return primes[name];}

		let prime;

		switch (name) {
		case "p192": {
		prime = new P192();
		break;
		}
		case "p224": {
		prime = new P224();
		break;
		}
		case "p521": {
		prime = new P521();
		break;
		}
		case "k256": {
		prime = new K256();
		break;
		}
		case "p251": {
		prime = new P251();
		break;
		}
		case "p25519": {
		prime = new P25519();
		break;
		}
		case "p448": {
		prime = new P448();
		break;
		}
		default: { throw new Error(`Unknown prime: "${name}".`);
		}
		}

		primes[name] = prime;

		return prime;
	}

	static prime(name) {
		return BN._prime(name).p.clone();
	}

	static pow(number_, exp) {
		if (number_ === 2) {return BN.shift(1, exp);}

		return new BN().fromNumber(number_).pown(exp);
	}

	static shift(number_, bits) {
		if (number_ === 1) {return new BN(0).usetn(bits, 1);}

		return new BN().fromNumber(number_).ishln(bits);
	}

	static mask(bits) {
		return BN.shift(1, bits).isubn(1);
	}

	static randomBits(rng, bits) {
		enforce(rng != null, "rng", "rng");
		enforce(bits >>> 0 === bits, "bits", "uint32");

		if (typeof rng === "object") {
			enforce(typeof rng.randomBytes === "function", "rng", "rng");

			const size = (bits + 7) >>> 3;
			const total = size * 8;
			const bytes = rng.randomBytes(size);

			enforce(Buffer.isBuffer(bytes), "bytes", "buffer");

			if (bytes.length !== size) {throw new RangeError("Invalid number of bytes returned from RNG.");}

			const number_ = BN.fromBuffer(bytes);

			if (total > bits) {number_.iushrn(total - bits);}

			return number_;
		}

		enforce(typeof rng === "function", "rng", "rng");

		const number_ = rng(bits);

		enforce(BN.isBN(number_), "num", "bignum");
		range(number_.negative === 0, "RNG");
		nonred(!number_.red, "RNG");

		if (number_.bitLength() > bits) {throw new RangeError("Invalid number of bits returned from RNG.");}

		return number_;
	}

	static random(rng, min, max) {
		min = BN.cast(min, 16);
		max = BN.cast(max, 16);

		if (min.cmp(max) > 0) {throw new RangeError("Minimum cannot be greater than maximum.");}

		const space = max.sub(min).iabs();
		const bits = space.bitLength();

		if (bits === 0) {return min.clone();}

		for (;;) {
			const number_ = BN.randomBits(rng, bits);

			// Maximum is _exclusive_!
			if (number_.cmp(space) >= 0) {continue;}

			// Minimum is _inclusive_!
			number_.iadd(min);

			return number_;
		}
	}

	static of(number_, endian) {
		return new BN().of(number_, endian);
	}

	static fromNumber(number_, endian) {
		return new BN().fromNumber(number_, endian);
	}

	static fromDouble(number_, endian) {
		return new BN().fromDouble(number_, endian);
	}

	static fromBigInt(number_, endian) {
		return new BN().fromBigInt(number_, endian);
	}

	static fromBool(value) {
		return new BN().fromBool(value);
	}

	static fromString(str, base, endian) {
		return new BN().fromString(str, base, endian);
	}

	static fromJSON(json) {
		return new BN().fromJSON(json);
	}

	static fromBN(number_) {
		return new BN().fromBN(number_);
	}

	static fromArray(data, endian) {
		return new BN().fromArray(data, endian);
	}

	static fromBuffer(data, endian) {
		return new BN().fromBuffer(data, endian);
	}

	static fromArrayLike(data, endian) {
		return new BN().fromArrayLike(data, endian);
	}

	static decode(data, endian) {
		return new BN().decode(data, endian);
	}

	static from(number_, base, endian) {
		return new BN().from(number_, base, endian);
	}

	static cast(number_, base, endian) {
		if (BN.isBN(number_)) {return number_;}

		return new BN(number_, base, endian);
	}

	static isBN(obj) {
		return obj instanceof BN;
	}
}

/*
 * Static
 */

BN.BN = BN;
BN.wordSize = 26;
BN.native = 0;

/**
 * Prime
 */

class Prime {
	constructor(name, p) {
		// P = 2^N - K
		this.name = name;
		this.p = new BN(p, 16);
		this.n = this.p.bitLength();
		this.k = BN.shift(1, this.n).isub(this.p);
		this.lo = this.p.clone();
		this.one = this.p.clone();
	}

	ireduce(number_) {
		// Assumes that `num` is less than `P^2`:
		// num = HI * (2^N - K) + HI * K + LO = HI * K + LO (mod P)
		const neg = number_.negative !== 0;

		// Track bits.
		let bits = number_.bitLength();

		// Must be less than P^2.
		assert(bits <= this.n * 2);

		// Ensure positive.
		number_.negative = 0;

		// Reduce.
		while (bits > this.n) {
			// lo = num & ((1 << n) - 1)
			// num = num >> n
			this.split(number_, this.lo);

			// num = num * K
			this.imulK(number_);

			// num = num + lo
			number_._iadd(number_, this.lo);

			// bits = bitlen(num)
			bits = number_.bitLength();
		}

		// Final reduction.
		const cmp = bits < this.n ? -1 : number_.ucmp(this.p);

		if (cmp === 0) {
			number_.words[0] = 0;
			number_.length = 1;
		} else if (cmp > 0) {
			number_._isub(number_, this.p);
		} else {
			// Note: we shouldn't need to strip here.
		}

		// Adjust sign.
		if (neg && !number_.isZero()) {number_._isub(this.p, number_);}

		return number_;
	}

	split(input, out) {
		input._split(this.n, out);
	}

	imulK(number_) {
		return number_.imul(this.k);
	}

	pm2(x1) {
		// Exponent: p - 2
		throw new Error("Not implemented.");
	}

	fermat(x) {
		return this.pm2(x);
	}
}

/**
 * Prime (3 mod 4)
 */

class Prime34 extends Prime {
	constructor(name, p) {
		super(name, p);
	}

	pm3d4(x1) {
		// Exponent: (p - 3) / 4
		throw new Error("Not implemented.");
	}

	pp1d4(x1) {
		// Exponent: (p + 1) / 4
		throw new Error("Not implemented.");
	}

	sqrt(x) {
		// r = x^((p + 1) / 4) mod p
		const { red } = x;
		const r = this.pp1d4(x);

		if (!red.sqr(r).eq(x)) {throw new SquareRootError(r);}

		return r;
	}

	divsqrt(u, v) {
		// x = u^3 * v * (u^5 * v^3)^((p - 3) / 4) mod p
		const { red } = u;
		const u2 = red.sqr(u);
		const u3 = red.mul(u2, u);
		const u5 = red.mul(u3, u2);
		const v3 = red.mul(red.sqr(v), v);
		const p = this.pm3d4(red.mul(u5, v3));
		const x = red.mul(red.mul(u3, v), p);
		const c = red.mul(v, red.sqr(x));

		if (c.eq(u)) {return x;}

		throw new SquareRootError(x);
	}
}

/**
 * Prime (5 mod 8)
 */

class Prime58 extends Prime {
	constructor(name, p, sm1) {
		super(name, p);

		this.sm1 = new BN(sm1, 16);
	}

	pm5d8(x1) {
		// Exponent: (p - 5) / 8
		throw new Error("Not implemented.");
	}

	pp3d8(x1) {
		// Exponent: (p + 3) / 8
		throw new Error("Not implemented.");
	}

	sqrt(x) {
		// r = x^((p + 3) / 8) mod p
		const { red } = x;
		const sm1 = this.sm1._forceRed(red);
		const r = this.pp3d8(x);

		if (red.sqr(r).eq(x)) {return r;}

		const c = red.mul(r, sm1);

		if (red.sqr(c).eq(x)) {return c;}

		throw new SquareRootError(r);
	}

	divsqrt(u, v) {
		// x = u * v^3 * (u * v^7)^((p - 5) / 8) mod p
		const { red } = u;
		const sm1 = this.sm1._forceRed(red);
		const v3 = red.mul(red.sqr(v), v);
		const v7 = red.mul(red.sqr(v3), v);
		const p = this.pm5d8(red.mul(u, v7));
		const x = red.mul(red.mul(u, v3), p);
		const c = red.mul(v, red.sqr(x));

		if (c.eq(u)) {return x;}

		const mc = red.ineg(c);

		if (mc.eq(u)) {return red.mul(x, sm1);}

		if (mc.eq(red.mul(u, sm1))) {throw new SquareRootError(red.mul(x, sm1));}

		throw new SquareRootError(x);
	}
}

/**
 * Prime (1 mod 16)
 */

class Prime116 extends Prime {
	constructor(name, p, g) {
		super(name, p);

		this.g = new BN(g, 16);
		this.z = this.p.subn(1).zeroBits();
	}

	powS(x1) {
		// Exponent: (p - 1) / 2^k
		throw new Error("Not implemented.");
	}

	powE(x1) {
		// Exponent: (s + 1) / 2
		throw new Error("Not implemented.");
	}

	sqrt(x) {
		// Tonelli-Shanks (variable time).
		//
		// Constants:
		//
		//   k = factors of 2 for (p - 1)
		//   s = (p - 1) / 2^k
		//   e = (s + 1) / 2
		//   n = first non-square in F(p)
		//
		// Algorithm:
		//
		//   g = n^s mod p
		//   y = x^e mod p
		//   b = x^s mod p
		//
		//   loop:
		//     t = b
		//     m = 0
		//
		//     while t != 1:
		//       t = t^2 mod p
		//       m += 1
		//
		//     if m == 0:
		//       break
		//
		//     if m >= k:
		//       fail
		//
		//     t = g^(2^(k - m - 1)) mod p
		//     g = t^2 mod p
		//     y = y * t mod p
		//     b = b * g mod p
		//     k = m
		//
		//   return y
		//
		const { red } = x;

		switch (red.jacobi(x)) {
			case -1: {
				throw new SquareRootError(x);
			}
			case 0: {
				return x.clone();
			}
			case 1: {
				break;
			}
		}

		let g = this.g._forceRed(red);
		let y = this.powE(x);
		let b = this.powS(x);
		let k = this.z;

		for (;;) {
			let t = b;
			let m = 0;

			while (t.cmpn(1) !== 0 && m < k) {
				t = red.sqr(t);
				m += 1;
			}

			if (m === 0) {break;}

			assert(m < k);

			t = red.sqrn(g, k - m - 1);
			g = red.sqr(t);
			y = red.mul(y, t);
			b = red.mul(b, g);
			k = m;
		}

		return y;
	}

	divsqrt(u, v) {
		const { red } = u;

		if (v.isZero()) {throw new SquareRootError(v);}

		return this.sqrt(red.div(u, v));
	}
}

/**
 * P192
 */

class P192 extends Prime34 {
	constructor() {
		// 2^192 - 2^64 - 1 (= 3 mod 4)
		super("p192", "ffffffff ffffffff ffffffff fffffffe" + "ffffffff ffffffff");
	}

	imulK(number_) {
		// K = 0x10000000000000001
		// K = 2^64 + 1
		const one = this.one.inject(number_);
		return number_.iushln(64)._iadd(number_, one);
	}

	core(x1) {
		// Exponent: (p - 3) / 4
		// Bits: 127x1 1x0 62x1
		const { red } = x1;
		const x2 = red.sqrnmul(x1, 1, x1);
		const x3 = red.sqrnmul(x2, 1, x1);
		const x6 = red.sqrnmul(x3, 3, x3);
		const x12 = red.sqrnmul(x6, 6, x6);
		const x24 = red.sqrnmul(x12, 12, x12);
		const x30 = red.sqrnmul(x24, 6, x6);
		const x31 = red.sqrnmul(x30, 1, x1);
		const x62 = red.sqrnmul(x31, 31, x31);
		const x124 = red.sqrnmul(x62, 62, x62);
		const x127 = red.sqrnmul(x124, 3, x3);
		const r0 = red.sqrn(x127, 1);
		return red.sqrnmul(r0, 62, x62);
	}

	pm3d4(x1) {
		// Exponent: (p - 3) / 4
		// Bits: 127x1 1x0 62x1
		return this.core(x1);
	}

	pm2(x1) {
		// Exponent: p - 2
		// Bits: 127x1 1x0 62x1 1x0 1x1
		const { red } = x1;
		const r0 = this.core(x1);
		const r1 = red.sqrn(r0, 1);
		return red.sqrnmul(r1, 1, x1);
	}

	pp1d4(x1) {
		// Exponent: (p + 1) / 4
		// Bits: 128x1 62x0
		const { red } = x1;
		const x2 = red.sqrnmul(x1, 1, x1);
		const x4 = red.sqrnmul(x2, 2, x2);
		const x8 = red.sqrnmul(x4, 4, x4);
		const x16 = red.sqrnmul(x8, 8, x8);
		const x32 = red.sqrnmul(x16, 16, x16);
		const x64 = red.sqrnmul(x32, 32, x32);
		const x128 = red.sqrnmul(x64, 64, x64);
		return red.sqrn(x128, 62);
	}
}

/**
 * P224
 */

class P224 extends Prime116 {
	constructor() {
		// 2^224 - 2^96 + 1 (1 mod 16)
		super(
			"p224",
			"ffffffff ffffffff ffffffff ffffffff" + "00000000 00000000 00000001",
			"6a0fec67 8598a792 0c55b2d4 0b2d6ffb" + "bea3d8ce f3fb3632 dc691b74",
		);
	}

	imulK(number_) {
		// K = 0xffffffffffffffffffffffff
		// K = 2^96 - 1
		const one = this.one.inject(number_);
		return number_.iushln(96)._isub(number_, one);
	}

	powS(x1) {
		// Exponent: 2^128 - 1
		// Bits: 128x1
		const { red } = x1;
		const x2 = red.sqrnmul(x1, 1, x1);
		const x4 = red.sqrnmul(x2, 2, x2);
		const x8 = red.sqrnmul(x4, 4, x4);
		const x16 = red.sqrnmul(x8, 8, x8);
		const x32 = red.sqrnmul(x16, 16, x16);
		const x64 = red.sqrnmul(x32, 32, x32);
		return red.sqrnmul(x64, 64, x64);
	}

	powE(x1) {
		// Exponent: 2^127
		// Bits: 1x1 127x0
		const { red } = x1;
		return red.sqrn(x1, 127);
	}

	pm2(x1) {
		// Exponent: p - 2
		// Bits: 127x1 1x0 96x1
		const { red } = x1;
		const x2 = red.sqrnmul(x1, 1, x1);
		const x3 = red.sqrnmul(x2, 1, x1);
		const x6 = red.sqrnmul(x3, 3, x3);
		const x12 = red.sqrnmul(x6, 6, x6);
		const x24 = red.sqrnmul(x12, 12, x12);
		const x48 = red.sqrnmul(x24, 24, x24);
		const x96 = red.sqrnmul(x48, 48, x48);
		const x120 = red.sqrnmul(x96, 24, x24);
		const x126 = red.sqrnmul(x120, 6, x6);
		const x127 = red.sqrnmul(x126, 1, x1);
		const r0 = red.sqrn(x127, 1);
		return red.sqrnmul(r0, 96, x96);
	}
}

/**
 * P521
 */

class P521 extends Prime34 {
	constructor() {
		// 2^521 - 1 (= 3 mod 4)
		super(
			"p521",
			"000001ff ffffffff ffffffff ffffffff" +
				"ffffffff ffffffff ffffffff ffffffff" +
				"ffffffff ffffffff ffffffff ffffffff" +
				"ffffffff ffffffff ffffffff ffffffff" +
				"ffffffff",
		);
	}

	imulK(number_) {
		// K = 0x01
		return number_;
	}

	core(x1) {
		// Exponent: 2^519 - 1
		// Bits: 519x1
		const { red } = x1;
		const x2 = red.sqrnmul(x1, 1, x1);
		const x3 = red.sqrnmul(x2, 1, x1);
		const x6 = red.sqrnmul(x3, 3, x3);
		const x7 = red.sqrnmul(x6, 1, x1);
		const x8 = red.sqrnmul(x7, 1, x1);
		const x16 = red.sqrnmul(x8, 8, x8);
		const x32 = red.sqrnmul(x16, 16, x16);
		const x64 = red.sqrnmul(x32, 32, x32);
		const x128 = red.sqrnmul(x64, 64, x64);
		const x256 = red.sqrnmul(x128, 128, x128);
		const x512 = red.sqrnmul(x256, 256, x256);
		return red.sqrnmul(x512, 7, x7);
	}

	pm3d4(x1) {
		// Exponent: 2^519 - 1
		// Bits: 519x1
		return this.core(x1);
	}

	pm2(x1) {
		// Exponent: p - 2
		// Bits: 519x1 1x0 1x1
		const { red } = x1;
		const r0 = this.core(x1);
		const r1 = red.sqrn(r0, 1);
		return red.sqrnmul(r1, 1, x1);
	}

	pp1d4(x1) {
		// Exponent: (p + 1) / 4
		// Bits: 1x1 519x0
		const { red } = x1;
		return red.sqrn(x1, 519);
	}
}

/**
 * K256
 */

class K256 extends Prime34 {
	constructor() {
		// 2^256 - 2^32 - 977 (= 3 mod 4)
		super("k256", "ffffffff ffffffff ffffffff ffffffff" + "ffffffff ffffffff fffffffe fffffc2f");
	}

	split(input, output) {
		// 256 = 9 * 26 + 22
		const mask = 0x3F_FF_FF;
		const len = Math.min(input.length, 9);

		output._alloc(len + 1);

		for (let index = 0; index < len; index++) {output.words[index] = input.words[index];}

		output.length = len;

		if (input.length <= 9) {
			output._strip();
			input.words[0] = 0;
			input.length = 1;
			return;
		}

		// Shift by 9 limbs.
		let prev = input.words[9];
		let index = 10;

		output.words[output.length++] = prev & mask;
		output._strip();

		for (; index < input.length; index++) {
			const next = input.words[index] | 0;

			input.words[index - 10] = ((next & mask) << 4) | (prev >>> 22);

			prev = next;
		}

		prev >>>= 22;

		input.words[index - 10] = prev;

		if (prev === 0 && input.length > 10) {input.length -= 10;}
		else {input.length -= 9;}

		input._strip(); // Unsure if we need this.
	}

	imulK(number_) {
		// K = 0x1000003d1 = [0x40, 0x3d1]
		// K = 2^32 + 977
		number_._expand(number_.length + 2);

		// Bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390
		let lo = 0;

		for (let index = 0; index < number_.length; index++) {
			const w = number_.words[index];

			lo += w * 0x3_D1;

			number_.words[index] = lo & 0x3_FF_FF_FF;

			lo = w * 0x40 + Math.floor(lo / 0x4_00_00_00);
		}

		// Fast length reduction.
		if (number_.words[number_.length - 1] === 0) {
			number_.length -= 1;
			if (number_.words[number_.length - 1] === 0) {number_.length -= 1;}
		}

		// Note: we shouldn't need to strip here.
		return number_;
	}

	core(x1, x2) {
		// Exponent: (p - 47) / 64
		// Bits: 223x1 1x0 22x1 4x0
		const { red } = x1;
		const x3 = red.sqrnmul(x2, 1, x1);
		const x6 = red.sqrnmul(x3, 3, x3);
		const x9 = red.sqrnmul(x6, 3, x3);
		const x11 = red.sqrnmul(x9, 2, x2);
		const x22 = red.sqrnmul(x11, 11, x11);
		const x44 = red.sqrnmul(x22, 22, x22);
		const x88 = red.sqrnmul(x44, 44, x44);
		const x176 = red.sqrnmul(x88, 88, x88);
		const x220 = red.sqrnmul(x176, 44, x44);
		const x223 = red.sqrnmul(x220, 3, x3);
		const r0 = red.sqrn(x223, 1);
		const r1 = red.sqrnmul(r0, 22, x22);
		return red.sqrn(r1, 4);
	}

	pm3d4(x1) {
		// Exponent: (p - 3) / 4
		// Bits: 223x1 1x0 22x1 4x0 1x1 1x0 2x1
		const { red } = x1;
		const x2 = red.sqrnmul(x1, 1, x1);
		const r2 = this.core(x1, x2);
		const r3 = red.sqrnmul(r2, 1, x1);
		const r4 = red.sqrn(r3, 1);
		return red.sqrnmul(r4, 2, x2);
	}

	pm2(x1) {
		// Exponent: p - 2
		// Bits: 223x1 1x0 22x1 4x0 1x1 1x0 2x1 1x0 1x1
		const { red } = x1;
		const x2 = red.sqrnmul(x1, 1, x1);
		const r2 = this.core(x1, x2);
		const r3 = red.sqrnmul(r2, 1, x1);
		const r4 = red.sqrn(r3, 1);
		const r5 = red.sqrnmul(r4, 2, x2);
		const r6 = red.sqrn(r5, 1);
		return red.sqrnmul(r6, 1, x1);
	}

	pp1d4(x1) {
		// Exponent: (p + 1) / 4
		// Bits: 223x1 1x0 22x1 4x0 2x1 2x0
		const { red } = x1;
		const x2 = red.sqrnmul(x1, 1, x1);
		const r2 = this.core(x1, x2);
		const r3 = red.sqrnmul(r2, 2, x2);
		return red.sqrn(r3, 2);
	}
}

/**
 * P251
 */

class P251 extends Prime34 {
	constructor() {
		// 2^251 - 9
		super("p251", "07ffffff ffffffff ffffffff ffffffff" + "ffffffff ffffffff ffffffff fffffff7");
	}

	imulK(number_) {
		// K = 0x09
		if (number_.isZero()) {return number_;}

		let carry = 0;

		for (let index = 0; index < number_.length; index++) {
			const w = number_.words[index] * 0x09 + carry;

			carry = w >>> 26;

			number_.words[index] = w & 0x3_FF_FF_FF;
		}

		if (carry !== 0) {
			number_._alloc(number_.length + 1);
			number_.words[number_.length++] = carry;
		}

		// Note: we shouldn't need to strip here.
		return number_;
	}

	core(x1) {
		// Exponent: 2^247 - 1
		// Bits: 247x1
		const { red } = x1;
		const x2 = red.sqrnmul(x1, 1, x1);
		const x3 = red.sqrnmul(x2, 1, x1);
		const x6 = red.sqrnmul(x3, 3, x3);
		const x12 = red.sqrnmul(x6, 6, x6);
		const x24 = red.sqrnmul(x12, 12, x12);
		const x48 = red.sqrnmul(x24, 24, x24);
		const x96 = red.sqrnmul(x48, 48, x48);
		const x192 = red.sqrnmul(x96, 96, x96);
		const x240 = red.sqrnmul(x192, 48, x48);
		const x246 = red.sqrnmul(x240, 6, x6);
		return red.sqrnmul(x246, 1, x1);
	}

	pm3d4(x1) {
		// Exponent: (p - 3) / 4
		// Bits: 247x1 1x0 1x1
		const { red } = x1;
		const r0 = this.core(x1);
		const r1 = red.sqrn(r0, 1);
		return red.sqrnmul(r1, 1, x1);
	}

	pm2(x1) {
		// Exponent: p - 2
		// Bits: 247x1 1x0 1x1 1x0 1x1
		const { red } = x1;
		const r0 = this.core(x1);
		const r1 = red.sqrn(r0, 1);
		const r2 = red.sqrnmul(r1, 1, x1);
		const r3 = red.sqrn(r2, 1);
		return red.sqrnmul(r3, 1, x1);
	}

	pp1d4(x1) {
		// Exponent: (p + 1) / 4
		// Bits: 248x1 1x0
		const { red } = x1;
		const r0 = this.core(x1);
		const r1 = red.sqrnmul(r0, 1, x1);
		return red.sqrn(r1, 1);
	}
}

/**
 * P25519
 */

class P25519 extends Prime58 {
	constructor() {
		// 2^255 - 19 (= 5 mod 8)
		super(
			"p25519",
			"7fffffff ffffffff ffffffff ffffffff" + "ffffffff ffffffff ffffffff ffffffed",
			"2b832480 4fc1df0b 2b4d0099 3dfbd7a7" + "2f431806 ad2fe478 c4ee1b27 4a0ea0b0",
		);
	}

	imulK(number_) {
		// K = 0x13
		let carry = 0;

		for (let index = 0; index < number_.length; index++) {
			const w = number_.words[index] * 0x13 + carry;

			carry = w >>> 26;

			number_.words[index] = w & 0x3_FF_FF_FF;
		}

		if (carry !== 0) {
			number_._alloc(number_.length + 1);
			number_.words[number_.length++] = carry;
		}

		// Note: we shouldn't need to strip here.
		return number_;
	}

	core(x1, x2) {
		// Exponent: 2^250 - 1
		// Bits: 250x1
		const { red } = x1;
		const x4 = red.sqrnmul(x2, 2, x2);
		const x5 = red.sqrnmul(x4, 1, x1);
		const x10 = red.sqrnmul(x5, 5, x5);
		const x20 = red.sqrnmul(x10, 10, x10);
		const x40 = red.sqrnmul(x20, 20, x20);
		const x50 = red.sqrnmul(x40, 10, x10);
		const x100 = red.sqrnmul(x50, 50, x50);
		const x200 = red.sqrnmul(x100, 100, x100);
		return red.sqrnmul(x200, 50, x50);
	}

	pm5d8(x1) {
		// Exponent: (p - 5) / 8
		// Bits: 250x1 1x0 1x1
		const { red } = x1;
		const x2 = red.sqrnmul(x1, 1, x1);
		const r0 = this.core(x1, x2);
		const r1 = red.sqrn(r0, 1);
		return red.sqrnmul(r1, 1, x1);
	}

	pm2(x1) {
		// Exponent: p - 2
		// Bits: 250x1 1x0 1x1 1x0 2x1
		const { red } = x1;
		const x2 = red.sqrnmul(x1, 1, x1);
		const r0 = this.core(x1, x2);
		const r1 = red.sqrn(r0, 1);
		const r2 = red.sqrnmul(r1, 1, x1);
		const r3 = red.sqrn(r2, 1);
		return red.sqrnmul(r3, 2, x2);
	}

	pp3d8(x1) {
		// Exponent: (p + 3) / 8
		// Bits: 251x1 1x0
		const { red } = x1;
		const x2 = red.sqrnmul(x1, 1, x1);
		const r0 = this.core(x1, x2);
		const r1 = red.sqrnmul(r0, 1, x1);
		return red.sqrn(r1, 1);
	}
}

/**
 * P448
 */

class P448 extends Prime34 {
	constructor() {
		// 2^448 - 2^224 - 1 (= 3 mod 4)
		super(
			"p448",
			"ffffffff ffffffff ffffffff ffffffff" +
				"ffffffff ffffffff fffffffe ffffffff" +
				"ffffffff ffffffff ffffffff ffffffff" +
				"ffffffff ffffffff",
		);
	}

	imulK(number_) {
		// K = 0x100000000000000000000000000000000000000000000000000000001
		// K = 2^224 + 1
		const one = this.one.inject(number_);
		return number_.iushln(224)._iadd(number_, one);
	}

	core(x1, x2) {
		// Exponent: 2^222 - 1
		// Bits: 222x1
		const { red } = x1;
		const x3 = red.sqrnmul(x2, 1, x1);
		const x6 = red.sqrnmul(x3, 3, x3);
		const x9 = red.sqrnmul(x6, 3, x3);
		const x11 = red.sqrnmul(x9, 2, x2);
		const x22 = red.sqrnmul(x11, 11, x11);
		const x44 = red.sqrnmul(x22, 22, x22);
		const x88 = red.sqrnmul(x44, 44, x44);
		const x176 = red.sqrnmul(x88, 88, x88);
		const x220 = red.sqrnmul(x176, 44, x44);
		return red.sqrnmul(x220, 2, x2);
	}

	pm3d4(x1) {
		// Exponent: (p - 3) / 4
		// Bits: 223x1 1x0 222x1
		const { red } = x1;
		const x2 = red.sqrnmul(x1, 1, x1);
		const x222 = this.core(x1, x2);
		const r0 = red.sqrnmul(x222, 1, x1);
		const r1 = red.sqrn(r0, 1);
		return red.sqrnmul(r1, 222, x222);
	}

	pm2(x1) {
		// Exponent: p - 2
		// Bits: 223x1 1x0 222x1 1x0 1x1
		const { red } = x1;
		const r0 = this.pm3d4(x1);
		const r1 = red.sqrn(r0, 1);
		return red.sqrnmul(r1, 1, x1);
	}

	pp1d4(x1) {
		// Exponent: (p + 1) / 4
		// Bits: 224x1 222x0
		const { red } = x1;
		const x2 = red.sqrnmul(x1, 1, x1);
		const r0 = this.core(x1, x2);
		const r1 = red.sqrnmul(r0, 2, x2);
		return red.sqrn(r1, 222);
	}
}

/**
 * Reduction Engine
 */

class Red {
	constructor(m) {
		let prime = null;

		if (typeof m === "string") {
			prime = BN._prime(m);
			m = prime.p;
		}

		enforce(BN.isBN(m), "m", "bignum");
		nonred(!m.red, "reduction");
		range(m.sign() > 0, "reduction");

		this.m = m;
		this.prime = prime;
		this.mb = null;
		this.sm1 = null;
	}

	_verify1(a) {
		range(a.negative === 0, "red");
		red(a.red != null, "red");
	}

	_verify2(a, b) {
		range((a.negative | b.negative) === 0, "red");
		red(a.red != null && a.red === b.red, "red");
	}

	get mont() {
		return false;
	}

	precompute() {
		// Precompute `sqrt(-1)` for primes congruent to 5 mod 8.
		if (this.sm1 === null && this.m.andln(7) === 5) {
			if (this.prime) {
				this.sm1 = this.prime.sm1.clone()._forceRed(this);
			} else {
				const x = new BN(2).toRed(this);
				const e = this.m.subn(1).iushrn(2);

				// sqrt(-1) = 2^((p - 1) / 4) mod p
				this.sm1 = this.pow(x, e);
			}
		}

		return this;
	}

	convertTo(number_) {
		const res = number_.mod(this.m);
		res.red = this;
		return res;
	}

	convertFrom(number_) {
		const res = number_.clone();
		res.red = null;
		return res;
	}

	intTo(a) {
		return a;
	}

	intFrom(a) {
		return a;
	}

	imod(a) {
		if (this.prime) {return this.prime.ireduce(a)._forceRed(this);}

		return a.imod(this.m)._forceRed(this);
	}

	iadd(a, b) {
		this._verify2(a, b);

		a._iadd(a, b);

		if (a.ucmp(this.m) >= 0) {a._isub(a, this.m);}

		return a;
	}

	add(a, b) {
		if (a.length < b.length) {return this.iadd(b.clone(), a);}

		return this.iadd(a.clone(), b);
	}

	iaddn(a, number_) {
		this._verify1(a);

		if (number_ < 0) {return this.isubn(a, -number_);}

		if (this.m.length === 1) {number_ %= this.m.words[0];}

		a._iaddn(number_);

		if (a.ucmp(this.m) >= 0) {a._isub(a, this.m);}

		return a;
	}

	addn(a, number_) {
		return this.iaddn(a.clone(), number_);
	}

	isub(a, b) {
		this._verify2(a, b);

		//  0: a - a mod m == 0
		// -1: a - b mod m == m - (b - a)
		// +1: a - b mod m == a - b
		const cmp = a.ucmp(b);

		if (cmp === 0) {
			a.words[0] = 0;
			a.length = 1;
			return a;
		}

		if (cmp < 0) {
			a._isub(b, a);
			a._isub(this.m, a);
		} else {
			a._isub(a, b);
		}

		return a;
	}

	sub(a, b) {
		return this.isub(a.clone(), b);
	}

	isubn(a, number_) {
		this._verify1(a);

		if (number_ < 0) {return this.iaddn(a, -number_);}

		if (this.m.length === 1) {number_ %= this.m.words[0];}

		//  <: a - b mod m == m - (b - a)
		// >=: a - b mod m == a - b
		if (a.length === 1 && a.words[0] < number_) {
			a.words[0] = number_ - a.words[0];
			a._isub(this.m, a);
		} else {
			a._isubn(number_);
		}

		return a;
	}

	subn(a, number_) {
		return this.isubn(a.clone(), number_);
	}

	imul(a, b) {
		this._verify2(a, b);
		return this.imod(a.imul(b));
	}

	mul(a, b) {
		this._verify2(a, b);
		return this.imod(a.mul(b));
	}

	imuln(a, number_) {
		this._verify1(a);

		if (a.isZero()) {return a;}

		if (number_ === 0) {
			a.words[0] = 0;
			a.length = 1;
			return a;
		}

		const neg = number_ < 0;

		if (neg) {number_ = -number_;}

		if (this.m.length === 1) {number_ %= this.m.words[0];}

		a.imuln(number_);

		if (number_ <= 16) {
			// Quick reduction.
			while (a.ucmp(this.m) >= 0) {a._isub(a, this.m);}
		} else {
			this.imod(a);
		}

		if (neg) {this.ineg(a);}

		return a;
	}

	muln(a, number_) {
		return this.imuln(a.clone(), number_);
	}

	idiv(a, b) {
		return this.div(a, b)._move(a);
	}

	div(a, b) {
		return this.mul(a, this.invert(b));
	}

	idivn(a, number_) {
		return this.divn(a, number_)._move(a);
	}

	divn(a, number_) {
		return this.div(a, this.convertTo(new BN(number_)));
	}

	ipow(a, number_) {
		return this.pow(a, number_)._move(a);
	}

	pow(a, number_) {
		this._verify1(a);

		if (number_.isNeg()) {a = this.invert(a);}

		// Small exponent.
		if (number_.length === 1) {return this.pown(a, number_.words[0]);}

		// Call out to BigInt.
		if (HAS_BIGINT && !this.prime) {return this.powInt(a, number_);}

		// Otherwise, a BN implementation.
		return this.powNum(a, number_);
	}

	powNum(a, number_) {
		// Sliding window (odd multiples only).
		const one = new BN(1).toRed(this);
		const wnd = Array.from({length: WND_SIZE});
		const a2 = this.sqr(a);

		wnd[0] = a;

		for (let index = 1; index < WND_SIZE; index++) {wnd[index] = this.mul(wnd[index - 1], a2);}

		let index = number_.bitLength();
		let r = one;

		while (index >= WND_WIDTH) {
			let width = WND_WIDTH;
			let bits = number_.bits(index - width, width);

			if (bits < WND_SIZE) {
				r = this.sqr(r);
				index -= 1;
				continue;
			}

			while ((bits & 1) === 0) {
				width -= 1;
				bits >>= 1;
			}

			if (r === one) {
				r = wnd[bits >> 1].clone();
			} else {
				r = this.sqrn(r, width);
				r = this.mul(r, wnd[bits >> 1]);
			}

			index -= width;
		}

		if (index > 0) {
			const bits = number_.bits(0, index);

			while (index--) {
				r = this.sqr(r);

				if ((bits >> index) & 1) {r = this.mul(r, a);}
			}
		}

		return r;
	}

	powInt(a, number_) {
		if (this.mb === null) {this.mb = this.m.toBigInt();}

		const x = this.intFrom(a.toBigInt());
		const y = powInt(x, number_, this.mb);
		const z = this.intTo(y);

		return BN.fromBigInt(z)._forceRed(this);
	}

	sqrn(a, n) {
		while (n--) {a = this.sqr(a);}

		return a;
	}

	sqrnmul(a, n, b) {
		return this.mul(this.sqrn(a, n), b);
	}

	ipown(a, number_) {
		return this.pown(a, number_)._move(a);
	}

	pown(a, number_) {
		this._verify1(a);

		if (number_ < 0) {
			a = this.invert(a);
			number_ = -number_;
		}

		if (number_ === 0) {return new BN(1).toRed(this);}

		if (number_ === 1) {return a.clone();}

		const bits = countBits(number_);

		let r = a;

		for (let index = bits - 2; index >= 0; index--) {
			r = this.sqr(r);

			if ((number_ >> index) & 1) {r = this.mul(r, a);}
		}

		return r;
	}

	isqr(a) {
		return this.imul(a, a);
	}

	sqr(a) {
		return this.mul(a, a);
	}

	isqrt(x) {
		return this.sqrt(x)._move(x);
	}

	sqrt(x) {
		this._verify1(x);

		// Optimized square root chain.
		if (this.prime) {return this.prime.sqrt(x);}

		// Fast case (p = 3 mod 4).
		if (this.m.andln(3) === 3) {return this.sqrt3mod4(x);}

		// Fast case (p = 5 mod 8).
		if (this.m.andln(7) === 5) {
			if (this.sm1 != null) {return this.sqrt5mod8sm1(x);}
			return this.sqrt5mod8(x);
		}

		// Slow case (Tonelli-Shanks).
		return this.sqrt0(x);
	}

	sqrt3mod4(x) {
		const e = this.m.addn(1).iushrn(2); // (p + 1) / 4
		const b = this.pow(x, e);

		if (!this.sqr(b).eq(x)) {throw new SquareRootError(b);}

		return b;
	}

	sqrt5mod8(x) {
		// Atkin's Algorithm.
		const one = new BN(1).toRed(this);
		const e = this.m.ushrn(3); // (p - 5) / 8
		const x2 = this.add(x, x);
		const alpha = this.pow(x2, e);
		const beta = this.mul(x2, this.sqr(alpha));
		const b = this.mul(this.mul(alpha, x), this.isub(beta, one));

		if (!this.sqr(b).eq(x)) {throw new SquareRootError(b);}

		return b;
	}

	sqrt5mod8sm1(x) {
		const e = this.m.addn(3).iushrn(3); // (p + 3) / 8
		const b = this.pow(x, e);

		if (this.sqr(b).eq(x)) {return b;}

		const c = this.mul(b, this.sm1);

		if (this.sqr(c).eq(x)) {return c;}

		throw new SquareRootError(b);
	}

	sqrt0(x) {
		if (this.m.cmpn(1) === 0 || !this.m.isOdd()) {throw new Error("Invalid prime.");}

		switch (this.jacobi(x)) {
			case -1: {
				throw new SquareRootError(x);
			}
			case 0: {
				return x.clone();
			}
			case 1: {
				break;
			}
		}

		const one = new BN(1).toRed(this);
		const s = this.m.subn(1);
		const e = s._makeOdd();
		const n = new BN(2).toRed(this);

		while (this.jacobi(n) !== -1) {this.iadd(n, one);}

		let g = this.pow(n, s);
		let b = this.pow(x, s);
		let y = this.pow(x, s.iaddn(1).iushrn(1));
		let k = e;

		for (;;) {
			let t = b;
			let m = 0;

			while (!t.eq(one) && m < k) {
				t = this.sqr(t);
				m += 1;
			}

			if (m === 0) {break;}

			assert(m < k);

			t = this.sqrn(g, k - m - 1);
			g = this.sqr(t);
			y = this.mul(y, t);
			b = this.mul(b, g);
			k = m;
		}

		return y;
	}

	idivsqrt(u, v) {
		return this.divsqrt(u, v)._move(u);
	}

	divsqrt(u, v) {
		this._verify2(u, v);

		// u = 0, v = 0
		if (u.isZero() && v.isZero()) {throw new SquareRootError(v);}

		// Optimized inverse square root chain.
		if (this.prime) {return this.prime.divsqrt(u, v);}

		// p = 3 mod 4
		if (this.m.andln(3) === 3) {return this.divsqrt3mod4(u, v);}

		// p = 5 mod 8
		if (this.sm1 != null && this.m.andln(7) === 5) {return this.divsqrt5mod8(u, v);}

		// v = 0
		if (v.isZero()) {throw new SquareRootError(v);}

		return this.sqrt(this.div(u, v));
	}

	divsqrt3mod4(u, v) {
		// x = u^3 * v * (u^5 * v^3)^((p - 3) / 4) mod p
		const e = this.m.subn(3).iushrn(2);
		const u2 = this.sqr(u);
		const u3 = this.mul(u2, u);
		const u5 = this.mul(u3, u2);
		const v3 = this.mul(this.sqr(v), v);
		const p = this.pow(this.mul(u5, v3), e);
		const x = this.mul(this.mul(u3, v), p);
		const c = this.mul(v, this.sqr(x));

		if (c.eq(u)) {return x;}

		throw new SquareRootError(x);
	}

	divsqrt5mod8(u, v) {
		// x = u * v^3 * (u * v^7)^((p - 5) / 8) mod p
		const e = this.m.subn(5).iushrn(3);
		const v3 = this.mul(this.sqr(v), v);
		const v7 = this.mul(this.sqr(v3), v);
		const p = this.pow(this.mul(u, v7), e);
		const x = this.mul(this.mul(u, v3), p);
		const c = this.mul(v, this.sqr(x));

		if (c.eq(u)) {return x;}

		const mc = this.ineg(c);

		if (mc.eq(u)) {return this.mul(x, this.sm1);}

		if (mc.eq(this.mul(u, this.sm1))) {throw new SquareRootError(this.mul(x, this.sm1));}

		throw new SquareRootError(x);
	}

	isSquare(a) {
		if (this.m.isOdd()) {return this.jacobi(a) >= 0;}

		return this.kronecker(a) >= 0;
	}

	ishl(a, number_) {
		this._verify1(a);
		return this.imod(a.iushl(number_));
	}

	shl(a, number_) {
		return this.ishl(a.clone(), number_);
	}

	ishln(a, number_) {
		this._verify1(a);

		a.iushln(number_);

		if (number_ <= 4) {
			// Quick reduction.
			while (a.ucmp(this.m) >= 0) {a._isub(a, this.m);}
		} else {
			this.imod(a);
		}

		return a;
	}

	shln(a, number_) {
		return this.ishln(a.clone(), number_);
	}

	ineg(a) {
		this._verify1(a);

		if (!a.isZero()) {a._isub(this.m, a);}

		return a;
	}

	neg(a) {
		return this.ineg(a.clone());
	}

	eq(a, b) {
		this._verify2(a, b);
		return a.ucmp(b) === 0;
	}

	eqn(a, number_) {
		this._verify1(a);

		if (this.m.length === 1) {
			number_ %= this.m.words[0];

			if (number_ < 0) {number_ += this.m.words[0];}

			return a.ucmpn(number_) === 0;
		}

		if (number_ < 0) {
			this.m._isubn(-number_);

			const cmp = a.ucmp(this.m);

			this.m._iaddn(-number_);

			return cmp === 0;
		}

		return a.ucmpn(number_) === 0;
	}

	isHigh(a) {
		return !this.isLow(a);
	}

	isLow(a) {
		this._verify1(a);
		return a.ucmp(this.m.ushrn(1)) <= 0;
	}

	isOdd(a) {
		this._verify1(a);
		return a.isOdd();
	}

	isEven(a) {
		this._verify1(a);
		return a.isEven();
	}

	legendre(number_) {
		this._verify1(number_);

		if (this.m.isEven()) {throw new Error("legendre: `num` must be odd.");}

		// Euler's criterion.
		const e = this.m.subn(1).iushrn(1); // (p - 1) / 2
		const symbol = this.pow(number_, e);

		if (symbol.isZero()) {return 0;}

		const one = new BN(1).toRed(this);

		if (symbol.eq(one)) {return 1;}

		if (symbol.eq(this.ineg(one))) {return -1;}

		throw new Error("Invalid prime.");
	}

	jacobi(a) {
		this._verify1(a);
		return a.jacobi(this.m);
	}

	kronecker(a) {
		this._verify1(a);
		return a.kronecker(this.m);
	}

	iinvert(a) {
		return this.invert(a)._move(a);
	}

	invert(a) {
		this._verify1(a);
		return a.invert(this.m)._forceRed(this);
	}

	ifermat(a) {
		return this.fermat(a)._move(a);
	}

	fermat(a) {
		this._verify1(a);

		if (a.isZero() || this.m.cmpn(1) === 0) {throw new RangeError("Not invertible.");}

		// Optimized inversion chain.
		if (this.prime) {return this.prime.fermat(a);}

		// Invert using fermat's little theorem.
		return this.pow(a, this.m.subn(2));
	}

	invertAll(elems) {
		// Montgomery's trick.
		enforce(Array.isArray(elems), "elems", "array");

		for (const elem of elems) {
			enforce(BN.isBN(elem), "elem", "bignum");

			this._verify1(elem);
		}

		if (this.m.cmpn(1) === 0 || this.m.isEven()) {throw new RangeError("Not invertible.");}

		const len = elems.length;
		const invs = new Array(len);

		if (len === 0) {return invs;}

		let acc = new BN(1).toRed(this);

		for (let index = 0; index < len; index++) {
			if (elems[index].isZero()) {
				invs[index] = elems[index].clone();
				continue;
			}

			invs[index] = acc;
			acc = this.mul(acc, elems[index]);
		}

		acc = this.invert(acc);

		for (let index = len - 1; index >= 0; index--) {
			if (elems[index].isZero()) {continue;}

			invs[index] = this.mul(acc, invs[index]);
			acc = this.mul(acc, elems[index]);
		}

		return invs;
	}

	[custom]() {
		if (this.prime) {return `<Red: ${this.prime.name}>`;}

		return `<Red: ${this.m.toString(10)}>`;
	}
}

/**
 * Barrett Engine
 */

class Barrett extends Red {
	constructor(m) {
		super(m);

		this.prime = null;
		this.n = this.m.bitLength();

		if (this.n % 26 !== 0) {this.n += 26 - (this.n % 26);}

		this.k = this.n * 2;
		this.w = this.k / 26;
		this.b = BN.shift(1, this.k).div(this.m);
	}

	convertTo(number_) {
		if (number_.length > this.w) {return super.convertTo(number_);}

		return this.imod(number_.clone());
	}

	_shift(q) {
		let index = 0;
		let j = this.w;

		while (j < q.length) {q.words[index++] = q.words[j++];}

		if (index === 0) {q.words[index++] = 0;}

		q.length = index;
	}

	imod(a) {
		const neg = a.negative;

		assert(a.length <= this.w);

		a.negative = 0;

		const q = a.mul(this.b);

		// Shift right by `k` bits.
		this._shift(q);

		a._isub(a, q.mul(this.m));

		if (a.ucmp(this.m) >= 0) {a._isub(a, this.m);}

		if (neg && !a.isZero()) {a._isub(this.m, a);}

		a.red = this;

		return a;
	}
}

/**
 * Montgomery Engine
 */

class Mont extends Red {
	constructor(m) {
		super(m);

		// Note that:
		//
		//   mi = (-m^-1 mod (2^(n * 2))) mod r
		//
		// and:
		//
		//   mi = (((2^n)^-1 mod m) * r^-1 - 1) / m
		//
		// are equivalent.
		this.prime = null;
		this.n = this.m.length * 26;
		this.r = BN.shift(1, this.n);
		this.r2 = BN.shift(1, this.n * 2).imod(this.m);
		this.ri = this.r.invert(this.m);
		this.mi = this.r.mul(this.ri).isubn(1).div(this.m);
		this.rib = null;
	}

	get mont() {
		return true;
	}

	convertTo(number_) {
		if (number_.isNeg() || number_.ucmp(this.m) >= 0) {return this.imod(number_.ushln(this.n));}

		// Equivalent to: (num * 2^n) mod m
		return this.mul(number_, this.r2);
	}

	convertFrom(number_) {
		// Equivalent to: num * r^-1 mod m
		const r = this.mul(number_, new BN(1));
		r.red = null;
		return r;
	}

	intTo(a) {
		return (a << BigInt(this.n)) % this.mb;
	}

	intFrom(a) {
		if (this.rib === null) {this.rib = this.ri.toBigInt();}

		return (a * this.rib) % this.mb;
	}

	iaddn(a, number_) {
		return this.iadd(a, this.convertTo(new BN(number_)));
	}

	isubn(a, number_) {
		return this.isub(a, this.convertTo(new BN(number_)));
	}

	imul(a, b) {
		return this.mul(a, b)._move(a);
	}

	mul(a, b) {
		if (a.isZero() || b.isZero()) {return new BN(0)._forceRed(this);}

		const t = a.mul(b);
		const c = t.umaskn(this.n).mul(this.mi).iumaskn(this.n);
		const u = t.iadd(c.mul(this.m)).iushrn(this.n);

		if (u.ucmp(this.m) >= 0) {u._isub(u, this.m);}

		return u._forceRed(this);
	}

	imuln(a, number_) {
		this._verify1(a);

		if (a.isZero()) {return a;}

		if (number_ === 0) {
			a.words[0] = 0;
			a.length = 1;
			return a;
		}

		const neg = number_ < 0;

		if (neg) {number_ = -number_;}

		if (this.m.length === 1) {number_ %= this.m.words[0];}

		const bits = countBits(number_);

		// Potentially compute with additions.
		// This avoids an expensive division.
		if (bits > 5) {
			// Slow case (num > 31).
			this.imul(a, this.convertTo(new BN(number_)));
		} else if ((number_ & (number_ - 1)) === 0) {
			// Optimize for powers of two.
			for (let index = 0; index < bits - 1; index++) {this.iadd(a, a);}
		} else {
			// Multiply left to right.
			const c = a.clone();

			for (let index = bits - 2; index >= 0; index--) {
				this.iadd(a, a);

				if ((number_ >> index) & 1) {this.iadd(a, c);}
			}
		}

		if (neg) {this.ineg(a);}

		return a;
	}

	eqn(a, number_) {
		this._verify1(a);

		if (number_ === 0) {return a.isZero();}

		return a.ucmp(this.convertTo(new BN(number_))) === 0;
	}

	isLow(a) {
		this._verify1(a);
		return this.convertFrom(a).ucmp(this.m.ushrn(1)) <= 0;
	}

	isOdd(a) {
		this._verify1(a);
		return this.convertFrom(a).isOdd();
	}

	isEven(a) {
		this._verify1(a);
		return this.convertFrom(a).isEven();
	}

	invert(a) {
		this._verify1(a);

		// (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
		return this.imod(a.invert(this.m).mul(this.r2));
	}
}

/*
 * Helpers
 */

function makeError(Error, message, start) {
	const err = new Error(message);

	if (Error.captureStackTrace) {Error.captureStackTrace(err, start);}

	return err;
}

function assert(value, message) {
	if (!value) {
		const message_ = message || "Assertion failed.";
		throw makeError(Error, message_, assert);
	}
}

function enforce(value, name, type) {
	if (!value) {
		const message = `"${name}" must be a(n) ${type}.`;
		throw makeError(TypeError, message, enforce);
	}
}

function range(value, name) {
	if (!value) {
		const message = `"${name}" only works with positive numbers.`;
		throw makeError(RangeError, message, range);
	}
}

function red(value, name) {
	if (!value) {
		const message = `"${name}" only works with red numbers.`;
		throw makeError(TypeError, message, red);
	}
}

function nonred(value, name) {
	if (!value) {
		const message = `"${name}" only works with normal numbers.`;
		throw makeError(TypeError, message, nonred);
	}
}

function nonzero(value) {
	if (!value) {
		const message = "Cannot divide by zero.";
		throw makeError(RangeError, message, nonzero);
	}
}

class SquareRootError extends Error {
	constructor(result) {
		super();

		this.name = "SquareRootError";
		this.message = "X is not a square mod P.";
		this.result = result.fromRed();

		if (Error.captureStackTrace) {Error.captureStackTrace(this, SquareRootError);}
	}
}

function isInteger(number_) {
	return Number.isSafeInteger(number_);
}

function isSMI(number_) {
	return isInteger(number_) && number_ >= -0x3_FF_FF_FF && number_ <= 0x3_FF_FF_FF;
}

function allocate(ArrayType, size) {
	if (ArrayType.allocUnsafeSlow) {return ArrayType.allocUnsafeSlow(size);}

	return new ArrayType(size);
}

function getBase(base) {
	if (base == null) {return 10;}

	if (typeof base === "number") {return base;}

	switch (base) {
		case "bin": {
			return 2;
		}
		case "oct": {
			return 8;
		}
		case "dec": {
			return 10;
		}
		case "hex": {
			return 16;
		}
	}

	return 0;
}

/*
 * Internal
 */

function countBits(w) {
	if (Math.clz32) {return 32 - Math.clz32(w);}

	let t = w;
	let r = 0;

	if (t >= 0x10_00) {
		r += 13;
		t >>>= 13;
	}

	if (t >= 0x40) {
		r += 7;
		t >>>= 7;
	}

	if (t >= 0x8) {
		r += 4;
		t >>>= 4;
	}

	if (t >= 0x02) {
		r += 2;
		t >>>= 2;
	}

	return r + t;
}

function zeroBits(w) {
	// Shortcut.
	if (w === 0) {return 26;}

	let t = w;
	let r = 0;

	if ((t & 0x1F_FF) === 0) {
		r += 13;
		t >>>= 13;
	}

	if ((t & 0x7F) === 0) {
		r += 7;
		t >>>= 7;
	}

	if ((t & 0xF) === 0) {
		r += 4;
		t >>>= 4;
	}

	if ((t & 0x3) === 0) {
		r += 2;
		t >>>= 2;
	}

	if ((t & 0x1) === 0) {r += 1;}

	return r;
}

function parseHex(str, start, end) {
	const len = Math.min(str.length, end);

	let r = 0;
	let z = 0;

	for (let index = start; index < len; index++) {
		const c = str.charCodeAt(index) - 48;

		r <<= 4;

		let b;

		if (c >= 49 && c <= 54) {
			// 'a' - 'f'
			b = c - 49 + 0xA;
		} else if (c >= 17 && c <= 22) {
			// 'A' - 'F'
			b = c - 17 + 0xA;
		} else {
			// '0' - '9'
			b = c;
		}

		r |= b;
		z |= b;
	}

	if (z & ~15) {throw new Error("Invalid string.");}

	return r;
}

function parseBase(str, start, end, mul) {
	const len = Math.min(str.length, end);

	let r = 0;

	for (let index = start; index < len; index++) {
		const c = str.charCodeAt(index) - 48;

		r *= mul;

		let b;

		if (c >= 49) {
			// 'a'
			b = c - 49 + 0xA;
		} else if (c >= 17) {
			// 'A'
			b = c - 17 + 0xA;
		} else {
			// '0' - '9'
			b = c;
		}

		if (c < 0 || c > 207 || b >= mul) {throw new Error("Invalid string.");}

		r += b;
	}

	return r;
}

/*
 * Exponentiation (bigint)
 */

function powInt(x, e, m) {
	// Sliding window (odd multiples only).
	const one = BigInt(1);
	const wnd = Array.from({length: WND_SIZE});
	const x2 = (x * x) % m;

	wnd[0] = x;

	for (let index = 1; index < WND_SIZE; index++) {wnd[index] = (wnd[index - 1] * x2) % m;}

	let index = e.bitLength();
	let r = one;

	while (index >= WND_WIDTH) {
		let width = WND_WIDTH;
		let bits = e.bits(index - width, width);

		if (bits < WND_SIZE) {
			r = (r * r) % m;
			index -= 1;
			continue;
		}

		while ((bits & 1) === 0) {
			width -= 1;
			bits >>= 1;
		}

		if (r === one) {
			r = wnd[bits >> 1];
		} else {
			r = sqrn(r, width, m);
			r = (r * wnd[bits >> 1]) % m;
		}

		index -= width;
	}

	if (index > 0) {
		const bits = e.bits(0, index);

		while (index--) {
			r = (r * r) % m;

			if ((bits >> index) & 1) {r = (r * x) % m;}
		}
	}

	return r;
}

function sqrn(x, n, m) {
	for (let index = 0; index < n; index++) {x = (x * x) % m;}
	return x;
}

/*
 * Multiplication
 */

function smallMulTo(self, number_, out) {
	const len = self.length + number_.length;

	out.negative = self.negative ^ number_.negative;
	out._alloc(len);
	out.length = len;

	// Peel one iteration (compiler can't
	// do it, because of code complexity).
	const a = self.words[0];
	const b = number_.words[0];
	const r = a * b;
	const lo = r & 0x3_FF_FF_FF;

	let carry = (r / 0x4_00_00_00) | 0;
	let k = 1;

	out.words[0] = lo;

	for (; k < out.length - 1; k++) {
		// Sum all words with the same
		// `i + j = k` and accumulate
		// `ncarry`, note that ncarry
		// could be >= 0x3ffffff.
		let ncarry = carry >>> 26;
		let rword = carry & 0x3_FF_FF_FF;

		const min = Math.max(0, k - self.length + 1);
		const max = Math.min(k, number_.length - 1);

		for (let j = min; j <= max; j++) {
			const index = k - j;
			const a = self.words[index];
			const b = number_.words[j];
			const r = a * b + rword;

			ncarry += (r / 0x4_00_00_00) | 0;
			rword = r & 0x3_FF_FF_FF;
		}

		out.words[k] = rword | 0;
		carry = ncarry | 0;
	}

	if (carry === 0) {out.length -= 1;}
	else {out.words[k] = carry | 0;}

	return out._strip();
}

function bigMulTo(self, number_, out) {
	const len = self.length + number_.length;

	out.negative = self.negative ^ number_.negative;
	out._alloc(len);
	out.length = len;

	let carry = 0;
	let hncarry = 0;
	let k = 0;

	for (; k < out.length - 1; k++) {
		// Sum all words with the same
		// `i + j = k` and accumulate
		// `ncarry`, note that ncarry
		// could be >= 0x3ffffff.
		let ncarry = hncarry;

		hncarry = 0;

		let rword = carry & 0x3_FF_FF_FF;

		const min = Math.max(0, k - self.length + 1);
		const max = Math.min(k, number_.length - 1);

		for (let j = min; j <= max; j++) {
			const index = k - j;
			const a = self.words[index];
			const b = number_.words[j];
			const r = a * b;

			let lo = r & 0x3_FF_FF_FF;

			ncarry = (ncarry + ((r / 0x4_00_00_00) | 0)) | 0;
			lo = (lo + rword) | 0;
			rword = lo & 0x3_FF_FF_FF;
			ncarry = (ncarry + (lo >>> 26)) | 0;

			hncarry += ncarry >>> 26;
			ncarry &= 0x3_FF_FF_FF;
		}

		out.words[k] = rword;
		carry = ncarry;
		ncarry = hncarry;
	}

	if (carry === 0) {out.length -= 1;}
	else {out.words[k] = carry;}

	return out._strip();
}

function jumboMulTo(x, y, out) {
	// v8 has a 2147483519 bit max (~256mb).
	if (!HAS_BIGINT || x.length + y.length > 82_595_519) {return bigMulTo(x, y, out);}

	const zero = BigInt(0);
	const mask = BigInt(0x3_FF_FF_FF);
	const shift = BigInt(26);

	let z = x.toBigInt() * y.toBigInt();

	const neg = (z < zero) | 0;

	if (neg) {z = -z;}

	let index = 0;

	while (z > zero) {
		out.words[index++] = Number(z & mask);
		z >>= shift;
	}

	if (index === 0) {out.words[index++] = 0;}

	out.length = index;
	out.negative = neg;

	return out;
}

function comb10MulTo(self, number_, out) {
	const a = self.words;
	const b = number_.words;
	const o = out.words;
	const a0 = a[0] | 0;
	const al0 = a0 & 0x1F_FF;
	const ah0 = a0 >>> 13;
	const a1 = a[1] | 0;
	const al1 = a1 & 0x1F_FF;
	const ah1 = a1 >>> 13;
	const a2 = a[2] | 0;
	const al2 = a2 & 0x1F_FF;
	const ah2 = a2 >>> 13;
	const a3 = a[3] | 0;
	const al3 = a3 & 0x1F_FF;
	const ah3 = a3 >>> 13;
	const a4 = a[4] | 0;
	const al4 = a4 & 0x1F_FF;
	const ah4 = a4 >>> 13;
	const a5 = a[5] | 0;
	const al5 = a5 & 0x1F_FF;
	const ah5 = a5 >>> 13;
	const a6 = a[6] | 0;
	const al6 = a6 & 0x1F_FF;
	const ah6 = a6 >>> 13;
	const a7 = a[7] | 0;
	const al7 = a7 & 0x1F_FF;
	const ah7 = a7 >>> 13;
	const a8 = a[8] | 0;
	const al8 = a8 & 0x1F_FF;
	const ah8 = a8 >>> 13;
	const a9 = a[9] | 0;
	const al9 = a9 & 0x1F_FF;
	const ah9 = a9 >>> 13;
	const b0 = b[0] | 0;
	const bl0 = b0 & 0x1F_FF;
	const bh0 = b0 >>> 13;
	const b1 = b[1] | 0;
	const bl1 = b1 & 0x1F_FF;
	const bh1 = b1 >>> 13;
	const b2 = b[2] | 0;
	const bl2 = b2 & 0x1F_FF;
	const bh2 = b2 >>> 13;
	const b3 = b[3] | 0;
	const bl3 = b3 & 0x1F_FF;
	const bh3 = b3 >>> 13;
	const b4 = b[4] | 0;
	const bl4 = b4 & 0x1F_FF;
	const bh4 = b4 >>> 13;
	const b5 = b[5] | 0;
	const bl5 = b5 & 0x1F_FF;
	const bh5 = b5 >>> 13;
	const b6 = b[6] | 0;
	const bl6 = b6 & 0x1F_FF;
	const bh6 = b6 >>> 13;
	const b7 = b[7] | 0;
	const bl7 = b7 & 0x1F_FF;
	const bh7 = b7 >>> 13;
	const b8 = b[8] | 0;
	const bl8 = b8 & 0x1F_FF;
	const bh8 = b8 >>> 13;
	const b9 = b[9] | 0;
	const bl9 = b9 & 0x1F_FF;
	const bh9 = b9 >>> 13;

	let c = 0;
	let lo, mid, hi;

	out.negative = self.negative ^ number_.negative;
	out._alloc(20);
	out.length = 19;

	/* k = 0 */
	lo = Math.imul(al0, bl0);
	mid = Math.imul(al0, bh0);
	mid = (mid + Math.imul(ah0, bl0)) | 0;
	hi = Math.imul(ah0, bh0);

	let w0 = (((c + lo) | 0) + ((mid & 0x1F_FF) << 13)) | 0;
	c = (((hi + (mid >>> 13)) | 0) + (w0 >>> 26)) | 0;
	w0 &= 0x3_FF_FF_FF;

	/* k = 1 */
	lo = Math.imul(al1, bl0);
	mid = Math.imul(al1, bh0);
	mid = (mid + Math.imul(ah1, bl0)) | 0;
	hi = Math.imul(ah1, bh0);
	lo = (lo + Math.imul(al0, bl1)) | 0;
	mid = (mid + Math.imul(al0, bh1)) | 0;
	mid = (mid + Math.imul(ah0, bl1)) | 0;
	hi = (hi + Math.imul(ah0, bh1)) | 0;

	let w1 = (((c + lo) | 0) + ((mid & 0x1F_FF) << 13)) | 0;
	c = (((hi + (mid >>> 13)) | 0) + (w1 >>> 26)) | 0;
	w1 &= 0x3_FF_FF_FF;

	/* k = 2 */
	lo = Math.imul(al2, bl0);
	mid = Math.imul(al2, bh0);
	mid = (mid + Math.imul(ah2, bl0)) | 0;
	hi = Math.imul(ah2, bh0);
	lo = (lo + Math.imul(al1, bl1)) | 0;
	mid = (mid + Math.imul(al1, bh1)) | 0;
	mid = (mid + Math.imul(ah1, bl1)) | 0;
	hi = (hi + Math.imul(ah1, bh1)) | 0;
	lo = (lo + Math.imul(al0, bl2)) | 0;
	mid = (mid + Math.imul(al0, bh2)) | 0;
	mid = (mid + Math.imul(ah0, bl2)) | 0;
	hi = (hi + Math.imul(ah0, bh2)) | 0;

	let w2 = (((c + lo) | 0) + ((mid & 0x1F_FF) << 13)) | 0;
	c = (((hi + (mid >>> 13)) | 0) + (w2 >>> 26)) | 0;
	w2 &= 0x3_FF_FF_FF;

	/* k = 3 */
	lo = Math.imul(al3, bl0);
	mid = Math.imul(al3, bh0);
	mid = (mid + Math.imul(ah3, bl0)) | 0;
	hi = Math.imul(ah3, bh0);
	lo = (lo + Math.imul(al2, bl1)) | 0;
	mid = (mid + Math.imul(al2, bh1)) | 0;
	mid = (mid + Math.imul(ah2, bl1)) | 0;
	hi = (hi + Math.imul(ah2, bh1)) | 0;
	lo = (lo + Math.imul(al1, bl2)) | 0;
	mid = (mid + Math.imul(al1, bh2)) | 0;
	mid = (mid + Math.imul(ah1, bl2)) | 0;
	hi = (hi + Math.imul(ah1, bh2)) | 0;
	lo = (lo + Math.imul(al0, bl3)) | 0;
	mid = (mid + Math.imul(al0, bh3)) | 0;
	mid = (mid + Math.imul(ah0, bl3)) | 0;
	hi = (hi + Math.imul(ah0, bh3)) | 0;

	let w3 = (((c + lo) | 0) + ((mid & 0x1F_FF) << 13)) | 0;
	c = (((hi + (mid >>> 13)) | 0) + (w3 >>> 26)) | 0;
	w3 &= 0x3_FF_FF_FF;

	/* k = 4 */
	lo = Math.imul(al4, bl0);
	mid = Math.imul(al4, bh0);
	mid = (mid + Math.imul(ah4, bl0)) | 0;
	hi = Math.imul(ah4, bh0);
	lo = (lo + Math.imul(al3, bl1)) | 0;
	mid = (mid + Math.imul(al3, bh1)) | 0;
	mid = (mid + Math.imul(ah3, bl1)) | 0;
	hi = (hi + Math.imul(ah3, bh1)) | 0;
	lo = (lo + Math.imul(al2, bl2)) | 0;
	mid = (mid + Math.imul(al2, bh2)) | 0;
	mid = (mid + Math.imul(ah2, bl2)) | 0;
	hi = (hi + Math.imul(ah2, bh2)) | 0;
	lo = (lo + Math.imul(al1, bl3)) | 0;
	mid = (mid + Math.imul(al1, bh3)) | 0;
	mid = (mid + Math.imul(ah1, bl3)) | 0;
	hi = (hi + Math.imul(ah1, bh3)) | 0;
	lo = (lo + Math.imul(al0, bl4)) | 0;
	mid = (mid + Math.imul(al0, bh4)) | 0;
	mid = (mid + Math.imul(ah0, bl4)) | 0;
	hi = (hi + Math.imul(ah0, bh4)) | 0;

	let w4 = (((c + lo) | 0) + ((mid & 0x1F_FF) << 13)) | 0;
	c = (((hi + (mid >>> 13)) | 0) + (w4 >>> 26)) | 0;
	w4 &= 0x3_FF_FF_FF;

	/* k = 5 */
	lo = Math.imul(al5, bl0);
	mid = Math.imul(al5, bh0);
	mid = (mid + Math.imul(ah5, bl0)) | 0;
	hi = Math.imul(ah5, bh0);
	lo = (lo + Math.imul(al4, bl1)) | 0;
	mid = (mid + Math.imul(al4, bh1)) | 0;
	mid = (mid + Math.imul(ah4, bl1)) | 0;
	hi = (hi + Math.imul(ah4, bh1)) | 0;
	lo = (lo + Math.imul(al3, bl2)) | 0;
	mid = (mid + Math.imul(al3, bh2)) | 0;
	mid = (mid + Math.imul(ah3, bl2)) | 0;
	hi = (hi + Math.imul(ah3, bh2)) | 0;
	lo = (lo + Math.imul(al2, bl3)) | 0;
	mid = (mid + Math.imul(al2, bh3)) | 0;
	mid = (mid + Math.imul(ah2, bl3)) | 0;
	hi = (hi + Math.imul(ah2, bh3)) | 0;
	lo = (lo + Math.imul(al1, bl4)) | 0;
	mid = (mid + Math.imul(al1, bh4)) | 0;
	mid = (mid + Math.imul(ah1, bl4)) | 0;
	hi = (hi + Math.imul(ah1, bh4)) | 0;
	lo = (lo + Math.imul(al0, bl5)) | 0;
	mid = (mid + Math.imul(al0, bh5)) | 0;
	mid = (mid + Math.imul(ah0, bl5)) | 0;
	hi = (hi + Math.imul(ah0, bh5)) | 0;

	let w5 = (((c + lo) | 0) + ((mid & 0x1F_FF) << 13)) | 0;
	c = (((hi + (mid >>> 13)) | 0) + (w5 >>> 26)) | 0;
	w5 &= 0x3_FF_FF_FF;

	/* k = 6 */
	lo = Math.imul(al6, bl0);
	mid = Math.imul(al6, bh0);
	mid = (mid + Math.imul(ah6, bl0)) | 0;
	hi = Math.imul(ah6, bh0);
	lo = (lo + Math.imul(al5, bl1)) | 0;
	mid = (mid + Math.imul(al5, bh1)) | 0;
	mid = (mid + Math.imul(ah5, bl1)) | 0;
	hi = (hi + Math.imul(ah5, bh1)) | 0;
	lo = (lo + Math.imul(al4, bl2)) | 0;
	mid = (mid + Math.imul(al4, bh2)) | 0;
	mid = (mid + Math.imul(ah4, bl2)) | 0;
	hi = (hi + Math.imul(ah4, bh2)) | 0;
	lo = (lo + Math.imul(al3, bl3)) | 0;
	mid = (mid + Math.imul(al3, bh3)) | 0;
	mid = (mid + Math.imul(ah3, bl3)) | 0;
	hi = (hi + Math.imul(ah3, bh3)) | 0;
	lo = (lo + Math.imul(al2, bl4)) | 0;
	mid = (mid + Math.imul(al2, bh4)) | 0;
	mid = (mid + Math.imul(ah2, bl4)) | 0;
	hi = (hi + Math.imul(ah2, bh4)) | 0;
	lo = (lo + Math.imul(al1, bl5)) | 0;
	mid = (mid + Math.imul(al1, bh5)) | 0;
	mid = (mid + Math.imul(ah1, bl5)) | 0;
	hi = (hi + Math.imul(ah1, bh5)) | 0;
	lo = (lo + Math.imul(al0, bl6)) | 0;
	mid = (mid + Math.imul(al0, bh6)) | 0;
	mid = (mid + Math.imul(ah0, bl6)) | 0;
	hi = (hi + Math.imul(ah0, bh6)) | 0;

	let w6 = (((c + lo) | 0) + ((mid & 0x1F_FF) << 13)) | 0;
	c = (((hi + (mid >>> 13)) | 0) + (w6 >>> 26)) | 0;
	w6 &= 0x3_FF_FF_FF;

	/* k = 7 */
	lo = Math.imul(al7, bl0);
	mid = Math.imul(al7, bh0);
	mid = (mid + Math.imul(ah7, bl0)) | 0;
	hi = Math.imul(ah7, bh0);
	lo = (lo + Math.imul(al6, bl1)) | 0;
	mid = (mid + Math.imul(al6, bh1)) | 0;
	mid = (mid + Math.imul(ah6, bl1)) | 0;
	hi = (hi + Math.imul(ah6, bh1)) | 0;
	lo = (lo + Math.imul(al5, bl2)) | 0;
	mid = (mid + Math.imul(al5, bh2)) | 0;
	mid = (mid + Math.imul(ah5, bl2)) | 0;
	hi = (hi + Math.imul(ah5, bh2)) | 0;
	lo = (lo + Math.imul(al4, bl3)) | 0;
	mid = (mid + Math.imul(al4, bh3)) | 0;
	mid = (mid + Math.imul(ah4, bl3)) | 0;
	hi = (hi + Math.imul(ah4, bh3)) | 0;
	lo = (lo + Math.imul(al3, bl4)) | 0;
	mid = (mid + Math.imul(al3, bh4)) | 0;
	mid = (mid + Math.imul(ah3, bl4)) | 0;
	hi = (hi + Math.imul(ah3, bh4)) | 0;
	lo = (lo + Math.imul(al2, bl5)) | 0;
	mid = (mid + Math.imul(al2, bh5)) | 0;
	mid = (mid + Math.imul(ah2, bl5)) | 0;
	hi = (hi + Math.imul(ah2, bh5)) | 0;
	lo = (lo + Math.imul(al1, bl6)) | 0;
	mid = (mid + Math.imul(al1, bh6)) | 0;
	mid = (mid + Math.imul(ah1, bl6)) | 0;
	hi = (hi + Math.imul(ah1, bh6)) | 0;
	lo = (lo + Math.imul(al0, bl7)) | 0;
	mid = (mid + Math.imul(al0, bh7)) | 0;
	mid = (mid + Math.imul(ah0, bl7)) | 0;
	hi = (hi + Math.imul(ah0, bh7)) | 0;

	let w7 = (((c + lo) | 0) + ((mid & 0x1F_FF) << 13)) | 0;
	c = (((hi + (mid >>> 13)) | 0) + (w7 >>> 26)) | 0;
	w7 &= 0x3_FF_FF_FF;

	/* k = 8 */
	lo = Math.imul(al8, bl0);
	mid = Math.imul(al8, bh0);
	mid = (mid + Math.imul(ah8, bl0)) | 0;
	hi = Math.imul(ah8, bh0);
	lo = (lo + Math.imul(al7, bl1)) | 0;
	mid = (mid + Math.imul(al7, bh1)) | 0;
	mid = (mid + Math.imul(ah7, bl1)) | 0;
	hi = (hi + Math.imul(ah7, bh1)) | 0;
	lo = (lo + Math.imul(al6, bl2)) | 0;
	mid = (mid + Math.imul(al6, bh2)) | 0;
	mid = (mid + Math.imul(ah6, bl2)) | 0;
	hi = (hi + Math.imul(ah6, bh2)) | 0;
	lo = (lo + Math.imul(al5, bl3)) | 0;
	mid = (mid + Math.imul(al5, bh3)) | 0;
	mid = (mid + Math.imul(ah5, bl3)) | 0;
	hi = (hi + Math.imul(ah5, bh3)) | 0;
	lo = (lo + Math.imul(al4, bl4)) | 0;
	mid = (mid + Math.imul(al4, bh4)) | 0;
	mid = (mid + Math.imul(ah4, bl4)) | 0;
	hi = (hi + Math.imul(ah4, bh4)) | 0;
	lo = (lo + Math.imul(al3, bl5)) | 0;
	mid = (mid + Math.imul(al3, bh5)) | 0;
	mid = (mid + Math.imul(ah3, bl5)) | 0;
	hi = (hi + Math.imul(ah3, bh5)) | 0;
	lo = (lo + Math.imul(al2, bl6)) | 0;
	mid = (mid + Math.imul(al2, bh6)) | 0;
	mid = (mid + Math.imul(ah2, bl6)) | 0;
	hi = (hi + Math.imul(ah2, bh6)) | 0;
	lo = (lo + Math.imul(al1, bl7)) | 0;
	mid = (mid + Math.imul(al1, bh7)) | 0;
	mid = (mid + Math.imul(ah1, bl7)) | 0;
	hi = (hi + Math.imul(ah1, bh7)) | 0;
	lo = (lo + Math.imul(al0, bl8)) | 0;
	mid = (mid + Math.imul(al0, bh8)) | 0;
	mid = (mid + Math.imul(ah0, bl8)) | 0;
	hi = (hi + Math.imul(ah0, bh8)) | 0;

	let w8 = (((c + lo) | 0) + ((mid & 0x1F_FF) << 13)) | 0;
	c = (((hi + (mid >>> 13)) | 0) + (w8 >>> 26)) | 0;
	w8 &= 0x3_FF_FF_FF;

	/* k = 9 */
	lo = Math.imul(al9, bl0);
	mid = Math.imul(al9, bh0);
	mid = (mid + Math.imul(ah9, bl0)) | 0;
	hi = Math.imul(ah9, bh0);
	lo = (lo + Math.imul(al8, bl1)) | 0;
	mid = (mid + Math.imul(al8, bh1)) | 0;
	mid = (mid + Math.imul(ah8, bl1)) | 0;
	hi = (hi + Math.imul(ah8, bh1)) | 0;
	lo = (lo + Math.imul(al7, bl2)) | 0;
	mid = (mid + Math.imul(al7, bh2)) | 0;
	mid = (mid + Math.imul(ah7, bl2)) | 0;
	hi = (hi + Math.imul(ah7, bh2)) | 0;
	lo = (lo + Math.imul(al6, bl3)) | 0;
	mid = (mid + Math.imul(al6, bh3)) | 0;
	mid = (mid + Math.imul(ah6, bl3)) | 0;
	hi = (hi + Math.imul(ah6, bh3)) | 0;
	lo = (lo + Math.imul(al5, bl4)) | 0;
	mid = (mid + Math.imul(al5, bh4)) | 0;
	mid = (mid + Math.imul(ah5, bl4)) | 0;
	hi = (hi + Math.imul(ah5, bh4)) | 0;
	lo = (lo + Math.imul(al4, bl5)) | 0;
	mid = (mid + Math.imul(al4, bh5)) | 0;
	mid = (mid + Math.imul(ah4, bl5)) | 0;
	hi = (hi + Math.imul(ah4, bh5)) | 0;
	lo = (lo + Math.imul(al3, bl6)) | 0;
	mid = (mid + Math.imul(al3, bh6)) | 0;
	mid = (mid + Math.imul(ah3, bl6)) | 0;
	hi = (hi + Math.imul(ah3, bh6)) | 0;
	lo = (lo + Math.imul(al2, bl7)) | 0;
	mid = (mid + Math.imul(al2, bh7)) | 0;
	mid = (mid + Math.imul(ah2, bl7)) | 0;
	hi = (hi + Math.imul(ah2, bh7)) | 0;
	lo = (lo + Math.imul(al1, bl8)) | 0;
	mid = (mid + Math.imul(al1, bh8)) | 0;
	mid = (mid + Math.imul(ah1, bl8)) | 0;
	hi = (hi + Math.imul(ah1, bh8)) | 0;
	lo = (lo + Math.imul(al0, bl9)) | 0;
	mid = (mid + Math.imul(al0, bh9)) | 0;
	mid = (mid + Math.imul(ah0, bl9)) | 0;
	hi = (hi + Math.imul(ah0, bh9)) | 0;

	let w9 = (((c + lo) | 0) + ((mid & 0x1F_FF) << 13)) | 0;
	c = (((hi + (mid >>> 13)) | 0) + (w9 >>> 26)) | 0;
	w9 &= 0x3_FF_FF_FF;

	/* k = 10 */
	lo = Math.imul(al9, bl1);
	mid = Math.imul(al9, bh1);
	mid = (mid + Math.imul(ah9, bl1)) | 0;
	hi = Math.imul(ah9, bh1);
	lo = (lo + Math.imul(al8, bl2)) | 0;
	mid = (mid + Math.imul(al8, bh2)) | 0;
	mid = (mid + Math.imul(ah8, bl2)) | 0;
	hi = (hi + Math.imul(ah8, bh2)) | 0;
	lo = (lo + Math.imul(al7, bl3)) | 0;
	mid = (mid + Math.imul(al7, bh3)) | 0;
	mid = (mid + Math.imul(ah7, bl3)) | 0;
	hi = (hi + Math.imul(ah7, bh3)) | 0;
	lo = (lo + Math.imul(al6, bl4)) | 0;
	mid = (mid + Math.imul(al6, bh4)) | 0;
	mid = (mid + Math.imul(ah6, bl4)) | 0;
	hi = (hi + Math.imul(ah6, bh4)) | 0;
	lo = (lo + Math.imul(al5, bl5)) | 0;
	mid = (mid + Math.imul(al5, bh5)) | 0;
	mid = (mid + Math.imul(ah5, bl5)) | 0;
	hi = (hi + Math.imul(ah5, bh5)) | 0;
	lo = (lo + Math.imul(al4, bl6)) | 0;
	mid = (mid + Math.imul(al4, bh6)) | 0;
	mid = (mid + Math.imul(ah4, bl6)) | 0;
	hi = (hi + Math.imul(ah4, bh6)) | 0;
	lo = (lo + Math.imul(al3, bl7)) | 0;
	mid = (mid + Math.imul(al3, bh7)) | 0;
	mid = (mid + Math.imul(ah3, bl7)) | 0;
	hi = (hi + Math.imul(ah3, bh7)) | 0;
	lo = (lo + Math.imul(al2, bl8)) | 0;
	mid = (mid + Math.imul(al2, bh8)) | 0;
	mid = (mid + Math.imul(ah2, bl8)) | 0;
	hi = (hi + Math.imul(ah2, bh8)) | 0;
	lo = (lo + Math.imul(al1, bl9)) | 0;
	mid = (mid + Math.imul(al1, bh9)) | 0;
	mid = (mid + Math.imul(ah1, bl9)) | 0;
	hi = (hi + Math.imul(ah1, bh9)) | 0;

	let w10 = (((c + lo) | 0) + ((mid & 0x1F_FF) << 13)) | 0;
	c = (((hi + (mid >>> 13)) | 0) + (w10 >>> 26)) | 0;
	w10 &= 0x3_FF_FF_FF;

	/* k = 11 */
	lo = Math.imul(al9, bl2);
	mid = Math.imul(al9, bh2);
	mid = (mid + Math.imul(ah9, bl2)) | 0;
	hi = Math.imul(ah9, bh2);
	lo = (lo + Math.imul(al8, bl3)) | 0;
	mid = (mid + Math.imul(al8, bh3)) | 0;
	mid = (mid + Math.imul(ah8, bl3)) | 0;
	hi = (hi + Math.imul(ah8, bh3)) | 0;
	lo = (lo + Math.imul(al7, bl4)) | 0;
	mid = (mid + Math.imul(al7, bh4)) | 0;
	mid = (mid + Math.imul(ah7, bl4)) | 0;
	hi = (hi + Math.imul(ah7, bh4)) | 0;
	lo = (lo + Math.imul(al6, bl5)) | 0;
	mid = (mid + Math.imul(al6, bh5)) | 0;
	mid = (mid + Math.imul(ah6, bl5)) | 0;
	hi = (hi + Math.imul(ah6, bh5)) | 0;
	lo = (lo + Math.imul(al5, bl6)) | 0;
	mid = (mid + Math.imul(al5, bh6)) | 0;
	mid = (mid + Math.imul(ah5, bl6)) | 0;
	hi = (hi + Math.imul(ah5, bh6)) | 0;
	lo = (lo + Math.imul(al4, bl7)) | 0;
	mid = (mid + Math.imul(al4, bh7)) | 0;
	mid = (mid + Math.imul(ah4, bl7)) | 0;
	hi = (hi + Math.imul(ah4, bh7)) | 0;
	lo = (lo + Math.imul(al3, bl8)) | 0;
	mid = (mid + Math.imul(al3, bh8)) | 0;
	mid = (mid + Math.imul(ah3, bl8)) | 0;
	hi = (hi + Math.imul(ah3, bh8)) | 0;
	lo = (lo + Math.imul(al2, bl9)) | 0;
	mid = (mid + Math.imul(al2, bh9)) | 0;
	mid = (mid + Math.imul(ah2, bl9)) | 0;
	hi = (hi + Math.imul(ah2, bh9)) | 0;

	let w11 = (((c + lo) | 0) + ((mid & 0x1F_FF) << 13)) | 0;
	c = (((hi + (mid >>> 13)) | 0) + (w11 >>> 26)) | 0;
	w11 &= 0x3_FF_FF_FF;

	/* k = 12 */
	lo = Math.imul(al9, bl3);
	mid = Math.imul(al9, bh3);
	mid = (mid + Math.imul(ah9, bl3)) | 0;
	hi = Math.imul(ah9, bh3);
	lo = (lo + Math.imul(al8, bl4)) | 0;
	mid = (mid + Math.imul(al8, bh4)) | 0;
	mid = (mid + Math.imul(ah8, bl4)) | 0;
	hi = (hi + Math.imul(ah8, bh4)) | 0;
	lo = (lo + Math.imul(al7, bl5)) | 0;
	mid = (mid + Math.imul(al7, bh5)) | 0;
	mid = (mid + Math.imul(ah7, bl5)) | 0;
	hi = (hi + Math.imul(ah7, bh5)) | 0;
	lo = (lo + Math.imul(al6, bl6)) | 0;
	mid = (mid + Math.imul(al6, bh6)) | 0;
	mid = (mid + Math.imul(ah6, bl6)) | 0;
	hi = (hi + Math.imul(ah6, bh6)) | 0;
	lo = (lo + Math.imul(al5, bl7)) | 0;
	mid = (mid + Math.imul(al5, bh7)) | 0;
	mid = (mid + Math.imul(ah5, bl7)) | 0;
	hi = (hi + Math.imul(ah5, bh7)) | 0;
	lo = (lo + Math.imul(al4, bl8)) | 0;
	mid = (mid + Math.imul(al4, bh8)) | 0;
	mid = (mid + Math.imul(ah4, bl8)) | 0;
	hi = (hi + Math.imul(ah4, bh8)) | 0;
	lo = (lo + Math.imul(al3, bl9)) | 0;
	mid = (mid + Math.imul(al3, bh9)) | 0;
	mid = (mid + Math.imul(ah3, bl9)) | 0;
	hi = (hi + Math.imul(ah3, bh9)) | 0;

	let w12 = (((c + lo) | 0) + ((mid & 0x1F_FF) << 13)) | 0;
	c = (((hi + (mid >>> 13)) | 0) + (w12 >>> 26)) | 0;
	w12 &= 0x3_FF_FF_FF;

	/* k = 13 */
	lo = Math.imul(al9, bl4);
	mid = Math.imul(al9, bh4);
	mid = (mid + Math.imul(ah9, bl4)) | 0;
	hi = Math.imul(ah9, bh4);
	lo = (lo + Math.imul(al8, bl5)) | 0;
	mid = (mid + Math.imul(al8, bh5)) | 0;
	mid = (mid + Math.imul(ah8, bl5)) | 0;
	hi = (hi + Math.imul(ah8, bh5)) | 0;
	lo = (lo + Math.imul(al7, bl6)) | 0;
	mid = (mid + Math.imul(al7, bh6)) | 0;
	mid = (mid + Math.imul(ah7, bl6)) | 0;
	hi = (hi + Math.imul(ah7, bh6)) | 0;
	lo = (lo + Math.imul(al6, bl7)) | 0;
	mid = (mid + Math.imul(al6, bh7)) | 0;
	mid = (mid + Math.imul(ah6, bl7)) | 0;
	hi = (hi + Math.imul(ah6, bh7)) | 0;
	lo = (lo + Math.imul(al5, bl8)) | 0;
	mid = (mid + Math.imul(al5, bh8)) | 0;
	mid = (mid + Math.imul(ah5, bl8)) | 0;
	hi = (hi + Math.imul(ah5, bh8)) | 0;
	lo = (lo + Math.imul(al4, bl9)) | 0;
	mid = (mid + Math.imul(al4, bh9)) | 0;
	mid = (mid + Math.imul(ah4, bl9)) | 0;
	hi = (hi + Math.imul(ah4, bh9)) | 0;

	let w13 = (((c + lo) | 0) + ((mid & 0x1F_FF) << 13)) | 0;
	c = (((hi + (mid >>> 13)) | 0) + (w13 >>> 26)) | 0;
	w13 &= 0x3_FF_FF_FF;

	/* k = 14 */
	lo = Math.imul(al9, bl5);
	mid = Math.imul(al9, bh5);
	mid = (mid + Math.imul(ah9, bl5)) | 0;
	hi = Math.imul(ah9, bh5);
	lo = (lo + Math.imul(al8, bl6)) | 0;
	mid = (mid + Math.imul(al8, bh6)) | 0;
	mid = (mid + Math.imul(ah8, bl6)) | 0;
	hi = (hi + Math.imul(ah8, bh6)) | 0;
	lo = (lo + Math.imul(al7, bl7)) | 0;
	mid = (mid + Math.imul(al7, bh7)) | 0;
	mid = (mid + Math.imul(ah7, bl7)) | 0;
	hi = (hi + Math.imul(ah7, bh7)) | 0;
	lo = (lo + Math.imul(al6, bl8)) | 0;
	mid = (mid + Math.imul(al6, bh8)) | 0;
	mid = (mid + Math.imul(ah6, bl8)) | 0;
	hi = (hi + Math.imul(ah6, bh8)) | 0;
	lo = (lo + Math.imul(al5, bl9)) | 0;
	mid = (mid + Math.imul(al5, bh9)) | 0;
	mid = (mid + Math.imul(ah5, bl9)) | 0;
	hi = (hi + Math.imul(ah5, bh9)) | 0;

	let w14 = (((c + lo) | 0) + ((mid & 0x1F_FF) << 13)) | 0;
	c = (((hi + (mid >>> 13)) | 0) + (w14 >>> 26)) | 0;
	w14 &= 0x3_FF_FF_FF;

	/* k = 15 */
	lo = Math.imul(al9, bl6);
	mid = Math.imul(al9, bh6);
	mid = (mid + Math.imul(ah9, bl6)) | 0;
	hi = Math.imul(ah9, bh6);
	lo = (lo + Math.imul(al8, bl7)) | 0;
	mid = (mid + Math.imul(al8, bh7)) | 0;
	mid = (mid + Math.imul(ah8, bl7)) | 0;
	hi = (hi + Math.imul(ah8, bh7)) | 0;
	lo = (lo + Math.imul(al7, bl8)) | 0;
	mid = (mid + Math.imul(al7, bh8)) | 0;
	mid = (mid + Math.imul(ah7, bl8)) | 0;
	hi = (hi + Math.imul(ah7, bh8)) | 0;
	lo = (lo + Math.imul(al6, bl9)) | 0;
	mid = (mid + Math.imul(al6, bh9)) | 0;
	mid = (mid + Math.imul(ah6, bl9)) | 0;
	hi = (hi + Math.imul(ah6, bh9)) | 0;

	let w15 = (((c + lo) | 0) + ((mid & 0x1F_FF) << 13)) | 0;
	c = (((hi + (mid >>> 13)) | 0) + (w15 >>> 26)) | 0;
	w15 &= 0x3_FF_FF_FF;

	/* k = 16 */
	lo = Math.imul(al9, bl7);
	mid = Math.imul(al9, bh7);
	mid = (mid + Math.imul(ah9, bl7)) | 0;
	hi = Math.imul(ah9, bh7);
	lo = (lo + Math.imul(al8, bl8)) | 0;
	mid = (mid + Math.imul(al8, bh8)) | 0;
	mid = (mid + Math.imul(ah8, bl8)) | 0;
	hi = (hi + Math.imul(ah8, bh8)) | 0;
	lo = (lo + Math.imul(al7, bl9)) | 0;
	mid = (mid + Math.imul(al7, bh9)) | 0;
	mid = (mid + Math.imul(ah7, bl9)) | 0;
	hi = (hi + Math.imul(ah7, bh9)) | 0;

	let w16 = (((c + lo) | 0) + ((mid & 0x1F_FF) << 13)) | 0;
	c = (((hi + (mid >>> 13)) | 0) + (w16 >>> 26)) | 0;
	w16 &= 0x3_FF_FF_FF;

	/* k = 17 */
	lo = Math.imul(al9, bl8);
	mid = Math.imul(al9, bh8);
	mid = (mid + Math.imul(ah9, bl8)) | 0;
	hi = Math.imul(ah9, bh8);
	lo = (lo + Math.imul(al8, bl9)) | 0;
	mid = (mid + Math.imul(al8, bh9)) | 0;
	mid = (mid + Math.imul(ah8, bl9)) | 0;
	hi = (hi + Math.imul(ah8, bh9)) | 0;

	let w17 = (((c + lo) | 0) + ((mid & 0x1F_FF) << 13)) | 0;
	c = (((hi + (mid >>> 13)) | 0) + (w17 >>> 26)) | 0;
	w17 &= 0x3_FF_FF_FF;

	/* k = 18 */
	lo = Math.imul(al9, bl9);
	mid = Math.imul(al9, bh9);
	mid = (mid + Math.imul(ah9, bl9)) | 0;
	hi = Math.imul(ah9, bh9);

	let w18 = (((c + lo) | 0) + ((mid & 0x1F_FF) << 13)) | 0;
	c = (((hi + (mid >>> 13)) | 0) + (w18 >>> 26)) | 0;
	w18 &= 0x3_FF_FF_FF;

	o[0] = w0;
	o[1] = w1;
	o[2] = w2;
	o[3] = w3;
	o[4] = w4;
	o[5] = w5;
	o[6] = w6;
	o[7] = w7;
	o[8] = w8;
	o[9] = w9;
	o[10] = w10;
	o[11] = w11;
	o[12] = w12;
	o[13] = w13;
	o[14] = w14;
	o[15] = w15;
	o[16] = w16;
	o[17] = w17;
	o[18] = w18;

	if (c !== 0) {
		o[19] = c;
		out.length += 1;
	}

	// Note: we shouldn't need to strip here.
	return out;
}

// Polyfill comb.
if (!Math.imul) {comb10MulTo = smallMulTo;}

/*
 * Expose
 */

BN.Red = Red;

export { BN };
