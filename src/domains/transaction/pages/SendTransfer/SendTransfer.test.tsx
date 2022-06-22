/* eslint-disable @typescript-eslint/require-await */
import "jest-extended";

import { DateTime } from "@ardenthq/sdk-intl";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import nock from "nock";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Route, Router } from "react-router-dom";

import { FormStep } from "./FormStep";
import { ReviewStep } from "./ReviewStep";
import { SendTransfer } from "./SendTransfer";
import { SummaryStep } from "./SummaryStep";
import { buildTransferData } from "@/domains/transaction/pages/SendTransfer/SendTransfer.helpers";
import { LedgerProvider, minVersionList, StepsProvider } from "@/app/contexts";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import transactionFixture from "@/tests/fixtures/coins/ark/devnet/transactions/transfer.json";
import {
	env,
	getDefaultProfileId,
	getDefaultWalletId,
	getDefaultWalletMnemonic,
	MNEMONICS,
	render,
	renderWithForm,
	screen,
	syncFees,
	waitFor,
	within,
	mockNanoXTransport,
	mockProfileWithPublicAndTestNetworks,
	mockProfileWithOnlyPublicNetworks,
} from "@/utils/testing-library";
import { NetworkStep } from "./NetworkStep";

const passphrase = getDefaultWalletMnemonic();
const fixtureProfileId = getDefaultProfileId();
const fixtureWalletId = getDefaultWalletId();

// We need more time on some of the tests here since we need to complete a bunch
// of steps to make a transaction
jest.setTimeout(10_000);

const createTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	jest.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => +transactionFixture.data.amount / 1e8,
		data: () => ({ data: () => transactionFixture.data }),
		explorerLink: () => `https://test.arkscan.io/transaction/${transactionFixture.data.id}`,
		fee: () => +transactionFixture.data.fee / 1e8,
		id: () => transactionFixture.data.id,
		isMultiSignatureRegistration: () => false,
		recipient: () => transactionFixture.data.recipient,
		recipients: () => [
			{
				address: transactionFixture.data.recipient,
				amount: +transactionFixture.data.amount / 1e8,
			},
		],
		sender: () => transactionFixture.data.sender,
		type: () => "transfer",
		usesMultiSignature: () => false,
	} as any);

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let secondWallet: Contracts.IReadWriteWallet;
let firstWalletAddress: string;
let resetProfileNetworksMock: () => void;
const transactionIdToBeVisible = () =>
	expect(screen.getByTestId("TransactionSuccessful")).toHaveTextContent("8f913b6b719e7767d");

const defaultRegisterCallback = ({ register }) => {
	register("network");
	register("fee");
	register("fees");
};

const Component = ({ deeplinkProperties }) => {
	const form = useForm({
		defaultValues: {
			network: wallet.network(),
			senderAddress: wallet.address(),
		},
	});

	const { register } = form;

	useEffect(() => {
		register("network");
		register("fee");
		register("fees");
		register("inputFeeSettings");
		register("senderAddress");
	}, [register]);

	return (
		<StepsProvider activeStep={0} steps={4}>
			<FormProvider {...form}>
				<FormStep networks={[]} profile={profile} deeplinkProps={deeplinkProperties} />
			</FormProvider>
		</StepsProvider>
	);
};

const selectFirstRecipient = () => userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
const selectRecipient = () =>
	userEvent.click(within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"));
const backToWalletButton = () => screen.getByTestId("StepNavigation__back-to-wallet-button");
const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const backButton = () => screen.getByTestId("StepNavigation__back-button");
const sendButton = () => screen.getByTestId("StepNavigation__send-button");

const networkStepID = "SendTransfer__network-step";
const reviewStepID = "SendTransfer__review-step";
const formStepID = "SendTransfer__form-step";
const sendAllID = "AddRecipient__send-all";
const ariaInvalid = "aria-invalid";

const history = createHashHistory();

describe("SendTransfer", () => {
	beforeAll(async () => {
		profile = env.profiles().findById("b999d134-7a24-481e-a95d-bc47c543bfc9");

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();
		secondWallet = profile.wallets().last();

		// Profile needs a wallet on the mainnet network to show network selection
		// step.
		const { wallet: arkMainnetWallet } = await profile.walletFactory().generate({
			coin: "ARK",
			network: "ark.mainnet",
		});
		profile.wallets().push(arkMainnetWallet);

		firstWalletAddress = wallet.address();

		profile.coins().set("ARK", "ark.devnet");

		nock.disableNetConnect();

		nock("https://ark-test.arkvault.io")
			.get("/api/transactions?address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD")
			.reply(200, require("tests/fixtures/coins/ark/devnet/transactions.json"))
			.get("/api/transactions?page=1&limit=20&senderId=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD")
			.reply(200, { data: [], meta: {} })
			.get("/api/transactions/8f913b6b719e7767d49861c0aec79ced212767645cb793d75d2f1b89abb49877")
			.reply(200, () => require("tests/fixtures/coins/ark/devnet/transactions.json"));

		await syncFees(profile);
	});

	beforeEach(() => {
		jest.spyOn(wallet.coin().ledger(), "getVersion").mockResolvedValue(minVersionList[wallet.network().coin()]);
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		jest.restoreAllMocks();
		resetProfileNetworksMock();
	});

	it("should render network step with network cards", async () => {
		const { asFragment } = renderWithForm(
			<StepsProvider activeStep={1} steps={4}>
				<NetworkStep profile={profile} networks={profile.availableNetworks().slice(0, 2)} />
			</StepsProvider>,
			{
				registerCallback: defaultRegisterCallback,
				withProviders: true,
			},
		);

		expect(screen.getByTestId(networkStepID)).toBeInTheDocument();
		await waitFor(() => expect(screen.queryByTestId("FormLabel")).not.toBeInTheDocument());

		expect(
			within(screen.getByTestId("SendTransfer__network-step__select")).getAllByTestId("NetworkOption"),
		).toHaveLength(2);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render network step with dropdown", () => {
		const { asFragment } = renderWithForm(
			<StepsProvider activeStep={1} steps={4}>
				<NetworkStep profile={profile} networks={profile.availableNetworks()} />
			</StepsProvider>,
			{
				registerCallback: defaultRegisterCallback,
				withProviders: true,
			},
		);

		expect(screen.getByTestId(networkStepID)).toBeInTheDocument();
		expect(screen.getByTestId("FormLabel")).toBeInTheDocument();

		expect(
			within(screen.getByTestId("SendTransfer__network-step__select")).getByTestId("SelectDropdown"),
		).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render form step", async () => {
		const { asFragment } = renderWithForm(
			<StepsProvider activeStep={1} steps={4}>
				<FormStep deeplinkProps={{}} networks={[]} profile={profile} />
			</StepsProvider>,
			{
				defaultValues: {
					network: wallet.network(),
				},
				registerCallback: defaultRegisterCallback,
				withProviders: true,
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getAllByTestId("Amount")).toHaveLength(3));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render form step without memo input", async () => {
		const memoMock = jest.spyOn(wallet.network(), "usesMemo").mockReturnValue(false);

		const { asFragment } = renderWithForm(
			<StepsProvider activeStep={1} steps={4}>
				<FormStep deeplinkProps={{}} networks={[]} profile={profile} />
			</StepsProvider>,
			{
				defaultValues: {
					network: wallet.network(),
				},
				registerCallback: defaultRegisterCallback,
				withProviders: true,
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.queryByTestId("Input__memo")).not.toBeInTheDocument();
		});

		expect(asFragment()).toMatchSnapshot();

		memoMock.mockRestore();
	});

	it("should render form step without test networks", async () => {
		const resetProfileNetworksMock = mockProfileWithOnlyPublicNetworks(profile);

		const { asFragment } = renderWithForm(
			<StepsProvider activeStep={1} steps={4}>
				<FormStep deeplinkProps={{}} networks={env.availableNetworks()} profile={profile} />,
			</StepsProvider>,
			{
				defaultValues: {
					network: wallet.network(),
				},
				// eslint-disable-next-line sonarjs/no-identical-functions
				registerCallback: defaultRegisterCallback,
				withProviders: true,
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getAllByTestId("Amount")).toHaveLength(3));

		expect(asFragment()).toMatchSnapshot();

		resetProfileNetworksMock();
	});

	it("should render form step with deeplink values and use them", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		history.push(transferURL);

		const deeplinkProperties: any = {
			amount: "1.2",
			coin: "ARK",
			method: "transfer",
			network: "ark.devnet",
			recipient: "DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9",
		};

		const { asFragment } = render(
			<Route path="/profiles/:profileId/send-transfer">
				<StepsProvider activeStep={1} steps={4}>
					<Component deeplinkProperties={deeplinkProperties} />
				</StepsProvider>
				,
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render form step with deeplink values and handle case no coin returned", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		const profileCoinsSpy = jest.spyOn(profile.coins(), "get").mockReturnValueOnce(undefined);
		const walletNetworkSpy = jest.spyOn(wallet.network(), "ticker");

		history.push(transferURL);

		const deeplinkProperties: any = {
			amount: "1.2",
			coin: "ARK",
			method: "transfer",
			network: "ark.devnet",
			recipient: "DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9",
		};

		const { asFragment } = render(
			<Route path="/profiles/:profileId/send-transfer">
				<StepsProvider activeStep={1} steps={4}>
					<Component deeplinkProperties={deeplinkProperties} />
				</StepsProvider>
				,
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		expect(walletNetworkSpy).toHaveBeenCalledWith();

		expect(asFragment()).toMatchSnapshot();

		profileCoinsSpy.mockRestore();
		walletNetworkSpy.mockRestore();
	});

	it("should render review step", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		history.push(transferURL);

		const { result: form } = renderHook(() =>
			useForm({
				defaultValues: {
					fee: "1",
					memo: "test memo",
					network: wallet.network(),
					recipients: [
						{
							address: wallet.address(),
							alias: wallet.alias(),
							amount: 1,
						},
					],
					senderAddress: wallet.address(),
				},
			}),
		);

		const { asFragment, container } = render(
			<Route path="/profiles/:profileId/send-transfer">
				<FormProvider {...form.current}>
					<StepsProvider activeStep={1} steps={4}>
						<ReviewStep wallet={wallet} />
					</StepsProvider>
					,
				</FormProvider>
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();
		expect(container).toHaveTextContent(wallet.network().name());
		expect(screen.getAllByTestId("Address__alias")).toHaveLength(2);
		expect(container).toHaveTextContent("D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD");
		expect(container).toHaveTextContent("test memo");

		expect(asFragment()).toMatchSnapshot();
	});

	it.each([
		["with memo", "memo"],
		["without memo", undefined],
	])("should render review step with multiple recipients (%s)", async (_, memo) => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		history.push(transferURL);

		const { result: form } = renderHook(() =>
			useForm({
				defaultValues: {
					fee: "1",
					memo,
					network: wallet.network(),
					recipients: [
						{
							address: wallet.address(),
							amount: 1,
						},
						{
							address: secondWallet.address(),
							amount: 1,
						},
					],
					senderAddress: wallet.address(),
				},
			}),
		);

		const { asFragment, container } = render(
			<Route path="/profiles/:profileId/send-transfer">
				<FormProvider {...form.current}>
					<StepsProvider activeStep={1} steps={4}>
						<ReviewStep wallet={wallet} />
					</StepsProvider>
					,
				</FormProvider>
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();
		expect(container).toHaveTextContent(wallet.network().name());
		expect(container).toHaveTextContent(wallet.address());
		expect(container).toHaveTextContent(secondWallet.address());

		if (memo) {
			expect(container).toHaveTextContent(memo);
		}

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render summary step", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		history.push(transferURL);

		await wallet.synchroniser().identity();

		const transaction = new DTO.ExtendedSignedTransactionData(
			await wallet
				.coin()
				.transaction()
				.transfer({
					data: {
						amount: 1,
						to: wallet.address(),
					},
					fee: 1,
					nonce: "1",
					signatory: await wallet
						.coin()
						.signatory()
						.multiSignature({
							min: 2,
							publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!],
						}),
				}),
			wallet,
		);

		renderWithForm(
			<Router history={history}>
				<Route path="/profiles/:profileId/send-transfer">
					<StepsProvider activeStep={1} steps={4}>
						<SummaryStep transaction={transaction} senderWallet={wallet} profile={profile} />
					</StepsProvider>
					,
				</Route>
			</Router>,
			{
				defaultValues: {
					network: wallet.network(),
					senderAddress: wallet.address(),
				},
				// eslint-disable-next-line sonarjs/no-identical-functions
				registerCallback: defaultRegisterCallback,
				withProviders: true,
			},
		);

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();
	});

	it("should render network selection without selected wallet", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		history.push(transferURL);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/send-transfer">
				<LedgerProvider>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(networkStepID)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render network selection with sorted network", async () => {
		const profile = await env.profiles().create("test");
		await env.profiles().restore(profile);

		const { wallet: arkWallet } = await profile.walletFactory().generate({
			coin: "ARK",
			network: "ark.devnet",
		});
		const { wallet: arkMainnetWallet } = await profile.walletFactory().generate({
			coin: "ARK",
			network: "ark.mainnet",
		});
		profile.wallets().push(arkMainnetWallet);
		profile.wallets().push(arkWallet);
		await env.wallets().syncByProfile(profile);
		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		const transferURL = `/profiles/${profile.id()}/send-transfer`;

		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/send-transfer">
				<LedgerProvider>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(networkStepID)).resolves.toBeVisible();

		expect(screen.getByTestId("NetworkOptions")).toHaveTextContent("ark.svg");

		resetProfileNetworksMock();
	});

	it("should render form and use location state", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${fixtureWalletId}/send-transfer?recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&memo=ARK&coin=ark&network=ark.devnet`;
		history.push(transferURL);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render form and use location state without memo", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${fixtureWalletId}/send-transfer?coin=ark&network=ark.devnet`;
		history.push(transferURL);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["with keyboard", "without keyboard"])("should send a single transfer %s", async (inputMethod) => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		history.push(transferURL);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		// const networkLabel = `${wallet.network().coin()} ${wallet.network().name()}`;

		expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address());

		const goSpy = jest.spyOn(history, "go").mockImplementation();

		expect(backButton()).not.toHaveAttribute("disabled");

		userEvent.click(backButton());

		expect(goSpy).toHaveBeenCalledWith(-1);

		selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		selectFirstRecipient();

		expect(screen.getAllByTestId("SelectDropdown__input")[1]).toHaveValue(firstWalletAddress);

		// Amount
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");

		expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1");

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");

		expect(screen.getByTestId("Input__memo")).toHaveValue("test memo");

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));

		expect(screen.getAllByRole("radio")[0]).toBeChecked();

		// remove focus from fee button
		userEvent.click(document.body);

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		// Step 2
		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { interval: 5 });

		if (inputMethod === "with keyboard") {
			userEvent.keyboard("{enter}");
		} else {
			userEvent.click(continueButton());
		}

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Step 3
		expect(continueButton()).not.toBeDisabled();

		if (inputMethod === "with keyboard") {
			userEvent.keyboard("{enter}");
		} else {
			userEvent.click(continueButton());
		}

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);

		expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase);

		// Step 5 (skip step 4 for now - ledger confirmation)
		const signMock = jest
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		await waitFor(() => expect(sendButton()).not.toBeDisabled(), { interval: 10 });

		userEvent.keyboard("{enter}");
		userEvent.click(sendButton());

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		transactionIdToBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		expect(container).toMatchSnapshot();

		// Go back to wallet
		const pushSpy = jest.spyOn(history, "push");
		userEvent.click(backToWalletButton());

		expect(pushSpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		goSpy.mockRestore();
		pushSpy.mockRestore();
	});

	it("should fail sending a single transfer", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address());

		const goSpy = jest.spyOn(history, "go").mockImplementation();

		expect(backButton()).not.toHaveAttribute("disabled");

		userEvent.click(backButton());

		expect(goSpy).toHaveBeenCalledWith(-1);

		selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		selectFirstRecipient();

		expect(screen.getAllByTestId("SelectDropdown__input")[1]).toHaveValue(firstWalletAddress);

		// Amount
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");

		expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1");

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");

		expect(screen.getByTestId("Input__memo")).toHaveValue("test memo");

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));

		expect(screen.getAllByRole("radio")[0]).toBeChecked();

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		// Step 2
		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { interval: 5 });

		userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Back to Step 1
		userEvent.click(backButton());

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		// Step 2
		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { interval: 5 });

		userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Step 3
		expect(continueButton()).not.toBeDisabled();

		userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);

		expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase);

		// Step 5 (skip step 4 for now - ledger confirmation)
		const signMock = jest
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [],
			//@ts-ignore
			errors: { [transactionFixture.data.id]: "ERROR" },

			rejected: [transactionFixture.data.id],
		});
		const transactionMock = createTransactionMock(wallet);

		await waitFor(() => expect(sendButton()).not.toBeDisabled(), { interval: 10 });
		userEvent.click(sendButton());

		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});

	it("should send a single transfer and handle undefined expiration", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		history.push(transferURL);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		const goSpy = jest.spyOn(history, "go").mockImplementation();

		expect(backButton()).not.toHaveAttribute("disabled");

		userEvent.click(backButton());

		expect(goSpy).toHaveBeenCalledWith(-1);

		selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[1]).toHaveValue(firstWalletAddress));

		// Amount
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");
		await waitFor(() => expect(screen.getByTestId("Input__memo")).toHaveValue("test memo"));

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		// Step 2
		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { interval: 5 });

		userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Step 3
		expect(continueButton()).not.toBeDisabled();

		userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		// Step 5 (skip step 4 for now - ledger confirmation)
		const signMock = jest
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);
		const expirationMock = jest
			.spyOn(wallet.coin().transaction(), "estimateExpiration")
			.mockResolvedValue(undefined);

		await waitFor(() => expect(sendButton()).not.toBeDisabled(), { interval: 10 });
		userEvent.click(sendButton());

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		transactionIdToBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		expect(container).toMatchSnapshot();

		// Go back to wallet
		const pushSpy = jest.spyOn(history, "push");
		userEvent.click(backToWalletButton());

		expect(pushSpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		goSpy.mockRestore();
		pushSpy.mockRestore();
		expirationMock.mockRestore();
	});

	it("should send a single transfer with a multisignature wallet", async () => {
		const isMultiSignatureSpy = jest.spyOn(wallet, "isMultiSignature").mockImplementation(() => true);
		const multisignatureSpy = jest
			.spyOn(wallet.multiSignature(), "all")
			.mockReturnValue({ min: 2, publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!] });

		const transferURL = `/profiles/${fixtureProfileId}/transactions/${wallet.id()}/transfer`;

		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/transactions/:walletId/transfer">
				<LedgerProvider>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[1]).toHaveValue(firstWalletAddress));

		// Amount
		await expect(screen.findByTestId(sendAllID)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId(sendAllID));
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).not.toHaveValue("0"), { timeout: 4000 });

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		// Step 2
		userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Step 5 (skip step 4 for now - ledger confirmation)
		const signMock = jest
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		userEvent.click(continueButton());

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		expect(screen.getByTestId("TransactionSuccessful")).toHaveTextContent("8f913b6b719e");

		expect(signMock).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.anything(),
				fee: expect.any(Number),
				signatory: expect.any(Object),
			}),
		);

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		isMultiSignatureSpy.mockRestore();
		multisignatureSpy.mockRestore();
	});

	it("should send a single transfer with a ledger wallet", async () => {
		jest.spyOn(wallet, "isLedger").mockImplementation(() => true);
		jest.spyOn(wallet.coin(), "__construct").mockImplementation();
		jest.spyOn(wallet.ledger(), "isNanoX").mockResolvedValue(true);

		jest.spyOn(wallet.coin().ledger(), "getPublicKey").mockResolvedValue(
			"0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb",
		);

		jest.spyOn(wallet.transaction(), "signTransfer").mockReturnValue(Promise.resolve(transactionFixture.data.id));

		createTransactionMock(wallet);

		jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});

		const transferURL = `/profiles/${fixtureProfileId}/transactions/${wallet.id()}/transfer`;

		history.push(transferURL);

		mockNanoXTransport();

		render(
			<Route path="/profiles/:profileId/transactions/:walletId/transfer">
				<LedgerProvider>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[1]).toHaveValue(firstWalletAddress));

		// Amount
		userEvent.click(screen.getByTestId(sendAllID));
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).not.toHaveValue("0"), { timeout: 4000 });

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");

		expect(screen.getByTestId("Input__memo")).toHaveValue("test memo");

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		const address = wallet.address();
		const balance = wallet.balance();
		const derivationPath = "m/44'/1'/1'/0/0";

		jest.spyOn(wallet.data(), "get").mockImplementation((key) => {
			if (key == Contracts.WalletData.Address) {
				return address;
			}
			if (key == Contracts.WalletData.Balance) {
				return balance;
			}

			if (key == Contracts.WalletData.DerivationPath) {
				return derivationPath;
			}
		});

		// Step 2
		userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Step 3
		expect(continueButton()).not.toBeDisabled();

		userEvent.click(continueButton());

		// Auto broadcast
		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		jest.restoreAllMocks();
	});

	it("should error if wrong mnemonic", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		history.push(transferURL);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		selectFirstRecipient();

		expect(screen.getAllByTestId("SelectDropdown__input")[1]).toHaveValue(firstWalletAddress);

		// Amount
		userEvent.click(screen.getByTestId(sendAllID));
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).not.toHaveValue("0"), { timeout: 4000 });

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");

		expect(screen.getByTestId("Input__memo")).toHaveValue("test memo");

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		expect(continueButton()).not.toBeDisabled();

		userEvent.click(continueButton());

		// Review Step
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		expect(continueButton()).not.toBeDisabled();

		userEvent.click(continueButton());

		// Auth Step
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const inputElement: HTMLInputElement = screen.getByTestId("AuthenticationStep__mnemonic");

		userEvent.paste(inputElement, passphrase);

		expect(inputElement).toHaveValue(passphrase);

		await waitFor(() => expect(sendButton()).not.toBeDisabled(), { interval: 10 });

		inputElement.select();
		userEvent.paste(inputElement, MNEMONICS[0]);
		await waitFor(() => expect(inputElement).toHaveValue(MNEMONICS[0]));

		expect(sendButton()).toBeDisabled();

		await waitFor(() => expect(screen.getByTestId("Input__error")).toBeVisible());

		expect(screen.getByTestId("Input__error")).toHaveAttribute(
			"data-errortext",
			"This mnemonic does not correspond to your wallet",
		);
		expect(container).toMatchSnapshot();
	});

	it("should show error step and go back", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		history.push(transferURL);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		selectFirstRecipient();

		expect(screen.getAllByTestId("SelectDropdown__input")[1]).toHaveValue(firstWalletAddress);

		// Amount
		userEvent.click(screen.getByTestId(sendAllID));
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).not.toHaveValue("0"), { timeout: 4000 });

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");

		expect(screen.getByTestId("Input__memo")).toHaveValue("test memo");

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		// Step 2
		expect(continueButton()).not.toBeDisabled();

		userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Step 3
		expect(continueButton()).not.toBeDisabled();

		userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		// Step 5 (skip step 4 for now - ledger confirmation)
		const signMock = jest.spyOn(wallet.transaction(), "signTransfer").mockImplementation(() => {
			throw new Error("broadcast error");
		});

		const historyMock = jest.spyOn(history, "push").mockReturnValue();

		userEvent.click(sendButton());

		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

		expect(screen.getByTestId("ErrorStep__errorMessage")).toHaveTextContent("broadcast error");
		expect(screen.getByTestId("ErrorStep__wallet-button")).toBeInTheDocument();
		expect(screen.getAllByTestId("clipboard-button__wrapper")[0]).toBeInTheDocument();
		expect(container).toMatchSnapshot();

		userEvent.click(screen.getByTestId("ErrorStep__repeat-button"));

		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("ErrorStep__wallet-button"));

		const walletDetailPage = `/profiles/${getDefaultProfileId()}/wallets/${getDefaultWalletId()}`;
		await waitFor(() => expect(historyMock).toHaveBeenCalledWith(walletDetailPage));

		signMock.mockRestore();
	});

	it("should require amount if not set", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[1]).toHaveValue(firstWalletAddress));

		// Amount
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveAttribute(ariaInvalid));
	});

	it("should send a single transfer and show unconfirmed transactions modal", async () => {
		//@ts-ignore
		const sentTransactionsMock = jest.spyOn(wallet.transactionIndex(), "sent").mockImplementation(() =>
			Promise.resolve({
				items: () => [
					{
						convertedTotal: () => 0,
						isConfirmed: () => false,
						isMultiPayment: () => false,
						isSent: () => true,
						isTransfer: () => true,
						isUnvote: () => false,
						isVote: () => false,
						recipient: () => "D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
						recipients: () => ["D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb", wallet.address()],
						timestamp: () => DateTime.make(),
						total: () => 1,
						type: () => "transfer",
						wallet: () => wallet,
					},
					{
						convertedTotal: () => 0,
						isConfirmed: () => false,
						isMultiPayment: () => true,
						isSent: () => true,
						isTransfer: () => false,
						isUnvote: () => false,
						isVote: () => false,
						recipient: () => "D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
						recipients: () => ["D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb", wallet.address()],
						timestamp: () => DateTime.make(),
						total: () => 1,
						type: () => "multiPayment",
						wallet: () => wallet,
					},
				],
			}),
		);

		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		history.push(transferURL);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		const goSpy = jest.spyOn(history, "go").mockImplementation();

		expect(backButton()).not.toHaveAttribute("disabled");

		userEvent.click(backButton());

		expect(goSpy).toHaveBeenCalledWith(-1);

		selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[1]).toHaveValue(firstWalletAddress));

		// Amount
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");
		await waitFor(() => expect(screen.getByTestId("Input__memo")).toHaveValue("test memo"));

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		// Step 2
		expect(continueButton()).not.toBeDisabled();

		userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Step 3
		expect(continueButton()).not.toBeDisabled();

		userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		// Step 5 (skip step 4 for now - ledger confirmation)
		const signMock = jest
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		await waitFor(() => expect(sendButton()).not.toBeDisabled(), { interval: 10 });
		userEvent.click(sendButton());

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("ConfirmSendTransaction__cancel"));
		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());

		userEvent.click(sendButton());

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("ConfirmSendTransaction__confirm"));
		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		transactionIdToBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		expect(container).toMatchSnapshot();

		// Go back to wallet
		const pushSpy = jest.spyOn(history, "push");
		userEvent.click(backToWalletButton());

		expect(pushSpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		goSpy.mockRestore();
		pushSpy.mockRestore();
		sentTransactionsMock.mockRestore();
	});

	it("should display unconfirmed transactions modal when submitting with Enter", async () => {
		const sentTransactionsMock = jest.spyOn(wallet.transactionIndex(), "sent").mockImplementation(() =>
			Promise.resolve<any>({
				items: () => [
					{
						convertedTotal: () => 0,
						isConfirmed: () => false,
						isMultiPayment: () => false,
						isSent: () => true,
						isTransfer: () => true,
						isUnvote: () => false,
						isVote: () => false,
						recipient: () => "D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
						recipients: () => ["D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb", wallet.address()],
						timestamp: () => DateTime.make(),
						total: () => 1,
						type: () => "transfer",
						wallet: () => wallet,
					},
				],
			}),
		);

		const signMock = jest
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		history.push(transferURL);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[1]).toHaveValue(firstWalletAddress));

		// enter amount
		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		expect(continueButton()).not.toBeDisabled();

		// proceed to step 2
		userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// proceed to step 3
		userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		// enter mnemonic
		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		await waitFor(() => expect(sendButton()).not.toBeDisabled(), { interval: 10 });

		// submit form
		userEvent.click(sendButton());

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		// confirm within the modal
		userEvent.click(screen.getByTestId("ConfirmSendTransaction__confirm"));
		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		transactionIdToBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		sentTransactionsMock.mockRestore();

		expect(container).toMatchSnapshot();
	});

	it("should send a single transfer using wallet with encryption password", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;
		const actsWithMnemonicMock = jest.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);
		const actsWithWifWithEncryptionMock = jest.spyOn(wallet, "actsWithWifWithEncryption").mockReturnValue(true);
		const wifGetMock = jest.spyOn(wallet.signingKey(), "get").mockReturnValue(passphrase);

		history.push(transferURL);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address());

		const goSpy = jest.spyOn(history, "go").mockImplementation();

		expect(backButton()).not.toHaveAttribute("disabled");

		userEvent.click(backButton());

		expect(goSpy).toHaveBeenCalledWith(-1);

		selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		selectFirstRecipient();

		expect(screen.getAllByTestId("SelectDropdown__input")[1]).toHaveValue(firstWalletAddress),
			// Amount
			userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1");

		// Memo
		userEvent.paste(screen.getByTestId("Input__memo"), "test memo");

		expect(screen.getByTestId("Input__memo")).toHaveValue("test memo");

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));

		expect(screen.getAllByRole("radio")[0]).toBeChecked();

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		// Step 2
		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { interval: 5 });

		userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Step 3
		expect(continueButton()).not.toBeDisabled();

		userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__encryption-password"), "password");

		expect(screen.getByTestId("AuthenticationStep__encryption-password")).toHaveValue("password");

		// Step 5 (skip step 4 for now - ledger confirmation)
		const signMock = jest
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		await waitFor(() => expect(sendButton()).not.toBeDisabled(), { interval: 10 });
		userEvent.click(sendButton());

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		transactionIdToBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		actsWithMnemonicMock.mockRestore();
		actsWithWifWithEncryptionMock.mockRestore();
		wifGetMock.mockRestore();

		expect(container).toMatchSnapshot();

		// Go back to wallet
		const pushSpy = jest.spyOn(history, "push");
		userEvent.click(backToWalletButton());

		expect(pushSpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		goSpy.mockRestore();
		pushSpy.mockRestore();
	});

	it("should show initial step when reset=1 is added to route query params", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		history.push(`${transferURL}?reset=1`);

		const replaceSpy = jest.spyOn(history, "replace").mockImplementation();

		render(
			<Route path="/profiles/:profileId/send-transfer">
				<LedgerProvider>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await waitFor(() => expect(replaceSpy).toHaveBeenCalledWith(transferURL));

		expect(screen.getByTestId(networkStepID)).toBeInTheDocument();

		replaceSpy.mockRestore();
	});

	it("should buildTransferData return zero amount for empty multi recipients", async () => {
		const addresses = [wallet.address(), secondWallet.address()];

		const transferData = await buildTransferData({
			coin: wallet.coin(),
			memo: "any memo",
			recipients: [
				{
					address: addresses[0],
				},
				{
					address: addresses[1],
				},
			],
		});

		transferData.payments.map((payment, index) => {
			expect(payment.amount).toBe(0);
			expect(payment.to).toBe(addresses[index]);
		});
	});

	it("should buildTransferData return zero amount for empty single recipient", async () => {
		const transferData = await buildTransferData({
			coin: wallet.coin(),
			memo: "any memo",
			recipients: [
				{
					address: wallet.address(),
				},
			],
		});

		expect(transferData.amount).toBe(0);
		expect(transferData.to).toBe(wallet.address());
	});
});
