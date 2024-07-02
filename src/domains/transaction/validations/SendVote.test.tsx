/* eslint-disable @typescript-eslint/require-await */
import { Contracts, ReadOnlyWallet } from "@ardenthq/sdk-profiles";

import { sendVote } from "./SendVote";
import { env, getDefaultProfileId } from "@/utils/testing-library";
import { data as delegateData } from "@/tests/fixtures/coins/ark/devnet/delegates.json";

let profile: Contracts.IProfile;
let translationMock: any;
let network: any;

const votes = [
	{
		amount: 10,
		wallet: new ReadOnlyWallet({
			address: delegateData[0].address,
			explorerLink: "",
			publicKey: delegateData[0].publicKey,
			rank: 1,
			username: "arkx",
		}),
	},
];

describe("Send Vote Validation", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();

		translationMock = vi.fn((index18nString: string) => index18nString);
		network = env.profiles().first().wallets().first().network();
	});

	it("senderAddress", async () => {
		const validator = sendVote(translationMock).senderAddress({ network, profile, votes });

		expect(validator.validate("address")).toBe(true);

		expect(validator.validate()).not.toBe(true);

		expect(validator.validate("1")).toBe(true);

		const mockWalletVotingDelegate = vi.spyOn(profile.wallets().first().voting(), "current").mockReturnValue(votes);

		expect(validator.validate(profile.wallets().first().address())).toBe("TRANSACTION.VALIDATION.ALREADY_VOTING");

		const mockNoUsername = vi.spyOn(votes[0].wallet, "username").mockReturnValue(undefined);

		expect(validator.validate(profile.wallets().first().address())).toBe("TRANSACTION.VALIDATION.ALREADY_VOTING");

		mockWalletVotingDelegate.mockRestore();
		mockNoUsername.mockRestore();

		expect(validator.validate(profile.wallets().first().address())).toBe(true);

		const validatorNoVotes = sendVote(translationMock).senderAddress({ network, profile, votes: [] });

		expect(validatorNoVotes.validate("address")).toBe(true);
	});

	it("network", () => {
		const emptyMemo = sendVote(translationMock).network();

		expect(emptyMemo.required).toBe("COMMON.VALIDATION.FIELD_REQUIRED");
	});
});
