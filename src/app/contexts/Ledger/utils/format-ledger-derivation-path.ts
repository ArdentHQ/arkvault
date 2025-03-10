import { LedgerDerivationScheme } from "@/app/contexts/Ledger/Ledger.contracts";

export const formatLedgerDerivationPath = (scheme: LedgerDerivationScheme) =>
	`m/${scheme.purpose || 44}'/${scheme.coinType}'/${scheme.account || 0}'/${scheme.change || 0}/${
		scheme.address || 0
	}`;
