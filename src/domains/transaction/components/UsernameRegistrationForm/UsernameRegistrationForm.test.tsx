/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk";
import { Contracts as ProfilesContracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";
import { FormProvider, useForm, UseFormMethods } from "react-hook-form";
import { Route } from "react-router-dom";
import { createHashHistory } from "history";
import { UsernameRegistrationForm, signUsernameRegistration } from "./UsernameRegistrationForm";
import * as useSearchParametersValidationHook from "@/app/hooks/use-search-parameters-validation";
import * as useFeesHook from "@/app/hooks/use-fees";
import { translations } from "@/domains/transaction/i18n";
import usernameRegistrationFixture from "@/tests/fixtures/coins/ark/devnet/transactions/username-registration.json";
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

const createTransactionMock = (wallet: ProfilesContracts.IReadWriteWallet) =>
	// @ts-ignore
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => +usernameRegistrationFixture.data.amount / 1e8,
		data: () => ({ data: () => usernameRegistrationFixture.data }),
		explorerLink: () => `https://test.arkscan.io/transaction/${usernameRegistrationFixture.data.id}`,
		fee: () => +usernameRegistrationFixture.data.fee / 1e8,
		id: () => usernameRegistrationFixture.data.id,
		recipient: () => usernameRegistrationFixture.data.recipient,
		sender: () => usernameRegistrationFixture.data.sender,
		username: () => usernameRegistrationFixture.data.asset.username,
	});

const formStepID = "UsernameRegistrationForm__form-step";

describe("UsernameRegistrationForm", () => {
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
					<UsernameRegistrationForm.component profile={profile} activeTab={activeTab} wallet={wallet} />
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

	it("should render form step for a wallet with previous username", async () => {
		const walletWithUsername = vi.spyOn(wallet, "username").mockReturnValue("test_username");

		renderComponent();

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		expect(screen.getByText("New Username")).toBeInTheDocument();
		expect(screen.getByText(/This address is currently registered to the username/)).toBeInTheDocument();

		walletWithUsername.mockRestore();
	});

	it("should render review step", async () => {
		const { asFragment } = renderComponent({ activeTab: 2 });

		await expect(screen.findByTestId("UsernameRegistrationForm__review-step")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should set username", async () => {
		const { form } = renderComponent();

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("Input__username"), "test_username");

		await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveValue("test_username"));
		await waitFor(() => expect(form?.getValues("username")).toBe("test_username"));
	});

	it("should set fee", async () => {
		const { asFragment } = renderComponent({
			defaultValues: {
				fee: "10",
			},
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
		await expect(screen.findByTestId("InputFee")).resolves.toBeVisible();

		userEvent.click(screen.getByText(translations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		await waitFor(() => expect(inputElement).toHaveValue("10"));

		inputElement.select();
		userEvent.paste(inputElement, "11");

		await waitFor(() => expect(inputElement).toHaveValue("11"));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should show error if username contains illegal characters", async () => {
		const { asFragment } = renderComponent();

		await waitFor(() => expect(screen.getByTestId(formStepID)));

		userEvent.paste(screen.getByTestId("Input__username"), "<invalid>");

		await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveAttribute("aria-invalid"));

		expect(screen.getByTestId("Input__error")).toBeVisible();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should error if username is too long", async () => {
		const { asFragment } = renderComponent();

		await waitFor(() => expect(screen.getByTestId(formStepID)));

		userEvent.paste(screen.getByTestId("Input__username"), "thisisaveryveryverylongdelegatename");

		await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveAttribute("aria-invalid"));

		expect(screen.getByTestId("Input__error")).toBeVisible();
		expect(asFragment()).toMatchSnapshot();
	});

	// it("should show error if username already exists", async () => {
	// 	const { asFragment } = renderComponent();
	//
	// 	await waitFor(() => expect(screen.getByTestId(formStepID)));
	//
	// 	userEvent.paste(screen.getByTestId("Input__username"), "arkx");
	//
	// 	await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveAttribute("aria-invalid"));
	//
	// 	expect(screen.getByTestId("Input__error")).toBeVisible();
	// 	expect(asFragment()).toMatchSnapshot();
	// });

	it("should sign transaction", async () => {
		const form = {
			clearErrors: vi.fn(),
			getValues: () => ({
				fee: "1",
				mnemonic: MNEMONICS[0],
				network: wallet.network(),
				senderAddress: wallet.address(),
				username: "test_username",
			}),
			setError: vi.fn(),
			setValue: vi.fn(),
		};
		const signMock = vi
			.spyOn(wallet.transaction(), "signUsernameRegistration")
			.mockReturnValue(Promise.resolve(usernameRegistrationFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [usernameRegistrationFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		await signUsernameRegistration({
			env,
			form,
			profile,
		});

		expect(signMock).toHaveBeenCalledWith({ data: { username: "test_username" }, fee: 1 });
		expect(broadcastMock).toHaveBeenCalledWith(usernameRegistrationFixture.data.id);
		expect(transactionMock).toHaveBeenCalledWith(usernameRegistrationFixture.data.id);

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});

	it("should output transaction details", () => {
		const translations = vi.fn((translation) => translation);
		const transaction = {
			amount: () => usernameRegistrationFixture.data.amount / 1e8,
			data: () => ({ data: () => usernameRegistrationFixture.data }),
			fee: () => usernameRegistrationFixture.data.fee / 1e8,
			id: () => usernameRegistrationFixture.data.id,
			recipient: () => usernameRegistrationFixture.data.recipient,
			sender: () => usernameRegistrationFixture.data.sender,
			username: () => usernameRegistrationFixture.data.asset.username,
		} as Contracts.SignedTransactionData;

		render(
			<UsernameRegistrationForm.transactionDetails
				transaction={transaction}
				translations={translations}
				wallet={wallet}
			/>,
		);

		expect(screen.getByText("TRANSACTION.USERNAME")).toBeInTheDocument();
		expect(screen.getByText("test_username")).toBeInTheDocument();
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
				senderAddress: wallet.address(),
				username: "test_username",
			}),
			setError: vi.fn(),
			setValue: vi.fn(),
		};
		const signMock = vi
			.spyOn(wallet.transaction(), "signUsernameRegistration")
			.mockReturnValue(Promise.resolve(usernameRegistrationFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [usernameRegistrationFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		await signUsernameRegistration({
			env,
			form,
			profile,
		});

		expect(signMock).toHaveBeenCalledWith({ data: { username: "test_username" }, fee: 1 });
		expect(broadcastMock).toHaveBeenCalledWith(usernameRegistrationFixture.data.id);
		expect(transactionMock).toHaveBeenCalledWith(usernameRegistrationFixture.data.id);

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		walletUsesWIFMock.mockRestore();
		walletWifMock.mockRestore();
	});
});

describe("UsernameRegistrationForm without wallet", () => {
	const history = createHashHistory();

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
					<UsernameRegistrationForm.component
						profile={profile}
						activeTab={activeTab}
						showWalletSelector={true}
						onSelectedWallet={properties?.onSelectedWallet}
					/>
				</FormProvider>
			);
		};

		const utils: RenderResult = render(
			<Route path="/profiles/:profileId">
				<Component />
			</Route>,
			{
				history,
				route: `/profiles/${profile.id()}`,
			},
		);

		return { ...utils, form };
	};

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

	let extractNetworkFromParametersMock: any;

	beforeEach(() => {
		extractNetworkFromParametersMock = vi.spyOn(useSearchParametersValidationHook, "extractNetworkFromParameters");
	});

	afterEach(() => {
		extractNetworkFromParametersMock.mockRestore();
	});

	it("should render form step and select address", async () => {
		extractNetworkFromParametersMock.mockReturnValue(wallet.network());

		const onSelectedWallet = vi.fn();
		renderComponent({
			onSelectedWallet,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		expect(screen.getByTestId("SelectAddress__wrapper")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectAddress__wrapper"));

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		const firstAddress = screen.getByTestId("SearchWalletListItem__select-0");

		userEvent.click(firstAddress);

		expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address());

		userEvent.paste(screen.getByTestId("Input__username"), "test_username");

		await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveValue("test_username"));

		expect(onSelectedWallet).toHaveBeenCalledWith(wallet);
	});

	it("redirects to dashboard if parameters are invalid", async () => {
		const historySpy = vi.spyOn(history, "push").mockImplementation(vi.fn());

		extractNetworkFromParametersMock.mockImplementation(() => {
			throw new Error("NETWORK_MISMATCH");
		});

		renderComponent();

		await waitFor(() => {
			expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/dashboard`);
		});

		historySpy.mockRestore();
	});

	it("synchronize if not full restored", async () => {
		extractNetworkFromParametersMock.mockReturnValue(wallet.network());

		const hasBeenFullyRestoredSpy = vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(false);
		const identitySpy = vi.spyOn(wallet.synchroniser(), "identity").mockImplementation();

		const onSelectedWallet = vi.fn();
		renderComponent({
			onSelectedWallet,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		expect(screen.getByTestId("SelectAddress__wrapper")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("SelectAddress__wrapper"));

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		const firstAddress = screen.getByTestId("SearchWalletListItem__select-0");

		userEvent.click(firstAddress);

		expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address());

		userEvent.paste(screen.getByTestId("Input__username"), "test_username");

		await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveValue("test_username"));

		expect(onSelectedWallet).toHaveBeenCalledWith(wallet);

		expect(identitySpy).toHaveBeenCalled();

		hasBeenFullyRestoredSpy.mockRestore();
		identitySpy.mockRestore();
	});
});
