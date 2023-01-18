import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { createHashHistory } from "history";
import { Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { MigrationConnectStep } from "./MigrationConnectStep";
import { translations as migrationTranslations } from "@/domains/migration/i18n";
import { migrationMinBalance, migrationTransactionFee } from "@/utils/polygon-migration";
import { render, screen, env, getDefaultProfileId, waitFor } from "@/utils/testing-library";
import { Form } from "@/app/components/Form";
import * as useMetaMask from "@/domains/migration/hooks/use-meta-mask";
import { useMigrationForm } from "@/domains/migration/hooks";

let profile: Contracts.IProfile;

const history = createHashHistory();

const WrapperForm = ({ children }: { children: React.ReactElement }) => {
	const form = useMigrationForm();

	return (
		<Form className="mx-auto max-w-xl" context={form}>
			{children}
		</Form>
	);
};

const renderComponent = (profileId = profile.id()) => {
	const migrationUrl = `/profiles/${profileId}/migration/add`;
	history.push(migrationUrl);

	return render(
		<Route path="/profiles/:profileId/migration/add">
			<WrapperForm>
				<MigrationConnectStep />
			</WrapperForm>
		</Route>,
		{
			history,
			route: migrationUrl,
		},
	);
};

describe("MigrationConnectStep", () => {
	let wallet: Contracts.IReadWriteWallet;
	let arkMainnetWalletSpy: any;

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());

		wallet = profile.wallets().first();
	});

	it("should render ", () => {
		renderComponent();
		expect(screen.getByText(migrationTranslations.MIGRATION_ADD.STEP_CONNECT.FORM.ARK_ADDRESS)).toBeInTheDocument();
		expect(
			screen.getByText(migrationTranslations.MIGRATION_ADD.STEP_CONNECT.FORM.AMOUNT_YOU_SEND),
		).toBeInTheDocument();
		expect(
			screen.getByText(migrationTranslations.MIGRATION_ADD.STEP_CONNECT.FORM.POLYGON_MIGRATION_ADDRESS),
		).toBeInTheDocument();
		expect(
			screen.getByText(migrationTranslations.MIGRATION_ADD.STEP_CONNECT.FORM.AMOUNT_YOU_GET),
		).toBeInTheDocument();
	});

	it("should show a message when account is not on polygon network", async () => {
		const useMetaMaskMock = vi.spyOn(useMetaMask, "useMetaMask").mockReturnValue({
			account: "0x0000000000000000000000000000000000000000",
			connectWallet: vi.fn(),
			connecting: false,
			isOnValidNetwork: false,
			needsMetaMask: false,
			supportsMetaMask: true,
		});

		renderComponent();

		await expect(screen.findByTestId("MigrationStep__wrongnetwork")).resolves.toBeVisible();

		expect(screen.getByTestId("MigrationStep__switchtopolygon")).toBeVisible();

		useMetaMaskMock.mockRestore();
	});

	it("should show a switching message", async () => {
		const useMetaMaskMock = vi.spyOn(useMetaMask, "useMetaMask").mockReturnValue({
			account: "0x0000000000000000000000000000000000000000",
			connectWallet: vi.fn(),
			connecting: false,
			isOnValidNetwork: false,
			needsMetaMask: false,
			supportsMetaMask: true,
			switching: true,
		});

		renderComponent();

		await expect(screen.findByTestId("MigrationStep__wrongnetwork")).resolves.toBeVisible();

		expect(screen.getByTestId("MigrationStep__switching")).toBeVisible();

		useMetaMaskMock.mockRestore();
	});

	it("install metamask button opens the download page", async () => {
		const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => null);

		const useMetaMaskMock = vi.spyOn(useMetaMask, "useMetaMask").mockReturnValue({
			account: "0x0000000000000000000000000000000000000000",
			connectWallet: vi.fn(),
			connecting: false,
			isOnValidNetwork: true,
			needsMetaMask: true,
			supportsMetaMask: true,
		});

		renderComponent();

		await expect(screen.findByTestId("MigrationConnectStep__metamask-button")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("MigrationConnectStep__metamask-button"));

		expect(windowOpenSpy).toHaveBeenCalledWith("https://metamask.io/download/", "_blank");

		windowOpenSpy.mockRestore();

		useMetaMaskMock.mockRestore();
	});

	describe("with valid wallets", () => {
		beforeAll(() => {
			arkMainnetWalletSpy = vi
				.spyOn(wallet, "balance")
				.mockReturnValue(migrationMinBalance() + migrationTransactionFee());
		});

		afterAll(() => {
			arkMainnetWalletSpy.mockRestore();
		});

		it("should enable polygon field if has metamask, is in polygon network and has an account", async () => {
			const useMetaMaskMock = vi.spyOn(useMetaMask, "useMetaMask").mockReturnValue({
				account: "0x0000000000000000000000000000000000000000",
				connectWallet: vi.fn(),
				connecting: false,
				isOnValidNetwork: true,
				needsMetaMask: false,
				supportsMetaMask: true,
			});

			renderComponent();

			await expect(screen.findByTestId("SelectPolygonAddress")).resolves.toBeVisible();

			useMetaMaskMock.mockRestore();
		});

		it("should disable polygon field if does not has metamask", async () => {
			const useMetaMaskMock = vi.spyOn(useMetaMask, "useMetaMask").mockReturnValue({
				account: "0x0000000000000000000000000000000000000000",
				connectWallet: vi.fn(),
				connecting: false,
				isOnValidNetwork: false,
				needsMetaMask: true,
				supportsMetaMask: true,
			});

			renderComponent();

			await expect(screen.findByTestId("MigrationStep__polygon-disabled")).resolves.toBeVisible();

			useMetaMaskMock.mockRestore();
		});

		it("should disable polygon field if metamask is not supported", async () => {
			const useMetaMaskMock = vi.spyOn(useMetaMask, "useMetaMask").mockReturnValue({
				account: "0x0000000000000000000000000000000000000000",
				connectWallet: vi.fn(),
				connecting: false,
				isOnValidNetwork: false,
				needsMetaMask: true,
				supportsMetaMask: false,
			});

			renderComponent();

			await expect(screen.findByTestId("MigrationStep__polygon-disabled")).resolves.toBeVisible();

			useMetaMaskMock.mockRestore();
		});

		it("should disable polygon if has metamask, is in the correct network but no account is selected", async () => {
			const useMetaMaskMock = vi.spyOn(useMetaMask, "useMetaMask").mockReturnValue({
				account: null,
				connectWallet: vi.fn(),
				connecting: false,
				isOnValidNetwork: true,
				needsMetaMask: false,
				supportsMetaMask: true,
			});

			renderComponent();

			await expect(screen.findByTestId("MigrationStep__polygon-disabled")).resolves.toBeVisible();

			useMetaMaskMock.mockRestore();
		});

		it("should show spinner while connecting", async () => {
			const useMetaMaskMock = vi.spyOn(useMetaMask, "useMetaMask").mockReturnValue({
				account: "0x0000000000000000000000000000000000000000",
				connectWallet: vi.fn(),
				connecting: true,
				isOnValidNetwork: true,
				needsMetaMask: true,
				supportsMetaMask: true,
			});

			renderComponent();

			await expect(screen.findByTestId("MigrationStep__connecting")).resolves.toBeVisible();

			useMetaMaskMock.mockRestore();
		});

		it("should include mainnet wallets with enough balance", () => {
			renderComponent();

			expect(screen.getByTestId("SelectAddress__input")).not.toBeDisabled();
		});

		it("selects a wallet address", async () => {
			renderComponent();

			userEvent.click(screen.getByTestId("SelectAddress__wrapper"));

			await expect(screen.findByTestId("SearchWalletListItem__select-0")).resolves.toBeVisible();

			userEvent.click(screen.getByTestId("SearchWalletListItem__select-0"));

			await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));
		});
	});

	describe("with invalid wallets", () => {
		beforeAll(() => {
			arkMainnetWalletSpy = vi.spyOn(wallet, "balance").mockReturnValue(0.003);
			vi.spyOn(profile.wallets(), "findByCoinWithNetwork").mockReturnValue([wallet]);
		});

		afterAll(() => {
			arkMainnetWalletSpy.mockRestore();
		});

		it("should not include wallets without balance", () => {
			renderComponent();

			expect(screen.getByTestId("SelectAddress__input")).toBeDisabled();
		});

		it("should validate the wallet if using a different transaction fee from the env", () => {
			process.env.VITE_POLYGON_MIGRATION_TRANSACTION_FEE = "0.01";

			renderComponent();

			expect(screen.getByTestId("SelectAddress__input")).toBeDisabled();
		});
	});
});
