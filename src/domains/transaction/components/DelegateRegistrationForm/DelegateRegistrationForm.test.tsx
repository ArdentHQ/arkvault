/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk";
import { Contracts as ProfilesContracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";
import { FormProvider, useForm, UseFormMethods } from "react-hook-form";
import { Route } from "react-router-dom";

import { DelegateRegistrationForm, signDelegateRegistration } from "./DelegateRegistrationForm";
import * as useFeesHook from "@/app/hooks/use-fees";
import { translations } from "@/domains/transaction/i18n";
import delegateRegistrationFixture from "@/tests/fixtures/coins/ark/devnet/transactions/delegate-registration.json";
import {
	env,
	getDefaultProfileId,
	MNEMONICS,
	render,
	RenderResult,
	screen,
	syncDelegates,
	waitFor,
} from "@/utils/testing-library";

let profile: ProfilesContracts.IProfile;
let wallet: ProfilesContracts.IReadWriteWallet;

const fees = { avg: 1.354, isDynamic: true, max: 10, min: 0, static: 0 };

const renderComponent = (properties?: any) => {
	let form: UseFormMethods | undefined;

	const defaultValues = properties?.defaultValues ?? { fee: "2" };
	const activeTab = properties?.activeTab ?? 1;

	const Component = () => {
		form = useForm<any>({ defaultValues, mode: "onChange" });

		const { register } = form;

		useEffect(() => {
			register("fee");
			register("fees");
			register("inputFeeSettings");
		}, [register]);

		return (
			<FormProvider {...form}>
				<DelegateRegistrationForm.component profile={profile} activeTab={activeTab} wallet={wallet} />
			</FormProvider>
		);
	};

	const utils: RenderResult = render(
		<Route path="/profiles/:profileId">
			<Component />
		</Route>,
		{
			route: `/profiles/${profile.id()}`,
		},
	);

	return { ...utils, form };
};

const createTransactionMock = (wallet: ProfilesContracts.IReadWriteWallet) =>
	// @ts-ignore
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => +delegateRegistrationFixture.data.amount / 1e8,
		data: () => ({ data: () => delegateRegistrationFixture.data }),
		explorerLink: () => `https://test.arkscan.io/transaction/${delegateRegistrationFixture.data.id}`,
		fee: () => +delegateRegistrationFixture.data.fee / 1e8,
		id: () => delegateRegistrationFixture.data.id,
		recipient: () => delegateRegistrationFixture.data.recipient,
		sender: () => delegateRegistrationFixture.data.sender,
		username: () => delegateRegistrationFixture.data.asset.delegate.username,
	});

const formStepID = "DelegateRegistrationForm__form-step";

describe("DelegateRegistrationForm", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();

		await syncDelegates(profile);

		vi.spyOn(useFeesHook, "useFees").mockReturnValue({
			calculate: () => Promise.resolve(fees),
		});
	});

	it("should render form step", async () => {
		const { asFragment } = renderComponent();

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render review step", async () => {
		const { asFragment } = renderComponent({ activeTab: 2 });

		await expect(screen.findByTestId("DelegateRegistrationForm__review-step")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should set fee", async () => {
		const { asFragment } = renderComponent({
			defaultValues: {
				fee: "10",
			},
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
		await expect(screen.findByTestId("InputFee")).resolves.toBeVisible();

		await userEvent.click(screen.getByText(translations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		await waitFor(() => expect(inputElement).toHaveValue("10"));

		inputElement.select();
		await userEvent.clear(inputElement);
		await userEvent.type(inputElement, "11");

		await waitFor(() => expect(inputElement).toHaveValue("11"));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should error if validator public key is too long", async () => {
		renderComponent();

		const validatorPublicKey = "invalidPublicKey02147bf63839be7abb44707619b012a8b59ad3eda90be1c6e04eb9c630232268dea90be1c6e04eb9c630232268de";

		await userEvent.type(screen.getByTestId("Input__validator_public_key"), validatorPublicKey);

		await waitFor(() => expect(screen.getByTestId("Input__validator_public_key")).toHaveValue(validatorPublicKey));

		await waitFor(() => expect(screen.getByTestId("Input__validator_public_key")).toHaveAttribute("aria-invalid"));

		expect(screen.getByTestId("Input__error")).toBeVisible();
	});

	it("should set validator public key", async () => {
		const { form } = renderComponent();

		const validatorPublicKey = "02147bf63839be7abb44707619b012a8b59ad3eda90be1c6e04eb9c630232268de";

		await userEvent.type(screen.getByTestId("Input__validator_public_key"), validatorPublicKey);

		await waitFor(() => expect(screen.getByTestId("Input__validator_public_key")).toHaveValue(validatorPublicKey));
		await waitFor(() => expect(form?.getValues("validatorPublicKey")).toBe(validatorPublicKey));
	});

	it("should sign transaction", async () => {
		const form = {
			clearErrors: vi.fn(),
			getValues: () => ({
				fee: "1",
				mnemonic: MNEMONICS[0],
				network: wallet.network(),
				senderAddress: wallet.address(),
				validatorPublicKey: "02147bf63839be7abb44707619b012a8b59ad3eda90be1c6e04eb9c630232268de",
			}),
			setError: vi.fn(),
			setValue: vi.fn(),
		};
		const signMock = vi
			.spyOn(wallet.transaction(), "signDelegateRegistration")
			.mockReturnValue(Promise.resolve(delegateRegistrationFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [delegateRegistrationFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		await signDelegateRegistration({
			env,
			form,
			profile,
		});

		expect(signMock).toHaveBeenCalledWith({ data: { validatorPublicKey: "02147bf63839be7abb44707619b012a8b59ad3eda90be1c6e04eb9c630232268de" }, fee: 1 });
		expect(broadcastMock).toHaveBeenCalledWith(delegateRegistrationFixture.data.id);
		expect(transactionMock).toHaveBeenCalledWith(delegateRegistrationFixture.data.id);

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});

	it("should output transaction details", () => {
		const translations = vi.fn((translation) => translation);
		const transaction = {
			amount: () => delegateRegistrationFixture.data.amount / 1e8,
			data: () => ({
				data: () => delegateRegistrationFixture.data
			}),
			fee: () => delegateRegistrationFixture.data.fee / 1e8,
			id: () => delegateRegistrationFixture.data.id,
			recipient: () => delegateRegistrationFixture.data.recipient,
			sender: () => delegateRegistrationFixture.data.sender,
		} as Contracts.SignedTransactionData;

		render(
			<DelegateRegistrationForm.transactionDetails
				transaction={transaction}
				translations={translations}
				wallet={wallet}
			/>,
		);

		expect(screen.getByText("TRANSACTION.VALIDATOR_PUBLIC_KEY")).toBeInTheDocument();
		expect(screen.getByText("02147bf63839be7abb44707619b012a8b59ad3eda90be1c6e04eb9c630232268de")).toBeInTheDocument();
	});

	it("should sign transaction using password encryption", async () => {
		const walletUsesWIFMock = vi.spyOn(wallet.signingKey(), "exists").mockReturnValue(true);
		const walletWifMock = vi.spyOn(wallet.signingKey(), "get").mockReturnValue(MNEMONICS[0]);

		const form = {
			clearErrors: vi.fn(),
			getValues: () => ({
				encryptionPassword: "password",
				fee: "1",
				mnemonic: MNEMONICS[0],
				network: wallet.network(),
				validatorPublicKey: "02147bf63839be7abb44707619b012a8b59ad3eda90be1c6e04eb9c630232268de",
				senderAddress: wallet.address(),
			}),
			setError: vi.fn(),
			setValue: vi.fn(),
		};
		const signMock = vi
			.spyOn(wallet.transaction(), "signDelegateRegistration")
			.mockReturnValue(Promise.resolve(delegateRegistrationFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [delegateRegistrationFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		await signDelegateRegistration({
			env,
			form,
			profile,
		});

		expect(signMock).toHaveBeenCalledWith({ data: { validatorPublicKey: "02147bf63839be7abb44707619b012a8b59ad3eda90be1c6e04eb9c630232268de" }, fee: 1 });
		expect(broadcastMock).toHaveBeenCalledWith(delegateRegistrationFixture.data.id);
		expect(transactionMock).toHaveBeenCalledWith(delegateRegistrationFixture.data.id);

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		walletUsesWIFMock.mockRestore();
		walletWifMock.mockRestore();
	});
});
