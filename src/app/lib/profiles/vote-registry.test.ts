import { describe } from "vitest";
import { AttributeBag } from "./helpers/attribute-bag";
import { IReadWriteWalletAttributes } from "./wallet.contract";
import { VoteRegistry } from "./vote-registry";
import { test } from "@/utils/testing-library";

describe("VoteRegistry", () => {
	let mockAttributes: AttributeBag<IReadWriteWalletAttributes>;
	const VOTES = "VOTES";

	beforeEach(() => {
		mockAttributes = new AttributeBag({});
	});

	describe("current", () => {
		test("should throw an error if WalletData.Votes is undefined", ({ defaultWallet }) => {
			const voteRegistry = new VoteRegistry(defaultWallet, mockAttributes);
			vi.spyOn(defaultWallet.data(), "get").mockReturnValue(undefined);

			expect(() => voteRegistry.current()).toThrow(
				"The voting data has not been synced. Please call [synchroniser().votes()] before accessing votes.",
			);
		});

		test("should return voting address from wallet attributes", async ({ defaultWallet }) => {
			const voteRegistry = new VoteRegistry(
				defaultWallet,
				new AttributeBag({
					wallet: {
						data: {
							attributes: {
								vote: "0x659A76be283644AEc2003aa8ba26485047fd1BFB",
							},
						},
					},
				}),
			);

			vi.spyOn(defaultWallet.data(), "get").mockImplementation((key) => {
				if (key === VOTES) {
					return [{ amount: 100, id: "validator1" }];
				}

				return;
			});

			vi.spyOn(defaultWallet.validators(), "mapByIdentifier").mockReturnValue(undefined);

			expect(voteRegistry.current()[0].wallet?.address()).toBe("0x659A76be283644AEc2003aa8ba26485047fd1BFB");
		});

		test("should return current votes with undefined wallet if validator and voting address are not found", ({
			defaultWallet,
		}) => {
			let voteRegistry = new VoteRegistry(defaultWallet, mockAttributes);
			const mockVotes = [{ amount: 0, id: "trulyUnknown" }];

			vi.spyOn(defaultWallet.data(), "get").mockImplementation((key) => {
				if (key === VOTES) {
					return mockVotes;
				}
				return;
			});

			vi.spyOn(defaultWallet.validators(), "mapByIdentifier").mockReturnValue(undefined);

			mockAttributes = new AttributeBag({});
			voteRegistry = new VoteRegistry(defaultWallet, mockAttributes);

			const result = voteRegistry.current();
			expect(result).toEqual([{ amount: 0, wallet: undefined }]);
		});
	});

	describe("used", () => {
		test("should throw an error if WalletData.VotesUsed is undefined", ({ defaultWallet }) => {
			const voteRegistry = new VoteRegistry(defaultWallet, mockAttributes);
			vi.spyOn(defaultWallet.data(), "get").mockReturnValue(undefined);

			expect(() => voteRegistry.used()).toThrow(
				"The voting data has not been synced. Please call [synchroniser().votes()] before accessing votes.",
			);
		});
	});
});
