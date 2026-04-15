import { Contracts } from "@/app/lib/profiles";
import { confirmSendVote } from "./SendVoteSidePanel.blocks";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

describe("confirmSendVote", () => {
	let mockWallet: Partial<Contracts.IReadWriteWallet>;
	let mockVotes: Contracts.VoteRegistryItem[];
	let mockUnvotes: Contracts.VoteRegistryItem[];
	let mockSynchroniser: { votes: vi.Mock };
	let mockVoting: { current: vi.Mock };

	beforeEach(() => {
		mockSynchroniser = {
			votes: vi.fn().mockResolvedValue(undefined),
		};

		mockVoting = {
			current: vi.fn().mockReturnValue([]),
		};

		mockWallet = {
			synchroniser: () => mockSynchroniser,
			voting: () => mockVoting,
		} as unknown as Partial<Contracts.IReadWriteWallet>;

		mockVotes = [
			{
				amount: BigInt(10),
				wallet: {
					address: () => "0x1",
				},
			},
		] as Contracts.VoteRegistryItem[];

		mockUnvotes = [
			{
				amount: BigInt(10),
				wallet: {
					address: () => "0x2",
				},
			},
		] as Contracts.VoteRegistryItem[];
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should resolve when vote is confirmed", async () => {
		mockVoting.current.mockReturnValue([{ wallet: { address: () => "0x1" } }]);

		vi.useFakeTimers();

		const promise = confirmSendVote(mockWallet as Contracts.IReadWriteWallet, "vote", mockVotes, mockUnvotes);

		vi.advanceTimersByTime(1000);

		await expect(promise).resolves.toBe("");
	});

	it("should resolve when unvote is confirmed", async () => {
		mockVoting.current.mockReturnValue([]);

		vi.useFakeTimers();

		const promise = confirmSendVote(mockWallet as Contracts.IReadWriteWallet, "unvote", mockVotes, mockUnvotes);

		vi.advanceTimersByTime(1000);

		await expect(promise).resolves.toBe("");
	});

	it("should resolve when combined vote and unvote are confirmed", async () => {
		mockVoting.current.mockReturnValue([{ wallet: { address: () => "0x1" } }]);

		vi.useFakeTimers();

		const promise = confirmSendVote(mockWallet as Contracts.IReadWriteWallet, "combined", mockVotes, mockUnvotes);

		vi.advanceTimersByTime(1000);

		await expect(promise).resolves.toBe("");
	});

	it("should poll until vote is confirmed", async () => {
		let callCount = 0;
		mockVoting.current.mockImplementation(() => {
			callCount++;
			if (callCount >= 3) {
				return [{ wallet: { address: () => "0x1" } }];
			}
			return [];
		});

		vi.useFakeTimers();

		const promise = confirmSendVote(mockWallet as Contracts.IReadWriteWallet, "vote", mockVotes, mockUnvotes);

		vi.advanceTimersByTime(1000);
		vi.advanceTimersByTime(1000);
		vi.advanceTimersByTime(1000);

		await expect(promise).resolves.toBe("");

		expect(mockSynchroniser.votes).toHaveBeenCalledTimes(3);
	});
});
