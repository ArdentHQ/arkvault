/* eslint-disable @typescript-eslint/require-await */
import { DateTime } from "@ardenthq/sdk-intl";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Route } from "react-router-dom";

import { FormStep } from "./FormStep";
import { ReviewStep } from "./ReviewStep";
import { SendTransfer } from "./SendTransfer";
import { NetworkStep } from "./NetworkStep";
import { buildTransferData } from "@/domains/transaction/pages/SendTransfer/SendTransfer.helpers";
import { minVersionList, StepsProvider } from "@/app/contexts";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import transactionFixture from "@/tests/fixtures/coins/ark/devnet/transactions/transfer.json";
import transactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";
import nodeFeesFixture from "@/tests/fixtures/coins/ark/mainnet/node-fees.json";

import {
	env,
	getDefaultProfileId,
	getDefaultWalletId,
	getDefaultWalletMnemonic,
	queryElementForSvg,
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
import { server, requestMock } from "@/tests/mocks/server";
import * as useConfirmedTransactionMock from "@/domains/transaction/components/TransactionSuccessful/hooks/useConfirmedTransaction";
import { BigNumber } from "@ardenthq/sdk-helpers";

const passphrase = getDefaultWalletMnemonic();
const fixtureProfileId = getDefaultProfileId();
const fixtureWalletId = getDefaultWalletId();

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const createTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => +transactionFixture.data.amount / 1e8,
		blockId: () => transactionFixture.data.blockId,
		confirmations: () => 10,
		convertedAmount: () => +transactionFixture.data.amount / 1e8,
		data: () => ({ data: () => transactionFixture.data }),
		explorerLink: () => `https://test.arkscan.io/transaction/${transactionFixture.data.id}`,
		explorerLinkForBlock: () => `https://test.arkscan.io/block/${transactionFixture.data.id}`,
		fee: () => +transactionFixture.data.fee / 1e8,
		id: () => transactionFixture.data.id,
		isConfirmed: () => true,
		isDelegateRegistration: () => false,
		isDelegateResignation: () => false,
		isIpfs: () => false,
		isMultiPayment: () => false,
		isMultiSignatureRegistration: () => false,
		isSent: () => true,
		isTransfer: () => true,
		isUnvote: () => false,
		isVote: () => false,
		isVoteCombination: () => false,
		memo: () => null,
		nonce: () => BigNumber.make(276),
		recipient: () => transactionFixture.data.recipient,
		recipients: () => [
			{ address: transactionFixture.data.recipient, amount: +transactionFixture.data.amount / 1e8 },
		],
		sender: () => transactionFixture.data.sender,
		timestamp: () => DateTime.make(),
		type: () => "transfer",
		usesMultiSignature: () => false,
		wallet: () => wallet,
	} as DTO.ExtendedSignedTransactionData);

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let secondWallet: Contracts.IReadWriteWallet;
let firstWalletAddress: string;
let resetProfileNetworksMock: () => void;

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
				<FormStep profile={profile} deeplinkProps={deeplinkProperties} />
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

		await syncFees(profile);
	});

	beforeEach(() => {
		server.use(
			requestMock(
				"https://ark-test.arkvault.io/api/transactions/8f913b6b719e7767d49861c0aec79ced212767645cb793d75d2f1b89abb49877",
				transactionFixture,
			),
			requestMock("https://ark-test.arkvault.io/api/transactions", transactionsFixture, {
				query: { address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD" },
			}),
			requestMock(
				"https://ark-test.arkvault.io/api/transactions",
				{ data: [], meta: {} },
				{
					query: {
						limit: 20,
						page: 1,
						senderId: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
					},
				},
			),
			requestMock("https://ark-test-musig.arkvault.io/", { result: [] }, { method: "post" }),
			requestMock("https://ark-live.arkvault.io/api/node/fees", nodeFeesFixture),
		);

		vi.spyOn(wallet.coin().ledger(), "getVersion").mockResolvedValue(minVersionList[wallet.network().coin()]);
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		vi.spyOn(useConfirmedTransactionMock, "useConfirmedTransaction").mockReturnValue({
			confirmations: 10,
			isConfirmed: true,
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
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

	it.each(["xs", "lg"])("should render form step (%s)", async (breakpoint) => {
		const { asFragment } = renderWithForm(
			<StepsProvider activeStep={1} steps={4}>
				<FormStep deeplinkProps={{}} profile={profile} />
			</StepsProvider>,
			{
				breakpoint,
				defaultValues: {
					network: wallet.network(),
				},
				registerCallback: defaultRegisterCallback,
				withProviders: true,
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		if (breakpoint === "xs") {
			expect(
				screen.getByText(transactionTranslations.PAGE_TRANSACTION_SEND.FORM_STEP.SCAN_FULL),
			).toBeInTheDocument();
		}

		if (breakpoint === "lg") {
			expect(screen.getByText(transactionTranslations.PAGE_TRANSACTION_SEND.FORM_STEP.SCAN)).toBeInTheDocument();

			await waitFor(() => expect(screen.getAllByTestId("Amount")).toHaveLength(3));
		}

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render form step without memo input", async () => {
		const memoMock = vi.spyOn(wallet.network(), "usesMemo").mockReturnValue(false);

		renderWithForm(
			<StepsProvider activeStep={1} steps={4}>
				<FormStep deeplinkProps={{}} profile={profile} />
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

		memoMock.mockRestore();
	});

	it("should render form step without test networks", async () => {
		const resetProfileNetworksMock = mockProfileWithOnlyPublicNetworks(profile);

		renderWithForm(
			<StepsProvider activeStep={1} steps={4}>
				<FormStep deeplinkProps={{}} profile={profile} />,
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

		render(
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
	});

	it("should render form step with deeplink values and handle case no coin returned", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		const profileCoinsSpy = vi.spyOn(profile.coins(), "get").mockReturnValueOnce(undefined);
		const walletNetworkSpy = vi.spyOn(wallet.network(), "ticker");

		history.push(transferURL);

		const deeplinkProperties: any = {
			amount: "1.2",
			coin: "ARK",
			method: "transfer",
			network: "ark.devnet",
			recipient: "DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9",
		};

		render(
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

		await expect(walletNetworkSpy).toHaveBeenCalledWith();

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
		expect(container).toHaveTextContent(wallet.address());
		expect(container).toHaveTextContent("View Full List");

		if (memo) {
			expect(container).toHaveTextContent(memo);
		}

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render network selection without selected wallet", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		history.push(transferURL);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/send-transfer">
				<SendTransfer />
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
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(networkStepID)).resolves.toBeVisible();

		expect(queryElementForSvg(screen.getByTestId("NetworkOptions"), "ark")).toBeInTheDocument();

		resetProfileNetworksMock();
	});

	it("should render with only one network", async () => {
		const networkMock = vi.spyOn(profile, "availableNetworks").mockReturnValue([profile.availableNetworks()[1]]);

		const transferURL = `/profiles/${profile.id()}/send-transfer`;

		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		networkMock.mockRestore();
	});

	it("should render form and use location state with network parameter", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${fixtureWalletId}/send-transfer?recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&memo=ARK&coin=ark&network=ark.devnet&amount=0`;
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
	});

	it("should render form and use location state with nethash parameter", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${fixtureWalletId}/send-transfer?recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&memo=ARK&coin=ark&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867&amount=0`;
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
	});

	it("should render form and use location state without memo", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${fixtureWalletId}/send-transfer?coin=ark&network=ark.devnet`;
		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
	});

	it.each(["with keyboard", "without keyboard"])("should send a single transfer %s", async (inputMethod) => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		history.push(transferURL);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		// const networkLabel = `${wallet.network().coin()} ${wallet.network().name()}`;

		expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address());

		const goSpy = vi.spyOn(history, "go").mockImplementation(vi.fn());

		expect(backButton()).not.toHaveAttribute("disabled");

		await userEvent.click(backButton());

		expect(goSpy).toHaveBeenCalledWith(-1);

		await selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await selectFirstRecipient();

		expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress);

		// Amount
		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");

		expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1");

		// Memo
		await userEvent.clear(screen.getByTestId("Input__memo"));
		await userEvent.type(screen.getByTestId("Input__memo"), "test memo");

		expect(screen.getByTestId("Input__memo")).toHaveValue("test memo");

		// Fee
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));

		expect(screen.getAllByRole("radio")[0]).toBeChecked();

		// remove focus from fee button
		await userEvent.click(document.body);

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		// Step 2
		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { interval: 5 });

		if (inputMethod === "with keyboard") {
			await userEvent.keyboard("{enter}");
		} else {
			await userEvent.click(continueButton());
		}

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Step 3
		expect(continueButton()).not.toBeDisabled();

		if (inputMethod === "with keyboard") {
			await userEvent.keyboard("{enter}");
		} else {
			await userEvent.click(continueButton());
		}

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);

		expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase);

		// Step 5 (skip step 4 for now - ledger confirmation)
		const signMock = vi
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		await waitFor(() => expect(sendButton()).not.toBeDisabled(), { interval: 10 });

		// const expirationMock = vi.spyOn(wallet.coin().transaction(), "estimateExpiration").mockResolvedValue(undefined);
		await userEvent.keyboard("{enter}");

		await expect(screen.findByText("Transfer")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		expect(container).toMatchSnapshot();

		// Go back to wallet
		const pushSpy = vi.spyOn(history, "push");
		await userEvent.click(backToWalletButton());

		expect(pushSpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		goSpy.mockRestore();
		pushSpy.mockRestore();
	});

	it("should fail sending a single transfer", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address());

		const goSpy = vi.spyOn(history, "go").mockImplementation(vi.fn());

		expect(backButton()).not.toHaveAttribute("disabled");

		await userEvent.click(backButton());

		expect(goSpy).toHaveBeenCalledWith(-1);

		await selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await selectFirstRecipient();

		expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress);

		// Amount
		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");

		expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1");

		// Memo
		await userEvent.clear(screen.getByTestId("Input__memo"));
		await userEvent.type(screen.getByTestId("Input__memo"), "test memo");

		expect(screen.getByTestId("Input__memo")).toHaveValue("test memo");

		// Fee
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));

		expect(screen.getAllByRole("radio")[0]).toBeChecked();

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		// Step 2
		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { interval: 5 });

		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Back to Step 1
		await userEvent.click(backButton());

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		// Step 2
		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { interval: 5 });

		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Step 3
		expect(continueButton()).not.toBeDisabled();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);

		expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase);

		// Step 5 (skip step 4 for now - ledger confirmation)
		const signMock = vi
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [],
			//@ts-ignore
			errors: { [transactionFixture.data.id]: "ERROR" },

			rejected: [transactionFixture.data.id],
		});
		const transactionMock = createTransactionMock(wallet);

		await waitFor(() => expect(sendButton()).not.toBeDisabled(), { interval: 10 });
		await userEvent.click(sendButton());

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
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		const goSpy = vi.spyOn(history, "go").mockImplementation(vi.fn());

		expect(backButton()).not.toHaveAttribute("disabled");

		await userEvent.click(backButton());

		expect(goSpy).toHaveBeenCalledWith(-1);

		await selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress));

		// Amount
		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		// Memo
		await userEvent.clear(screen.getByTestId("Input__memo"));
		await userEvent.type(screen.getByTestId("Input__memo"), "test memo");
		await waitFor(() => expect(screen.getByTestId("Input__memo")).toHaveValue("test memo"));

		// Fee
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		// Step 2
		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { interval: 5 });

		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Step 3
		expect(continueButton()).not.toBeDisabled();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		// Step 5 (skip step 4 for now - ledger confirmation)
		const signMock = vi
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);
		const expirationMock = vi.spyOn(wallet.coin().transaction(), "estimateExpiration").mockResolvedValue(undefined);

		await waitFor(() => expect(sendButton()).not.toBeDisabled(), { interval: 10 });
		await userEvent.click(sendButton());

		await expect(screen.findByText("Transfer")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		expect(container).toMatchSnapshot();

		// Go back to wallet
		const pushSpy = vi.spyOn(history, "push");
		await userEvent.click(backToWalletButton());

		expect(pushSpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		goSpy.mockRestore();
		pushSpy.mockRestore();
		expirationMock.mockRestore();
	});

	it("should send a single transfer with a multisignature wallet", async () => {
		const isMultiSignatureSpy = vi.spyOn(wallet, "isMultiSignature").mockImplementation(() => true);
		const multisignatureSpy = vi
			.spyOn(wallet.multiSignature(), "all")
			.mockReturnValue({ min: 2, publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!] });

		const transferURL = `/profiles/${fixtureProfileId}/transactions/${wallet.id()}/transfer`;

		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/transactions/:walletId/transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		await selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress));

		// Amount
		await expect(screen.findByTestId(sendAllID)).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId(sendAllID));
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).not.toHaveValue("0"), { timeout: 4000 });

		// Fee
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		// Step 2
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Step 5 (skip step 4 for now - ledger confirmation)
		const signMock = vi
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		await userEvent.click(continueButton());

		await expect(screen.findByText("Transfer")).resolves.toBeVisible();

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
		vi.spyOn(wallet, "isLedger").mockImplementation(() => true);
		vi.spyOn(wallet.coin(), "__construct").mockImplementation(vi.fn());
		vi.spyOn(wallet.ledger(), "isNanoX").mockResolvedValue(true);

		vi.spyOn(wallet.coin().ledger(), "getPublicKey").mockResolvedValue(
			"0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb",
		);

		vi.spyOn(wallet.transaction(), "signTransfer").mockReturnValue(Promise.resolve(transactionFixture.data.id));

		createTransactionMock(wallet);

		vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});

		const transferURL = `/profiles/${fixtureProfileId}/transactions/${wallet.id()}/transfer`;

		history.push(transferURL);

		mockNanoXTransport();

		render(
			<Route path="/profiles/:profileId/transactions/:walletId/transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		await selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress));

		// Amount
		await userEvent.click(screen.getByTestId(sendAllID));
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).not.toHaveValue("0"), { timeout: 4000 });

		// Memo
		await userEvent.clear(screen.getByTestId("Input__memo"));
		await userEvent.type(screen.getByTestId("Input__memo"), "test memo");

		expect(screen.getByTestId("Input__memo")).toHaveValue("test memo");

		// Fee
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		const address = wallet.address();
		const balance = wallet.balance();
		const derivationPath = "m/44'/1'/1'/0/0";

		vi.spyOn(wallet.data(), "get").mockImplementation((key) => {
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
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Step 3
		expect(continueButton()).not.toBeDisabled();

		await userEvent.click(continueButton());

		// Auto broadcast
		await expect(screen.findByText("Transfer")).resolves.toBeVisible();

		vi.restoreAllMocks();
	});

	it("should error if wrong mnemonic", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		history.push(transferURL);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		await selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await selectFirstRecipient();

		expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress);

		// Amount
		await userEvent.click(screen.getByTestId(sendAllID));
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).not.toHaveValue("0"), { timeout: 4000 });

		// Memo
		await userEvent.clear(screen.getByTestId("Input__memo"));
		await userEvent.type(screen.getByTestId("Input__memo"), "test memo");

		expect(screen.getByTestId("Input__memo")).toHaveValue("test memo");

		// Fee
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		await waitFor(() => {
			expect(continueButton()).not.toBeDisabled();
		});

		await userEvent.click(continueButton());

		// Review Step
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		expect(continueButton()).not.toBeDisabled();

		await userEvent.click(continueButton());

		// Auth Step
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const inputElement: HTMLInputElement = screen.getByTestId("AuthenticationStep__mnemonic");

		await userEvent.clear(inputElement);
		await userEvent.type(inputElement, passphrase);

		expect(inputElement).toHaveValue(passphrase);

		await waitFor(() => expect(sendButton()).not.toBeDisabled(), { interval: 10 });

		inputElement.select();
		await userEvent.clear(inputElement);
		await userEvent.type(inputElement, MNEMONICS[0]);
		await waitFor(() => expect(inputElement).toHaveValue(MNEMONICS[0]));

		await waitFor(() => {
			expect(sendButton()).toBeDisabled();
		});

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

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		await selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await selectFirstRecipient();

		expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress);

		// Amount
		await userEvent.click(screen.getByTestId(sendAllID));
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).not.toHaveValue("0"), { timeout: 4000 });

		// Memo
		await userEvent.clear(screen.getByTestId("Input__memo"), "test memo");
		await userEvent.type(screen.getByTestId("Input__memo"), "test memo");

		expect(screen.getByTestId("Input__memo")).toHaveValue("test memo");

		// Fee
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		// Step 2
		expect(continueButton()).not.toBeDisabled();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Step 3
		expect(continueButton()).not.toBeDisabled();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		// Step 5 (skip step 4 for now - ledger confirmation)
		const signMock = vi.spyOn(wallet.transaction(), "signTransfer").mockImplementation(() => {
			throw new Error("broadcast error");
		});

		const historyMock = vi.spyOn(history, "push").mockReturnValue();

		await waitFor(() => {
			expect(sendButton()).toBeEnabled();
		});

		await userEvent.click(sendButton());

		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

		expect(screen.getByTestId("ErrorStep__errorMessage")).toHaveTextContent("broadcast error");
		expect(screen.getByTestId("ErrorStep__close-button")).toBeInTheDocument();
		expect(screen.getAllByTestId("clipboard-button__wrapper")[0]).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("ErrorStep__close-button"));

		const walletDetailPage = `/profiles/${getDefaultProfileId()}/wallets/${getDefaultWalletId()}`;
		await waitFor(() => expect(historyMock).toHaveBeenCalledWith(walletDetailPage));

		signMock.mockRestore();
	});

	it("should require amount if not set", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		await selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress));

		// Amount
		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveAttribute(ariaInvalid));
	});

	it("should send a single transfer and show unconfirmed transactions modal", async () => {
		//@ts-ignore
		const sentTransactionsMock = vi.spyOn(wallet.transactionIndex(), "sent").mockImplementation(() =>
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
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		const goSpy = vi.spyOn(history, "go").mockImplementation(vi.fn());

		expect(backButton()).not.toHaveAttribute("disabled");

		await userEvent.click(backButton());

		expect(goSpy).toHaveBeenCalledWith(-1);

		await selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress));

		// Amount
		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		// Memo
		await userEvent.clear(screen.getByTestId("Input__memo"));
		await userEvent.type(screen.getByTestId("Input__memo"), "test memo");
		await waitFor(() => expect(screen.getByTestId("Input__memo")).toHaveValue("test memo"));

		// Fee
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		// Step 2
		expect(continueButton()).not.toBeDisabled();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Step 3
		expect(continueButton()).not.toBeDisabled();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		// Step 5 (skip step 4 for now - ledger confirmation)
		const signMock = vi
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		await waitFor(() => expect(sendButton()).not.toBeDisabled(), { interval: 10 });
		await userEvent.click(sendButton());

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("ConfirmSendTransaction__cancel"));
		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());

		await userEvent.click(sendButton());

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("ConfirmSendTransaction__confirm"));

		await expect(screen.findByText("Transfer")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		expect(container).toMatchSnapshot();

		// Go back to wallet
		const pushSpy = vi.spyOn(history, "push");
		await userEvent.click(backToWalletButton());

		expect(pushSpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		goSpy.mockRestore();
		pushSpy.mockRestore();
		sentTransactionsMock.mockRestore();
	});

	it("should display unconfirmed transactions modal when submitting with Enter", async () => {
		const sentTransactionsMock = vi.spyOn(wallet.transactionIndex(), "sent").mockImplementation(() =>
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

		const signMock = vi
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		history.push(transferURL);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		await selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress));

		// enter amount
		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		// Fee
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		expect(continueButton()).not.toBeDisabled();

		// proceed to step 2
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// proceed to step 3
		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		// enter mnemonic
		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		await waitFor(() => expect(sendButton()).not.toBeDisabled(), { interval: 10 });

		// submit form
		await userEvent.click(sendButton());

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		// confirm within the modal
		await userEvent.click(screen.getByTestId("ConfirmSendTransaction__confirm"));

		await expect(screen.findByText("Transfer")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		sentTransactionsMock.mockRestore();

		expect(container).toMatchSnapshot();
	});

	it("should send a single transfer using wallet with encryption password", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;
		const actsWithMnemonicMock = vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);
		const actsWithWifWithEncryptionMock = vi.spyOn(wallet, "actsWithWifWithEncryption").mockReturnValue(true);
		const wifGetMock = vi.spyOn(wallet.signingKey(), "get").mockReturnValue(passphrase);

		history.push(transferURL);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<SendTransfer />
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address());

		const goSpy = vi.spyOn(history, "go").mockImplementation(vi.fn());

		expect(backButton()).not.toHaveAttribute("disabled");

		await userEvent.click(backButton());

		expect(goSpy).toHaveBeenCalledWith(-1);

		await selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await selectFirstRecipient();

		// Amount
		expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress);
		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");
		expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1");

		// Memo
		await userEvent.clear(screen.getByTestId("Input__memo"));
		await userEvent.type(screen.getByTestId("Input__memo"), "test memo");

		expect(screen.getByTestId("Input__memo")).toHaveValue("test memo");

		// Fee
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));

		expect(screen.getAllByRole("radio")[0]).toBeChecked();

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.00357");

		// Step 2
		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { interval: 5 });

		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Step 3
		expect(continueButton()).not.toBeDisabled();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("AuthenticationStep__encryption-password"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__encryption-password"), "password");

		expect(screen.getByTestId("AuthenticationStep__encryption-password")).toHaveValue("password");

		// Step 5 (skip step 4 for now - ledger confirmation)
		const signMock = vi
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		await waitFor(() => expect(sendButton()).not.toBeDisabled(), { interval: 10 });
		await userEvent.click(sendButton());

		await expect(screen.findByText("Transfer")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		actsWithMnemonicMock.mockRestore();
		actsWithWifWithEncryptionMock.mockRestore();
		wifGetMock.mockRestore();

		expect(container).toMatchSnapshot();

		// Go back to wallet
		const pushSpy = vi.spyOn(history, "push");
		await userEvent.click(backToWalletButton());

		expect(pushSpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		goSpy.mockRestore();
		pushSpy.mockRestore();
	});

	it("should show initial step when reset=1 is added to route query params", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		history.push(`${transferURL}?reset=1`);

		const replaceSpy = vi.spyOn(history, "replace").mockImplementation(vi.fn());

		render(
			<Route path="/profiles/:profileId/send-transfer">
				<SendTransfer />
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
