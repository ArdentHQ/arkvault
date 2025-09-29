import { describe, it, expect, vi, afterEach } from "vitest";
import { sortWallets, isLedgerWalletCompatible } from "./wallet-utils";
import { WalletSetting } from "@/app/lib/profiles/wallet.enum";
import * as LedgerTransport from "@/app/contexts/Ledger/transport";

const createWallet = (config: {
	alias?: string;
	coinName: string;
	isCustom?: boolean;
	isStarred?: boolean;
	isTest?: boolean;
	id: string;
	isLedger?: boolean;
}): any => {
	const { alias = "", coinName, isCustom = false, isStarred = false, isTest = false, id, isLedger = false } = config;

	return {
		id: () => id,
		isLedger: () => isLedger,
		isStarred: () => isStarred,
		network: () => ({
			coinName: () => coinName,
			id: () => (isCustom ? `${coinName.toLowerCase()}.custom` : `${coinName.toLowerCase()}.mainnet`),
			isTest: () => isTest,
		}),
		settings: () => ({
			get: (key: string) => (key === WalletSetting.Alias ? alias : undefined),
		}),
	} as any;
};

afterEach(() => {
	vi.restoreAllMocks();
});

describe("wallet-utils", () => {
	it("sortWallets orders by: non-custom first, coin, mainnet before testnet, starred first, alias asc", () => {
		const w1 = createWallet({ alias: "B", coinName: "ARK", id: "w1", isStarred: false, isTest: false });
		const w2 = createWallet({ alias: "A", coinName: "ARK", id: "w2", isStarred: true, isTest: false });
		const w3 = createWallet({ alias: "A", coinName: "BTC", id: "w3", isStarred: false, isTest: false });
		const w4 = createWallet({
			alias: "Z",
			coinName: "ARK",
			id: "w4",
			isCustom: true,
			isStarred: true,
			isTest: true,
		});
		const w5 = createWallet({ alias: "C", coinName: "ARK", id: "w5", isStarred: false, isTest: true });

		const input = [w1, w2, w3, w4, w5];
		const result = sortWallets([...input]);

		expect(result.map((w: any) => w.id())).toEqual(["w2", "w1", "w5", "w3", "w4"]);
	});

	it("sortWallets uses alias as a tiebreaker when other fields equal", () => {
		const a1 = createWallet({ alias: "Alpha", coinName: "ARK", id: "a1", isStarred: false, isTest: false });
		const a2 = createWallet({ alias: "Beta", coinName: "ARK", id: "a2", isStarred: false, isTest: false });

		const result = sortWallets([a2, a1]);
		expect(result.map((w: any) => w.id())).toEqual(["a1", "a2"]);
	});

	it("isLedgerWalletCompatible returns true for non-ledger wallets", () => {
		const wallet = createWallet({ coinName: "ARK", id: "x", isLedger: false });
		expect(isLedgerWalletCompatible(wallet)).toBe(true);
	});

	it("isLedgerWalletCompatible defers to isLedgerTransportSupported for ledger wallets", () => {
		const wallet = createWallet({ coinName: "ARK", id: "x", isLedger: true });
		const spy = vi.spyOn(LedgerTransport, "isLedgerTransportSupported");

		spy.mockReturnValueOnce(true);
		expect(isLedgerWalletCompatible(wallet)).toBe(true);

		spy.mockReturnValueOnce(false);
		expect(isLedgerWalletCompatible(wallet)).toBe(false);
	});
});
