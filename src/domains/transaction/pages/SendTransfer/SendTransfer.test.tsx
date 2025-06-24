import * as useConfirmedTransactionMock from "@/domains/transaction/components/TransactionSuccessful/hooks/useConfirmedTransaction";

import { Contracts, DTO } from "@/app/lib/profiles";
import { FormProvider, useForm } from "react-hook-form";
import {
	env,
	getDefaultProfileId,
	getDefaultWalletId,
	getDefaultWalletMnemonic,
	mockNanoXTransport,
	mockProfileWithPublicAndTestNetworks,
	render,
	renderWithForm,
	screen,
	syncFees,
	waitFor,
	within,
	getMainsailProfileId,
} from "@/utils/testing-library";
import React, { useEffect } from "react";
import { StepsProvider } from "@/app/contexts";
import { requestMock, server } from "@/tests/mocks/server";

import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import { FormStep } from "./FormStep";
import { ReviewStep } from "./ReviewStep";
import { SendTransfer } from "./SendTransfer";
import nodeFeesFixture from "@/tests/fixtures/coins/mainsail/devnet/node-fees.json";
import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/transfer.json";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import transactionsFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions.json";
import userEvent from "@testing-library/user-event";
import { buildTransferData } from "./SendTransfer.helpers";

const passphrase = getDefaultWalletMnemonic();
const fixtureProfileId = getDefaultProfileId();
const fixtureWalletId = getDefaultWalletId();

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const signedTransactionMock = {
	blockHash: () => {},
	confirmations: () => BigNumber.ZERO,
	convertedAmount: () => +transactionFixture.data.value / 1e8,
	convertedFee: () => {
		const fee = BigNumber.make(transactionFixture.data.gasPrice).times(transactionFixture.data.gas).dividedBy(1e8);
		return fee.toNumber();
	},
	convertedTotal: () => BigNumber.ZERO,
	data: () => transactionFixture.data,
	explorerLink: () => `https://test.arkscan.io/transaction/${transactionFixture.data.hash}`,
	explorerLinkForBlock: () => {},
	fee: () => BigNumber.make(transactionFixture.data.gasPrice).times(transactionFixture.data.gas),
	from: () => transactionFixture.data.from,
	hash: () => transactionFixture.data.hash,
	isConfirmed: () => false,
	isMultiPayment: () => false,
	isMultiSignatureRegistration: () => false,
	isReturn: () => false,
	isSecondSignature: () => false,
	isSent: () => true,
	isSuccess: () => true,
	isTransfer: () => true,
	isUnvote: () => false,
	isUsernameRegistration: () => false,
	isUsernameResignation: () => false,
	isValidatorRegistration: () => false,
	isValidatorResignation: () => false,
	isVote: () => false,
	isVoteCombination: () => false,
	memo: () => transactionFixture.data.memo || undefined,
	nonce: () => BigNumber.make(transactionFixture.data.nonce),
	payments: () => [],
	recipients: () => [
		{
			address: transactionFixture.data.to,
			amount: +transactionFixture.data.value / 1e8,
		},
	],
	timestamp: () => DateTime.make(transactionFixture.data.timestamp),
	to: () => transactionFixture.data.to,
	total: () => {
		const value = BigNumber.make(transactionFixture.data.value);
		const feeVal = BigNumber.make(transactionFixture.data.gasPrice).times(transactionFixture.data.gas);
		return value.plus(feeVal);
	},
	type: () => "transfer",
	usesMultiSignature: () => false,
	value: () => +transactionFixture.data.value / 1e8,
	wallet: () => wallet,
} as DTO.ExtendedSignedTransactionData;

const createTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(signedTransactionMock);

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

const ComponentWrapper = ({
	defaultValues = {
		network: wallet.network(),
		senderAddress: wallet.address(),
	},
	activeStep = 0,
	children,
}) => {
	const form = useForm({
		defaultValues,
	});

	const { register } = form;

	useEffect(() => {
		register("network");
		register("fee");
		register("fees");
		register("InputFeeSettings");
		register("senderAddress");
		register("recipients");
	}, [register]);

	return (
		<StepsProvider activeStep={activeStep} steps={4}>
			<FormProvider {...form}>{children}</FormProvider>
		</StepsProvider>
	);
};

const FormStepComponent = ({ deeplinkProperties }) => (
	<ComponentWrapper>
		<FormStep profile={profile} deeplinkProps={deeplinkProperties} network={wallet.network()} />
	</ComponentWrapper>
);

const selectFirstRecipient = () => userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
const selectRecipient = () =>
	userEvent.click(within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"));
const backToWalletButton = () => screen.getByTestId("StepNavigation__back-to-wallet-button");
const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const backButton = () => screen.getByTestId("StepNavigation__back-button");
const sendButton = () => screen.getByTestId("StepNavigation__send-button");

const reviewStepID = "SendTransfer__review-step";
const formStepID = "SendTransfer__form-step";
const sendAllID = "AddRecipient__send-all";
const ariaInvalid = "aria-invalid";

describe("SendTransfer", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();
		secondWallet = profile.wallets().last();

		// Profile needs a wallet on the mainnet network to show network selection
		// step.
		const { wallet: arkMainnetWallet } = await profile.walletFactory().generate({
			coin: "Mainsail",
			network: "mainsail.mainnet",
		});
		profile.wallets().push(arkMainnetWallet);

		firstWalletAddress = wallet.address();

		await syncFees(profile);
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		vi.spyOn(wallet, "balance").mockReturnValue(1_000_000_000_000_000_000);

		server.use(
			requestMock(
				`https://dwallets-evm.mainsailhq.com/api/transactions/${transactionFixture.data.hash}`,
				transactionFixture,
			),
			requestMock("https://dwallets-evm.mainsailhq.com/api/transactions", transactionsFixture, {
				query: { address: wallet.address() },
			}),
			requestMock(
				`https://dwallets-evm.mainsailhq.com/api/blocks/${transactionFixture.data.blockHash}`,
				{ data: {} }, // Basic mock for block data
			),
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api/transactions",
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

		vi.spyOn(useConfirmedTransactionMock, "useConfirmedTransaction").mockReturnValue({
			confirmations: 10,
			isConfirmed: true,
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		resetProfileNetworksMock();
	});

	it.each(["xs", "lg"])("should render form step (%s)", async (breakpoint) => {
		renderWithForm(
			<StepsProvider activeStep={1} steps={4}>
				<FormStep deeplinkProps={{}} profile={profile} network={wallet.network()} />
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
		}

		await expect(screen.findByTestId("Amount")).resolves.toBeVisible();
	});

	it("should render form step with deeplink values and use them", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		const deeplinkProperties: any = {
			amount: "1.2",
			coin: "Mainsail",
			method: "transfer",
			network: "mainsail.devnet",
			recipient: wallet.address(),
		};

		render(
			<StepsProvider activeStep={1} steps={4}>
				<FormStepComponent deeplinkProperties={deeplinkProperties} />
			</StepsProvider>,
			{
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
	});

	it("should render form step with deeplink values and handle case no coin returned", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		const walletNetworkSpy = vi.spyOn(wallet.network(), "ticker");

		const deeplinkProperties: any = {
			amount: "1.2",
			coin: "Mainsail",
			method: "transfer",
			network: "mainsail.devnet",
			recipient: wallet.address(),
		};

		render(
			<StepsProvider activeStep={1} steps={4}>
				<FormStepComponent deeplinkProperties={deeplinkProperties} />
			</StepsProvider>,
			{
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await expect(walletNetworkSpy).toHaveBeenCalledWith();

		walletNetworkSpy.mockRestore();
	});

	it("should render review step", () => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		const defaultValues = {
			gasLimit: "1",
			gasPrice: "1",
			network: wallet.network(),
			recipients: [
				{
					address: wallet.address(),
					alias: wallet.alias(),
					amount: 1,
				},
			],
			senderAddress: wallet.address(),
		};

		const { container } = render(
			<ComponentWrapper defaultValues={defaultValues} activeStep={1}>
				<ReviewStep wallet={wallet} network={wallet.network()} />
			</ComponentWrapper>,
			{
				route: transferURL,
			},
		);

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();
		expect(screen.getAllByTestId("Address__alias")).toHaveLength(2);
		expect(container).toHaveTextContent(wallet.address());
	});

	it("should render review step with multiple recipients (%s)", (_, memo) => {
		const transferURL = `/profiles/${fixtureProfileId}/send-transfer`;

		const defaultValues = {
			gasLimit: "1",
			gasPrice: "1",
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
		};

		const { container } = render(
			<ComponentWrapper defaultValues={defaultValues} activeStep={1}>
				<ReviewStep wallet={wallet} network={wallet.network()} />
			</ComponentWrapper>,
			{
				route: transferURL,
			},
		);

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();
		expect(container).toHaveTextContent(wallet.address());
		expect(container).toHaveTextContent("View Full List");

		if (memo) {
			expect(container).toHaveTextContent(memo);
		}
	});

	it("should render with only one network", async () => {
		const networkMock = vi.spyOn(profile, "availableNetworks").mockReturnValue([profile.availableNetworks()[0]]);

		const transferURL = `/profiles/${fixtureProfileId}/wallets/${fixtureWalletId}/send-transfer`;

		render(<SendTransfer />, {
			route: transferURL,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		networkMock.mockRestore();
	});

	it("should render form and use location state with network parameter", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${fixtureWalletId}/send-transfer?recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&memo=ARK&coin=ark&network=mainsail.devnet&amount=0`;

		render(<SendTransfer />, {
			route: transferURL,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
	});

	it("should render form and use location state with nethash parameter", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${fixtureWalletId}/send-transfer?recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&memo=ARK&coin=ark&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867&amount=0`;

		render(<SendTransfer />, {
			route: transferURL,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
	});

	it("should render form and use location state without memo", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${fixtureWalletId}/send-transfer?coin=ark&network=mainsail.devnet`;

		render(<SendTransfer />, {
			route: transferURL,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
	});

	it.each(["with keyboard", "without keyboard"])("should send a single transfer %s", async (inputMethod) => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		const { router } = render(<SendTransfer />, {
			route: transferURL,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		// const networkLabel = `${wallet.network().coin()} ${wallet.network().name()}`;

		expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address());

		expect(backButton()).not.toHaveAttribute("disabled");

		await userEvent.click(backButton());

		expect(router.state.location.pathname).toBe(`/profiles/${profile.id()}/wallets/${wallet.id()}/send-transfer`);

		await selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await selectFirstRecipient();

		expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress);

		// Amount
		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");

		expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1");

		// Step 2
		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { interval: 5 });

		if (inputMethod === "with keyboard") {
			await userEvent.keyboard("{enter}");
		} else {
			await userEvent.click(continueButton());
		}

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Fee
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));

		expect(screen.getAllByRole("radio")[0]).toBeChecked();

		// remove focus from fee button
		await userEvent.click(document.body);

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.000105");

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
			.mockReturnValue(Promise.resolve(transactionFixture.data.hash));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.hash],
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

		// Go back to wallet
		await userEvent.click(backToWalletButton());

		expect(router.state.location.pathname).toBe(`/profiles/${profile.id()}/dashboard`);
	});

	it("should fail sending a single transfer", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		const { router } = render(<SendTransfer />, {
			route: transferURL,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address());

		expect(backButton()).not.toHaveAttribute("disabled");

		await userEvent.click(backButton());

		expect(router.state.location.pathname).toBe(`/profiles/${profile.id()}/wallets/${wallet.id()}/send-transfer`);

		await selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await selectFirstRecipient();

		expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress);

		// Amount
		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");

		expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1");

		// Step 2
		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { interval: 5 });

		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Fee
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));

		expect(screen.getAllByRole("radio")[0]).toBeChecked();

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.000105");

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
			.mockReturnValue(Promise.resolve(transactionFixture.data.hash));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [],
			//@ts-ignore
			errors: { [transactionFixture.data.hash]: "ERROR" },

			rejected: [transactionFixture.data.hash],
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

		const { router } = render(<SendTransfer />, {
			route: transferURL,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		expect(backButton()).not.toHaveAttribute("disabled");

		await userEvent.click(backButton());

		expect(router.state.location.pathname).toBe(transferURL);

		await selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress));

		// Amount
		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		// Step 2
		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { interval: 5 });

		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Fee
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.000105");

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
			.mockReturnValue(Promise.resolve(transactionFixture.data.hash));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.hash],
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

		// Go back to wallet
		await userEvent.click(backToWalletButton());
		expect(router.state.location.pathname).toBe(`/profiles/${profile.id()}/dashboard`);
	});

	it("should send a single transfer with a ledger wallet", async () => {
		vi.spyOn(wallet, "isLedger").mockImplementation(() => true);

		vi.spyOn(profile.ledger(), "isNanoX").mockResolvedValue(true);

		vi.spyOn(profile.ledger(), "getPublicKey").mockResolvedValue(
			"0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb",
		);

		vi.spyOn(wallet.transaction(), "signTransfer").mockReturnValue(Promise.resolve(transactionFixture.data.hash));

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

		vi.spyOn(wallet, "balance").mockReturnValue(1_000_000_000_000_000_000);

		createTransactionMock(wallet);

		vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.hash],
			errors: {},
			rejected: [],
		});

		const transferURL = `/profiles/${fixtureProfileId}/transactions/${wallet.id()}/transfer`;

		mockNanoXTransport();

		render(<SendTransfer />, {
			route: transferURL,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		await selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress));

		// Amount
		await userEvent.click(screen.getByTestId(sendAllID));
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).not.toHaveValue(0), { timeout: 4000 });

		// Step 2
		expect(continueButton()).not.toBeDisabled();
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Fee
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.000105");

		// Step 3
		expect(continueButton()).not.toBeDisabled();

		await userEvent.click(continueButton());

		// Auto broadcast
		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		vi.restoreAllMocks();
	});

	it("should error if wrong mnemonic", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;
		const mnemonicMock = vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(true);

		render(<SendTransfer />, {
			route: transferURL,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		await selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await selectFirstRecipient();

		expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress);

		// Amount
		await userEvent.click(screen.getByTestId(sendAllID));
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).not.toHaveValue("0"), { timeout: 4000 });

		await waitFor(() => {
			expect(continueButton()).not.toBeDisabled();
		});

		await userEvent.click(continueButton());

		// Fee
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.000105");

		// Review Step
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await waitFor(() => {
			expect(continueButton()).not.toBeDisabled();
		});

		expect(continueButton()).not.toBeDisabled();

		await userEvent.click(continueButton());

		// Auth Step
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const inputElement: HTMLInputElement = screen.getByTestId("AuthenticationStep__mnemonic");

		await userEvent.clear(inputElement);
		await userEvent.type(inputElement, passphrase);

		expect(inputElement).toHaveValue(passphrase);

		await userEvent.clear(inputElement);
		await userEvent.type(inputElement, "test");

		await waitFor(() => expect(inputElement).toHaveValue("test"));

		await waitFor(() => expect(screen.getByTestId("Input__error")).toBeVisible());

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toHaveAttribute(
				"data-errortext",
				"This mnemonic does not correspond to your wallet",
			);
		});

		mnemonicMock.mockRestore();
	});

	it("should show error step and go back", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		const { router } = render(<SendTransfer />, {
			route: transferURL,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		await selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await selectFirstRecipient();

		expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress);

		// Amount
		await userEvent.click(screen.getByTestId(sendAllID));
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).not.toHaveValue("0"), { timeout: 4000 });

		// Step 2
		expect(continueButton()).not.toBeDisabled();

		await userEvent.click(continueButton());

		// Fee
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.000105");

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

		await waitFor(() => {
			expect(sendButton()).toBeEnabled();
		});

		await userEvent.click(sendButton());

		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

		expect(screen.getByTestId("ErrorStep__errorMessage")).toHaveTextContent("broadcast error");
		expect(screen.getByTestId("ErrorStep__close-button")).toBeInTheDocument();
		expect(screen.getAllByTestId("clipboard-button__wrapper")[0]).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("ErrorStep__close-button"));

		const walletDetailPage = `/profiles/${getDefaultProfileId()}/dashboard`;
		await waitFor(() => expect(router.state.location.pathname).toBe(walletDetailPage));

		signMock.mockRestore();
	});

	it("should require amount if not set", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		render(<SendTransfer />, {
			route: transferURL,
		});

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
						...signedTransactionMock,
						isConfirmed: () => false,
						isMultiPayment: () => true,
						isTransfer: () => true,
					},
					{
						...signedTransactionMock,
						isConfirmed: () => false,
						isMultiPayment: () => true,
						isTransfer: () => false,
					},
				],
			}),
		);

		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		const { router } = render(<SendTransfer />, {
			route: transferURL,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address()));

		expect(backButton()).not.toHaveAttribute("disabled");

		await userEvent.click(backButton());

		expect(router.state.location.pathname).toBe(transferURL);

		await selectRecipient();

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress));

		// Amount
		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		// Step 2
		expect(continueButton()).not.toBeDisabled();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Fee
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.000105");

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
			.mockReturnValue(Promise.resolve(transactionFixture.data.hash));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.hash],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		await waitFor(() => expect(sendButton()).not.toBeDisabled(), { interval: 10 });
		await userEvent.click(sendButton());

		await waitFor(() => expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible());

		await userEvent.click(screen.getByTestId("ConfirmSendTransaction__cancel"));
		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());

		await userEvent.click(sendButton());

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("ConfirmSendTransaction__confirm"));

		await expect(screen.findByText("Transfer")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		// Go back to wallet
		await userEvent.click(backToWalletButton());

		expect(router.state.location.pathname).toBe(`/profiles/${profile.id()}/dashboard`);

		sentTransactionsMock.mockRestore();
	});

	it("should display unconfirmed transactions modal when submitting with Enter", async () => {
		const sentTransactionsMock = vi.spyOn(wallet.transactionIndex(), "sent").mockImplementation(() =>
			Promise.resolve<any>({
				items: () => [
					{
						...signedTransactionMock,
						convertedTotal: () => 0,
						isConfirmed: () => false,
					},
				],
			}),
		);

		const signMock = vi
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.hash));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.hash],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		render(<SendTransfer />, {
			route: transferURL,
		});

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

		expect(continueButton()).not.toBeDisabled();

		// proceed to step 2
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Fee
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.000105");

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
	});

	it("should send a single transfer using wallet with encryption password", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;
		const actsWithMnemonicMock = vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);
		const actsWithEncryptionMock = vi.spyOn(wallet, "actsWithMnemonicWithEncryption").mockReturnValue(true);
		const passphraseGetMock = vi.spyOn(wallet.signingKey(), "get").mockReturnValue(passphrase);

		render(<SendTransfer />, {
			route: transferURL,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address());

		expect(backButton()).not.toHaveAttribute("disabled");

		await userEvent.click(backButton());

		await selectRecipient();

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();

		await selectFirstRecipient();

		// Amount
		expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress);
		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");
		expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1");

		// Step 2
		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { interval: 5 });

		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Fee
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));

		expect(screen.getAllByRole("radio")[0]).toBeChecked();

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.000105");

		// Step 3
		expect(continueButton()).not.toBeDisabled();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("AuthenticationStep__encryption-password"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__encryption-password"), "password");

		expect(screen.getByTestId("AuthenticationStep__encryption-password")).toHaveValue("password");

		//Step 5 (skip step 4 for now - ledger confirmation)
		const signMock = vi
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.hash));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.hash],
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
		actsWithEncryptionMock.mockRestore();
		passphraseGetMock.mockRestore();
	});

	it("should buildTransferData return zero amount for empty multi recipients", async () => {
		const addresses = [wallet.address(), secondWallet.address()];

		const transferData = await buildTransferData({
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
