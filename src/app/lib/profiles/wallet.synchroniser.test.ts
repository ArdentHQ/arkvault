import { beforeEach, describe, expect, it, vi } from "vitest";
import { BigNumber } from "@/app/lib/helpers/bignumber";
import { IProfile, IReadWriteWallet } from "./contracts";
import { ReadOnlyWallet, ROWallet } from "./read-only-wallet";
import { WalletSynchroniser } from "./wallet.synchroniser";
import { env, getDefaultProfileId } from "@/utils/testing-library";

let profile: IProfile;
let wallet: IReadWriteWallet;
let subject: WalletSynchroniser;

const mockVoteData: ROWallet = {
	address: "0x659A76be283644AEc2003aa8ba26485047fd1BFB",
	explorerLink: "https://dwallets-evm.mainsailhq.com/wallet/0x659A76be283644AEc2003aa8ba26485047fd1BFB",
	governanceIdentifier: "publicKey",
	isLegacyValidator: false,
	isResignedValidator: false,
	isValidator: true,
	publicKey: "02f65cbd5dfe4979b559e00c089058fa7379554ba6d2558520f2036d8854f1c9a2",
	rank: 1,
	username: "test_user",
};

beforeEach(() => {
	vi.clearAllMocks();
	profile = env.profiles().findById(getDefaultProfileId());
	wallet = profile.wallets().first();
	subject = new WalletSynchroniser(wallet);
});

describe("WalletSynchroniser", () => {
	describe("identity", () => {
		it("should sync the wallet's identity", async () => {
			await env.wallets().syncByProfile(profile);

			const clientSpy = vi.spyOn(wallet, "client");

			vi.spyOn(wallet.network(), "usesExtendedPublicKey").mockReturnValue(false);

			await subject.identity();

			expect(clientSpy).toHaveBeenCalled();
		});

		it("should sync the wallet's identity with extended public key", async () => {
			const clientSpy = vi.spyOn(wallet, "client");

			vi.spyOn(wallet.network(), "usesExtendedPublicKey").mockReturnValue(true);

			await subject.identity();

			expect(clientSpy).toHaveBeenCalled();
		});

		it("should not sync the wallet's identity if it throws", async () => {
			const walletMock = vi.fn().mockRejectedValue(new Error("Oops"));

			vi.spyOn(wallet, "client").mockReturnValue({
				wallet: walletMock,
			} as any);

			await subject.identity();

			expect(walletMock).toHaveBeenCalled();
		});
	});

	describe("votes", () => {
		it("should sync the wallet's votes", async () => {
			const votesMock = vi.fn().mockResolvedValue({
				available: BigNumber.make(10),
				used: BigNumber.make(20),
				votes: [new ReadOnlyWallet(mockVoteData, profile)],
			});

			vi.spyOn(wallet, "client").mockReturnValue({
				votes: votesMock,
			} as any);

			await subject.votes();

			expect(votesMock).toHaveBeenCalledWith(wallet.address());
		});
	});
});
