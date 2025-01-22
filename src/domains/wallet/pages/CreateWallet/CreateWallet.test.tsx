/* eslint-disable @typescript-eslint/require-await */
import { BIP39 } from "@ardenthq/sdk-cryptography";
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";
import { CreateWallet } from "./CreateWallet";
import * as randomWordPositionsMock from "@/domains/wallet/components/MnemonicVerification/utils/randomWordPositions";
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

let profile: Contracts.IProfile;
let bip39GenerateMock: any;

const fixtureProfileId = getDefaultProfileId();
const passphrase = "power return attend drink piece found tragic fire liar page disease combine";
const encryptionPassword = "S3cUrePa$sword";

const continueButton = () => screen.getByTestId("CreateWallet__continue-button");

describe("CreateWallet", () => {
	let resetProfileNetworksMock: () => void;

	beforeAll(() => {
		bip39GenerateMock = vi.spyOn(BIP39, "generate").mockReturnValue(passphrase);

		vi.spyOn(randomWordPositionsMock, "randomWordPositions").mockReturnValue([1, 2, 3]);
	});

	afterAll(() => {
		bip39GenerateMock.mockRestore();
	});

	beforeEach(() => {
		profile = env.profiles().findById(fixtureProfileId);

		for (const wallet of profile.wallets().values()) {
			profile.wallets().forget(wallet.id());
		}

		bip39GenerateMock = vi.spyOn(BIP39, "generate").mockReturnValue(passphrase);

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

		const backButton = await screen.findByTestId("CreateWallet__back-button");

		const historySpy = vi.spyOn(history, "push").mockImplementation(() => {});

		expect(backButton).toBeEnabled();

		await userEvent.click(backButton);

		await waitFor(() => {
			expect(historySpy).toHaveBeenCalledWith(`/profiles/${fixtureProfileId}/dashboard`);
		});

		await userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton()).toBeDisabled());

		await userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await userEvent.click(continueButton());

		await waitFor(() => expect(profile.wallets().values()).toHaveLength(0));

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		await userEvent.click(backButton);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		await userEvent.click(backButton);

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		const [firstInput, secondInput, thirdInput] = screen.getAllByTestId("MnemonicVerificationInput__input");
		await userEvent.click(screen.getByTestId("CreateWallet__ConfirmPassphraseStep__passphraseDisclaimer"));
		await userEvent.clear(firstInput);
		await userEvent.type(firstInput, "power");
		await userEvent.clear(secondInput);
		await userEvent.type(secondInput, "return");
		await userEvent.clear(thirdInput);
		await userEvent.type(thirdInput, "attend");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		expect(profile.wallets().values()).toHaveLength(0);

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__SuccessStep")).resolves.toBeVisible();

		expect(profile.wallets().values()).toHaveLength(1);

		await userEvent.click(screen.getByTestId("CreateWallet__edit-alias"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("UpdateWalletName__input"));
		await userEvent.type(screen.getByTestId("UpdateWalletName__input"), "test alias");

		await waitFor(() => expect(screen.getByTestId("UpdateWalletName__submit")).toBeEnabled());

		await userEvent.click(screen.getByTestId("UpdateWalletName__submit"));

		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());

		await userEvent.click(screen.getByTestId("CreateWallet__finish-button"));

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

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		const backButton = await screen.findByTestId("CreateWallet__back-button");

		const historySpy = vi.spyOn(history, "push").mockImplementation(() => {});

		expect(backButton).toBeEnabled();

		await userEvent.click(backButton);

		await waitFor(() => {
			expect(historySpy).toHaveBeenCalledWith(`/profiles/${fixtureProfileId}/dashboard`);
		});

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

		const backButton = await screen.findByTestId("CreateWallet__back-button");

		const historySpy = vi.spyOn(history, "push").mockImplementation(() => {});

		expect(backButton).toBeEnabled();

		await userEvent.click(backButton);

		await waitFor(() => {
			expect(historySpy).toHaveBeenCalledWith(`/profiles/${fixtureProfileId}/dashboard`);
		});

		await userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton()).toBeDisabled());

		await userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await userEvent.click(continueButton());

		await waitFor(() => expect(profile.wallets().values()).toHaveLength(0));

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		await userEvent.click(backButton);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		const steps = within(screen.getByTestId("Form")).getAllByRole("list")[0];

		expect(within(steps).getAllByRole("listitem")).toHaveLength(4);

		await userEvent.click(screen.getByTestId("CreateWallet__encryption-toggle"));

		expect(within(steps).getAllByRole("listitem")).toHaveLength(4);

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		await userEvent.click(backButton);

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		const [firstInput, secondInput, thirdInput] = screen.getAllByTestId("MnemonicVerificationInput__input");
		await userEvent.click(screen.getByTestId("CreateWallet__ConfirmPassphraseStep__passphraseDisclaimer"));
		await userEvent.clear(firstInput);
		await userEvent.type(firstInput, "power");
		await userEvent.clear(secondInput);
		await userEvent.type(secondInput, "return");
		await userEvent.clear(thirdInput);
		await userEvent.type(thirdInput, "attend");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("EncryptPassword")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("PasswordValidation__encryptionPassword"));
		await userEvent.type(screen.getByTestId("PasswordValidation__encryptionPassword"), encryptionPassword);
		await userEvent.clear(screen.getByTestId("PasswordValidation__confirmEncryptionPassword"));
		await userEvent.type(screen.getByTestId("PasswordValidation__confirmEncryptionPassword"), encryptionPassword);

		await expect(screen.findByTestId("PasswordValidation__encryptionPassword")).resolves.toHaveValue(
			encryptionPassword,
		);
		await expect(screen.findByTestId("PasswordValidation__confirmEncryptionPassword")).resolves.toHaveValue(
			encryptionPassword,
		);

		const continueEncryptionButton = screen.getByTestId("CreateWallet__continue-encryption-button");

		await waitFor(() => expect(continueEncryptionButton).toBeEnabled());

		await userEvent.click(continueEncryptionButton);

		await expect(screen.findByTestId("CreateWallet__SuccessStep")).resolves.toBeVisible();

		expect(profile.wallets().values()).toHaveLength(1);

		await userEvent.click(screen.getByTestId("CreateWallet__finish-button"));

		const wallet = profile.wallets().first();

		expect(wallet.alias()).toBe("ARK Devnet #1");

		await waitFor(() =>
			expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`),
		);

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

		expect(asFragment()).toMatchSnapshot();

		await userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("CreateWallet__back-button"));

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		history.push("/");

		await waitFor(() => expect(profile.wallets().values()).toHaveLength(0));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should show an error message if wallet generation failed", async () => {
		bip39GenerateMock.mockRestore();
		bip39GenerateMock = vi.spyOn(BIP39, "generate").mockImplementation(() => {
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

		await userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await userEvent.click(continueButton());

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

		await userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton()).toBeDisabled());

		await userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__WalletOverviewStep")).resolves.toBeVisible();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__ConfirmPassphraseStep")).resolves.toBeVisible();

		const [firstInput, secondInput, thirdInput] = screen.getAllByTestId("MnemonicVerificationInput__input");
		await userEvent.click(screen.getByTestId("CreateWallet__ConfirmPassphraseStep__passphraseDisclaimer"));
		await userEvent.clear(firstInput);
		await userEvent.type(firstInput, "power");
		await userEvent.clear(secondInput);
		await userEvent.type(secondInput, "return");
		await userEvent.clear(thirdInput);
		await userEvent.type(thirdInput, "attend");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("CreateWallet__SuccessStep")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("CreateWallet__edit-alias"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("UpdateWalletName__input"));
		await userEvent.type(screen.getByTestId("UpdateWalletName__input"), "Test");

		await waitFor(() => expect(screen.getByTestId("UpdateWalletName__submit")).toBeDisabled());

		await userEvent.click(screen.getByTestId("UpdateWalletName__cancel"));

		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());
	});
});
