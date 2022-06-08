/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/require-await */
import { Contracts, Wallet } from "@payvo/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import nock from "nock";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { ImportWallet } from "./ImportWallet";
import { MethodStep } from "./MethodStep";
import { SuccessStep } from "./SuccessStep";
import { EnvironmentProvider, LedgerProvider } from "@/app/contexts";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { toasts } from "@/app/services";
import { NetworkStep } from "@/domains/wallet/components/NetworkStep";
import { OptionsValue } from "@/domains/wallet/hooks/use-import-options";
import { translations as walletTranslations } from "@/domains/wallet/i18n";
import { assertNetwork } from "@/utils/assertions";
import {
	env,
	getDefaultProfileId,
	MNEMONICS,
	render,
	renderWithForm,
	screen,
	waitFor,
	within,
	mockNanoXTransport,
	mockProfileWithPublicAndTestNetworks,
	mockProfileWithOnlyPublicNetworks,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;
const fixtureProfileId = getDefaultProfileId();

const identityAddress = "DC8ghUdhS8w8d11K8cFQ37YsLBFhL3Dq2P";
const mnemonic = "buddy year cost vendor honey tonight viable nut female alarm duck symptom";
const randomAddress = "D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib";
const randomPublicKey = "034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192";
const randomPublicKeyInvalid = "a34151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192";

const route = `/profiles/${fixtureProfileId}/wallets/import`;
const routeLedger = `/profiles/${fixtureProfileId}/wallets/import/ledger`;
const history = createHashHistory();

jest.setTimeout(30_000);

const enableEncryptionToggle = () => userEvent.click(screen.getByTestId("ImportWallet__encryption-toggle"));
const continueButton = () => screen.getByTestId("ImportWallet__continue-button");
const backButton = () => screen.getByTestId("ImportWallet__back-button");
const mnemonicInput = () => screen.getByTestId("ImportWallet__mnemonic-input");
const addressInput = () => screen.findByTestId("ImportWallet__address-input");
const finishButton = () => screen.getByTestId("ImportWallet__finish-button");
const successStep = () => screen.getByTestId("ImportWallet__success-step");
const methodStep = () => screen.getByTestId("ImportWallet__method-step");
const publicKeyInput = () => screen.getByTestId("ImportWallet__publicKey-input");
const privateKeyInput = () => screen.getByTestId("ImportWallet__privatekey-input");
const wifInput = () => screen.getByTestId("ImportWallet__wif-input");
const encryptedWifInput = () => screen.getByTestId("ImportWallet__encryptedWif-input");

const secretInputID = "ImportWallet__secret-input";
const errorText = "data-errortext";
const password = "S3cUrePa$sword";
const testNetwork = "ark.devnet";
const ARKDevnet = "ARK Devnet";

describe("ImportWallet", () => {
	let resetProfileNetworksMock: () => void;

	beforeAll(() => {
		nock.disableNetConnect();

		nock("https://ark-test.arkvault.io")
			.get("/api/wallets/DC8ghUdhS8w8d11K8cFQ37YsLBFhL3Dq2P")
			.reply(200, require("tests/fixtures/coins/ark/devnet/wallets/DC8ghUdhS8w8d11K8cFQ37YsLBFhL3Dq2P.json"))
			.persist();
	});

	beforeEach(async () => {
		profile = env.profiles().findById(fixtureProfileId);

		await env.profiles().restore(profile);

		const walletId = profile.wallets().findByAddressWithNetwork(randomAddress, testNetwork)?.id();

		if (walletId) {
			profile.wallets().forget(walletId);
		}

		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should render network step", async () => {
		const { asFragment } = renderWithForm(<NetworkStep profile={profile} title="title" subtitle="subtitle" />);

		expect(screen.getByTestId("NetworkStep")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		expect(selectNetworkInput).toBeInTheDocument();

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);
	});

	it("should render network step without test networks", async () => {
		resetProfileNetworksMock = mockProfileWithOnlyPublicNetworks(profile);

		const { asFragment } = renderWithForm(<NetworkStep profile={profile} title="title" subtitle="subtitle" />);

		expect(screen.getByTestId("NetworkStep")).toBeInTheDocument();

		expect(screen.getByTestId("SelectNetworkInput__input")).toBeInTheDocument();

		expect(screen.getByTestId("NetworkIcon-ARK-ark.mainnet")).toBeInTheDocument();
		expect(screen.queryByTestId("NetworkIcon-ARK-ark.devnet")).toBeNull();

		expect(asFragment()).toMatchSnapshot();

		resetProfileNetworksMock();
	});

	it("should render method step", async () => {
		let form: ReturnType<typeof useForm>;

		const Component = () => {
			const network = env.availableNetworks().find((net) => net.coin() === "ARK" && net.id() === testNetwork);
			assertNetwork(network);

			network.importMethods = () => ({
				bip39: {
					default: false,
					permissions: [],
				},
			});

			form = useForm({
				defaultValues: { network },
			});

			form.register("importOption");
			form.register("network");

			return (
				<EnvironmentProvider env={env}>
					<FormProvider {...form}>
						<MethodStep profile={profile} />
					</FormProvider>
				</EnvironmentProvider>
			);
		};

		history.push(`/profiles/${profile.id()}`);
		const { container } = render(
			<Route path="/profiles/:profileId">
				<Component />
			</Route>,
			{ history, withProviders: false },
		);

		expect(methodStep()).toBeInTheDocument();

		await waitFor(() => expect(mnemonicInput()));

		expect(mnemonicInput()).toBeInTheDocument();

		userEvent.paste(mnemonicInput(), mnemonic);

		await waitFor(() => {
			expect(form.getValues()).toMatchObject({
				importOption: {
					canBeEncrypted: false,
					label: "Mnemonic",
					value: OptionsValue.BIP39,
				},
				value: mnemonic,
			});
		});

		expect(container).toMatchSnapshot();
	});

	it("should be possible to change import type in method step", async () => {
		let form: ReturnType<typeof useForm>;

		const Component = () => {
			const network = env.availableNetworks().find((net) => net.coin() === "ARK" && net.id() === testNetwork);
			assertNetwork(network);

			network.importMethods = () => ({
				address: {
					default: false,
					permissions: [],
				},
				bip39: {
					default: true,
					permissions: [],
				},
			});

			form = useForm({
				defaultValues: { network },
			});

			form.register("importOption");
			form.register("network");

			return (
				<EnvironmentProvider env={env}>
					<FormProvider {...form}>
						<MethodStep profile={profile} />
					</FormProvider>
				</EnvironmentProvider>
			);
		};

		history.push(`/profiles/${profile.id()}`);
		render(
			<Route path="/profiles/:profileId">
				<Component />
			</Route>,
			{ history, withProviders: false },
		);

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByTestId("ImportWallet__mnemonic-input")).resolves.toBeVisible();

		const selectDropdown = screen.getByTestId("SelectDropdown__input");

		userEvent.paste(selectDropdown, "test");

		await waitFor(() => expect(screen.queryByTestId("SelectDropdown__option--0")).not.toBeInTheDocument());

		userEvent.paste(selectDropdown, "addr");

		await expect(screen.findByTestId("SelectDropdown__option--0")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("SelectDropdown__option--0"));

		expect(screen.getByTestId("select-list__input")).toHaveValue("address");

		await expect(addressInput()).resolves.toBeVisible();
	});

	it("should render success step", async () => {
		let form: ReturnType<typeof useForm>;
		const onClickEditAlias = jest.fn();
		const importedWallet = profile.wallets().first();

		const Component = () => {
			form = useForm({
				defaultValues: {
					network: importedWallet.network(),
				},
			});

			return (
				<FormProvider {...form}>
					<SuccessStep importedWallet={importedWallet} onClickEditAlias={onClickEditAlias} />
				</FormProvider>
			);
		};

		const { asFragment } = render(<Component />);

		expect(successStep()).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		expect(screen.getAllByText(ARKDevnet)[0]).toBeInTheDocument();
		expect(screen.getAllByText(importedWallet.address())[0]).toBeInTheDocument();

		userEvent.click(screen.getByTestId("ImportWallet__edit-alias"));

		expect(onClickEditAlias).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should go back to portfolio", async () => {
		const history = createHashHistory();

		const historySpy = jest.spyOn(history, "push").mockImplementation();

		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				history,
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		await waitFor(() => expect(backButton()).toBeEnabled());
		userEvent.click(backButton());

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${fixtureProfileId}/dashboard`);

		historySpy.mockRestore();
	});

	it("should skip network step if only one network", async () => {
		const history = createHashHistory();

		const historySpy = jest.spyOn(history, "push").mockImplementation();

		resetProfileNetworksMock();

		resetProfileNetworksMock = mockProfileWithOnlyPublicNetworks(profile);

		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				history,
				route: route,
			},
		);

		await expect(screen.findByTestId("ImportWallet__method-step")).resolves.toBeVisible();

		await waitFor(() => expect(backButton()).toBeEnabled());
		userEvent.click(backButton());

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${fixtureProfileId}/dashboard`);

		historySpy.mockRestore();
	});

	it("should go to previous step", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => {
			expect(methodStep()).toBeInTheDocument();
		});

		await waitFor(() => expect(backButton()).toBeEnabled());
		userEvent.click(backButton());

		await waitFor(() => {
			expect(screen.getByTestId("NetworkStep")).toBeInTheDocument();
		});
	});

	it("should import by mnemonic", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.keyboard("{enter}");

		await waitFor(() => expect(() => mnemonicInput()).not.toThrow());

		expect(mnemonicInput()).toBeInTheDocument();

		userEvent.paste(mnemonicInput(), mnemonic);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.keyboard("{enter}");

		await waitFor(() => {
			expect(successStep()).toBeInTheDocument();
		});

		userEvent.click(screen.getByTestId("ImportWallet__edit-alias"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("UpdateWalletName__input"), "test alias");

		await waitFor(() => expect(screen.getByTestId("UpdateWalletName__submit")).toBeEnabled());

		userEvent.keyboard("{enter}");
		userEvent.click(screen.getByTestId("UpdateWalletName__submit"));

		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());

		userEvent.click(finishButton());

		await waitFor(() => {
			expect(profile.wallets().findByAddressWithNetwork(identityAddress, testNetwork)).toBeInstanceOf(Wallet);
		});
	});

	it("should import by mnemonic and use encryption password", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		expect(mnemonicInput()).toBeInTheDocument();

		userEvent.paste(mnemonicInput(), MNEMONICS[3]);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		enableEncryptionToggle();

		userEvent.click(continueButton());

		await waitFor(() => {
			expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		});

		userEvent.paste(screen.getByTestId("PasswordValidation__encryptionPassword"), password);
		userEvent.paste(screen.getByTestId("PasswordValidation__confirmEncryptionPassword"), password);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(
			() => {
				expect(successStep()).toBeInTheDocument();
			},
			{ timeout: 15_000 },
		);
	});

	it("should disable the encryption option when selecting a methods without encryption", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		expect(mnemonicInput()).toBeInTheDocument();

		userEvent.paste(mnemonicInput(), MNEMONICS[0]);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		expect(screen.getByTestId("ImportWallet__encryption-toggle")).not.toBeChecked();

		enableEncryptionToggle();

		expect(screen.getByTestId("ImportWallet__encryption-toggle")).toBeChecked();

		// Select address that doesnt accept encryption
		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.ADDRESS)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.ADDRESS));

		await expect(addressInput()).resolves.toBeVisible();

		expect(screen.getByTestId("ImportWallet__encryption-toggle")).not.toBeChecked();
	});

	it("should import by mnemonic with second signature and use password to encrypt both", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		expect(mnemonicInput()).toBeInTheDocument();

		userEvent.paste(mnemonicInput(), MNEMONICS[0]);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		enableEncryptionToggle();

		userEvent.click(continueButton());

		await waitFor(() => {
			expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		});

		userEvent.paste(screen.getByTestId("EncryptPassword__second-mnemonic"), MNEMONICS[5]);

		userEvent.paste(screen.getByTestId("PasswordValidation__encryptionPassword"), password);
		userEvent.paste(screen.getByTestId("PasswordValidation__confirmEncryptionPassword"), password);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(
			() => {
				expect(successStep()).toBeInTheDocument();
			},
			{ timeout: 15_000 },
		);
	});

	it("should show an error message for invalid second mnemonic", async () => {
		const walletId = profile
			.wallets()
			.findByAddressWithNetwork("DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr", testNetwork)
			?.id();
		if (walletId) {
			profile.wallets().forget(walletId);
		}

		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
				withProviders: true,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		userEvent.paste(mnemonicInput(), MNEMONICS[0]);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		enableEncryptionToggle();

		userEvent.click(continueButton());

		await waitFor(() => {
			expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		});

		userEvent.paste(
			screen.getByTestId("EncryptPassword__second-mnemonic"),
			"invalid second mnemonic fjdkfjdkjfkdjf",
		);

		await waitFor(() => {
			expect(screen.getAllByTestId("Input__error")[0]).toHaveAttribute(
				errorText,
				walletTranslations.PAGE_IMPORT_WALLET.VALIDATION.INVALID_MNEMONIC,
			);
		});
	});

	it("should import by address", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.ADDRESS)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.ADDRESS));

		await expect(addressInput()).resolves.toBeVisible();

		userEvent.paste(await addressInput(), randomAddress);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => {
			expect(successStep()).toBeInTheDocument();
		});

		userEvent.click(finishButton());

		await waitFor(() => {
			expect(profile.wallets().findByAddressWithNetwork(randomAddress, testNetwork)).toBeInstanceOf(Wallet);
		});
	});

	it("should import by public key", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.PUBLIC_KEY)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.PUBLIC_KEY));

		await expect(screen.findByTestId("ImportWallet__publicKey-input")).resolves.toBeVisible();

		userEvent.paste(publicKeyInput(), randomPublicKey);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => {
			expect(successStep()).toBeInTheDocument();
		});

		userEvent.click(finishButton());

		await waitFor(() => {
			expect(profile.wallets().findByAddressWithNetwork(randomAddress, testNetwork)).toBeInstanceOf(Wallet);
		});
	});

	it("should validate public key doesnt exist", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.PUBLIC_KEY)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.PUBLIC_KEY));

		await expect(screen.findByTestId("ImportWallet__publicKey-input")).resolves.toBeVisible();

		const findAdressSpy = jest.spyOn(profile.wallets(), "findByAddressWithNetwork").mockReturnValue({} as any);

		userEvent.paste(publicKeyInput(), randomPublicKey);

		await waitFor(() => expect(continueButton()).toBeDisabled());

		findAdressSpy.mockRestore();
	});

	it("should not allow importing from an invalid public key", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.PUBLIC_KEY)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.PUBLIC_KEY));

		await expect(screen.findByTestId("ImportWallet__publicKey-input")).resolves.toBeVisible();

		userEvent.paste(publicKeyInput(), randomPublicKeyInvalid);

		await waitFor(() => expect(continueButton()).toBeDisabled());
	});

	it("should import by secret", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		const countBefore = profile.wallets().count();

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.SECRET)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.SECRET));

		await expect(screen.findByTestId(secretInputID)).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId(secretInputID), "secret.111");

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => {
			expect(successStep()).toBeInTheDocument();
		});

		userEvent.click(finishButton());

		await waitFor(() => expect(profile.wallets().count()).toBe(countBefore + 1));
	});

	it("should import by secret with encryption", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.SECRET)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.SECRET));

		await expect(screen.findByTestId(secretInputID)).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId(secretInputID), "secret.222");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		enableEncryptionToggle();

		userEvent.click(continueButton());

		await waitFor(() => {
			expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		});

		userEvent.paste(screen.getByTestId("PasswordValidation__encryptionPassword"), password);
		userEvent.paste(screen.getByTestId("PasswordValidation__confirmEncryptionPassword"), password);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(
			() => {
				expect(successStep()).toBeInTheDocument();
			},
			{ timeout: 15_000 },
		);
	});

	it("should import by secret with second signature and use password to encrypt both", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.SECRET)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.SECRET));

		expect(methodStep()).toBeInTheDocument();

		const passphraseInput = screen.getByTestId(secretInputID);

		expect(passphraseInput).toBeInTheDocument();

		userEvent.paste(passphraseInput, "abc");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		enableEncryptionToggle();

		userEvent.click(continueButton());

		await waitFor(() => {
			expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		});

		userEvent.paste(screen.getByTestId("EncryptPassword__second-secret"), "abc");

		userEvent.paste(screen.getByTestId("PasswordValidation__encryptionPassword"), password);
		userEvent.paste(screen.getByTestId("PasswordValidation__confirmEncryptionPassword"), password);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(
			() => {
				expect(successStep()).toBeInTheDocument();
			},
			{ timeout: 15_000 },
		);
	});

	it("forgets the imported wallet if back from encrypted password step", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.SECRET)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.SECRET));

		expect(methodStep()).toBeInTheDocument();

		const passphraseInput = screen.getByTestId(secretInputID);

		expect(passphraseInput).toBeInTheDocument();

		userEvent.paste(passphraseInput, "abcd");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		enableEncryptionToggle();

		userEvent.click(continueButton());

		await waitFor(() => {
			expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		});

		const profileForgetWalletSpy = jest.spyOn(profile.wallets(), "forget").mockImplementation(() => {});

		userEvent.click(backButton());

		expect(profileForgetWalletSpy).toHaveBeenCalledWith(expect.any(String));

		profileForgetWalletSpy.mockRestore();
	});

	it("should show an error message for invalid second secret", async () => {
		const walletId = profile
			.wallets()
			.findByAddressWithNetwork("DNTwQTSp999ezQ425utBsWetcmzDuCn2pN", testNetwork)
			?.id();
		if (walletId) {
			profile.wallets().forget(walletId);
		}

		const wallet = await profile.walletFactory().fromSecret({
			coin: "ARK",
			network: "ark.devnet",
			secret: "abc",
		});

		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.SECRET)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.SECRET));

		expect(methodStep()).toBeInTheDocument();

		const passphraseInput = screen.getByTestId(secretInputID);

		expect(passphraseInput).toBeInTheDocument();

		userEvent.paste(passphraseInput, "abc");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		enableEncryptionToggle();

		userEvent.click(continueButton());

		await waitFor(() => {
			expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		});

		const fromSecretMock = jest.spyOn(wallet.coin().address(), "fromSecret").mockImplementationOnce(() => {
			throw new Error("test");
		});

		userEvent.paste(screen.getByTestId("EncryptPassword__second-secret"), "invalid second secret");

		await waitFor(() => {
			expect(screen.getAllByTestId("Input__error")[0]).toHaveAttribute(
				errorText,
				walletTranslations.PAGE_IMPORT_WALLET.VALIDATION.INVALID_SECRET,
			);
		});

		fromSecretMock.mockRestore();
	});

	it("should get options depend on the network", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		expect(screen.getAllByText(commonTranslations.MNEMONIC_TYPE.BIP39)).toHaveLength(3);

		await expect(screen.findByText(commonTranslations.ADDRESS)).resolves.toBeVisible();

		await waitFor(() => expect(screen.queryByText(commonTranslations.MNEMONIC_TYPE.BIP49)).not.toBeInTheDocument());
		await waitFor(() => expect(screen.queryByText(commonTranslations.PRIVATE_KEY)).not.toBeInTheDocument());
		await waitFor(() => expect(screen.queryByText(commonTranslations.WIF)).not.toBeInTheDocument());
		await waitFor(() => expect(screen.queryByText(commonTranslations.ENCRYPTED_WIF)).not.toBeInTheDocument());
	});

	it("should show an error message for duplicate address when importing by mnemonic", async () => {
		const generated = await profile.walletFactory().generate({
			coin: "ARK",
			network: testNetwork,
		});

		profile.wallets().push(generated.wallet);

		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		expect(mnemonicInput()).toBeInTheDocument();

		userEvent.paste(mnemonicInput(), generated.mnemonic);

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toHaveAttribute(
				errorText,
				commonTranslations.INPUT_ADDRESS.VALIDATION.ADDRESS_ALREADY_EXISTS.replace(
					"{{address}}",
					generated.wallet.address(),
				),
			);
		});

		expect(continueButton()).toBeDisabled();
	});

	it("should show an error message for duplicate address when importing by address", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.ADDRESS)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.ADDRESS));

		await expect(addressInput()).resolves.toBeVisible();

		userEvent.paste(await addressInput(), profile.wallets().first().address());

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toHaveAttribute(
				errorText,
				commonTranslations.INPUT_ADDRESS.VALIDATION.ADDRESS_ALREADY_EXISTS.replace(
					"{{address}}",
					profile.wallets().first().address(),
				),
			);
		});

		expect(continueButton()).toBeDisabled();
	});

	it("should show an error message for invalid address", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.ADDRESS)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.ADDRESS));

		await expect(addressInput()).resolves.toBeVisible();

		userEvent.paste(await addressInput(), "123");

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toHaveAttribute(
				errorText,
				commonTranslations.INPUT_ADDRESS.VALIDATION.NOT_VALID,
			);
		});

		expect(continueButton()).toBeDisabled();
	});

	it("should render as ledger import", async () => {
		const nanoXMock = mockNanoXTransport();

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/import/ledger">
				<LedgerProvider>
					<ImportWallet />
				</LedgerProvider>
			</Route>,
			{
				route: {
					pathname: routeLedger,
				},
			},
		);

		expect(container).toMatchSnapshot();

		await expect(screen.findByTestId("LedgerTabs")).resolves.toBeVisible();

		nanoXMock.mockRestore();
	});

	it("should import by address and name", async () => {
		const emptyProfile = await env.profiles().create("empty profile");

		await env.profiles().restore(emptyProfile);
		await emptyProfile.sync();

		const history = createHashHistory();
		history.push(route);
		const randomNewAddress = "DHnF7Ycv16QxQQNGDUdGzWGh5n3ym424UW";

		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				history,
			},
		);

		const historySpy = jest.spyOn(history, "push").mockImplementation();

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.ADDRESS)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.ADDRESS));

		await expect(addressInput()).resolves.toBeVisible();

		userEvent.paste(await addressInput(), randomNewAddress);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => {
			expect(successStep()).toBeInTheDocument();
		});

		userEvent.click(finishButton());

		await waitFor(() => {
			expect(historySpy).toHaveBeenCalledWith(expect.stringContaining(`/profiles/${profile.id()}/wallets/`));
		});

		historySpy.mockRestore();
	});

	it("should show an error message for duplicate name", async () => {
		const emptyProfile = await env.profiles().create("duplicate wallet name profile");

		await env.profiles().restore(emptyProfile);
		await emptyProfile.sync();

		const randomNewAddress = "D6pPxYLwwCptuhVRvLQQYXEQiQMB5x6iY3";

		const wallet = await emptyProfile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: MNEMONICS[1],
			network: testNetwork,
		});

		wallet.settings().set(Contracts.WalletSetting.Alias, "My wallet");

		profile.wallets().push(wallet);

		render(
			<Route path="/profiles/:profileId/wallets/import">
				<ImportWallet />
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.ADDRESS)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.ADDRESS));

		await expect(addressInput()).resolves.toBeVisible();

		userEvent.paste(await addressInput(), randomNewAddress);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => {
			expect(successStep()).toBeInTheDocument();
		});

		const alias = "My Wallet";

		userEvent.click(screen.getByTestId("ImportWallet__edit-alias"));

		await expect(screen.findByTestId("UpdateWalletName__input")).resolves.toBeVisible();

		// Test cancel button
		userEvent.click(screen.getByTestId("UpdateWalletName__cancel"));

		expect(screen.queryByTestId("UpdateWalletName__input")).toBeNull();

		// Try to edit name again
		userEvent.click(screen.getByTestId("ImportWallet__edit-alias"));

		userEvent.clear(screen.getByTestId("UpdateWalletName__input"));
		userEvent.paste(screen.getByTestId("UpdateWalletName__input"), alias);

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toHaveAttribute(
				errorText,
				walletTranslations.VALIDATION.ALIAS_ASSIGNED.replace("{{alias}}", alias),
			);
		});

		expect(screen.getByTestId("UpdateWalletName__submit")).toBeDisabled();
	});

	it("should show warning sync error toast in network step and retry sync", async () => {
		render(
			<Route path="/profiles/:profileId/wallets/import">
				<>
					<ToastContainer closeOnClick={false} newestOnTop />
					<ImportWallet />
				</>
			</Route>,
			{
				route: route,
			},
		);

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		const selectNetworkInput = screen.getByTestId("SelectNetworkInput__input");

		userEvent.paste(selectNetworkInput, "ARK Dev");
		userEvent.keyboard("{enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);

		const coin = profile.coins().get("ARK", testNetwork);
		const coinMock = jest.spyOn(coin, "__construct").mockImplementationOnce(() => {
			throw new Error("test");
		});

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await expect(screen.findByTestId("SyncErrorMessage__retry")).resolves.toBeVisible();

		const toastDismissMock = jest.spyOn(toasts, "dismiss").mockResolvedValue(undefined);
		userEvent.click(within(screen.getByTestId("SyncErrorMessage__retry")).getByRole("link"));

		await expect(screen.findByTestId("SyncErrorMessage__retry")).resolves.toBeVisible();

		coinMock.mockRestore();
		toastDismissMock.mockRestore();
	});

	describe("import with private key", () => {
		let form: ReturnType<typeof useForm>;
		const privateKey = "d8839c2432bfd0a67ef10a804ba991eabba19f154a3d707917681d45822a5712";

		const Component = () => {
			const network = env.availableNetworks().find((net) => net.coin() === "ARK" && net.id() === testNetwork);
			assertNetwork(network);

			network.importMethods = () => ({
				privateKey: {
					canBeEncrypted: true,
					default: true,
					permissions: ["read", "write"],
				},
			});

			form = useForm({
				defaultValues: { network, privateKey },
				shouldUnregister: false,
			});

			form.register("importOption");
			form.register("network");
			form.register("privateKey");
			form.register("value");

			return (
				<EnvironmentProvider env={env}>
					<FormProvider {...form}>
						<MethodStep profile={profile} />
					</FormProvider>
				</EnvironmentProvider>
			);
		};

		const testFormValues = async (form) => {
			await waitFor(() => {
				expect(form.getValues()).toMatchObject({
					importOption: {
						canBeEncrypted: true,
						label: "Private Key",
						value: OptionsValue.PRIVATE_KEY,
					},
					value: privateKey,
				});
			});

			await waitFor(() => {
				expect(privateKeyInput()).toHaveValue(privateKey);
			});
		};

		it("when is valid", async () => {
			const coin = profile.coins().get("ARK", testNetwork);
			const coinMock = jest.spyOn(coin.address(), "fromPrivateKey").mockResolvedValue({ address: "whatever" });

			history.push(`/profiles/${profile.id()}`);

			const { container } = render(
				<Route path="/profiles/:profileId">
					<Component />
				</Route>,
				{ history, withProviders: false },
			);

			expect(methodStep()).toBeInTheDocument();

			await waitFor(() => expect(privateKeyInput()));

			userEvent.paste(privateKeyInput(), privateKey);

			await testFormValues(form);

			// Trigger validation
			form.trigger("value");

			coinMock.mockRestore();

			expect(container).toMatchSnapshot();
		});

		it("when is not valid", async () => {
			const coin = profile.coins().get("ARK", testNetwork);
			const coinMock = jest.spyOn(coin.address(), "fromPrivateKey").mockImplementation(() => {
				throw new Error("test");
			});

			history.push(`/profiles/${profile.id()}`);

			const { container } = render(
				<Route path="/profiles/:profileId">
					<Component />
				</Route>,
				{ history, withProviders: false },
			);

			expect(methodStep()).toBeInTheDocument();

			await waitFor(() => expect(privateKeyInput()));

			userEvent.paste(privateKeyInput(), privateKey);

			await testFormValues(form);

			// Trigger validation
			form.trigger("value");

			coinMock.mockRestore();

			expect(container).toMatchSnapshot();
		});
	});

	describe("import with wif", () => {
		let form: ReturnType<typeof useForm>;
		const wif = "wif.1111";

		const Component = () => {
			const network = env.availableNetworks().find((net) => net.coin() === "ARK" && net.id() === testNetwork);
			assertNetwork(network);

			network.importMethods = () => ({
				wif: {
					canBeEncrypted: true,
					default: true,
					permissions: ["read", "write"],
				},
			});

			form = useForm({
				defaultValues: { network, wif },
				shouldUnregister: false,
			});

			form.register("importOption");
			form.register("network");
			form.register("wif");
			form.register("value");

			return (
				<EnvironmentProvider env={env}>
					<FormProvider {...form}>
						<MethodStep profile={profile} />
					</FormProvider>
				</EnvironmentProvider>
			);
		};

		const testFormValues = async (form) => {
			await waitFor(() => {
				expect(form.getValues()).toMatchObject({
					importOption: {
						canBeEncrypted: true,
						label: "WIF",
						value: OptionsValue.WIF,
					},
					value: wif,
				});
			});
		};

		it("with valid wif", async () => {
			const coin = profile.coins().get("ARK", testNetwork);
			const coinMock = jest
				.spyOn(coin.address(), "fromWIF")
				.mockResolvedValue({ address: "whatever", type: "bip39" });

			history.push(`/profiles/${profile.id()}`);

			const { container } = render(
				<Route path="/profiles/:profileId">
					<Component />
				</Route>,
				{ history, withProviders: false },
			);

			expect(methodStep()).toBeInTheDocument();

			await waitFor(() => expect(wifInput()));

			userEvent.paste(wifInput(), wif);

			await testFormValues(form);

			await waitFor(() => {
				expect(wifInput()).toHaveValue(wif);
			});

			// Trigger validation
			form.trigger("value");

			expect(container).toMatchSnapshot();

			coinMock.mockRestore();
		});

		it("with invalid wif", async () => {
			const coin = profile.coins().get("ARK", testNetwork);

			const coinMock = jest.spyOn(coin.address(), "fromWIF").mockImplementation(() => {
				throw new Error("Something went wrong");
			});

			history.push(`/profiles/${profile.id()}`);

			const { container } = render(
				<Route path="/profiles/:profileId">
					<Component />
				</Route>,
				{ history, withProviders: false },
			);

			expect(methodStep()).toBeInTheDocument();

			await waitFor(() => expect(wifInput()));

			userEvent.paste(wifInput(), wif);

			await testFormValues(form);

			await waitFor(() => {
				expect(wifInput()).toHaveValue(wif);
			});

			// Trigger validation
			form.trigger("value");

			expect(container).toMatchSnapshot();

			coinMock.mockRestore();
		});
	});

	it("should import with encryped wif", async () => {
		let form: ReturnType<typeof useForm>;
		const wif = "wif.1111";
		const wifPassword = "password";

		const Component = () => {
			const network = env.availableNetworks().find((net) => net.coin() === "ARK" && net.id() === testNetwork);
			assertNetwork(network);

			//ts-ignore
			network.importMethods = () => ({
				//ts-ignore
				encryptedWif: true,
			});

			form = useForm({
				defaultValues: { network, wif },
				shouldUnregister: false,
			});

			form.register("type");
			form.register("network");
			form.register("encryptedWif");
			form.register("value");

			return (
				<EnvironmentProvider env={env}>
					<FormProvider {...form}>
						<MethodStep profile={profile} />
					</FormProvider>
				</EnvironmentProvider>
			);
		};

		history.push(`/profiles/${profile.id()}`);

		const { container } = render(
			<Route path="/profiles/:profileId">
				<Component />
			</Route>,
			{ history, withProviders: false },
		);

		expect(methodStep()).toBeInTheDocument();

		await waitFor(() => expect(encryptedWifInput()));

		userEvent.paste(encryptedWifInput(), wif);

		userEvent.paste(screen.getByTestId("ImportWallet__encryptedWif__password-input"), wifPassword);

		await waitFor(() => {
			expect(encryptedWifInput()).toHaveValue(wif);
		});

		// Trigger validation
		form.trigger("value");

		expect(container).toMatchSnapshot();
	});
});
