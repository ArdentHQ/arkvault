import { Contracts } from "@/app/lib/profiles";
import { isCustomNetwork } from "@/utils/network-utils";
import { isLedgerTransportSupported } from "@/app/contexts/Ledger/transport";
import { WalletSetting } from "@/app/lib/profiles/wallet.enum";

export const sortWallets = (wallets: Contracts.IReadWriteWallet[]) =>
	wallets.sort(
		(a, b) =>
			Number(isCustomNetwork(a.network())) - Number(isCustomNetwork(b.network())) ||
			a.network().coinName().localeCompare(b.network().coinName()) ||
			Number(a.network().isTest()) - Number(b.network().isTest()) ||
			Number(b.isStarred()) - Number(a.isStarred()) ||
			((a.settings().get(WalletSetting.Alias) as string | undefined) ?? "").localeCompare(
				b.settings().get(WalletSetting.Alias) ?? "",
			),
	);

export const isLedgerWalletCompatible = (wallet: Contracts.IReadWriteWallet) => {
	if (!wallet.isLedger()) {
		return true;
	}

	return isLedgerTransportSupported();
};
