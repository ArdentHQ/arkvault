import { Contracts } from "@ardenthq/sdk-profiles";

import { env, getDefaultProfileId, mockNanoXTransport } from "@/utils/testing-library";

import { accessLedgerApp, accessLedgerDevice, persistLedgerConnection } from "./connection";

describe("Ledger Device Connection", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let ledgerListenSpy: vi.SpyInstance;
	let publicKeyPaths: Map<string, string>;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();

		publicKeyPaths = new Map([
			["m/44'/1'/0'/0/0", "027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"],
			["m/44'/1'/1'/0/0", wallet.publicKey()!],
			["m/44'/1'/2'/0/0", "020aac4ec02d47d306b394b79d3351c56c1253cd67fe2c1a38ceba59b896d584d1"],
			["m/44'/1'/3'/0/0", "033a5474f68f92f254691e93c06a2f22efaf7d66b543a53efcece021819653a200"],
			["m/44'/1'/4'/0/0", "03d3c6889608074b44155ad2e6577c3368e27e6e129c457418eb3e5ed029544e8d"],
		]);
	});

	beforeEach(() => {
		ledgerListenSpy = mockNanoXTransport();
	});

	afterEach(() => {
		ledgerListenSpy.mockRestore();
	});

	describe("Access Ledger Device", () => {
		it("should connect to ledger device", async () => {
			await expect(accessLedgerDevice(wallet.coin())).resolves.not.toThrow();
		});

		it("should connect if device is already open", async () => {
			const connectSpy = vi.spyOn(wallet.coin().ledger(), "connect").mockImplementation(() => {
				throw new Error("The device is already open.");
			});

			await expect(accessLedgerDevice(wallet.coin())).resolves.not.toThrow();

			connectSpy.mockRestore();
		});

		it("should throw on unknown connection error", async () => {
			const connectSpy = vi.spyOn(wallet.coin().ledger(), "connect").mockImplementation(() => {
				throw new Error("Connection error");
			});

			await expect(accessLedgerDevice(wallet.coin())).rejects.toThrow("Connection error");

			connectSpy.mockRestore();
		});
	});

	describe("Access Ledger App", () => {
		it("should connect to ledger app", async () => {
			const publicKeySpy = vi
				.spyOn(wallet.coin().ledger(), "getPublicKey")
				.mockResolvedValue(publicKeyPaths.values().next().value);

			const versionSpy = vi.spyOn(wallet.coin().ledger(), "getVersion").mockResolvedValue("2.3.0");

			await expect(accessLedgerApp({ coin: wallet.coin() })).resolves.not.toThrow();

			versionSpy.mockRestore();
			publicKeySpy.mockRestore();
		});

		it("should throw version error", async () => {
			const versionSpy = vi.spyOn(wallet.coin().ledger(), "getVersion").mockResolvedValue("1.3.0");

			await expect(accessLedgerApp({ coin: wallet.coin() })).rejects.toThrow("VERSION_ERROR");

			versionSpy.mockRestore();
		});
	});

	describe("Persist Ledger Connection", () => {
		it("should connect to ledger app without retries", async () => {
			const publicKeySpy = vi
				.spyOn(wallet.coin().ledger(), "getPublicKey")
				.mockResolvedValue(publicKeyPaths.values().next().value);

			const versionSpy = vi.spyOn(wallet.coin().ledger(), "getVersion").mockResolvedValue("2.3.0");

			await expect(
				persistLedgerConnection({
					coin: wallet.coin(),
					hasRequestedAbort: () => false,
					options: {},
				}),
			).resolves.not.toThrow();

			versionSpy.mockRestore();
			publicKeySpy.mockRestore();
		});

		it("should bail if requested abort", async () => {
			const connectSpy = vi.spyOn(wallet.coin().ledger(), "connect").mockImplementation(() => {
				throw new Error("Unknown Error");
			});

			const publicKeySpy = vi
				.spyOn(wallet.coin().ledger(), "getPublicKey")
				.mockResolvedValue(publicKeyPaths.values().next().value);

			const versionSpy = vi.spyOn(wallet.coin().ledger(), "getVersion").mockResolvedValue("2.3.0");

			await expect(
				persistLedgerConnection({
					coin: wallet.coin(),
					hasRequestedAbort: () => true,
					options: { factor: 1, randomize: false, retries: 2 },
				}),
			).rejects.toThrow("CONNECTION_ERROR");

			versionSpy.mockRestore();
			publicKeySpy.mockRestore();
			connectSpy.mockRestore();
		});

		it("should abort retries if version error", async () => {
			const publicKeySpy = vi
				.spyOn(wallet.coin().ledger(), "getPublicKey")
				.mockResolvedValue(publicKeyPaths.values().next().value);

			const versionSpy = vi.spyOn(wallet.coin().ledger(), "getVersion").mockResolvedValue("1.3.0");

			await expect(
				persistLedgerConnection({
					coin: wallet.coin(),
					hasRequestedAbort: () => false,
					options: { factor: 1, randomize: false, retries: 2 },
				}),
			).rejects.toThrow("VERSION_ERROR");

			versionSpy.mockRestore();
			publicKeySpy.mockRestore();
		});

		it("should abort after reaching max retries", async () => {
			const connectSpy = vi.spyOn(wallet.coin().ledger(), "connect").mockImplementation(() => {
				throw new Error("Unknown Error");
			});

			const publicKeySpy = vi
				.spyOn(wallet.coin().ledger(), "getPublicKey")
				.mockResolvedValue(publicKeyPaths.values().next().value);

			const versionSpy = vi.spyOn(wallet.coin().ledger(), "getVersion").mockResolvedValue("2.3.0");

			await expect(
				persistLedgerConnection({
					coin: wallet.coin(),
					hasRequestedAbort: () => false,
					options: { factor: 1, randomize: false, retries: 2 },
				}),
			).rejects.toThrow("Unknown Error");

			versionSpy.mockRestore();
			publicKeySpy.mockRestore();
			connectSpy.mockRestore();
		});
	});
});
