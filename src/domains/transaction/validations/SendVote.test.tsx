import { Contracts, ReadOnlyWallet } from "@/app/lib/profiles";

import { sendVote } from "./SendVote";
import { env, getDefaultProfileId, t } from "@/utils/testing-library";
import { data as validatorData } from "@/tests/fixtures/coins/mainsail/devnet/validators.json";

let profile: Contracts.IProfile;
let network: any;

const votes = [
	{
		amount: 10,
		wallet: new ReadOnlyWallet(
			{
				address: validatorData[0].address,
				explorerLink: "",
				publicKey: validatorData[0].publicKey,
				rank: 1,
				username: "arkx",
			},
			profile,
		),
	},
];

const votesWithoutUsername = [
	{
		amount: 10,
		wallet: new ReadOnlyWallet(
			{
				address: validatorData[0].address,
				explorerLink: "",
				publicKey: validatorData[0].publicKey,
				rank: 1,
			},
			profile,
		),
	},
];

describe("Send Vote Validation", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();

		network = env.profiles().first().wallets().first().network();
	});

	describe("Network", () => {
		it("should return required validation", () => {
			const { required } = sendVote(t).network();
			expect(required).toBe(t("COMMON.VALIDATION.FIELD_REQUIRED", { field: t("COMMON.NETWORK") }));
		});
	});

	describe("Sender Address", () => {
		it("should pass if there are no votes", () => {
			const { validate } = sendVote(t).senderAddress({ network, profile, votes: [] });
			expect(validate("any-address")).toBe(true);
		});

		it("should fail if sender address is missing", () => {
			const { validate } = sendVote(t).senderAddress({ network, profile, votes });
			expect(validate("")).toBe(t("COMMON.VALIDATION.FIELD_REQUIRED", { field: t("COMMON.SENDER_ADDRESS") }));
		});

		it("should pass if wallet is not found", () => {
			const { validate } = sendVote(t).senderAddress({ network, profile, votes });
			expect(validate("unknown-address")).toBe(true);
		});

		it("should fail if already voting for validator", () => {
			const wallet = profile.wallets().first();
			vi.spyOn(wallet.voting(), "current").mockReturnValue(votes);

			const { validate } = sendVote(t).senderAddress({ network, profile, votes });
			expect(validate(wallet.address())).toBe(
				t("TRANSACTION.VALIDATION.ALREADY_VOTING", {
					validator: "arkx",
					wallet: wallet.displayName(),
				}),
			);

			vi.restoreAllMocks();
		});

		it("should fail if already voting for validator without username", () => {
			const wallet = profile.wallets().first();
			vi.spyOn(wallet.voting(), "current").mockReturnValue(votesWithoutUsername);

			const { validate } = sendVote(t).senderAddress({ network, profile, votes: votesWithoutUsername });
			expect(validate(wallet.address())).toBe(
				t("TRANSACTION.VALIDATION.ALREADY_VOTING", {
					validator: validatorData[0].address,
					wallet: wallet.displayName(),
				}),
			);

			vi.restoreAllMocks();
		});

		it("should pass if not already voting for validator", () => {
			const wallet = profile.wallets().first();
			const { validate } = sendVote(t).senderAddress({ network, profile, votes });
			expect(validate(wallet.address())).toBe(true);
		});
	});
});
