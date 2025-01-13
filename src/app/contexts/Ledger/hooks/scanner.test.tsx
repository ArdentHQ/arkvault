import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { useLedgerScanner } from "./scanner";
import { useLedgerContext } from "@/app/contexts/Ledger";
import { env, getDefaultProfileId, render, screen, waitFor, mockNanoXTransport } from "@/utils/testing-library";
import { server, requestMock, requestMockOnce } from "@/tests/mocks/server";

const walletsList = (wallets, isSelected) => (
	<ul>
		{wallets.map((x) => (
			<li key={x.path}>
				<p>{`Path: ${x.path}`}</p>
				<p>{`Address: ${x.address}`}</p>
				<p>{`Selected: ${isSelected(x.path)}`}</p>
			</li>
		))}
	</ul>
);

describe("Use Ledger Scanner", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let legacyPublicKeyPaths: Map<string, string>;
	let getPublicKeySpy: vi.SpyInstance;
	let getExtendedPublicKeySpy: vi.SpyInstance;

	beforeAll(() => {
		legacyPublicKeyPaths = new Map<string, string>();

		mockNanoXTransport();
	});

	beforeEach(async () => {
		server.use(
			requestMockOnce("https://ark-test.arkvault.io/api/wallets", {
				data: [
					{
						address: "DRgF3PvzeGWndQjET7dZsSmnrc6uAy23ES",
						balance: "1",
					},
					{
						address: "DJpFwW39QnQvQRQJF2MCfAoKvsX4DJ28jq",
						balance: "2",
					},
					{
						address: "DSyG9hK9CE8eyfddUoEvsga4kNVQLdw2ve",
						balance: "3",
					},
				],
				meta: {},
			}),
			requestMock("https://ark-test.arkvault.io/api/wallets", {
				data: [],
				meta: {},
			}),
		);

		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();

		await env.profiles().restore(profile);
		await profile.sync();
		await wallet.synchroniser().coin();
		await wallet.coin().ledger().connect();

		legacyPublicKeyPaths = new Map([
			["m/44'/1'/0'/0/0", "027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"],
			["m/44'/1'/0'/0/1", "03d3fdad9c5b25bf8880e6b519eb3611a5c0b31adebc8455f0e096175b28321aff"],
			["m/44'/1'/0'/0/2", "025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca"],
			["m/44'/1'/0'/0/3", "024d5eacc5e05e1b05c476b367b7d072857826d9b271e07d3a3327224db8892a21"],
			["m/44'/1'/0'/0/4", "025d7298a7a472b1435e40df13491e98609b9b555bf3ef452b2afea27061d11235"],

			["m/44'/1'/1'/0/0", wallet.publicKey()!],
			["m/44'/1'/2'/0/0", "020aac4ec02d47d306b394b79d3351c56c1253cd67fe2c1a38ceba59b896d584d1"],
			["m/44'/1'/3'/0/0", "033a5474f68f92f254691e93c06a2f22efaf7d66b543a53efcece021819653a200"],
			["m/44'/1'/4'/0/0", "03d3c6889608074b44155ad2e6577c3368e27e6e129c457418eb3e5ed029544e8d"],
			["m/44'/1'/5'/0/0", "02ac8d84d81648154f79ba64fbf64cd6ee60f385b2aa52e8eb72bc1374bf55a68c"],
			["m/44'/1'/6'/0/0", "032cfbb18f4e49952c6d6475e8adc6d0cba00b81ef6606cc4927b78c6c50558beb"],
			["m/44'/1'/7'/0/0", "0242555e90957de10e3912ce8831bcc985a40a645447dbfe8a0913ee6d89914707"],
			["m/44'/1'/8'/0/0", "02677f73453da6073f5cf76db8f65fabc1a3b7aadc7b06027e0df709f14e097790"],
			["m/44'/1'/9'/0/0", "03f3512aa9717b2ca83d371ed3bb2d3ff922969f3ceef92f65c060afa2bc2244fb"],
			["m/44'/1'/10'/0/0", "0349e7e2afb470994a8323e9623a6dab227c69d5f09f1a59991fd92880123ffe75"],
		]);

		getPublicKeySpy = vi
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockImplementation((path) => Promise.resolve(legacyPublicKeyPaths.get(path)!));

		getExtendedPublicKeySpy = vi
			.spyOn(wallet.coin().ledger(), "getExtendedPublicKey")
			.mockResolvedValue(wallet.publicKey()!);
	});

	afterEach(() => {
		getPublicKeySpy.mockRestore();
		getExtendedPublicKeySpy.mockRestore();
	});

	afterAll(() => {
		vi.clearAllMocks();
	});

	it("should render", async () => {
		const Component = () => {
			const { scan, wallets, isSelected } = useLedgerScanner(wallet.coinId(), wallet.networkId());

			return (
				<div>
					{walletsList(wallets, isSelected)}
					<button onClick={() => scan(profile)}>Scan</button>
				</div>
			);
		};

		const { container } = render(<Component />);

		await userEvent.click(screen.getByRole("button"));

		await waitFor(() => expect(screen.queryAllByRole("listitem")).toHaveLength(1));
		await waitFor(() => expect(screen.queryAllByText("Balance: Loading")).toHaveLength(0));

		expect(container).toMatchSnapshot();
	});

	it("should render with toggleSelect", async () => {
		const Component = () => {
			const { toggleSelect, wallets, isSelected, scan } = useLedgerScanner(wallet.coinId(), wallet.networkId());

			return (
				<div>
					<ul>
						{wallets.map((wallet, index) => (
							<li key={wallet.path}>
								<p>{`Path: ${wallet.path}`}</p>
								<p>{`Address: ${wallet.address}`}</p>
								<p>{`Selected: ${isSelected(wallet.path)}`}</p>
								<input
									type="checkbox"
									data-testid={`input--${index}`}
									onChange={toggleSelect.bind(undefined, wallet.path)}
								/>
							</li>
						))}
					</ul>
					<button data-testid="scan" onClick={() => scan(profile)}>
						Scan
					</button>
				</div>
			);
		};

		render(<Component />);

		await userEvent.click(screen.getByTestId("scan"));

		await waitFor(() => expect(screen.queryAllByRole("listitem")).toHaveLength(1));
		await waitFor(() => expect(screen.queryAllByText("Balance: Loading")).toHaveLength(0));

		await userEvent.click(screen.getByTestId("input--0"));

		await waitFor(() => expect(screen.queryAllByText("Selected: false")).toHaveLength(1));
	});

	it("should render with toggleSelectAll", async () => {
		const Component = () => {
			const { scan, toggleSelectAll, wallets, isSelected } = useLedgerScanner(
				wallet.coinId(),
				wallet.networkId(),
			);

			return (
				<div>
					{walletsList(wallets, isSelected)}
					<button onClick={() => scan(profile)}>Scan</button>
					<button onClick={toggleSelectAll}>Toggle All</button>
				</div>
			);
		};

		render(<Component />);

		await userEvent.click(screen.getByText("Scan"));

		await waitFor(() => expect(screen.queryAllByText("Selected: true")).toHaveLength(1));

		await userEvent.click(screen.getByText("Toggle All"));

		await waitFor(() => expect(screen.queryAllByText("Selected: false")).toHaveLength(1));
	});

	it.each([
		["m/44'/1'/0'/0/3", "m/44'/1'/0'/0/1"],
		["m/44'/1'/0'/0/2", "m/44'/1'/0'/0/3"],
	])("should load with last import path", async (path1, path2) => {
		const ledgerScanSpy = vi.spyOn(wallet.coin().ledger(), "scan");

		const profileWallets = profile.wallets().values();
		const walletSpy1 = vi.spyOn(profileWallets[0].data(), "get").mockImplementation(() => path1);
		const walletSpy2 = vi.spyOn(profileWallets[1].data(), "get").mockImplementation(() => path2);

		const Component = () => {
			const { scan } = useLedgerScanner(wallet.coinId(), wallet.networkId());

			return (
				<div>
					<button onClick={() => scan(profile, path1)}>Scan</button>
				</div>
			);
		};

		render(<Component />);

		await userEvent.click(screen.getByRole("button"));

		await waitFor(() =>
			expect(ledgerScanSpy).toHaveBeenCalledWith({
				onProgress: expect.any(Function),
				startPath: path1,
			}),
		);

		walletSpy1.mockRestore();
		walletSpy2.mockRestore();
		ledgerScanSpy.mockRestore();
	});

	it("should load more wallets", async () => {
		const Component = () => {
			const { scan, wallets, isScanningMore } = useLedgerScanner(wallet.coinId(), wallet.networkId());

			return (
				<div>
					{isScanningMore && <p data-testid="scanningMore">Scanning more...</p>}
					{wallets.length > 0 ? (
						<button data-testid="scanMore" onClick={() => scan(profile)}>
							Scan More
						</button>
					) : (
						<button data-testid="scan" onClick={() => scan(profile)}>
							Scan
						</button>
					)}
				</div>
			);
		};

		render(<Component />);

		await userEvent.click(screen.getByTestId("scan"));

		await waitFor(() => expect(screen.queryByTestId("scan")).not.toBeInTheDocument());

		expect(screen.getByTestId("scanMore")).toBeInTheDocument();

		const ledgerScanSpy = vi.spyOn(wallet.coin().ledger(), "scan");

		await userEvent.click(screen.getByTestId("scanMore"));

		expect(screen.getByTestId("scanningMore")).toBeInTheDocument();

		await waitFor(() => expect(screen.queryByTestId("scanningMore")).not.toBeInTheDocument());

		ledgerScanSpy.mockRestore();
	});

	it("should dispatch failed", async () => {
		getExtendedPublicKeySpy.mockRestore();
		getExtendedPublicKeySpy = vi
			.spyOn(wallet.coin().ledger(), "getExtendedPublicKey")
			.mockRejectedValue(new Error("Failed"));

		const Component = () => {
			const { wallets, scan, canRetry } = useLedgerScanner(wallet.coinId(), wallet.networkId());

			return (
				<div>
					<ul>
						{wallets.map((x) => (
							<li key={x.path}>
								<p>{`Path: ${x.path}`}</p>
								<p>{`Address: ${x.address}`}</p>
								<p>{`Address: ${x.address}`}</p>
							</li>
						))}
					</ul>
					<button onClick={() => scan(profile)}>Scan</button>
					{canRetry && <button>Retry</button>}
				</div>
			);
		};

		render(<Component />);

		await userEvent.click(screen.getByText("Scan"));

		await expect(screen.findByText("Retry")).resolves.toBeVisible();

		getExtendedPublicKeySpy.mockRestore();
	});

	it("should abort scanner", async () => {
		const Component = () => {
			const { isBusy } = useLedgerContext();
			const { scan, abortScanner } = useLedgerScanner(wallet.coinId(), wallet.networkId());

			return (
				<div>
					<p>{isBusy ? "Busy" : "Idle"}</p>
					<button data-testid="scan" onClick={() => scan(profile)}>
						Scan
					</button>
					<button data-testid="abort" onClick={abortScanner}>
						Abort
					</button>
				</div>
			);
		};

		render(<Component />);

		await userEvent.click(screen.getByTestId("scan"));
		await userEvent.click(screen.getByTestId("abort"));

		await expect(screen.findByText("Idle")).resolves.toBeVisible();
	});
});
