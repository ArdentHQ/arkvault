import { MAINSAIL_MNEMONICS } from "@/utils/testing-library";
import { Contracts } from "@/app/lib/profiles";
import { minVersionList } from "@/app/contexts";
import { WalletData } from "@/app/lib/mainsail/wallet.dto";
import { BigNumber } from "@/app/lib/helpers";

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

export const createTransactionMocks = async (wallet: Contracts.IReadWriteWallet) => {
	const signatory = await wallet.signatoryFactory().fromSigningKeys({ key: MAINSAIL_MNEMONICS[0] });
	const hash = await wallet.transaction().signTransfer({
		data: {
			amount: 1,
			to: wallet.profile().wallets().last().address(),
		},
		gasLimit: BigNumber.make(1),
		gasPrice: BigNumber.make(1),
		nonce: BigNumber.make(1).toString(),
		signatory,
	});

	const signatorySpy = vi.spyOn(wallet.signatoryFactory(), "fromSigningKeys").mockResolvedValue(signatory);
	const signSpy = vi.spyOn(wallet.transaction(), "signTransfer").mockResolvedValue(hash);
	const broadcastSpy = vi
		.spyOn(wallet.transaction(), "broadcast")
		.mockResolvedValue({ accepted: [hash], errors: [] });

	return {
		restoreAll: () => {
			signatorySpy.mockRestore();
			signSpy.mockRestore();
			broadcastSpy.mockRestore();
		},
	};
};
