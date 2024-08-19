import React, { useEffect } from "react";
import { Options } from "p-retry";
import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslation } from "react-i18next";

import { useLedgerConnection } from "./connection";
import { minVersionList } from "@/app/contexts/Ledger/Ledger.contracts";
import { toasts } from "@/app/services";
import { translations as walletTranslations } from "@/domains/wallet/i18n";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	waitFor,
	mockNanoXTransport,
	mockLedgerTransportError,
} from "@/utils/testing-library";

const LedgerWaitingDevice = "Waiting Device";

class LedgerError extends Error {
	statusText: string;

	constructor(statusText: string, message?: string) {
		super(message);
		this.statusText = statusText;
	}
}

describe("Use Ledger Connection", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let publicKeyPaths: Map<string, string>;
	let getVersionSpy: vi.SpyInstance;

	beforeAll(() => {
		publicKeyPaths = new Map<string, string>();
	});

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();

		getVersionSpy = vi
			.spyOn(wallet.coin().ledger(), "getVersion")
			.mockResolvedValue(minVersionList[wallet.network().coin()]);

		publicKeyPaths = new Map([
			["m/44'/1'/0'/0/0", "027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"],
			["m/44'/1'/1'/0/0", wallet.publicKey()!],
			["m/44'/1'/2'/0/0", "020aac4ec02d47d306b394b79d3351c56c1253cd67fe2c1a38ceba59b896d584d1"],
			["m/44'/1'/3'/0/0", "033a5474f68f92f254691e93c06a2f22efaf7d66b543a53efcece021819653a200"],
			["m/44'/1'/4'/0/0", "03d3c6889608074b44155ad2e6577c3368e27e6e129c457418eb3e5ed029544e8d"],
		]);
	});

	afterEach(() => {
		getVersionSpy.mockRestore();
	});

	const Component = () => {
		const { hasDeviceAvailable, error, listenDevice, importLedgerWallets } = useLedgerConnection();

		useEffect(() => {
			listenDevice();
		}, []);

		const handleImport = async () => {
			const wallets = [{ address: "DQx1w8KE7nEW1nX9gj9iWjMXnp8Q3xyn3y", path: "m/44'/1'/0'/0/0" }];
			await importLedgerWallets(wallets, wallet.coin(), profile);
		};

		return (
			<div>
				{error && <span>{error}</span>}
				<button disabled={!hasDeviceAvailable} onClick={handleImport}>
					Import
				</button>
				;
			</div>
		);
	};

	it("should have device available", async () => {
		const listenSpy = mockNanoXTransport();

		render(<Component />);

		expect(screen.getByRole("button")).toBeDisabled();

		await waitFor(() => {
			expect(screen.getByRole("button")).toBeEnabled();
		});

		listenSpy.mockReset();
	});

	it("should not have device available", () => {
		const listenSpy = mockLedgerTransportError("no device");

		render(<Component />);

		expect(screen.getByRole("button")).toBeDisabled();

		listenSpy.mockReset();
	});

	it("should import ledger wallets", async () => {
		const listenSpy = mockNanoXTransport();

		render(<Component />);

		await waitFor(() => {
			expect(screen.getByRole("button")).toBeEnabled();
		});

		expect(profile.wallets().count()).toBe(2);

		listenSpy.mockReset();

		await userEvent.click(screen.getByRole("button"));

		await waitFor(() => {
			expect(profile.wallets().count()).toBe(3);
		});

		const importedWallet = profile
			.wallets()
			.findByAddressWithNetwork("DQx1w8KE7nEW1nX9gj9iWjMXnp8Q3xyn3y", "ark.devnet");

		expect(importedWallet?.isLedgerNanoX()).toBe(true);
		expect(importedWallet?.data().get(Contracts.WalletData.LedgerModel)).toBe(Contracts.WalletLedgerModel.NanoX);

		profile.wallets().forget("DQx1w8KE7nEW1nX9gj9iWjMXnp8Q3xyn3y");
		await env.persist();
	});

	describe("Ledger Connection", () => {
		beforeEach(() => {
			vi.spyOn(wallet.coin(), "__construct").mockImplementation(vi.fn());
		});

		afterEach(() => {
			vi.clearAllMocks();
		});

		const Component = ({
			userProfile = profile,
			userWallet = wallet,
			retryOptions,
		}: {
			userProfile?: Contracts.IProfile;
			userWallet?: Contracts.IReadWriteWallet;
			retryOptions?: Options;
		}) => {
			const {
				connect,
				disconnect,
				setBusy,
				isConnected,
				isBusy,
				isAwaitingConnection,
				error,
				abortConnectionRetry,
				listenDevice,
				resetConnectionState,
			} = useLedgerConnection();

			useEffect(() => {
				listenDevice();
			}, []);

			const handleConnect = async () => {
				try {
					await connect(userProfile, userWallet.coinId(), userWallet.networkId(), retryOptions);
				} catch {
					//
				}
			};

			return (
				<div>
					{error && <span>{error}</span>}
					{isAwaitingConnection && <span>Waiting Device</span>}
					{isConnected && <span>Connected</span>}
					{isBusy && <span>Busy</span>}
					{!isConnected && <span>Disconnected</span>}

					<button onClick={abortConnectionRetry}>Abort</button>
					<button onClick={handleConnect}>Connect</button>
					<button onClick={resetConnectionState}>Reset</button>
					<button onClick={disconnect}>Disconnect</button>
					<button onClick={setBusy}>Set Busy</button>
				</div>
			);
		};

		it("should succeed in connecting without retries", async () => {
			const getPublicKeySpy = vi
				.spyOn(wallet.coin().ledger(), "getPublicKey")
				.mockResolvedValue(publicKeyPaths.values().next().value);

			const listenSpy = mockNanoXTransport();

			render(<Component />);

			await userEvent.click(screen.getByText("Connect"));

			await waitFor(() => expect(screen.queryByText(LedgerWaitingDevice)).not.toBeInTheDocument());

			await expect(screen.findByText("Connected")).resolves.toBeVisible();

			expect(getPublicKeySpy).toHaveBeenCalledTimes(1);

			getPublicKeySpy.mockReset();

			listenSpy.mockRestore();
		});

		it.skip("should disconnect", async () => {
			const getPublicKeySpy = vi
				.spyOn(wallet.coin().ledger(), "getPublicKey")
				.mockResolvedValue(publicKeyPaths.values().next().value);

			const listenSpy = mockNanoXTransport();

			render(<Component retryOptions={{ retries: 2 }} />);

			await userEvent.click(screen.getByText("Connect"));

			await waitFor(() => expect(screen.queryByText(LedgerWaitingDevice)).not.toBeInTheDocument());

			await expect(screen.findByText("Connected")).resolves.toBeVisible();

			expect(getPublicKeySpy).toHaveBeenCalledTimes(1);

			await userEvent.click(screen.getByText("Disconnect"));

			await expect(screen.findByText("Disconnected")).resolves.toBeVisible();

			getPublicKeySpy.mockReset();
			listenSpy.mockRestore();
		});

		it.skip("should set busy", async () => {
			const getPublicKeySpy = vi
				.spyOn(wallet.coin().ledger(), "getPublicKey")
				.mockResolvedValue(publicKeyPaths.values().next().value);

			const listenSpy = mockNanoXTransport();

			render(<Component retryOptions={{ retries: 2 }} />);

			await userEvent.click(screen.getByText("Connect"));

			await waitFor(() => expect(screen.queryByText(LedgerWaitingDevice)).not.toBeInTheDocument());

			await expect(screen.findByText("Connected")).resolves.toBeVisible();

			expect(getPublicKeySpy).toHaveBeenCalledTimes(1);

			await userEvent.click(screen.getByText("Set Busy"));

			await expect(screen.findByText("Busy")).resolves.toBeVisible();

			getPublicKeySpy.mockReset();
			listenSpy.mockRestore();
		});

		it.skip("should show disconnected warning message upon disconnecting device", async () => {
			const toastSpy = vi.spyOn(toasts, "warning").mockImplementationOnce(vi.fn());

			const getPublicKeySpy = vi
				.spyOn(wallet.coin().ledger(), "getPublicKey")
				.mockResolvedValue(publicKeyPaths.values().next().value);

			const listenSpy = mockNanoXTransport();

			render(<Component retryOptions={{ retries: 2 }} />);

			await userEvent.click(screen.getByText("Connect"));

			await waitFor(() => expect(screen.queryByText(LedgerWaitingDevice)).not.toBeInTheDocument());

			await expect(screen.findByText("Connected")).resolves.toBeVisible();

			expect(getPublicKeySpy).toHaveBeenCalledTimes(1);

			await userEvent.click(screen.getByText("Reset"));

			await expect(screen.findByText("Disconnected")).resolves.toBeVisible();

			await waitFor(() => expect(toastSpy).toHaveBeenCalledWith("Nano X disconnected"));

			getPublicKeySpy.mockReset();
			listenSpy.mockRestore();
		});

		it.skip("should add default device model id", async () => {
			const toastSpy = vi.spyOn(toasts, "warning").mockImplementationOnce(vi.fn());

			const getPublicKeySpy = vi
				.spyOn(wallet.coin().ledger(), "getPublicKey")
				.mockResolvedValue(publicKeyPaths.values().next().value);

			const listenSpy = mockNanoXTransport({ deviceModel: { id: null, productName: "Nano S" } });

			render(<Component retryOptions={{ retries: 2 }} />);

			await userEvent.click(screen.getByText("Connect"));

			await waitFor(() => expect(screen.queryByText(LedgerWaitingDevice)).not.toBeInTheDocument());

			await expect(screen.findByText("Connected")).resolves.toBeVisible();

			expect(getPublicKeySpy).toHaveBeenCalledTimes(1);

			await userEvent.click(screen.getByText("Reset"));

			await expect(screen.findByText("Disconnected")).resolves.toBeVisible();

			await waitFor(() => expect(toastSpy).toHaveBeenCalledWith("Nano S disconnected"));

			getPublicKeySpy.mockReset();
			listenSpy.mockRestore();
		});

		it.skip("should abort connection retries", async () => {
			const connectSpy = vi.spyOn(wallet.coin().ledger(), "connect").mockImplementation(() => {
				throw new Error("CONNECTION_ERROR");
			});

			const listenSpy = mockNanoXTransport();

			render(
				<Component
					retryOptions={{
						factor: 1,
						minTimeout: 10,
						randomize: false,
						retries: 2,
					}}
				/>,
			);

			await userEvent.click(screen.getByText("Connect"));
			await waitFor(() => expect(screen.queryByText(LedgerWaitingDevice)).not.toBeInTheDocument());

			await userEvent.click(screen.getByText("Abort"));

			await expect(
				screen.findByText(walletTranslations.MODAL_LEDGER_WALLET.GENERIC_CONNECTION_ERROR),
			).resolves.toBeVisible();

			await waitFor(() => expect(screen.queryByText(LedgerWaitingDevice)).not.toBeInTheDocument());

			await waitFor(() => {
				expect(connectSpy).toHaveBeenCalledTimes(3);
			});

			listenSpy.mockRestore();
			connectSpy.mockRestore();
		});

		it.skip("should fail to connect with retries", async () => {
			const connectSpy = vi.spyOn(wallet.coin().ledger(), "connect").mockImplementation(() => {
				throw new Error("CONNECTION_ERROR");
			});

			const listenSpy = mockNanoXTransport();

			render(
				<Component
					retryOptions={{
						factor: 1,
						minTimeout: 10,
						randomize: false,
						retries: 2,
					}}
				/>,
			);

			expect(screen.getByText("Connect")).toBeInTheDocument();

			await userEvent.click(screen.getByText("Connect"));

			await waitFor(() => expect(screen.queryByText(LedgerWaitingDevice)).not.toBeInTheDocument(), {
				timeout: 4000,
			});

			await expect(
				screen.findByText(walletTranslations.MODAL_LEDGER_WALLET.GENERIC_CONNECTION_ERROR),
			).resolves.toBeVisible();

			expect(connectSpy).toHaveBeenCalledTimes(3);

			listenSpy.mockRestore();
			connectSpy.mockRestore();
		});

		it.skip("should fail to connect unknown connection error and show generic connection error", async () => {
			const connectSpy = vi.spyOn(wallet.coin().ledger(), "connect").mockImplementation(() => {
				throw new LedgerError("UNKNOWN_ERROR");
			});

			const listenSpy = mockNanoXTransport();

			render(
				<Component
					retryOptions={{
						factor: 1,
						minTimeout: 10,
						randomize: false,
						retries: 2,
					}}
				/>,
			);

			expect(screen.getByText("Connect")).toBeInTheDocument();

			await userEvent.click(screen.getByText("Connect"));

			await waitFor(() => expect(screen.queryByText(LedgerWaitingDevice)).not.toBeInTheDocument());

			await waitFor(
				() =>
					expect(
						screen.findByText(walletTranslations.MODAL_LEDGER_WALLET.GENERIC_CONNECTION_ERROR),
					).resolves.toBeVisible(),
				{ timeout: 3000 },
			);

			await waitFor(() => expect(connectSpy).toHaveBeenCalledTimes(3));

			listenSpy.mockRestore();
			connectSpy.mockRestore();
		});

		it.skip("should fail to connect with unknown error", async () => {
			const listenSpy = mockNanoXTransport();

			const connectSpy = vi.spyOn(wallet.coin().ledger(), "connect").mockImplementation(() => {
				throw new Error("some error");
			});

			render(
				<Component
					retryOptions={{
						factor: 1,
						minTimeout: 10,
						randomize: false,
						retries: 2,
					}}
				/>,
			);

			await userEvent.click(screen.getByText("Connect"));
			await waitFor(() => expect(screen.queryByText(LedgerWaitingDevice)).not.toBeInTheDocument(), {
				timeout: 4000,
			});

			await expect(screen.findByText("some error")).resolves.toBeVisible();

			await waitFor(() => expect(connectSpy).toHaveBeenCalledTimes(3));

			connectSpy.mockReset();
			listenSpy.mockReset();
		});

		it.skip("should fail to connect if app version is less than minimum version", async () => {
			const listenSpy = mockNanoXTransport();
			const { result } = renderHook(() => useTranslation());
			const { t } = result.current;

			const getPublicKeySpy = vi
				.spyOn(wallet.coin().ledger(), "getPublicKey")
				.mockResolvedValue(publicKeyPaths.values().next().value);

			const versionSpy = vi.spyOn(wallet.coin().ledger(), "getVersion").mockResolvedValue("1.3.0");
			const disconnectSpy = vi.spyOn(wallet.coin().ledger(), "disconnect").mockImplementation(() => {
				throw new Error("Disconnect error");
			});

			render(<Component retryOptions={{ retries: 2 }} />);

			await expect(screen.findByText("Connect")).resolves.toBeVisible();

			await userEvent.click(screen.getByText("Connect"));

			await waitFor(() => expect(screen.queryByText(LedgerWaitingDevice)).not.toBeInTheDocument());

			await expect(
				screen.findByText(
					t("WALLETS.MODAL_LEDGER_WALLET.UPDATE_ERROR", {
						coin: wallet.network().coin(),
						version: "1.3.0",
					}),
				),
			).resolves.toBeVisible();

			getPublicKeySpy.mockReset();
			getVersionSpy.mockReset();
			versionSpy.mockRestore();
			disconnectSpy.mockRestore();
			listenSpy.mockRestore();
		});

		it.skip("should ignore the app version check for coins that are not in the minVersionList", async () => {
			const listenSpy = mockNanoXTransport();

			const getPublicKeySpy = vi
				.spyOn(wallet.coin().ledger(), "getPublicKey")
				.mockResolvedValue(publicKeyPaths.values().next().value);

			const coinSpy = vi.spyOn(wallet.coin().network(), "coin").mockReturnValue("BTC");

			render(
				<Component
					userProfile={profile}
					userWallet={wallet}
					retryOptions={{
						factor: 1,
						minTimeout: 10,
						randomize: false,
						retries: 2,
					}}
				/>,
			);

			await userEvent.click(screen.getByText("Connect"));

			await waitFor(() => expect(screen.queryByText(LedgerWaitingDevice)).not.toBeInTheDocument());

			await expect(screen.findByText("Connected")).resolves.toBeVisible();

			expect(getPublicKeySpy).toHaveBeenCalledTimes(1);

			getPublicKeySpy.mockRestore();
			coinSpy.mockRestore();
			listenSpy.mockRestore();
		});

		it.skip("should fail to connect and throw a browser compatibility error", async () => {
			process.env.REACT_APP_IS_UNIT = undefined;

			const listenSpy = mockNanoXTransport();

			const connectSpy = vi.spyOn(wallet.coin().ledger(), "connect").mockImplementation(() => {
				throw new Error("COMPATIBILITY_ERROR");
			});

			render(
				<Component
					retryOptions={{
						factor: 1,
						minTimeout: 10,
						randomize: false,
						retries: 2,
					}}
				/>,
			);

			await userEvent.click(screen.getByText("Connect"));
			await waitFor(() => expect(screen.queryByText(LedgerWaitingDevice)).not.toBeInTheDocument(), {
				timeout: 4000,
			});

			await expect(
				screen.findByText(walletTranslations.MODAL_LEDGER_WALLET.COMPATIBILITY_ERROR),
			).resolves.toBeVisible();

			connectSpy.mockReset();
			listenSpy.mockReset();
		});
	});
});
