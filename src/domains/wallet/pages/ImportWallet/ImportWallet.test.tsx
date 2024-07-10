/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Route } from "react-router-dom";

import { ImportWallet } from "./ImportWallet";
import { MethodStep } from "./MethodStep";
import { SuccessStep } from "./SuccessStep";
import { EnvironmentProvider } from "@/app/contexts";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { NetworkStep } from "@/domains/wallet/components/NetworkStep";
import { OptionsValue } from "@/domains/wallet/hooks/use-import-options";
import { assertNetwork } from "@/utils/assertions";
import {
	env,
	getDefaultProfileId,
	render,
	renderResponsive,
	renderWithForm,
	screen,
	waitFor,
	mockNanoXTransport,
	mockProfileWithPublicAndTestNetworks,
	mockProfileWithOnlyPublicNetworks,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;
const fixtureProfileId = getDefaultProfileId();

const mnemonic = "buddy year cost vendor honey tonight viable nut female alarm duck symptom";
const randomAddress = "D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib";

const route = `/profiles/${fixtureProfileId}/wallets/import`;
const routeLedger = `/profiles/${fixtureProfileId}/wallets/import/ledger`;
const history = createHashHistory();

const continueButton = () => screen.getByTestId("ImportWallet__continue-button");
const backButton = () => screen.getByTestId("ImportWallet__back-button");
const mnemonicInput = () => screen.getByTestId("ImportWallet__mnemonic-input");
const addressInput = () => screen.findByTestId("ImportWallet__address-input");
const finishButton = () => screen.getByTestId("ImportWallet__finish-button");
const successStep = () => screen.getByTestId("ImportWallet__success-step");
const methodStep = () => screen.getByTestId("ImportWallet__method-step");
const privateKeyInput = () => screen.getByTestId("ImportWallet__privatekey-input");
const wifInput = () => screen.getByTestId("ImportWallet__wif-input");
const encryptedWifInput = () => screen.getByTestId("ImportWallet__encryptedWif-input");

const testNetwork = "ark.devnet";
const ARKDevnet = "ARK Devnet";

describe("ImportWallet", () => {
	let resetProfileNetworksMock: () => void;

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

		const selectNetworkInput = screen.getByTestId("SelectDropdown__input");

		await userEvent.clear(selectNetworkInput);
		await userEvent.type(selectNetworkInput, "ARK D");
		await userEvent.keyboard("{Enter}");

		expect(selectNetworkInput).toHaveValue(ARKDevnet);
	});

	it("should render method step", async () => {
		let form: ReturnType<typeof useForm>;

		const Component = () => {
			const network = profile.availableNetworks().find((net) => net.coin() === "ARK" && net.id() === testNetwork);
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

		await userEvent.clear(mnemonicInput());
		await userEvent.type(mnemonicInput(), mnemonic);

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
			const network = profile.availableNetworks().find((net) => net.coin() === "ARK" && net.id() === testNetwork);
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
	
		await userEvent.clear(selectDropdown);
		await userEvent.type(selectDropdown, "test");
	
		await waitFor(() => expect(screen.queryByTestId("SelectDropdown__option--0")).not.toBeInTheDocument());
	
		await userEvent.clear(selectDropdown);
		await userEvent.type(selectDropdown, "addr");
	
		await expect(screen.findByTestId("SelectDropdown__option--0")).resolves.toBeVisible();
	
		userEvent.click(screen.getByTestId("SelectDropdown__option--0"));
	
		// Ensure the value is set
		await waitFor(() => expect(screen.getByTestId("SelectDropdown__input")).toHaveValue("Address"));
	
		await expect(addressInput()).resolves.toBeVisible();
	});
	
	// @TODO: Fix the following tests
	/* it.each(["xs", "lg"])("should render success step (%s)", async (breakpoint) => {
		let form: ReturnType<typeof useForm>;
		const onClickEditAlias = vi.fn();
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

		const { asFragment } = renderResponsive(<Component />, breakpoint);

		expect(successStep()).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		expect(screen.getAllByText(ARKDevnet)[0]).toBeInTheDocument();
		expect(screen.getAllByText(importedWallet.address())[0]).toBeInTheDocument();

		userEvent.click(screen.getByTestId("ImportWallet__edit-alias"));

		expect(onClickEditAlias).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	}); */

	/* it("should go back to portfolio", async () => {
		const history = createHashHistory();

		const historySpy = vi.spyOn(history, "push").mockImplementation(vi.fn());

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
	}); */

	/* it("should skip network step if only one network", async () => {
		const history = createHashHistory();
	
		const historySpy = vi.spyOn(history, "push").mockImplementation(vi.fn());
	
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
	
		// Log to confirm button click is attempted
		console.log("Clicking back button");
	
		userEvent.click(backButton());
	
		// Log the function calls to see if history.push was called
		console.log("history.push calls:", historySpy.mock.calls);
	
		expect(historySpy).toHaveBeenCalledWith(`/profiles/${fixtureProfileId}/dashboard`);
	
		historySpy.mockRestore();
	}); */
	

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

		userEvent.click(screen.getAllByTestId("NetworkOption")[0]);

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

		userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		expect(screen.getAllByText(commonTranslations.MNEMONIC_TYPE.BIP39)).toHaveLength(2);

		await expect(screen.findByText(commonTranslations.ADDRESS)).resolves.toBeVisible();

		await waitFor(() => expect(screen.queryByText(commonTranslations.MNEMONIC_TYPE.BIP49)).not.toBeInTheDocument());
		await waitFor(() => expect(screen.queryByText(commonTranslations.PRIVATE_KEY)).not.toBeInTheDocument());
		await waitFor(() => expect(screen.queryByText(commonTranslations.WIF)).not.toBeInTheDocument());
		await waitFor(() => expect(screen.queryByText(commonTranslations.ENCRYPTED_WIF)).not.toBeInTheDocument());
	});

	it("should render as ledger import", async () => {
		const nanoXMock = mockNanoXTransport();

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/import/ledger">
				<ImportWallet />
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

		const historySpy = vi.spyOn(history, "push").mockImplementation(vi.fn());

		await expect(screen.findByTestId("NetworkStep")).resolves.toBeVisible();

		userEvent.click(screen.getAllByTestId("NetworkOption")[1]);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));

		await expect(screen.findByText(commonTranslations.ADDRESS)).resolves.toBeVisible();

		userEvent.click(screen.getByText(commonTranslations.ADDRESS));

		await expect(addressInput()).resolves.toBeVisible();

		await userEvent.clear(await addressInput());
		await userEvent.type(await addressInput(), randomNewAddress);

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

	describe("import with private key", () => {
		let form: ReturnType<typeof useForm>;
		const privateKey = "d8839c2432bfd0a67ef10a804ba991eabba19f154a3d707917681d45822a5712";

		const Component = () => {
			const network = profile.availableNetworks().find((net) => net.coin() === "ARK" && net.id() === testNetwork);
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
			const coinMock = vi.spyOn(coin.address(), "fromPrivateKey").mockResolvedValue({ address: "whatever" });

			history.push(`/profiles/${profile.id()}`);

			const { container } = render(
				<Route path="/profiles/:profileId">
					<Component />
				</Route>,
				{ history, withProviders: false },
			);

			expect(methodStep()).toBeInTheDocument();

			await waitFor(() => expect(privateKeyInput()));

			await userEvent.clear(privateKeyInput());
			await userEvent.type(privateKeyInput(), privateKey);

			await testFormValues(form);

			// Trigger validation
			form.trigger("value");

			coinMock.mockRestore();

			expect(container).toMatchSnapshot();
		});

		it("when is not valid", async () => {
			const coin = profile.coins().get("ARK", testNetwork);
			const coinMock = vi.spyOn(coin.address(), "fromPrivateKey").mockImplementation(() => {
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

			await userEvent.clear(privateKeyInput());
			await userEvent.type(privateKeyInput(), privateKey);

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
			const network = profile.availableNetworks().find((net) => net.coin() === "ARK" && net.id() === testNetwork);
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
			const coinMock = vi
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

			await userEvent.clear(wifInput());
			await userEvent.type(wifInput(), wif);

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

			const coinMock = vi.spyOn(coin.address(), "fromWIF").mockImplementation(() => {
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

			await userEvent.clear(wifInput());
			await userEvent.type(wifInput(), wif);

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
			const network = profile.availableNetworks().find((net) => net.coin() === "ARK" && net.id() === testNetwork);
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

		await userEvent.clear(encryptedWifInput());
		await userEvent.type(encryptedWifInput(), wif);

		await userEvent.clear(screen.getByTestId("ImportWallet__encryptedWif__password-input"));
		await userEvent.type(screen.getByTestId("ImportWallet__encryptedWif__password-input"), wifPassword);

		await waitFor(() => {
			expect(encryptedWifInput()).toHaveValue(wif);
		});

		// Trigger validation
		form.trigger("value");

		expect(container).toMatchSnapshot();
	});
});
