import { LedgerDerivationScheme } from "./ledger.service.types";

export const chunk = <T>(value: T[], size: number) =>
	Array.from({ length: Math.ceil(value.length / size) }, (v, index) =>
		value.slice(index * size, index * size + size),
	);

export const formatLedgerDerivationPath = (scheme: LedgerDerivationScheme) =>
	`m/${scheme.purpose || 44}'/${scheme.coinType}'/${scheme.account || 0}'/${scheme.change || 0}/${
		scheme.address || 0
	}`;

export const createRange = (start: number, size: number) =>
	Array.from({ length: size }, (_, index) => index + size * start);
