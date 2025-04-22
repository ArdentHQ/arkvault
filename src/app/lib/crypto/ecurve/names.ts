// Based on https://github.com/cryptocoinjs/ecurve/blob/master/lib/names.js

import BigInteger from "bigi";

import { Curve } from "./curve.js";

const p = new BigInteger("fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f", 16, undefined);
const a = new BigInteger("00", 16, undefined);
const b = new BigInteger("07", 16, undefined);
const n = new BigInteger("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", 16, undefined);
const h = new BigInteger("01", 16, undefined);
const Gx = new BigInteger("79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798", 16, undefined);
const Gy = new BigInteger("483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8", 16, undefined);

export const secp256k1 = new Curve(p, a, b, Gx, Gy, n, h);
