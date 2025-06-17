import { Contracts } from "@/app/lib/mainsail";
import { Contracts as ProfilesContracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";
import { FormProvider, useForm, UseFormMethods } from "react-hook-form";

import { ValidatorRegistrationForm, signValidatorRegistration } from "./ValidatorRegistrationForm";
import * as useFeesHook from "@/app/hooks/use-fees";
import validatorRegistrationFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/validator-registration.json";
import { TransactionFixture } from "@/tests/fixtures/transactions";
import { configManager } from "@/app/lib/mainsail";

import {
	env,
	getDefaultProfileId,
	MNEMONICS,
	render,
	RenderResult,
	screen,
	syncValidators,
	waitFor,
} from "@/utils/testing-library";

let profile: ProfilesContracts.IProfile;
let wallet: ProfilesContracts.IReadWriteWallet;

const fees = { avg: 1.354, max: 10, min: 0 };

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
				<ValidatorRegistrationForm.component profile={profile} activeTab={activeTab} wallet={wallet} />
			</FormProvider>
		);
	};

	const utils: RenderResult = render(<Component />, {
		route: `/profiles/${profile.id()}`,
	});

	return { ...utils, form };
};

const createTransactionMock = (wallet: ProfilesContracts.IReadWriteWallet) =>
	// @ts-ignore
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => +validatorRegistrationFixture.data.amount / 1e8,
		data: () => ({ data: () => validatorRegistrationFixture.data }),
		explorerLink: () => `https://test.arkscan.io/transaction/${validatorRegistrationFixture.data.hash}`,
		from: () => validatorRegistrationFixture.data.from,
		gasPrice: () => +validatorRegistrationFixture.data.gasPrice / 1e8,
		hash: () => validatorRegistrationFixture.data.hash,
		to: () => validatorRegistrationFixture.data.to,
	});

const formStepID = "ValidatorRegistrationForm_form-step";

describe("ValidatorRegistrationForm", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();

		await syncValidators(profile);

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

		await expect(screen.findByTestId("ValidatorRegistrationForm__review-step")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should error if public key is too long", async () => {
		renderComponent();

		const validatorPublicKey =
			"invalidPublicKey02147bf63839be7abb44707619b012a8b59ad3eda90be1c6e04eb9c630232268dea90be1c6e04eb9c630232268de";

		await userEvent.type(screen.getByTestId("Input__validator_public_key"), validatorPublicKey);

		await waitFor(() => expect(screen.getByTestId("Input__validator_public_key")).toHaveValue(validatorPublicKey));

		await waitFor(() => expect(screen.getByTestId("Input__validator_public_key")).toHaveAttribute("aria-invalid"));

		expect(screen.getByTestId("Input__error")).toBeVisible();
	});

	it("should set public key", async () => {
		const { form } = renderComponent();

		const validatorPublicKey = "02147bf63839be7abb44707619b012a8b59ad3eda90be1c6e04eb9c630232268de";

		await userEvent.type(screen.getByTestId("Input__validator_public_key"), validatorPublicKey);

		await waitFor(() => expect(screen.getByTestId("Input__validator_public_key")).toHaveValue(validatorPublicKey));
		await waitFor(() => expect(form?.getValues("validatorPublicKey")).toBe(validatorPublicKey));
	});

	it("should sign transaction", async () => {
		const getMilestoneMock = vi.spyOn(configManager, "getMilestone").mockReturnValue({
			validatorRegistrationFee: 250_000_000_000_000_000_000,
		});

		const form = {
			clearErrors: vi.fn(),
			getValues: () => ({
				gasLimit: "1",
				gasPrice: "1",
				mnemonic: MNEMONICS[0],
				network: wallet.network(),
				senderAddress: wallet.address(),
				validatorPublicKey: "02147bf63839be7abb44707619b012a8b59ad3eda90be1c6e04eb9c630232268de",
			}),
			setError: vi.fn(),
			setValue: vi.fn(),
		};
		const signMock = vi
			.spyOn(wallet.transaction(), "signValidatorRegistration")
			.mockReturnValue(Promise.resolve(validatorRegistrationFixture.data.hash));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [validatorRegistrationFixture.data.hash],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		await signValidatorRegistration({
			env,
			form,
			profile,
		});

		expect(signMock).toHaveBeenCalledWith({
			data: {
				validatorPublicKey: "02147bf63839be7abb44707619b012a8b59ad3eda90be1c6e04eb9c630232268de",
				value: 250_000_000_000_000_000_000,
			},
			gasLimit: "1",
			gasPrice: "1",
			signatory: undefined,
		});
		expect(broadcastMock).toHaveBeenCalledWith(validatorRegistrationFixture.data.hash);
		expect(transactionMock).toHaveBeenCalledWith(validatorRegistrationFixture.data.hash);

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		getMilestoneMock.mockRestore();
	});

	it("should output transaction details", () => {
		const translations = vi.fn((translation) => translation);
		const transaction = {
			...TransactionFixture,
			data: () => ({ data: () => validatorRegistrationFixture.data }),
			fee: () => validatorRegistrationFixture.data.fee / 1e8,
			from: () => validatorRegistrationFixture.data.from,
			gasLimit: () => validatorRegistrationFixture.data.gas,
			gasPrice: () => validatorRegistrationFixture.data.gasPrice,
			hash: () => validatorRegistrationFixture.data.hash,
			to: () => validatorRegistrationFixture.data.to,
			validatorPublicKey: () => "validatorPublickey.",
			value: () => validatorRegistrationFixture.data.amount / 1e8,
		} as Contracts.SignedTransactionData;

		render(
			<ValidatorRegistrationForm.transactionDetails
				transaction={transaction}
				translations={translations}
				wallet={wallet}
			/>,
		);

		expect(screen.getByText("TRANSACTION.VALIDATOR_PUBLIC_KEY")).toBeInTheDocument();
		expect(screen.getByText(/validatorPublickey/)).toBeInTheDocument();
	});

	it("should sign transaction using password encryption", async () => {
		const walletUsesWIFMock = vi.spyOn(wallet.signingKey(), "exists").mockReturnValue(true);
		const walletWifMock = vi.spyOn(wallet.signingKey(), "get").mockReturnValue(MNEMONICS[0]);

		const getMilestoneMock = vi.spyOn(configManager, "getMilestone").mockReturnValue({
			validatorRegistrationFee: 250_000_000_000_000_000_000,
		});

		const form = {
			clearErrors: vi.fn(),
			getValues: () => ({
				encryptionPassword: "password",
				gasLimit: "1",
				gasPrice: "1",
				mnemonic: MNEMONICS[0],
				network: wallet.network(),
				senderAddress: wallet.address(),
				validatorPublicKey: "02147bf63839be7abb44707619b012a8b59ad3eda90be1c6e04eb9c630232268de",
			}),
			setError: vi.fn(),
			setValue: vi.fn(),
		};
		const signMock = vi
			.spyOn(wallet.transaction(), "signValidatorRegistration")
			.mockReturnValue(Promise.resolve(validatorRegistrationFixture.data.hash));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [validatorRegistrationFixture.data.hash],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		await signValidatorRegistration({
			env,
			form,
			profile,
		});

		expect(signMock).toHaveBeenCalledWith({
			data: {
				validatorPublicKey: "02147bf63839be7abb44707619b012a8b59ad3eda90be1c6e04eb9c630232268de",
				value: 250_000_000_000_000_000_000,
			},
			gasLimit: "1",
			gasPrice: "1",
			signatory: undefined,
		});
		expect(broadcastMock).toHaveBeenCalledWith(validatorRegistrationFixture.data.hash);
		expect(transactionMock).toHaveBeenCalledWith(validatorRegistrationFixture.data.hash);

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		walletUsesWIFMock.mockRestore();
		walletWifMock.mockRestore();
		getMilestoneMock.mockRestore();
	});
});
