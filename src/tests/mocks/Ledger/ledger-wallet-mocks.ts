import { Contracts } from "@/app/lib/profiles";
import { minVersionList } from "@/app/contexts";
import { WalletData } from "@/app/lib/mainsail/wallet.dto";

export const createLedgerMocks = (wallet: Contracts.IReadWriteWallet, publicKeyPaths: Map<string, string>) => {
	const isEthBasedAppSpy = vi.spyOn(wallet.ledger(), "isEthBasedApp").mockResolvedValue(true);
	const versionSpy = vi
		.spyOn(wallet.ledger(), "getVersion")
		.mockResolvedValue(minVersionList[wallet.network().coin()]);
	const publicKeySpy = vi
		.spyOn(wallet.ledger(), "getPublicKey")
		.mockResolvedValue(publicKeyPaths.values().next().value!);
	const scanSpy = vi.spyOn(wallet.ledger(), "scan").mockResolvedValue({
		"m/44'/1'/1'/0/0": new WalletData({ config: wallet.network().config() }).fill({
			address: wallet.address(),
			balance: 10,
			publicKey: wallet.publicKey(),
		}),
	});

	const extendedPublicKeySpy = vi
		.spyOn(wallet.ledger(), "getExtendedPublicKey")
		.mockResolvedValue(wallet.publicKey()!);

	return {
		restoreAll: () => {
			isEthBasedAppSpy.mockRestore();
			versionSpy.mockRestore();
			publicKeySpy.mockRestore();
			scanSpy.mockRestore();
			extendedPublicKeySpy.mockRestore();
		},
	};
};
