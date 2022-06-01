/* eslint-disable @typescript-eslint/require-await */
import { BIP39 } from "@payvo/sdk-cryptography";
import { Contracts } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { CreateWallet } from "./CreateWallet";
import { translations as walletTranslations } from "@/domains/wallet/i18n";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	waitFor,
	within,
	mockProfileWithPublicAndTestNetworks,
	mockProfileWithOnlyPublicNetworks,
} from "@/utils/testing-library";

jest.setTimeout(30_000);

let profile: Contracts.IProfile;
let bip39GenerateMock: any;

const fixtureProfileId = getDefaultProfileId();
const passphrase = "power return attend drink piece found tragic fire liar page disease combine";

const continueButton = () => screen.getByTestId("CreateWallet__continue-button");

const ARKDevnet = "ARK Devnet";

describe("CreateWallet", () => {
	let resetProfileNetworksMock: () => void;

	beforeAll(() => {
		bip39GenerateMock = jest.spyOn(BIP39, "generate").mockReturnValue(passphrase);
	});

	afterAll(() => {
		bip39GenerateMock.mockRestore();
	});

	beforeEach(() => {
		profile = env.profiles().findById(fixtureProfileId);

		for (const wallet of profile.wallets().values()) {
			profile.wallets().forget(wallet.id());
		}

		bip39GenerateMock = jest.spyOn(BIP39, "generate").mockReturnValue(passphrase);

		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		bip39GenerateMock.mockRestore();

		resetProfileNetworksMock();
	});

	it("should create a wallet", async () => {
		const history = createHashHistory();
		const createURL = `/profiles/${fixtureProfileId}/wallets/create`;
		history.push(createURL);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/wallets/create">
				<CreateWallet />
			</Route>,
			{
				history,
				route: createURL,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");
		const backButton = screen.getByTestId("CreateWallet__back-button");

		const historySpy = jest.spyOn(history, "push").mockImplementation();

		expect(backButton).toBeEnabled();

		userEvent.click(backButton);

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${fixtureProfileId}/dashboard`);

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(selectNetworkInput).toHaveValue(ARKDevnet));

		expect(continueButton()).toBeEnabled();

		userEvent.clear(selectNetworkInput);

		await waitFor(() => expect(selectNetworkInput).not.toHaveValue());

		expect(continueButton()).toBeDisabled();

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(selectNetworkInput).toHaveValue(ARKDevnet));

		expect(continueButton()).toBeEnabled();

		userEvent.click(continueButton());

		await waitFor(() => expect(profile.wallets().values()).toHaveLength(0));

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		userEvent.click(backButton);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		userEvent.click(backButton);

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		const walletMnemonic = passphrase.split(" ");
		for (let index = 0; index < 3; index++) {
			const wordNumber = Number.parseInt(screen.getByText(/Select the/).innerHTML.replace(/Select the/, ""));

			userEvent.click(screen.getByText(walletMnemonic[wordNumber - 1]));
			if (index < 2) {
				await waitFor(() => expect(screen.queryAllByText(/The #(\d+) word/).length === 2 - index));
			}
		}
		await waitFor(() => expect(continueButton()).toBeEnabled());

		expect(profile.wallets().values()).toHaveLength(0);

		userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__SuccessStep")).resolves.toBeVisible();

		expect(profile.wallets().values()).toHaveLength(1);

		userEvent.click(screen.getByTestId("CreateWallet__edit-alias"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		userEvent.clear(screen.getByTestId("UpdateWalletName__input"));
		userEvent.paste(screen.getByTestId("UpdateWalletName__input"), "test alias");

		await waitFor(() => expect(screen.getByTestId("UpdateWalletName__submit")).toBeEnabled());

		userEvent.click(screen.getByTestId("UpdateWalletName__submit"));

		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());

		userEvent.click(screen.getByTestId("CreateWallet__finish-button"));

		const wallet = profile.wallets().first();

		expect(wallet.alias()).toBe("test alias");

		await waitFor(() =>
			expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`),
		);

		expect(asFragment()).toMatchSnapshot();

		historySpy.mockRestore();
	});

	it("should skip the network selection step if only one network", async () => {
		resetProfileNetworksMock();

		resetProfileNetworksMock = mockProfileWithOnlyPublicNetworks(profile);

		const history = createHashHistory();
		const createURL = `/profiles/${fixtureProfileId}/wallets/create`;
		history.push(createURL);

		render(
			<Route path="/profiles/:profileId/wallets/create">
				<CreateWallet />
			</Route>,
			{
				history,
				route: createURL,
			},
		);

		const backButton = screen.getByTestId("CreateWallet__back-button");

		const historySpy = jest.spyOn(history, "push").mockImplementation();

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		await waitFor(() => expect(backButton).toBeEnabled());

		userEvent.click(backButton);

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${fixtureProfileId}/dashboard`);

		historySpy.mockRestore();

		resetProfileNetworksMock();
	});

	it("should create a wallet with encryption", async () => {
		const history = createHashHistory();
		const createURL = `/profiles/${fixtureProfileId}/wallets/create`;
		history.push(createURL);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/wallets/create">
				<CreateWallet />
			</Route>,
			{
				history,
				route: createURL,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");
		const backButton = screen.getByTestId("CreateWallet__back-button");

		const historySpy = jest.spyOn(history, "push").mockImplementation();

		expect(backButton).toBeEnabled();

		userEvent.click(backButton);

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${fixtureProfileId}/dashboard`);

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(selectNetworkInput).toHaveValue(ARKDevnet));

		expect(continueButton()).toBeEnabled();

		userEvent.clear(selectNetworkInput);

		await waitFor(() => expect(selectNetworkInput).not.toHaveValue());

		expect(continueButton()).toBeDisabled();

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(selectNetworkInput).toHaveValue(ARKDevnet));

		expect(continueButton()).toBeEnabled();

		userEvent.click(continueButton());

		await waitFor(() => expect(profile.wallets().values()).toHaveLength(0));

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		userEvent.click(backButton);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		const steps = within(screen.getByTestId("Form")).getAllByRole("list")[0];

		expect(within(steps).getAllByRole("listitem")).toHaveLength(4);

		userEvent.click(screen.getByTestId("CreateWallet__encryption-toggle"));

		expect(within(steps).getAllByRole("listitem")).toHaveLength(5);

		userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		userEvent.click(backButton);

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		const walletMnemonic = passphrase.split(" ");
		for (let index = 0; index < 3; index++) {
			const wordNumber = Number.parseInt(screen.getByText(/Select the/).innerHTML.replace(/Select the/, ""));

			userEvent.click(screen.getByText(walletMnemonic[wordNumber - 1]));
			if (index < 2) {
				await waitFor(() => expect(screen.queryAllByText(/The #(\d+) word/).length === 2 - index));
			}
		}
		await waitFor(() => expect(continueButton()).toBeEnabled());

		userEvent.click(continueButton());

		await expect(screen.findByTestId("EncryptPassword")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("PasswordValidation__encryptionPassword"), "S3cUrePa$sword");
		userEvent.paste(screen.getByTestId("PasswordValidation__confirmEncryptionPassword"), "S3cUrePa$sword");

		const continueEncryptionButton = screen.getByTestId("CreateWallet__continue-encryption-button");

		await waitFor(() => expect(continueEncryptionButton).toBeEnabled());

		userEvent.click(continueEncryptionButton);

		await expect(screen.findByTestId("CreateWallet__SuccessStep")).resolves.toBeVisible();

		expect(profile.wallets().values()).toHaveLength(1);

		userEvent.click(screen.getByTestId("CreateWallet__finish-button"));

		const wallet = profile.wallets().first();

		expect(wallet.alias()).toBe("ARK Devnet #1");

		await waitFor(() =>
			expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`),
		);

		expect(asFragment()).toMatchSnapshot();

		historySpy.mockRestore();
	});

	it("should not have a pending wallet if leaving on step 1", async () => {
		const history = createHashHistory();
		const createURL = `/profiles/${fixtureProfileId}/wallets/create`;
		history.push(createURL);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/wallets/create">
				<CreateWallet />
			</Route>,
			{
				history,
				route: createURL,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		history.push("/");
		await waitFor(() => expect(profile.wallets().values()).toHaveLength(0));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should remove pending wallet if not submitted", async () => {
		const history = createHashHistory();
		const createURL = `/profiles/${fixtureProfileId}/wallets/create`;
		history.push(createURL);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/wallets/create">
				<CreateWallet />
			</Route>,
			{
				history,
				route: createURL,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		expect(asFragment()).toMatchSnapshot();

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("CreateWallet__back-button"));

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		history.push("/");

		await waitFor(() => expect(profile.wallets().values()).toHaveLength(0));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should show an error message if wallet generation failed", async () => {
		bip39GenerateMock.mockRestore();
		bip39GenerateMock = jest.spyOn(BIP39, "generate").mockImplementation(() => {
			throw new Error("test");
		});

		const history = createHashHistory();
		const createURL = `/profiles/${fixtureProfileId}/wallets/create`;
		history.push(createURL);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/wallets/create">
				<CreateWallet />
			</Route>,
			{
				history,
				route: createURL,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);

		await waitFor(() => {
			expect(continueButton()).toBeEnabled();
		});

		userEvent.click(continueButton());

		await expect(
			screen.findByText(walletTranslations.PAGE_CREATE_WALLET.NETWORK_STEP.GENERATION_ERROR),
		).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		bip39GenerateMock.mockRestore();
	});

	it("should show an error message for duplicate name", async () => {
		const wallet = await profile.walletFactory().fromAddress({
			address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
			coin: "ARK",
			network: "ark.devnet",
		});

		profile.wallets().push(wallet);
		wallet.settings().set(Contracts.WalletSetting.Alias, "Test");

		const history = createHashHistory();
		const createURL = `/profiles/${fixtureProfileId}/wallets/create`;
		history.push(createURL);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/wallets/create">
				<CreateWallet />
			</Route>,
			{
				history,
				route: createURL,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		userEvent.clear(selectNetworkInput);

		await waitFor(() => expect(continueButton()).toBeDisabled());

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		const walletMnemonic = passphrase.split(" ");
		for (let index = 0; index < 3; index++) {
			const wordNumber = Number.parseInt(screen.getByText(/Select the/).innerHTML.replace(/Select the/, ""));

			userEvent.click(screen.getByText(walletMnemonic[wordNumber - 1]));
			if (index < 2) {
				await waitFor(() => expect(screen.queryAllByText(/The #(\d+) word/).length === 2 - index));
			}
		}
		await waitFor(() => expect(continueButton()).toBeEnabled());

		userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__SuccessStep")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("CreateWallet__edit-alias"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("UpdateWalletName__input"), "Test");

		await waitFor(() => expect(screen.getByTestId("UpdateWalletName__submit")).toBeDisabled());

		userEvent.click(screen.getByTestId("UpdateWalletName__cancel"));

		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());
	});
});
