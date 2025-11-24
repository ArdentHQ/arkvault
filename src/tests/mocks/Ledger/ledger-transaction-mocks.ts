import { MAINSAIL_MNEMONICS } from "@/utils/testing-library";
import { Contracts } from "@/app/lib/profiles";
import { BigNumber } from "@/app/lib/helpers";

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
