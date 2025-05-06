import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Route } from "react-router-dom";

import { SuccessStep } from "./SuccessStep";
import { EnvironmentProvider } from "@/app/contexts";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";

import {
	env,
	render,
	renderResponsive,
	screen,
	waitFor,
	mockNanoXTransport,
	mockProfileWithPublicAndTestNetworks,
	getMainsailProfileId,
} from "@/utils/testing-library";
import * as usePortfolio from "@/domains/portfolio/hooks/use-portfolio";
import { ImportAddressesSidePanel } from "./ImportAddressSidePanel";
import { expect } from "vitest";

let profile: Contracts.IProfile;
const fixtureProfileId = getMainsailProfileId();

const mnemonic = "buddy year cost vendor honey tonight viable nut female alarm duck symptom";
const randomAddress = "D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib";

const route = `/profiles/${fixtureProfileId}/dashboard`;
const history = createHashHistory();

const continueButton = () => screen.getByTestId("ImportWallet__continue-button");
const mnemonicInput = () => screen.getByTestId("ImportWallet__mnemonic-input");
const addressInput = () => screen.findByTestId("ImportWallet__address-input");
const finishButton = () => screen.getByTestId("ImportWallet__finish-button");
const successStep = () => screen.getByTestId("ImportWallet__success-step");
const methodStep = () => screen.getByTestId("ImportWallet__method-step");
const detailStep = () => screen.getByTestId("ImportWallet__detail-step");
const privateKeyInput = () => screen.getByTestId("ImportWallet__privatekey-input");
const wifInput = () => screen.getByTestId("ImportWallet__wif-input");
const encryptedWifInput = () => screen.getByTestId("ImportWallet__encryptedWif-input");

const testNetwork = "mainsail.devnet";
let network;

describe("ImportSidePanel", () => {
	let resetProfileNetworksMock: () => void;
	let uInt8ArrayFix: () => void;

	beforeEach(async () => {
		profile = env.profiles().findById(fixtureProfileId);
		network = profile.availableNetworks().find((net) => net.coin() === "Mainsail" && net.id() === testNetwork);

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

	it("should render method step", async () => {
		const Component = () => {
			network.importMethods = () => ({
				bip39: {
					default: false,
					permissions: [],
				},
			});
			return (
				<EnvironmentProvider env={env}>
					<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />
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

		await expect(screen.findByText(commonTranslations.MNEMONIC)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.MNEMONIC));

		expect(detailStep()).toBeInTheDocument();

		await waitFor(() => expect(mnemonicInput()));

		expect(mnemonicInput()).toBeInTheDocument();

		await userEvent.clear(mnemonicInput());
		await userEvent.type(mnemonicInput(), mnemonic);

		await waitFor(() => expect(continueButton()).toBeEnabled());
	});

	it("should be possible to change import type in method step", async () => {
		let form: ReturnType<typeof useForm>;

		const Component = () => {
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
						<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />
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

		await expect(screen.findByText(commonTranslations.MNEMONIC)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.MNEMONIC));

		expect(detailStep()).toBeInTheDocument();

		await expect(screen.findByTestId("ImportWallet__mnemonic-input")).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.BACK));

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByText(commonTranslations.ADDRESS)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.ADDRESS));

		expect(detailStep()).toBeInTheDocument();

		await expect(addressInput()).resolves.toBeVisible();
	});

	it.each(["xs", "lg"])("should render success step (%s)", async (breakpoint) => {
		vi.spyOn(usePortfolio, "usePortfolio").mockReturnValue({
			selectedAddresses: [],
			setSelectedAddresses: () => {},
		});

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

		renderResponsive(<Component />, breakpoint);

		expect(successStep()).toBeInTheDocument();

		expect(screen.getAllByText(importedWallet.address())[0]).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("ImportWallet__edit-alias"));

		expect(onClickEditAlias).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));

		vi.clearAllMocks();
	});

	it.skip("should render as ledger import", async () => {
		const nanoXMock = mockNanoXTransport();

		render(
			<Route path="/profiles/:profileId/wallets/import/ledger">
				<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />
			</Route>,
			{
				route: {
					pathname: routeLedger,
				},
			},
		);

		await expect(screen.findByTestId("LedgerTabs")).resolves.toBeVisible();

		nanoXMock.mockRestore();
	});

	it("should import by address and name", async () => {
		const emptyProfile = await env.profiles().create("empty profile");

		await env.profiles().restore(emptyProfile);
		await emptyProfile.sync();

		const history = createHashHistory();
		history.push(route);
		const randomNewAddress = "0x125b484e51Ad990b5b3140931f3BD8eAee85Db23";

		const onOpenChangeMock = vi.fn();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<ImportAddressesSidePanel open={true} onOpenChange={onOpenChangeMock} />
			</Route>,
			{
				history,
			},
		);

		const historySpy = vi.spyOn(history, "push").mockImplementation(vi.fn());

		await waitFor(() => expect(() => methodStep()).not.toThrow());

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByText(commonTranslations.ADDRESS)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.ADDRESS));

		await expect(addressInput()).resolves.toBeVisible();

		await userEvent.clear(await addressInput());
		await userEvent.type(await addressInput(), randomNewAddress);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await waitFor(() => {
			expect(successStep()).toBeInTheDocument();
		});

		await userEvent.click(finishButton());

		expect(onOpenChangeMock).toHaveBeenCalledWith(false);

		historySpy.mockRestore();
	});

	describe("import with private key", () => {
		const privateKey = "d8839c2432bfd0a67ef10a804ba991eabba19f154a3d707917681d45822a5712";

		const Component = () => {
			network.importMethods = () => ({
				privateKey: {
					canBeEncrypted: true,
					default: true,
					permissions: ["read", "write"],
				},
			});

			return (
				<EnvironmentProvider env={env}>
					<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />
				</EnvironmentProvider>
			);
		};

		it("when is valid", async () => {
			const coin = profile.coins().get("Mainsail", testNetwork);
			const coinMock = vi.spyOn(coin.address(), "fromPrivateKey").mockResolvedValue({ address: "whatever" });

			history.push(`/profiles/${profile.id()}`);

			render(
				<Route path="/profiles/:profileId">
					<Component />
				</Route>,
				{ history, withProviders: false },
			);

			expect(methodStep()).toBeInTheDocument();

			await expect(screen.findByText(commonTranslations.PRIVATE_KEY)).resolves.toBeVisible();

			await userEvent.click(screen.getByText(commonTranslations.PRIVATE_KEY));

			await waitFor(() => expect(privateKeyInput()));

			await userEvent.clear(privateKeyInput());
			await userEvent.type(privateKeyInput(), privateKey);

			await waitFor(() => expect(continueButton()).toBeEnabled());

			coinMock.mockRestore();
		});

		it("when is not valid", async () => {
			const coin = profile.coins().get("Mainsail", testNetwork);
			const coinMock = vi.spyOn(coin.address(), "fromPrivateKey").mockImplementation(() => {
				throw new Error("test");
			});

			history.push(`/profiles/${profile.id()}`);

			render(
				<Route path="/profiles/:profileId">
					<Component />
				</Route>,
				{ history, withProviders: false },
			);

			expect(methodStep()).toBeInTheDocument();

			await expect(screen.findByText(commonTranslations.PRIVATE_KEY)).resolves.toBeVisible();

			await userEvent.click(screen.getByText(commonTranslations.PRIVATE_KEY));

			await waitFor(() => expect(privateKeyInput()));

			await userEvent.clear(privateKeyInput());
			await userEvent.type(privateKeyInput(), privateKey);

			await waitFor(() => expect(continueButton()).not.toBeEnabled());

			await waitFor(() => {
				expect(screen.getByTestId("Input__error")).toHaveAttribute("data-errortext", "Invalid Private Key.");
			});

			coinMock.mockRestore();
		});
	});

	describe("import with wif", () => {
		const wif = "wif.1111";

		const Component = () => {
			network.importMethods = () => ({
				wif: {
					canBeEncrypted: true,
					default: true,
					permissions: ["read", "write"],
				},
			});

			return (
				<EnvironmentProvider env={env}>
					<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />
				</EnvironmentProvider>
			);
		};

		it("with valid wif", async () => {
			const coin = profile.coins().get("Mainsail", testNetwork);
			const coinMock = vi
				.spyOn(coin.address(), "fromWIF")
				.mockResolvedValue({ address: "whatever", type: "bip39" });

			history.push(`/profiles/${profile.id()}`);

			render(
				<Route path="/profiles/:profileId">
					<Component />
				</Route>,
				{ history, withProviders: false },
			);

			expect(methodStep()).toBeInTheDocument();

			await expect(screen.findByText(commonTranslations.WIF)).resolves.toBeVisible();

			await userEvent.click(screen.getByText(commonTranslations.WIF));

			await waitFor(() => expect(wifInput()));

			await userEvent.type(wifInput(), wif);

			await waitFor(() => expect(continueButton()).toBeEnabled());

			coinMock.mockRestore();
		});

		it("with invalid wif", async () => {
			const coin = profile.coins().get("Mainsail", testNetwork);

			const coinMock = vi.spyOn(coin.address(), "fromWIF").mockImplementation(() => {
				throw new Error("Something went wrong");
			});

			history.push(`/profiles/${profile.id()}`);

			render(
				<Route path="/profiles/:profileId">
					<Component />
				</Route>,
				{ history, withProviders: false },
			);

			expect(methodStep()).toBeInTheDocument();

			await expect(screen.findByText(commonTranslations.WIF)).resolves.toBeVisible();

			await userEvent.click(screen.getByText(commonTranslations.WIF));

			await waitFor(() => expect(wifInput()));

			await userEvent.type(wifInput(), wif);

			await waitFor(() => {
				expect(wifInput()).toHaveValue(wif);
			});

			await waitFor(() => expect(continueButton()).not.toBeEnabled());

			coinMock.mockRestore();
		});
	});

	it("should import with encryped wif", async () => {
		const wif = "wif.1111";
		const wifPassword = "password";

		const Component = () => {
			//ts-ignore
			network.importMethods = () => ({
				//ts-ignore
				encryptedWif: true,
			});

			return (
				<EnvironmentProvider env={env}>
					<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />
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

		expect(methodStep()).toBeInTheDocument();

		await expect(screen.findByText(commonTranslations.ENCRYPTED_WIF)).resolves.toBeVisible();

		await userEvent.click(screen.getByText(commonTranslations.ENCRYPTED_WIF));

		await waitFor(() => expect(encryptedWifInput()));

		await userEvent.clear(encryptedWifInput());
		await userEvent.type(encryptedWifInput(), wif);

		await userEvent.clear(screen.getByTestId("ImportWallet__encryptedWif__password-input"));
		await userEvent.type(screen.getByTestId("ImportWallet__encryptedWif__password-input"), wifPassword);

		await waitFor(() => {
			expect(encryptedWifInput()).toHaveValue(wif);
		});

		await waitFor(() => expect(continueButton()).toBeEnabled());
	});
});
