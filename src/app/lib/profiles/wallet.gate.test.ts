import { describe, vi, expect, beforeEach, it, afterEach } from "vitest";
import { IProfile, IReadWriteWallet, IWalletGate } from "./contracts.js";
import { env, MAINSAIL_MNEMONICS } from "@/utils/testing-library";

let profile: IProfile;
let wallet: IReadWriteWallet;
let subject: IWalletGate;

describe("WalletGate", () => {
	beforeEach(async () => {
		profile = await env.profiles().create("test profile");
		wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			mnemonic: MAINSAIL_MNEMONICS[0],
		});
		subject = wallet.gate();
	});

	afterEach(() => {
		env.profiles().forget(profile.id());
	});

	describe("allows", () => {
		it("should allow a feature", () => {
			const allowsSpy = vi.spyOn(wallet, "network").mockImplementation(() => ({
				allows: () => true,
			}));
			expect(subject.allows("feature.a")).toBe(true);
			allowsSpy.mockRestore();
		});

		it("should not allow a feature", () => {
			const allowsSpy = vi.spyOn(wallet, "network").mockImplementation(() => ({
				allows: () => false,
			}));
			expect(subject.allows("feature.a")).toBe(false);
			allowsSpy.mockRestore();
		});
	});

	describe("denies", () => {
		it("should deny a feature", () => {
			const deniesSpy = vi.spyOn(wallet, "network").mockImplementation(() => ({
				denies: () => true,
			}));
			expect(subject.denies("feature.a")).toBe(true);
			deniesSpy.mockRestore();
		});

		it("should not deny a feature", () => {
			const deniesSpy = vi.spyOn(wallet, "network").mockImplementation(() => ({
				denies: () => false,
			}));
			expect(subject.denies("feature.a")).toBe(false);
			deniesSpy.mockRestore();
		});
	});

	describe("any", () => {
		it("should be true if any feature is allowed", () => {
			const allowsSpy = vi.spyOn(wallet, "network").mockImplementation(() => ({
				allows: (feature: string) => feature === "feature.b",
			}));

			expect(subject.any(["feature.a", "feature.b"])).toBe(true);

			allowsSpy.mockRestore();
		});

		it("should be false if no feature is allowed", () => {
			const allowsSpy = vi.spyOn(wallet, "network").mockImplementation(() => ({
				allows: () => false,
			}));
			expect(subject.any(["feature.a", "feature.b"])).toBe(false);
			allowsSpy.mockRestore();
		});
	});

	describe("all", () => {
		it("should be true if all features are allowed", () => {
			const deniesSpy = vi.spyOn(wallet, "network").mockImplementation(() => ({
				denies: () => false,
			}));
			expect(subject.all(["feature.a", "feature.b"])).toBe(true);
			deniesSpy.mockRestore();
		});

		it("should be false if any feature is denied", () => {
			const deniesSpy = vi.spyOn(wallet, "network").mockImplementation(() => ({
				denies: (feature: string) => feature === "feature.b",
			}));

			expect(subject.all(["feature.a", "feature.b"])).toBe(false);

			deniesSpy.mockRestore();
		});
	});
});
