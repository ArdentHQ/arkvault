import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { IProfile, IReadWriteWallet, IWalletRepository, WalletData } from "./contracts";
import { env, MAINSAIL_MNEMONICS } from "@/utils/testing-library";
import * as queue from "./helpers/queue";
import { DataRepository } from "./data.repository";

let profile: IProfile;
let wallet: IReadWriteWallet;
let subject: IWalletRepository;

beforeEach(async () => {
	profile = await env.profiles().create("test profile");

	subject = profile.wallets();

	wallet = await profile.walletFactory().fromMnemonicWithBIP39({
		mnemonic: MAINSAIL_MNEMONICS[0],
	});

	subject.push(wallet);
});

afterEach(() => {
	env.profiles().forget(profile.id());
});

describe("WalletRepository", () => {
	it("should return all", () => {
		expect(subject.all()).toEqual({ [wallet.id()]: wallet });
	});

	it("should return values", () => {
		expect(subject.values()).toEqual([wallet]);
	});

	it("should return the first wallet", () => {
		expect(subject.first()).toEqual(wallet);
	});

	it("should return the last wallet", () => {
		expect(subject.last()).toEqual(wallet);
	});

	it("should return all keys", () => {
		expect(subject.keys()).toEqual([wallet.id()]);
	});

	it("should return all values", () => {
		expect(subject.values()).toEqual([wallet]);
	});

	it("should find a wallet by its id", () => {
		expect(subject.findById(wallet.id())).toEqual(wallet);
	});

	it("should throw if a wallet cannot be found by its id", () => {
		expect(() => subject.findById("invalid")).toThrow("Failed to find a wallet for [invalid].");
	});

	it("should find wallets by address", () => {
		expect(subject.filterByAddress(wallet.address())).toHaveLength(1);
	});

	it("should find a wallet by address and network", () => {
		expect(subject.findByAddressWithNetwork(wallet.address(), wallet.networkId())).toEqual(wallet);
	});

	it("should find a wallet by public key", () => {
		const publicKey = wallet.publicKey();
		if (publicKey) {
			expect(subject.findByPublicKey(publicKey)).toEqual(wallet);
		}
	});

	it("should find wallets by coin", () => {
		const coin = wallet.manifest().get<string>("name");
		if (coin) {
			expect(subject.findByCoin(coin)).toHaveLength(1);
		}
	});

	it("should find a wallet by alias", () => {
		wallet.mutator().alias("My Wallet");
		expect(subject.findByAlias("My Wallet")).toEqual(wallet);
	});

	it("should update a wallet's alias", () => {
		subject.update(wallet.id(), { alias: "New Alias" });
		expect(wallet.alias()).toBe("New Alias");
	});

	it("should throw when updating a wallet with an existing alias", async () => {
		const anotherWallet = await profile.walletFactory().fromMnemonicWithBIP39({
			mnemonic: MAINSAIL_MNEMONICS[2],
		});

		subject.push(anotherWallet);

		subject.update(anotherWallet.id(), { alias: "Another Alias" });

		expect(() => subject.update(wallet.id(), { alias: "Another Alias" })).toThrow(
			"The wallet with alias [Another Alias] already exists.",
		);
	});

	it("should throw when pushing a wallet with an existing alias", async () => {
		const anotherWallet = await profile.walletFactory().fromMnemonicWithBIP39({
			mnemonic: MAINSAIL_MNEMONICS[2],
		});

		vi.spyOn(anotherWallet, "alias").mockReturnValue(wallet.alias());

		subject.push(anotherWallet);

		expect(() => subject.push(anotherWallet)).toThrow(
			`The wallet [${anotherWallet.address()}] with network [mainsail.devnet] already exists.`,
		);
	});

	it("should check if a wallet exists", () => {
		expect(subject.has(wallet.id())).toBe(true);
		expect(subject.has("invalid")).toBe(false);
	});

	it("should forget a wallet", () => {
		subject.forget(wallet.id());
		expect(subject.has(wallet.id())).toBe(false);
	});

	it("should flush all wallets", () => {
		subject.flush();
		expect(subject.count()).toBe(0);
	});

	it("should return the wallet count", () => {
		expect(subject.count()).toBe(1);
	});

	it("should handle first on empty", () => {
		subject.flush();
		expect(subject.first()).toBeUndefined();
	});

	it("should exclude wallets on toObject", async () => {
		vi.spyOn(wallet, "balance").mockReturnValue(1000000000000000000);

		const ledgerWallet = await profile.walletFactory().fromMnemonicWithBIP39({
			mnemonic: MAINSAIL_MNEMONICS[2],
		});

		vi.spyOn(ledgerWallet, "isLedger").mockReturnValue(true);

		subject.push(ledgerWallet);

		const emptyWallet = await profile.walletFactory().fromMnemonicWithBIP39({
			mnemonic: MAINSAIL_MNEMONICS[3],
		});

		vi.spyOn(emptyWallet, "balance").mockReturnValue(0);

		subject.push(emptyWallet);

		const wallets = subject.toObject({
			addNetworkInformation: true,
			excludeEmptyWallets: true,
			excludeLedgerWallets: true,
		});

		expect(Object.keys(wallets)).toContain(wallet.id());
		expect(Object.keys(wallets)).not.toContain(ledgerWallet.id());
		expect(Object.keys(wallets)).not.toContain(emptyWallet.id());
	});

	it("should handle findByCoin without manifest", () => {
		const manifestSpy = vi.spyOn(wallet.manifest(), "get").mockReturnValue(undefined as any);
		expect(subject.findByCoin("ARK")).toHaveLength(0);
		manifestSpy.mockRestore();
	});

	it("should sort wallets by coin", async () => {
		const wallet2 = await profile.walletFactory().fromMnemonicWithBIP39({ mnemonic: MAINSAIL_MNEMONICS[1] });

		vi.spyOn(wallet, "currency").mockReturnValue("B");
		vi.spyOn(wallet2, "currency").mockReturnValue("A");

		subject.push(wallet2);

		const wallets = subject.sortBy("coin", "asc");
		expect(wallets[0].id()).toBe(wallet2.id());
		expect(wallets[1].id()).toBe(wallet.id());
	});

	it("should sort wallets by balance", async () => {
		const wallet2 = await profile.walletFactory().fromMnemonicWithBIP39({ mnemonic: MAINSAIL_MNEMONICS[1] });

		vi.spyOn(wallet, "balance").mockReturnValue(200);
		vi.spyOn(wallet2, "balance").mockReturnValue(100);

		subject.push(wallet2);

		const wallets = subject.sortBy("balance", "desc");
		expect(wallets[0].id()).toBe(wallet.id());
		expect(wallets[1].id()).toBe(wallet2.id());
	});

	it("should sort wallets by type", async () => {
		const wallet2 = await profile.walletFactory().fromMnemonicWithBIP39({ mnemonic: MAINSAIL_MNEMONICS[1] });

		wallet.toggleStarred();

		subject.push(wallet2); // wallet2 is not starred

		const wallets = subject.sortBy("type", "desc"); // starred first
		expect(wallets[0].id()).toBe(wallet.id());
		expect(wallets[1].id()).toBe(wallet2.id());
	});

	it("should convert wallets to object", () => {
		const wallets = subject.toObject({
			addNetworkInformation: true,
			excludeEmptyWallets: true,
			excludeLedgerWallets: true,
		});
		expect(wallets).toBeTypeOf("object");

		expect(() =>
			subject.toObject({
				addNetworkInformation: false,
				excludeEmptyWallets: true,
				excludeLedgerWallets: true,
			}),
		).toThrow("This is not implemented yet");
	});

	it("should convert wallets to object using default options", () => {
		const wallets = subject.toObject();
		expect(wallets).toBeTypeOf("object");
	});

	it("should fill wallets", () => {
		const wallets = subject.toObject({
			addNetworkInformation: true,
			excludeEmptyWallets: false,
			excludeLedgerWallets: false,
		});
		subject.flush();
		subject.fill(wallets);
		expect(subject.count()).toBe(1);
	});

	it("should return selected wallets", () => {
		wallet.mutator().isSelected(true);
		expect(subject.selected()).toHaveLength(1);
	});

	it("should forget a selected wallet", async () => {
		const anotherWallet = await profile.walletFactory().fromMnemonicWithBIP39({
			mnemonic: MAINSAIL_MNEMONICS[2],
		});
		subject.push(anotherWallet);

		vi.spyOn(profile, "walletSelectionMode").mockReturnValue("single");
		wallet.mutator().isSelected(true);

		const anotherWalletId = anotherWallet.id();
		subject.forget(wallet.id());

		expect(subject.has(wallet.id())).toBe(false);

		const updatedAnotherWallet = profile.wallets().findById(anotherWalletId);
		expect(updatedAnotherWallet.isSelected()).toBe(true);
	});

	it("should not find a wallet by a wrong alias", () => {
		expect(subject.findByAlias("Wrong Alias")).toBeUndefined();
	});

	it("should sort wallets by address", async () => {
		const wallet2 = await profile.walletFactory().fromMnemonicWithBIP39({ mnemonic: MAINSAIL_MNEMONICS[1] });
		subject.push(wallet2);

		const wallets = subject.sortBy("address", "asc");
		expect(wallets).toBeInstanceOf(Array);
		expect(wallets.length).toBe(2);
	});

	it("should not find a wallet by a wrong public key", () => {
		expect(subject.findByPublicKey("invalid")).toBeUndefined();
	});

	it("should not find a wallet by a wrong address and network", () => {
		expect(subject.findByAddressWithNetwork("invalid", "invalid")).toBeUndefined();
	});

	it("should convert wallets to object and not exclude ledger wallets", () => {
		const wallets = subject.toObject({
			addNetworkInformation: true,
			excludeEmptyWallets: true,
			excludeLedgerWallets: false,
		});
		expect(wallets).toBeTypeOf("object");
	});

	it("should convert wallets to object and not exclude empty wallets", () => {
		const wallets = subject.toObject({
			addNetworkInformation: true,
			excludeEmptyWallets: false,
			excludeLedgerWallets: true,
		});
		expect(wallets).toBeTypeOf("object");
	});

	it("should not find wallets by coin", () => {
		expect(subject.findByCoin("invalid")).toHaveLength(0);
	});

	it("should not restore wallets from a different network", async () => {
		const pqueueSpy = vi.spyOn(queue, "pqueue").mockResolvedValue([]);

		const wallet1Data = wallet.toObject();

		const wallet2DataRepo = new DataRepository();
		const wallet2RawData = { ...wallet.data().all() };
		wallet2RawData[WalletData.Network] = "another.network";
		wallet2DataRepo.fill(wallet2RawData);

		const wallet2Data = {
			...wallet1Data,
			data: wallet2DataRepo,
			id: "wallet-2",
		};

		const walletsToFill = {
			[wallet.id()]: wallet1Data,
			"wallet-2": wallet2Data,
		};

		subject.flush();
		subject.fill(walletsToFill);

		await subject.restore({ networkId: wallet.networkId() });

		expect(pqueueSpy).toHaveBeenCalledTimes(2);
		expect(pqueueSpy.mock.calls[0][0]).toHaveLength(1);
		expect(pqueueSpy.mock.calls[1][0]).toHaveLength(0);
	});
});
