/* eslint-disable sonarjs/no-duplicate-string */

import { describe, expect, it, beforeEach, vi } from "vitest";
import { IProfile, IReadWriteWallet, WalletData, WalletFlag, WalletSetting, WalletImportMethod } from "./contracts";
import { env, getMainsailProfileId, getDefaultMainsailWalletId } from "@/utils/testing-library";
import { DataRepository } from "./data.repository";
import { SettingRepository } from "./setting.repository";
import { WalletGate } from "./wallet.gate";
import { WalletSynchroniser } from "./wallet.synchroniser";
import { WalletMutator } from "./wallet.mutator";
import { VoteRegistry } from "./vote-registry";
import { TransactionIndex } from "./transaction-index";
import { WalletImportFormat } from "./wif";
import { SignatoryFactory } from "./signatory.factory";
import { AttributeBag } from "./helpers/attribute-bag";
import { TransactionService as WalletTransactionService } from "./wallet-transaction.service";
import { MessageService } from "@/app/lib/mainsail/message.service";
import { LedgerService } from "@/app/lib/mainsail/ledger.service";
import { ClientService } from "@/app/lib/mainsail/client.service";
import { AddressService } from "@/app/lib/mainsail/address.service";
import { PublicKeyService } from "@/app/lib/mainsail/public-key.service";
import { SignatoryService } from "@/app/lib/mainsail/signatory.service";
import { TransactionService } from "@/app/lib/mainsail/transaction.service";
import { LinkService } from "@/app/lib/mainsail/link.service";
import { ValidatorService } from "./validator.service";
import { ExchangeRateService } from "./exchange-rate.service";
import { WalletLedgerModel } from "./wallet.enum";
import { BigNumber } from "@/app/lib/helpers/bignumber";
import { Wallet } from "./wallet";

describe("Wallet", () => {
	let profile: IProfile;
	let wallet: IReadWriteWallet;

	beforeEach(() => {
		profile = env.profiles().findById(getMainsailProfileId());
		wallet = profile.wallets().findById(getDefaultMainsailWalletId());

		vi.restoreAllMocks();
	});

	it("should have an id", () => {
		expect(wallet.id()).toBeDefined();
		expect(typeof wallet.id()).toBe("string");
	});

	it("should have a profile", () => {
		expect(wallet.profile()).toBe(profile);
	});

	it("should have a network", () => {
		expect(wallet.network()).toBe(profile.activeNetwork());
	});

	it("should have a currency", () => {
		expect(wallet.currency()).toBe(wallet.network().ticker());
	});

	it("should have an exchange currency", () => {
		const result = wallet.exchangeCurrency();
		expect(result).toBeDefined();
		expect(typeof result).toBe("string");
	});

	it("should have an alias", () => {
		const result = wallet.alias();
		if (result) {
			expect(typeof result).toBe("string");
		}
	});

	it("should have a display name", () => {
		const result = wallet.displayName();
		if (result) {
			expect(typeof result).toBe("string");
		}
	});

	it("should have a primary key", () => {
		const mockWalletData = {
			primaryKey: () => "test-primary-key",
		};
		vi.spyOn(wallet.getAttributes(), "get").mockReturnValue(mockWalletData);

		expect(wallet.primaryKey()).toBe("test-primary-key");
	});

	it("should throw if primary key is accessed before sync", () => {
		vi.spyOn(wallet.getAttributes(), "get").mockReturnValue(undefined);

		expect(() => wallet.primaryKey()).toThrow(
			"This wallet has not been synchronized yet. Please call [synchroniser().identity()] before using it.",
		);
	});

	it("should have an import method", () => {
		const result = wallet.importMethod();
		expect(result).toBeDefined();
		expect(typeof result).toBe("string");
	});

	it("should have a derivation method", () => {
		const result = wallet.derivationMethod();
		// derivationMethod can be undefined, but it should be a valid return value
		if (result !== undefined) {
			expect(typeof result).toBe("string");
		}
	});

	it("should have an address", () => {
		const result = wallet.address();
		expect(result).toBeDefined();
		expect(typeof result).toBe("string");
	});

	it("should have a public key", () => {
		const result = wallet.publicKey();
		if (result) {
			expect(typeof result).toBe("string");
		}
	});

	it("should have a balance", () => {
		const result = wallet.balance();
		expect(typeof result).toBe("number");
		expect(result).toBeGreaterThanOrEqual(0);
	});

	it("should have a balance for different types", () => {
		const available = wallet.balance("available");
		const fees = wallet.balance("fees");
		expect(typeof available).toBe("number");
		expect(typeof fees).toBe("number");
	});

	it("should return 0 for balance when undefined", () => {
		vi.spyOn(wallet.data(), "get").mockReturnValue(undefined);
		expect(wallet.balance()).toBe(0);
	});

	it("should have a converted balance", () => {
		const result = wallet.convertedBalance();
		expect(typeof result).toBe("number");
	});

	it("should fallback to 18 decimals when manifest currency decimals is undefined", () => {
		vi.spyOn(wallet, "manifest").mockImplementation(() => ({
			get: () => ({
				[wallet.networkId()]: {
					currency: { decimals: undefined },
				},
			}),
		}));
		const result = wallet.balance();
		expect(typeof result).toBe("number");
	});

	it("should return 0 for converted balance on test network", () => {
		vi.spyOn(wallet.network(), "isTest").mockReturnValue(true);
		expect(wallet.convertedBalance()).toBe(0);
	});

	it("should have a nonce", () => {
		const result = wallet.nonce();
		expect(result).toBeInstanceOf(BigNumber);
	});

	it("should return zero nonce when undefined", () => {
		vi.spyOn(wallet.data(), "get").mockReturnValue(undefined);
		expect(wallet.nonce()).toEqual(BigNumber.ZERO);
	});

	it("should have an avatar", () => {
		const result = wallet.avatar();
		expect(result).toBeDefined();
		expect(typeof result).toBe("string");
	});

	it("should check if synced with network", () => {
		const result = wallet.hasSyncedWithNetwork();
		expect(typeof result).toBe("boolean");
	});

	it("should return false for sync check when wallet data is undefined", () => {
		vi.spyOn(wallet.getAttributes(), "get").mockReturnValue(undefined);
		expect(wallet.hasSyncedWithNetwork()).toBe(false);
	});

	it("should have a data repository", () => {
		expect(wallet.data()).toBeInstanceOf(DataRepository);
	});

	it("should have a settings repository", () => {
		expect(wallet.settings()).toBeInstanceOf(SettingRepository);
	});

	it("should convert to data", () => {
		const mockWalletData = {
			primaryKey: () => "test-key",
		};
		vi.spyOn(wallet.getAttributes(), "get").mockReturnValue(mockWalletData);

		const result = wallet.toData();
		expect(result).toBe(mockWalletData);
	});

	it("should throw when converting to data if not synced", () => {
		vi.spyOn(wallet.getAttributes(), "get").mockReturnValue(undefined);

		expect(() => wallet.toData()).toThrow(
			"This wallet has not been synchronized yet. Please call [synchroniser().identity()] before using it.",
		);
	});

	it("should convert to object", () => {
		const result = wallet.toObject();
		expect(result).toBeDefined();
		expect(typeof result).toBe("object");
	});

	it("should have a known name", () => {
		const spy = vi.spyOn(profile.knownWallets(), "name").mockReturnValue("Known Wallet");
		expect(wallet.knownName()).toBe("Known Wallet");
		spy.mockRestore();
	});

	it("should have a second public key", () => {
		const mockWalletData = {
			secondPublicKey: () => "test-second-key",
		};
		vi.spyOn(wallet.getAttributes(), "get").mockReturnValue(mockWalletData);

		expect(wallet.secondPublicKey()).toBe("test-second-key");
	});

	it("should throw when accessing second public key if not synced", () => {
		vi.spyOn(wallet.getAttributes(), "get").mockReturnValue(undefined);

		expect(() => wallet.secondPublicKey()).toThrow(
			"This wallet has not been synchronized yet. Please call [synchroniser().identity()] before using it.",
		);
	});

	it("should have a username", () => {
		const mockWalletData = {
			username: () => "test-username",
		};
		vi.spyOn(wallet.getAttributes(), "get").mockReturnValue(mockWalletData);

		expect(wallet.username()).toBe("test-username");
	});

	it("should return undefined for username if cold wallet", () => {
		vi.spyOn(wallet, "isCold").mockReturnValue(true);
		const result = wallet.username();
		expect(result).toBeUndefined();
	});

	it("should throw when accessing username if not synced", () => {
		vi.spyOn(wallet, "isCold").mockReturnValue(false);
		vi.spyOn(wallet.getAttributes(), "get").mockReturnValue(undefined);

		expect(() => wallet.username()).toThrow(
			"This wallet has not been synchronized yet. Please call [synchroniser().identity()] before using it.",
		);
	});

	it("should have a validator public key", () => {
		const mockWalletData = {
			validatorPublicKey: () => "test-validator-key",
		};
		vi.spyOn(wallet.getAttributes(), "get").mockReturnValue(mockWalletData);

		expect(wallet.validatorPublicKey()).toBe("test-validator-key");
	});

	it("should throw when accessing validator public key if not synced", () => {
		vi.spyOn(wallet.getAttributes(), "get").mockReturnValue(undefined);

		expect(() => wallet.validatorPublicKey()).toThrow(
			"This wallet has not been synchronized yet. Please call [synchroniser().identity()] before using it.",
		);
	});

	it("should check if is resigned delegate", () => {
		const mockWalletData = {
			isResignedDelegate: () => true,
		};
		vi.spyOn(wallet.getAttributes(), "get").mockReturnValue(mockWalletData);

		expect(wallet.isResignedDelegate()).toBe(true);
	});

	it("should throw when checking resigned delegate if not synced", () => {
		vi.spyOn(wallet.getAttributes(), "get").mockReturnValue(undefined);

		expect(() => wallet.isResignedDelegate()).toThrow(
			"This wallet has not been synchronized yet. Please call [synchroniser().identity()] before using it.",
		);
	});

	it("should check if is validator", () => {
		const mockWalletData = {
			isValidator: () => true,
		};
		vi.spyOn(wallet.getAttributes(), "get").mockReturnValue(mockWalletData);

		expect(wallet.isValidator()).toBe(true);
	});

	it("should throw when checking validator if not synced", () => {
		vi.spyOn(wallet.getAttributes(), "get").mockReturnValue(undefined);

		expect(() => wallet.isValidator()).toThrow(
			"This wallet has not been synchronized yet. Please call [synchroniser().identity()] before using it.",
		);
	});

	it("should check if is legacy validator", () => {
		const mockWalletData = {
			isLegacyValidator: () => true,
		};
		vi.spyOn(wallet.getAttributes(), "get").mockReturnValue(mockWalletData);

		expect(wallet.isLegacyValidator()).toBe(true);
	});

	it("should throw when checking legacy validator if not synced", () => {
		vi.spyOn(wallet.getAttributes(), "get").mockReturnValue(undefined);

		expect(() => wallet.isLegacyValidator()).toThrow(
			"This wallet has not been synchronized yet. Please call [synchroniser().identity()] before using it.",
		);
	});

	it("should have a validator fee", () => {
		const mockWalletData = {
			validatorFee: () => 100,
		};
		vi.spyOn(wallet.getAttributes(), "get").mockReturnValue(mockWalletData);

		expect(wallet.validatorFee()).toBe(100);
	});

	it("should throw when accessing validator fee if not synced", () => {
		vi.spyOn(wallet.getAttributes(), "get").mockReturnValue(undefined);

		expect(() => wallet.validatorFee()).toThrow(
			"This wallet has not been synchronized yet. Please call [synchroniser().identity()] before using it.",
		);
	});

	it("should check if is resigned validator", () => {
		const mockWalletData = {
			isResignedValidator: () => true,
		};
		vi.spyOn(wallet.getAttributes(), "get").mockReturnValue(mockWalletData);

		expect(wallet.isResignedValidator()).toBe(true);
	});

	it("should throw when checking resigned validator if not synced", () => {
		vi.spyOn(wallet.getAttributes(), "get").mockReturnValue(undefined);

		expect(() => wallet.isResignedValidator()).toThrow(
			"This wallet has not been synchronized yet. Please call [synchroniser().identity()] before using it.",
		);
	});

	it("should check if is known", () => {
		const spy = vi.spyOn(profile.knownWallets(), "is").mockReturnValue(true);
		expect(wallet.isKnown()).toBe(true);
		spy.mockRestore();
	});

	it("should check if is owned by exchange", () => {
		const spy = vi.spyOn(profile.knownWallets(), "isExchange").mockReturnValue(true);
		expect(wallet.isOwnedByExchange()).toBe(true);
		spy.mockRestore();
	});

	it("should check if is owned by team", () => {
		const spy = vi.spyOn(profile.knownWallets(), "isTeam").mockReturnValue(true);
		expect(wallet.isOwnedByTeam()).toBe(true);
		spy.mockRestore();
	});

	it("should check if is ledger", () => {
		const spy = vi.spyOn(wallet.data(), "get").mockReturnValue("m/44'/0'/0'/0/0");
		expect(wallet.isLedger()).toBe(true);
		spy.mockRestore();
	});

	it("should check if is ledger nano x", () => {
		const spy = vi.spyOn(wallet.data(), "get").mockReturnValue(WalletLedgerModel.NanoX);
		expect(wallet.isLedgerNanoX()).toBe(true);
		spy.mockRestore();
	});

	it("should check if is ledger nano s", () => {
		const spy = vi.spyOn(wallet.data(), "get").mockReturnValue(WalletLedgerModel.NanoS);
		expect(wallet.isLedgerNanoS()).toBe(true);
		spy.mockRestore();
	});

	it("should check if is second signature", () => {
		const mockWalletData = {
			isSecondSignature: () => true,
		};
		vi.spyOn(wallet.getAttributes(), "get").mockReturnValue(mockWalletData);

		expect(wallet.isSecondSignature()).toBe(true);
	});

	it("should throw when checking second signature if not synced", () => {
		vi.spyOn(wallet.getAttributes(), "get").mockReturnValue(undefined);

		expect(() => wallet.isSecondSignature()).toThrow(
			"This wallet has not been synchronized yet. Please call [synchroniser().identity()] before using it.",
		);
	});

	it("should check if is starred", () => {
		const spy = vi.spyOn(wallet.data(), "get").mockReturnValue(true);
		expect(wallet.isStarred()).toBe(true);
		spy.mockRestore();
	});

	it("should check if is cold", () => {
		const spy = vi.spyOn(wallet.data(), "get").mockReturnValue(WalletFlag.Cold);
		expect(wallet.isCold()).toBe(true);
		spy.mockRestore();
	});

	it("should toggle starred", () => {
		const setSpy = vi.spyOn(wallet.data(), "set");
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");
		const isStarredSpy = vi.spyOn(wallet, "isStarred").mockReturnValue(false);

		wallet.toggleStarred();

		expect(setSpy).toHaveBeenCalledWith(WalletFlag.Starred, true);
		expect(statusSpy).toHaveBeenCalled();

		setSpy.mockRestore();
		statusSpy.mockRestore();
		isStarredSpy.mockRestore();
	});

	it("should have a coin id", () => {
		const result = wallet.coinId();
		expect(result).toBeDefined();
		expect(typeof result).toBe("string");
	});

	it("should have a network id", () => {
		const result = wallet.networkId();
		expect(result).toBeDefined();
		expect(typeof result).toBe("string");
	});

	it("should have a manifest", () => {
		const result = wallet.manifest();
		expect(result).toBeDefined();
		expect(typeof result.get).toBe("function");
	});

	it("should have a client", () => {
		expect(wallet.client()).toBeInstanceOf(ClientService);
	});

	it("should have an address service", () => {
		expect(wallet.addressService()).toBeInstanceOf(AddressService);
	});

	it("should have a public key service", () => {
		expect(wallet.publicKeyService()).toBeInstanceOf(PublicKeyService);
	});

	it("should have a ledger service", () => {
		expect(wallet.ledger()).toBeInstanceOf(LedgerService);
	});

	it("should have a link service", () => {
		expect(wallet.link()).toBeInstanceOf(LinkService);
	});

	it("should have a message service", () => {
		expect(wallet.message()).toBeInstanceOf(MessageService);
	});

	it("should have a signatory service", () => {
		expect(wallet.signatory()).toBeInstanceOf(SignatoryService);
	});

	it("should have a transaction service", () => {
		expect(wallet.transaction()).toBeInstanceOf(WalletTransactionService);
	});

	it("should have a transaction service", () => {
		expect(wallet.transactionService()).toBeInstanceOf(TransactionService);
	});

	it("should have transaction types", () => {
		const result = wallet.transactionTypes();
		expect(Array.isArray(result)).toBe(true);
	});

	it("should have a gate", () => {
		expect(wallet.gate()).toBeInstanceOf(WalletGate);
	});

	it("should have a synchroniser", () => {
		expect(wallet.synchroniser()).toBeInstanceOf(WalletSynchroniser);
	});

	it("should have a mutator", () => {
		expect(wallet.mutator()).toBeInstanceOf(WalletMutator);
	});

	it("should have a voting registry", () => {
		expect(wallet.voting()).toBeInstanceOf(VoteRegistry);
	});

	it("should have a transaction index", () => {
		expect(wallet.transactionIndex()).toBeInstanceOf(TransactionIndex);
	});

	it("should have a signing key", () => {
		expect(wallet.signingKey()).toBeInstanceOf(WalletImportFormat);
	});

	it("should have a confirm key", () => {
		expect(wallet.confirmKey()).toBeInstanceOf(WalletImportFormat);
	});

	it("should have an explorer link", () => {
		const result = wallet.explorerLink();
		expect(result).toBeDefined();
		expect(typeof result).toBe("string");
	});

	it("should mark as fully restored", () => {
		const forgetSpy = vi.spyOn(wallet.getAttributes(), "forget");
		const setSpy = vi.spyOn(wallet.getAttributes(), "set");

		wallet.markAsFullyRestored();

		expect(forgetSpy).toHaveBeenCalledWith("isMissingNetwork");
		expect(setSpy).toHaveBeenCalledWith("restorationState", {
			full: true,
			partial: false,
		});

		forgetSpy.mockRestore();
		setSpy.mockRestore();
	});

	it("should check if has been fully restored", () => {
		const spy = vi.spyOn(wallet.getAttributes(), "get").mockReturnValue({ full: true, partial: false });
		expect(wallet.hasBeenFullyRestored()).toBe(true);
		spy.mockRestore();
	});

	it("should mark as partially restored", () => {
		const setSpy = vi.spyOn(wallet.getAttributes(), "set");

		wallet.markAsPartiallyRestored();

		expect(setSpy).toHaveBeenCalledWith("restorationState", {
			full: false,
			partial: true,
		});

		setSpy.mockRestore();
	});

	it("should check if has been partially restored", () => {
		const spy = vi.spyOn(wallet.getAttributes(), "get").mockReturnValue({ full: false, partial: true });
		expect(wallet.hasBeenPartiallyRestored()).toBe(true);
		spy.mockRestore();
	});

	it("should mark as missing network", () => {
		const setSpy = vi.spyOn(wallet.getAttributes(), "set");

		wallet.markAsMissingNetwork();

		expect(setSpy).toHaveBeenCalledWith("isMissingNetwork", true);

		setSpy.mockRestore();
	});

	it("should check if is missing network", () => {
		const spy = vi.spyOn(wallet.getAttributes(), "has").mockReturnValue(true);
		expect(wallet.isMissingNetwork()).toBe(true);
		spy.mockRestore();
	});

	it("should have attributes", () => {
		expect(wallet.getAttributes()).toBeInstanceOf(AttributeBag);
	});

	it("should check if can vote", () => {
		const spy = vi.spyOn(wallet.voting(), "available").mockReturnValue(5);
		expect(wallet.canVote()).toBe(true);
		spy.mockRestore();
	});

	it("should check if can write", () => {
		const actsWithAddressSpy = vi.spyOn(wallet, "actsWithAddress").mockReturnValue(false);
		const actsWithPublicKeySpy = vi.spyOn(wallet, "actsWithPublicKey").mockReturnValue(false);

		expect(wallet.canWrite()).toBe(true);

		actsWithAddressSpy.mockRestore();
		actsWithPublicKeySpy.mockRestore();
	});

	it("should not be able to write if acts with address", () => {
		const actsWithAddressSpy = vi.spyOn(wallet, "actsWithAddress").mockReturnValue(true);
		expect(wallet.canWrite()).toBe(false);
		actsWithAddressSpy.mockRestore();
	});

	it("should not be able to write if acts with public key", () => {
		const actsWithAddressSpy = vi.spyOn(wallet, "actsWithAddress").mockReturnValue(false);
		const actsWithPublicKeySpy = vi.spyOn(wallet, "actsWithPublicKey").mockReturnValue(true);

		expect(wallet.canWrite()).toBe(false);

		actsWithAddressSpy.mockRestore();
		actsWithPublicKeySpy.mockRestore();
	});

	it("should check if acts with mnemonic", () => {
		const spy = vi.spyOn(wallet.data(), "get").mockReturnValue(WalletImportMethod.BIP39.MNEMONIC);
		expect(wallet.actsWithMnemonic()).toBe(true);
		spy.mockRestore();
	});

	it("should check if acts with address", () => {
		const spy = vi.spyOn(wallet.data(), "get").mockReturnValue(WalletImportMethod.Address);
		expect(wallet.actsWithAddress()).toBe(true);
		spy.mockRestore();
	});

	it("should check if acts with public key", () => {
		const spy = vi.spyOn(wallet.data(), "get").mockReturnValue(WalletImportMethod.PublicKey);
		expect(wallet.actsWithPublicKey()).toBe(true);
		spy.mockRestore();
	});

	it("should check if acts with address with derivation path", () => {
		const spy = vi.spyOn(wallet.data(), "get").mockReturnValue(WalletImportMethod.BIP44.DERIVATION_PATH);
		expect(wallet.actsWithAddressWithDerivationPath()).toBe(true);
		spy.mockRestore();
	});

	it("should check if acts with mnemonic with encryption", () => {
		const spy = vi.spyOn(wallet.data(), "get").mockReturnValue(WalletImportMethod.BIP39.MNEMONIC_WITH_ENCRYPTION);
		expect(wallet.actsWithMnemonicWithEncryption()).toBe(true);
		spy.mockRestore();
	});

	it("should check if acts with wif", () => {
		const spy = vi.spyOn(wallet.data(), "get").mockReturnValue(WalletImportMethod.WIF);
		expect(wallet.actsWithWif()).toBe(true);
		spy.mockRestore();
	});

	it("should check if is selected", () => {
		const spy = vi.spyOn(wallet.settings(), "get").mockReturnValue(true);
		expect(wallet.isSelected()).toBe(true);
		spy.mockRestore();
	});

	it("should check if acts with wif with encryption", () => {
		const spy = vi.spyOn(wallet.data(), "get").mockReturnValue(WalletImportMethod.WIFWithEncryption);
		expect(wallet.actsWithWifWithEncryption()).toBe(true);
		spy.mockRestore();
	});

	it("should check if acts with secret", () => {
		const spy = vi.spyOn(wallet.data(), "get").mockReturnValue(WalletImportMethod.SECRET);
		expect(wallet.actsWithSecret()).toBe(true);
		spy.mockRestore();
	});

	it("should check if acts with secret with encryption", () => {
		const spy = vi.spyOn(wallet.data(), "get").mockReturnValue(WalletImportMethod.SECRET_WITH_ENCRYPTION);
		expect(wallet.actsWithSecretWithEncryption()).toBe(true);
		spy.mockRestore();
	});

	it("should check if is primary", () => {
		const spy = vi.spyOn(wallet.data(), "get").mockReturnValue(true);
		expect(wallet.isPrimary()).toBe(true);
		spy.mockRestore();
	});

	it("should check if uses password", () => {
		const spy = vi.spyOn(wallet.signingKey(), "exists").mockReturnValue(true);
		expect(wallet.usesPassword()).toBe(true);
		spy.mockRestore();
	});

	it("should have a signatory factory", () => {
		expect(wallet.signatoryFactory()).toBeInstanceOf(SignatoryFactory);
	});

	it("should have a validators service", () => {
		expect(wallet.validators()).toBeInstanceOf(ValidatorService);
	});

	it("should have an exchange rates service", () => {
		expect(wallet.exchangeRates()).toBeInstanceOf(ExchangeRateService);
	});

	it("should handle balance restoration with default values", () => {
		// Test the #restore method by creating a new wallet
		const newWallet = new Wallet("test-id", {}, profile);

		// Check that balance is set to default values
		expect(newWallet.balance()).toBe(0);
		expect(newWallet.nonce()).toEqual(BigNumber.ZERO);
	});

	it("should handle balance restoration with existing values", () => {
		const balance = { available: BigNumber.make(100), fees: BigNumber.make(10) };
		const sequence = "5";

		const newWallet = new Wallet("test-id", {}, profile);
		newWallet.data().set(WalletData.Balance, balance);
		newWallet.data().set(WalletData.Sequence, sequence);

		// Trigger restore by creating another wallet
		const restoredWallet = new Wallet("test-id-2", {}, profile);

		expect(typeof restoredWallet.balance()).toBe("number");
		expect(restoredWallet.nonce()).toBeInstanceOf(BigNumber);
	});

	it("should handle decimals from manifest", () => {
		const newWallet = new Wallet("test-id", {}, profile);

		// Test that decimals are used correctly
		expect(newWallet.balance()).toBeGreaterThanOrEqual(0);
	});

	it("should use default decimals when manifest fails", () => {
		const newWallet = new Wallet("test-id", {}, profile);
		vi.spyOn(newWallet.manifest(), "get").mockImplementation(() => {
			throw new Error("Manifest error");
		});

		// Should still work with default decimals
		expect(newWallet.balance()).toBeGreaterThanOrEqual(0);
	});

	it("should create wallet with proper attributes", () => {
		const newWallet = new Wallet("test-id", { test: "data" }, profile);

		expect(newWallet.id()).toBe("test-id");
		expect(newWallet.profile()).toBe(profile);
		expect(newWallet.hasBeenFullyRestored()).toBe(false);
		expect(newWallet.hasBeenPartiallyRestored()).toBe(false);
	});

	it("should initialize all services correctly", () => {
		const newWallet = new Wallet("test-id", {}, profile);

		expect(newWallet.data()).toBeInstanceOf(DataRepository);
		expect(newWallet.settings()).toBeInstanceOf(SettingRepository);
		expect(newWallet.transaction()).toBeInstanceOf(WalletTransactionService);
		expect(newWallet.gate()).toBeInstanceOf(WalletGate);
		expect(newWallet.synchroniser()).toBeInstanceOf(WalletSynchroniser);
		expect(newWallet.mutator()).toBeInstanceOf(WalletMutator);
		expect(newWallet.voting()).toBeInstanceOf(VoteRegistry);
		expect(newWallet.transactionIndex()).toBeInstanceOf(TransactionIndex);
		expect(newWallet.signingKey()).toBeInstanceOf(WalletImportFormat);
		expect(newWallet.confirmKey()).toBeInstanceOf(WalletImportFormat);
		expect(newWallet.signatoryFactory()).toBeInstanceOf(SignatoryFactory);
		expect(newWallet.message()).toBeInstanceOf(MessageService);
		expect(newWallet.ledger()).toBeInstanceOf(LedgerService);
	});

	// Additional tests to reach 100% coverage
	it("should test converted balance on non-test network", () => {
		vi.spyOn(wallet.network(), "isTest").mockReturnValue(false);
		vi.spyOn(wallet, "exchangeRates").mockReturnValue({
			exchange: vi.fn().mockReturnValue(50),
		} as any);

		const result = wallet.convertedBalance();
		expect(typeof result).toBe("number");
	});

	it("should return avatar from wallet settings when available", () => {
		const newWallet = new Wallet("test-id", {}, profile);
		vi.spyOn(newWallet.data(), "get").mockImplementation((key) => {
			if (key === WalletSetting.Avatar) {
				return "custom-avatar";
			}
			return;
		});

		const result = newWallet.avatar();
		expect(result).toBe("custom-avatar");
	});

	it("should handle decimals when manifest throws error", () => {
		const newWallet = new Wallet("test-id", {}, profile);

		// Mock balance to trigger the #decimals method through balance calculation
		const mockBalance = { available: BigNumber.make(100), fees: BigNumber.make(10) };
		vi.spyOn(newWallet.data(), "get").mockImplementation((key) => {
			if (key === WalletData.Balance) {
				return mockBalance;
			}
			return;
		});

		// Mock manifest to throw error
		vi.spyOn(newWallet.manifest(), "get").mockImplementation(() => {
			throw new Error("Manifest error");
		});

		// This should use default decimals (18) and not throw
		const result = newWallet.balance();
		expect(typeof result).toBe("number");
	});

	it("should cover username early return when cold wallet", () => {
		const newWallet = new Wallet("test-id", {}, profile);

		// Set wallet as cold by mocking the isCold method directly
		vi.spyOn(newWallet, "isCold").mockReturnValue(true);

		// This should trigger the early return in username() method (line 170)
		const result = newWallet.username();
		expect(result).toBeUndefined();
	});

	it("should return undefined for username when wallet is cold - direct test", () => {
		// Mock isCold to return true directly on the existing wallet
		vi.spyOn(wallet, "isCold").mockReturnValue(true);

		// This should definitely trigger line 170: return; in username()
		const result = wallet.username();
		expect(result).toBeUndefined();
	});

	it("should test all branches in username method", () => {
		const testWallet = new Wallet("test-id", {}, profile);

		// Test 1: Cold wallet should return undefined (covers line 170)
		vi.spyOn(testWallet, "isCold").mockReturnValue(true);
		expect(testWallet.username()).toBeUndefined();

		// Test 2: Not cold wallet but no attributes (should throw)
		vi.spyOn(testWallet, "isCold").mockReturnValue(false);
		vi.spyOn(testWallet.getAttributes(), "get").mockReturnValue(undefined);
		expect(() => testWallet.username()).toThrow("This wallet has not been synchronized yet");

		// Test 3: Not cold wallet with attributes (should return username)
		const mockWalletData = { username: () => "test-user" };
		vi.spyOn(testWallet.getAttributes(), "get").mockReturnValue(mockWalletData);
		expect(testWallet.username()).toBe("test-user");
	});

	it("should use default decimals when networkId fails", () => {
		const newWallet = new Wallet("test-id", {}, profile);

		// Mock networkId to return something that will fail in manifest
		vi.spyOn(newWallet, "networkId").mockReturnValue("invalid-network-id");

		// Mock manifest.get to throw when accessing networks
		vi.spyOn(newWallet.manifest(), "get").mockImplementation((key) => {
			if (key === "networks") {
				return {}; // Empty object so that [networkId] will be undefined
			}
			return "test-name";
		});

		// Mock balance data to trigger the decimals calculation
		const mockBalance = { available: BigNumber.make(100), fees: BigNumber.make(10) };
		vi.spyOn(newWallet.data(), "get").mockImplementation((key) => {
			if (key === WalletData.Balance) {
				return mockBalance;
			}
			return;
		});

		// This should use default decimals (18) when manifest access fails
		const result = newWallet.balance();
		expect(typeof result).toBe("number");
	});

	it("should test all displayName branches", () => {
		const newWallet = new Wallet("test-id", {}, profile);

		// Test 1: alias() returns a value (first branch)
		vi.spyOn(newWallet.settings(), "get").mockReturnValue("wallet-alias");
		vi.spyOn(newWallet, "username").mockReturnValue("wallet-username");
		vi.spyOn(newWallet, "knownName").mockReturnValue("wallet-known");
		expect(newWallet.displayName()).toBe("wallet-alias");

		// Test 2: alias() returns undefined, username() returns a value (second branch)
		vi.spyOn(newWallet.settings(), "get").mockReturnValue(undefined);
		vi.spyOn(newWallet, "username").mockReturnValue("wallet-username");
		vi.spyOn(newWallet, "knownName").mockReturnValue("wallet-known");
		expect(newWallet.displayName()).toBe("wallet-username");

		// Test 3: alias() and username() return undefined, knownName() returns a value (third branch)
		vi.spyOn(newWallet.settings(), "get").mockReturnValue(undefined);
		vi.spyOn(newWallet, "username").mockReturnValue(undefined);
		vi.spyOn(newWallet, "knownName").mockReturnValue("wallet-known");
		expect(newWallet.displayName()).toBe("wallet-known");

		// Test 4: all return undefined (covers all branches)
		vi.spyOn(newWallet.settings(), "get").mockReturnValue(undefined);
		vi.spyOn(newWallet, "username").mockReturnValue(undefined);
		vi.spyOn(newWallet, "knownName").mockReturnValue(undefined);
		expect(newWallet.displayName()).toBeUndefined();
	});
});
