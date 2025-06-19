import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { renderHook } from "@testing-library/react";
import { SuccessStep } from "./SuccessStep";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";

import {
	env,
	render,
	screen,
	waitFor,
	mockNanoXTransport,
	mockProfileWithPublicAndTestNetworks,
	getMainsailProfileId,
	renderResponsiveWithRoute,
} from "@/utils/testing-library";
import * as usePortfolio from "@/domains/portfolio/hooks/use-portfolio";
import { ImportAddressesSidePanel } from "./ImportAddressSidePanel";
import { expect } from "vitest";
import { ImportAddressStep, useLedgerStepHeaderConfig, useStepHeaderConfig } from "./ImportAddressSidePanel.blocks";
import { LedgerTabStep } from "./Ledger/LedgerTabs.contracts";
import { ImportOption } from "@/domains/wallet/hooks";

let profile: Contracts.IProfile;
const fixtureProfileId = getMainsailProfileId();

const mnemonic =
	"skin fortune security mom coin hurdle click emotion heart brisk exact rather code feature era leopard grocery tide gift power lawsuit sight vehicle coin";

const route = `/profiles/${fixtureProfileId}/dashboard`;

const continueButton = () => screen.getByTestId("ImportWallet__continue-button");
const mnemonicInput = () => screen.getByTestId("ImportWallet__mnemonic-input");
const addressInput = () => screen.findByTestId("ImportWallet__address-input");
const finishButton = () => screen.getByTestId("ImportWallet__finish-button");
const successStep = () => screen.getByTestId("ImportWallet__success-step");
const methodStep = () => screen.getByTestId("ImportWallet__method-step");
const detailStep = () => screen.getByTestId("ImportWallet__detail-step");

describe("ImportSidePanel", () => {
	let network;
	let resetProfileNetworksMock: () => void;

	const Component = () => <ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />;

	beforeEach(async () => {
		profile = env.profiles().findById(fixtureProfileId);
		network = profile.activeNetwork();

		await env.profiles().restore(profile);

		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should render method step", async () => {
		render(<Component />, { route });

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

		const ImportAddressesSidePanelComponent = () => {
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
				<FormProvider {...form}>
					<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />
				</FormProvider>
			);
		};

		render(<ImportAddressesSidePanelComponent />, { route });

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

		renderResponsiveWithRoute(<Component />, breakpoint, { route });

		expect(successStep()).toBeInTheDocument();

		expect(screen.getAllByText(importedWallet.address())[0]).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("ImportWallet__edit-alias"));

		expect(onClickEditAlias).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));

		vi.clearAllMocks();
	});

	it.skip("should render as ledger import", async () => {
		const nanoXMock = mockNanoXTransport();

		render(<ImportAddressesSidePanel open={true} onOpenChange={vi.fn()} />, {
			route,
		});

		await expect(screen.findByTestId("LedgerTabs")).resolves.toBeVisible();

		nanoXMock.mockRestore();
	});

	it("should import by address and name", async () => {
		const emptyProfile = await env.profiles().create("empty profile");

		await env.profiles().restore(emptyProfile);
		await emptyProfile.sync();

		const randomNewAddress = "0x125b484e51Ad990b5b3140931f3BD8eAee85Db23";

		const onOpenChangeMock = vi.fn();

		render(<ImportAddressesSidePanel open={true} onOpenChange={onOpenChangeMock} />, { route });

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
	});
});

describe("useStepHeaderConfig", () => {
	it("returns correct config for MethodStep", () => {
		const { result } = renderHook(() => useStepHeaderConfig(ImportAddressStep.MethodStep));
		expect(result.current).toEqual({
			subtitle: "Select the method you want to use to import your address.",
			title: "Import",
		});
	});

	it("returns config for ImportDetailStep with importOption", () => {
		const option = { description: "Desc", header: "Header", icon: <span>Icon</span> } as unknown as ImportOption;
		const { result } = renderHook(() => useStepHeaderConfig(ImportAddressStep.ImportDetailStep, option));
		expect(result.current).toEqual({
			subtitle: "Desc",
			title: "Header",
			titleIcon: option.icon,
		});
	});

	it("returns correct config for EncryptPasswordStep", () => {
		const { result } = renderHook(() => useStepHeaderConfig(ImportAddressStep.EncryptPasswordStep));
		expect(result.current).toMatchObject({
			title: "Encryption Password",
		});
	});

	it("returns correct config for SummaryStep", () => {
		const { result } = renderHook(() => useStepHeaderConfig(ImportAddressStep.SummaryStep));
		expect(result.current).toMatchObject({
			subtitle: "The address has been successfully imported.",
			title: "Import Completed",
		});
	});
});

describe("useLedgerStepHeaderConfig", () => {
	it("returns config for LedgerConnectionStep with importOption", () => {
		const option = { description: "LDesc", header: "LHeader", icon: <span>LICON</span> } as unknown as ImportOption;
		const { result } = renderHook(() => useLedgerStepHeaderConfig(LedgerTabStep.LedgerConnectionStep, option));
		expect(result.current).toEqual({
			subtitle: "LDesc",
			title: "LHeader",
			titleIcon: option.icon,
		});
	});

	it("returns config for LedgerScanStep", () => {
		const { result } = renderHook(() => useLedgerStepHeaderConfig(LedgerTabStep.LedgerScanStep));
		expect(result.current).toEqual({
			subtitle: "Select the addresses that you want to import.",
			title: "Ledger Addresses",
			titleIcon: expect.anything(),
		});
	});

	it("returns config for LedgerImportStep", () => {
		const { result } = renderHook(() => useLedgerStepHeaderConfig(LedgerTabStep.LedgerImportStep));
		expect(result.current).toEqual({
			subtitle: "Your Ledger addresses have been imported.",
			title: "Import Completed",
			titleIcon: expect.anything(),
		});
	});

	it("returns default config for unknown step", () => {
		const { result } = renderHook(() => useStepHeaderConfig(999 as unknown as ImportAddressStep));
		expect(result.current).toEqual({
			title: "",
		});
	});
});
