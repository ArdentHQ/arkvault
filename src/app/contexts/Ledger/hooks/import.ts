import { Coins } from "@payvo/sdk";
import { Contracts, Environment } from "@payvo/sdk-profiles";
import { useCallback } from "react";
import { LedgerDevice } from "./connection.state";
import { LedgerData } from "@/app/contexts/Ledger/Ledger.contracts";
import { getDefaultAlias } from "@/domains/wallet/utils/get-default-alias";

interface LedgerWalletImportProperties {
	device?: LedgerDevice;
	env: Environment;
}

export const useLedgerImport = ({ device, env }: LedgerWalletImportProperties) => {
	const importLedgerWallets = useCallback(
		async (wallets: LedgerData[], coin: Coins.Coin, profile: Contracts.IProfile) => {
			for (const { address, path } of wallets) {
				const wallet = await profile.walletFactory().fromAddressWithDerivationPath({
					address,
					coin: coin.network().coin(),
					network: coin.network().id(),
					path,
				});

				profile.wallets().push(wallet);

				wallet.mutator().alias(
					getDefaultAlias({
						network: wallet.network(),
						profile,
					}),
				);

				wallet.data().set(Contracts.WalletData.LedgerModel, device?.id);
			}
			await env.persist();
		},
		[env, device],
	);

	return { importLedgerWallets };
};
