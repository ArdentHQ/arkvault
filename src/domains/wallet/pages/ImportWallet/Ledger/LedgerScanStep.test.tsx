import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import { FormProvider, useForm, UseFormMethods } from "react-hook-form";

import { Networks } from "@ardenthq/sdk";
import { LedgerScanStep, showLoadedLedgerWalletsMessage, LedgerTable } from "./LedgerScanStep";
import { env, getDefaultProfileId, render, renderResponsive, screen, waitFor } from "@/utils/testing-library";
import { toasts } from "@/app/services";
import { server, requestMockOnce, requestMock } from "@/tests/mocks/server";
import { LedgerData } from "@/app/contexts/Ledger/Ledger.contracts";

let formReference: UseFormMethods<{ network: Networks.Network }>;

const validLedgerWallet = () =>
	expect(formReference.getValues("wallets")).toMatchObject([{ address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD" }]);

const sampleLedgerData: LedgerData[] = [
	{
		address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		balance: 1000,
		path: "3431431",
	},
	{
		address: "D7rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		balance: 2000,
		path: "3431432",
	},
	{
		address: "D6rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		balance: 3000,
		path: "3431433",
	},
	{
		address: "D5rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		balance: 4000,
		path: "3431434",
	},
	{
		address: "D4rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		balance: 5000,
		path: "3431435",
	},
	{
		address: "D3rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		balance: 6000,
		path: "3431436",
	},
	{
		address: "D2rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		balance: 7000,
		path: "3431437",
	},
];

describe("LedgerScanStep", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let publicKeyPaths: Map<string, string>;

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();
		await wallet.synchroniser().identity();

		server.use(
			requestMockOnce("https://ark-test.arkvault.io/api/wallets", {
				data: [
					{
						address: "DJpFwW39QnQvQRQJF2MCfAoKvsX4DJ28jq",
						balance: "2",
					},
				],
				meta: {},
			}),
			requestMockOnce("https://ark-test.arkvault.io/api/wallets", {
				data: [
					{
						address: "DSyG9hK9CE8eyfddUoEvsga4kNVQLdw2ve",
						balance: "3",
					},
				],
				meta: {},
			}),
			requestMock("https://ark-test.arkvault.io/api/wallets", { data: [], meta: {} }),
		);

		publicKeyPaths = new Map([
			["m/44'/1'/0'/0/0", "027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"],
			["m/44'/1'/0'/0/1", "03d3fdad9c5b25bf8880e6b519eb3611a5c0b31adebc8455f0e096175b28321aff"],
			["m/44'/1'/0'/0/2", "025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca"],
			["m/44'/1'/0'/0/3", "024d5eacc5e05e1b05c476b367b7d072857826d9b271e07d3a3327224db8892a21"],
			["m/44'/1'/0'/0/4", "025d7298a7a472b1435e40df13491e98609b9b555bf3ef452b2afea27061d11235"],

			["m/44'/1'/0'/0/0", "027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"],
			["m/44'/1'/1'/0/0", wallet.publicKey()!],
			["m/44'/1'/2'/0/0", "020aac4ec02d47d306b394b79d3351c56c1253cd67fe2c1a38ceba59b896d584d1"],
			["m/44'/1'/3'/0/0", "033a5474f68f92f254691e93c06a2f22efaf7d66b543a53efcece021819653a200"],
			["m/44'/1'/4'/0/0", "03d3c6889608074b44155ad2e6577c3368e27e6e129c457418eb3e5ed029544e8d"],
		]);

		vi.spyOn(wallet.coin().ledger(), "getPublicKey").mockImplementation((path) =>
			Promise.resolve(publicKeyPaths.get(path)!),
		);

		vi.spyOn(wallet.coin().ledger(), "getExtendedPublicKey").mockResolvedValue(wallet.publicKey()!);

		vi.spyOn(wallet.coin().ledger(), "scan").mockImplementation(({ onProgress }) => {
			onProgress(wallet);
			return {
				"m/44'/1'/0'/0/0": wallet.toData(),
			};
		});

		vi.spyOn(profile.wallets(), "findByAddressWithNetwork").mockImplementation(() => {});
	});

	const Component = ({ isCancelling = false }: { isCancelling?: boolean }) => {
		formReference = useForm({
			defaultValues: {
				network: wallet.network(),
			},
		});

		return (
			<FormProvider {...formReference}>
				<LedgerScanStep profile={profile} cancelling={isCancelling} />
			</FormProvider>
		);
	};

	it("should show message for 1 or more loaded wallets", () => {
		expect(
			showLoadedLedgerWalletsMessage([
				{ address: wallet.address(), balance: 1 },
				{ address: profile.wallets().last().address(), balance: 2 },
			]),
		).toMatchInlineSnapshot(`
			<Trans
			  i18nKey="WALLETS.PAGE_IMPORT_WALLET.LEDGER_SCAN_STEP.LOADED_WALLETS"
			  values={
			    {
			      "count": 2,
			    }
			  }
			/>
		`);

		expect(showLoadedLedgerWalletsMessage([{ address: wallet.address(), balance: 1 }])).toMatchInlineSnapshot(`
			<Trans
			  i18nKey="WALLETS.PAGE_IMPORT_WALLET.LEDGER_SCAN_STEP.LOADED_SINGLE_WALLET"
			/>
		`);
	});

	it("should handle select in mobile", async () => {
		render(<Component />);

		userEvent.click(screen.getByTestId("LedgerScanStep__select-all-mobile"));

		await waitFor(() => {
			expect(screen.getAllByRole("checkbox", { checked: true })).toHaveLength(4);
		});

		// Unselect All

		userEvent.click(screen.getByTestId("LedgerScanStep__select-all"));

		await waitFor(() => expect(screen.getAllByRole("checkbox", { checked: false })).toHaveLength(4));

		// Select just first

		userEvent.click(screen.getAllByRole("checkbox")[1]);

		await waitFor(() => expect(formReference.getValues("wallets")).toHaveLength(1));

		userEvent.click(screen.getAllByRole("checkbox")[1]);

		await waitFor(() => expect(formReference.getValues("wallets")).toHaveLength(0));
	});

	it("should handle select in desktop", async () => {
		global.innerWidth = 1024;

		render(<Component />);

		await userEvent.click(screen.getAllByRole("checkbox")[0]);

		await waitFor(() => {
			expect(screen.getAllByRole("checkbox", { checked: true })).toHaveLength(4);
		});

		await userEvent.click(screen.getAllByRole("checkbox")[0]);

		await waitFor(() => expect(formReference.getValues("wallets")).toHaveLength(0));
	});

	it("should render ledger table in scanning mode", () => {
		render(
			<LedgerTable
				wallets={[]}
				selectedWallets={[]}
				isScanningMore
				isSelected={() => false}
				network={profile.wallets().first().network()}
			/>,
		);
		expect(screen.getByTestId("LedgerScanStep__scan-more")).toMatchSnapshot();
	});

	it('should not render ledger table with "Show All" button in mobile view', () => {
		render(
			<LedgerTable
				wallets={[]}
				selectedWallets={[]}
				isScanningMore
				isSelected={() => false}
				network={profile.wallets().first().network()}
			/>,
		);

		expect(screen.queryByTestId("LedgerScanStep__load-more")).not.toBeInTheDocument();
	});

	it('should render ledger table with "Show All" button in desktop view', () => {
		// set the window width to desktop
		global.innerWidth = 1024;

		render(
			<LedgerTable
				wallets={sampleLedgerData}
				selectedWallets={[]}
				isScanningMore
				isSelected={() => false}
				network={profile.wallets().first().network()}
			/>,
		);

		expect(screen.getByTestId("LedgerScanStep__load-more")).toBeInTheDocument();
	});

	it.each(["xs", "lg"])("should render responsive (%s))", async (breakpoint) => {
		const { container } = renderResponsive(<Component />, breakpoint);

		await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(6));

		await waitFor(() =>
			expect(formReference.getValues("wallets")).toMatchObject([
				{
					address: wallet.address(),
					balance: wallet.balance(),
					path: "m/44'/1'/0'/0/0",
				},
			]),
		);

		const checkboxSelectAll = screen.getAllByRole("checkbox")[0];
		const checkboxFirstItem = screen.getAllByRole("checkbox")[1];

		userEvent.click(checkboxSelectAll);

		await waitFor(() => expect(formReference.getValues("wallets")).toMatchObject([]));

		userEvent.click(checkboxSelectAll);

		await waitFor(validLedgerWallet);

		userEvent.click(checkboxFirstItem);

		await waitFor(() => expect(formReference.getValues("wallets")).toMatchObject([]));

		userEvent.click(checkboxFirstItem);

		await waitFor(validLedgerWallet);

		expect(container).toMatchSnapshot();
	});

	it("should render compact table", async () => {
		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, true);

		const { container } = render(<Component />);

		expect(screen.getAllByRole("row")).toHaveLength(6);

		await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(2));

		expect(container).toMatchSnapshot();

		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, false);
	});

	it("should update the toast messages if already added", async () => {
		const toastUpdateSpy = vi.spyOn(toasts, "update");

		vi.spyOn(toasts, "isActive").mockReturnValueOnce(false);

		vi.spyOn(toasts, "isActive").mockReturnValueOnce(true);

		render(<Component />);

		await waitFor(() => {
			expect(screen.getAllByRole("checkbox", { checked: true })).toHaveLength(4);
		});

		expect(screen.getAllByText("D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD")).toHaveLength(2);

		expect(toastUpdateSpy).toHaveBeenCalledTimes(1);

		expect(toastUpdateSpy).toHaveBeenCalledWith("wallet-loading", "success", expect.anything());

		vi.restoreAllMocks();
	});

	it("should render cancelling screen", async () => {
		const { container } = render(<Component isCancelling />);
		// eslint-disable-next-line testing-library/prefer-explicit-assert
		await screen.findByTestId("LedgerCancellingScreen");

		expect(container).toMatchSnapshot();
	});
});
