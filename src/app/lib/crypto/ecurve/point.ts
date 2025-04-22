// Based on https://github.com/cryptocoinjs/ecurve/blob/master/lib/point.js

import assert from "assert";
import { Buffer } from "buffer";
import BigInteger from "bigi";

const THREE = BigInteger.valueOf(3);

export class Point {
	private curve;
	private x;
	private y;
	private z;
	private _zInv;
	private compressed;

	public constructor(curve, x, y, z) {
		assert.notStrictEqual(z, undefined, "Missing Z coordinate");

		this.curve = curve;
		this.x = x;
		this.y = y;
		this.z = z;
		this._zInv = null;

		this.compressed = true;
	}

	public zInv() {
		if (this._zInv === null) {
			this._zInv = this.z.modInverse(this.curve.p);
		}

		return this._zInv;
	}

	public affineX() {
		return this.x.multiply(this.zInv()).mod(this.curve.p);
	}

	public affineY() {
		return this.y.multiply(this.zInv()).mod(this.curve.p);
	}

	public static fromAffine(curve, x, y) {
		return new Point(curve, x, y, BigInteger.ONE);
	}

	public equals(other) {
		if (other === this) {
			return true;
		}
		if (this.curve.isInfinity(this)) {
			return this.curve.isInfinity(other);
		}
		if (this.curve.isInfinity(other)) {
			return this.curve.isInfinity(this);
		}

		// u = Y2 * Z1 - Y1 * Z2
		const u = other.y.multiply(this.z).subtract(this.y.multiply(other.z)).mod(this.curve.p);

		if (u.signum() !== 0) {
			return false;
		}

		// v = X2 * Z1 - X1 * Z2
		const v = other.x.multiply(this.z).subtract(this.x.multiply(other.z)).mod(this.curve.p);

		return v.signum() === 0;
	}

	public negate() {
		const y = this.curve.p.subtract(this.y);

		return new Point(this.curve, this.x, y, this.z);
	}

	public add(b) {
		if (this.curve.isInfinity(this)) {
			return b;
		}
		if (this.curve.isInfinity(b)) {
			return this;
		}

		const x1 = this.x;
		const y1 = this.y;
		const x2 = b.x;
		const y2 = b.y;

		// u = Y2 * Z1 - Y1 * Z2
		const u = y2.multiply(this.z).subtract(y1.multiply(b.z)).mod(this.curve.p);
		// v = X2 * Z1 - X1 * Z2
		const v = x2.multiply(this.z).subtract(x1.multiply(b.z)).mod(this.curve.p);

		if (v.signum() === 0) {
			if (u.signum() === 0) {
				return this.twice(); // this == b, so double
			}

			return this.curve.infinity; // this = -b, so infinity
		}

		const v2 = v.square();
		const v3 = v2.multiply(v);
		const x1v2 = x1.multiply(v2);
		const zu2 = u.square().multiply(this.z);

		// x3 = v * (z2 * (z1 * u^2 - 2 * x1 * v^2) - v^3)
		const x3 = zu2.subtract(x1v2.shiftLeft(1)).multiply(b.z).subtract(v3).multiply(v).mod(this.curve.p);
		// y3 = z2 * (3 * x1 * u * v^2 - y1 * v^3 - z1 * u^3) + u * v^3
		const y3 = x1v2
			.multiply(THREE)
			.multiply(u)
			.subtract(y1.multiply(v3))
			.subtract(zu2.multiply(u))
			.multiply(b.z)
			.add(u.multiply(v3))
			.mod(this.curve.p);
		// z3 = v^3 * z1 * z2
		const z3 = v3.multiply(this.z).multiply(b.z).mod(this.curve.p);

		return new Point(this.curve, x3, y3, z3);
	}

	public twice() {
		if (this.curve.isInfinity(this)) {
			return this;
		}
		if (this.y.signum() === 0) {
			return this.curve.infinity;
		}

		const x1 = this.x;
		const y1 = this.y;

		const y1z1 = y1.multiply(this.z).mod(this.curve.p);
		const y1sqz1 = y1z1.multiply(y1).mod(this.curve.p);
		const a = this.curve.a;

		// w = 3 * x1^2 + a * z1^2
		let w = x1.square().multiply(THREE);

		if (a.signum() !== 0) {
			w = w.add(this.z.square().multiply(a));
		}

		w = w.mod(this.curve.p);
		// x3 = 2 * y1 * z1 * (w^2 - 8 * x1 * y1^2 * z1)
		const x3 = w.square().subtract(x1.shiftLeft(3).multiply(y1sqz1)).shiftLeft(1).multiply(y1z1).mod(this.curve.p);
		// y3 = 4 * y1^2 * z1 * (3 * w * x1 - 2 * y1^2 * z1) - w^3
		const y3 = w
			.multiply(THREE)
			.multiply(x1)
			.subtract(y1sqz1.shiftLeft(1))
			.shiftLeft(2)
			.multiply(y1sqz1)
			.subtract(w.pow(3))
			.mod(this.curve.p);
		// z3 = 8 * (y1 * z1)^3
		const z3 = y1z1.pow(3).shiftLeft(3).mod(this.curve.p);

		return new Point(this.curve, x3, y3, z3);
	}

	// Simple NAF (Non-Adjacent Form) multiplication algorithm
	public multiply(k) {
		if (this.curve.isInfinity(this)) {
			return this;
		}
		if (k.signum() === 0) {
			return this.curve.infinity;
		}

		const e = k;
		const h = e.multiply(THREE);

		const neg = this.negate();
		// eslint-disable-next-line @typescript-eslint/no-this-alias,unicorn/no-this-assignment
		let R = this;

		for (let index = h.bitLength() - 2; index > 0; --index) {
			const hBit = h.testBit(index);
			const eBit = e.testBit(index);

			R = R.twice();

			if (hBit !== eBit) {
				R = R.add(hBit ? this : neg);
			}
		}

		return R;
	}

	public getEncoded(compressed) {
		if (compressed == undefined) {
			compressed = this.compressed;
		}
		if (this.curve.isInfinity(this)) {
			return Buffer.alloc(1, 0);
		} // Infinity point encoded is simply '00'

		const x = this.affineX();
		const y = this.affineY();
		const byteLength = this.curve.pLength;
		let buffer;

		// 0x02/0x03 | X
		if (compressed) {
			buffer = Buffer.allocUnsafe(1 + byteLength);
			buffer.writeUInt8(y.isEven() ? 0x02 : 0x03, 0);

			// 0x04 | X | Y
		} else {
			buffer = Buffer.allocUnsafe(1 + byteLength + byteLength);
			buffer.writeUInt8(0x04, 0);

			y.toBuffer(byteLength).copy(buffer, 1 + byteLength);
		}

		x.toBuffer(byteLength).copy(buffer, 1);

		return buffer;
	}
}
