import { describe, vi, expect, beforeEach, it, afterEach } from "vitest";
import { BigNumber } from "@/app/lib/helpers";
import { IProfile } from "./contracts.js";
import { WalletAggregate } from "./wallet.aggregate";
import { env } from "@/utils/testing-library";

let profile: IProfile;
let subject: WalletAggregate;

const liveWallet1 = {
	balance: () => BigNumber.make(10),
	convertedBalance: () => BigNumber.make(100),
	network: () => ({ isLive: () => true }),
};

const liveWallet2 = {
	balance: () => BigNumber.make(5),
	convertedBalance: () => BigNumber.make(50),
	network: () => ({ isLive: () => true }),
};

const testWallet1 = {
	balance: () => BigNumber.make(20),
	convertedBalance: () => BigNumber.make(200),
	network: () => ({ isLive: () => false }),
};

const wallets = [liveWallet1, liveWallet2, testWallet1];

describe("WalletAggregate", () => {
	beforeEach(async () => {
		profile = await env.profiles().create("test profile");

		vi.spyOn(profile.wallets(), "values").mockReturnValue(wallets as any);

		subject = new WalletAggregate(profile);
	});

	afterEach(() => {
		env.profiles().forget(profile.id());
	});

	describe("balance", () => {
		it("should return the total balance for live networks by default", () => {
			expect(subject.balance()).toBe(15);
		});

		it("should return the total balance for test networks when specified", () => {
			expect(subject.balance("test")).toBe(20);
		});

		it("should return 0 if there are no wallets", () => {
			vi.spyOn(profile.wallets(), "values").mockReturnValue([]);
			const subject = new WalletAggregate(profile);

			expect(subject.balance("live")).toBe(0);
		});
	});

	describe("balancesByNetworkType", () => {
		it("should return balances aggregated by network type", () => {
			const result = subject.balancesByNetworkType();

			expect(result.live.toNumber()).toBe(15);
			expect(result.test.toNumber()).toBe(20);
		});
	});

	describe("convertedBalance", () => {
		it("should return the total converted balance for all wallets", () => {
			expect(subject.convertedBalance()).toBe(350);
		});

		it("should return 0 if there are no wallets", () => {
			vi.spyOn(profile.wallets(), "values").mockReturnValue([]);
			const subject = new WalletAggregate(profile);

			expect(subject.convertedBalance()).toBe(0);
		});
	});
});
