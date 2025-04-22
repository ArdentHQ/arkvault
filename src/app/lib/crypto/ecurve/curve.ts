// Based on https://github.com/cryptocoinjs/ecurve/blob/master/lib/curve.js
import BigInteger from "bigi";

import { Point } from "./point.js";

export class Curve {
	public p: BigInteger;
	public a: BigInteger;
	public b: BigInteger;
	public G: Point;
	public n: BigInteger;
	public h: BigInteger;
	public infinity: Point;
	public pOverFour: BigInteger;
	public pLength: number;

	public constructor(p, a, b, Gx, Gy, n, h) {
		this.p = p;
		this.a = a;
		this.b = b;
		this.G = Point.fromAffine(this, Gx, Gy);
		this.n = n;
		this.h = h;

		this.infinity = new Point(this, undefined, undefined, BigInteger.ZERO);

		// result caching
		this.pOverFour = p.add(BigInteger.ONE).shiftRight(2);

		// determine size of p in bytes
		this.pLength = Math.floor((this.p.bitLength() + 7) / 8);
	}

	public isInfinity(Q) {
		if (Q === this.infinity) {
			return true;
		}

		return Q.z.signum() === 0 && Q.y.signum() !== 0;
	}
}
