/* eslint-disable import/no-namespace */

import * as networks from "./networks/index";

export type NetworkType = typeof networks.mainnet.network | typeof networks.devnet.network;

export type NetworkName = keyof typeof networks;
