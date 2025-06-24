import {
	MAINSAIL_MNEMONICS,
	act,
	env,
	getMainsailProfileId,
	render,
	screen,
	syncValidators,
	syncFees,
	waitFor,
	within,
} from "@/utils/testing-library";
import { Contracts, DTO } from "@/app/lib/profiles";
import { requestMock, server } from "@/tests/mocks/server";
import { AddressService } from "@/app/lib/mainsail/address.service";
import React from "react";
import { SendValidatorResignation } from "./SendValidatorResignation";
import { expect } from "vitest";
import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/transfer.json";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import userEvent from "@testing-library/user-event";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";

let wallet: Contracts.IReadWriteWallet;
let profile: Contracts.IProfile;

let resignationUrl: string;

const passphrase = MAINSAIL_MNEMONICS[0];

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const renderPage = () =>
	render(<SendValidatorResignation />, {
		route: resignationUrl,
	});

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

const transactionResponse = {
	...signedTransactionMock,
	isTransfer: () => false,
	isValidatorResignation: () => true,
	type: () => "validatorResignation",
};

const createTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(transactionResponse as any);

const reviewStep = () => screen.findByTestId("SendValidatorResignation__review-step");
const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const formStep = () => screen.findByTestId("SendValidatorResignation__form-step");
const sendButton = () => screen.getByTestId("StepNavigation__send-button");

let mnemonicMock;

describe("SendValidatorResignation", () => {
	beforeAll(async () => {
		vi.useFakeTimers({
			shouldAdvanceTime: true,
			toFake: ["setInterval", "clearInterval", "Date"],
		});

		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().push(
			await profile.walletFactory().fromMnemonicWithBIP39({
				coin: "Mainsail",
				mnemonic: passphrase,
				network: "mainsail.devnet",
			}),
		);

		vi.spyOn(wallet, "balance").mockReturnValue(1200);
		vi.spyOn(wallet, "validatorPublicKey").mockReturnValue("validator-public-key");

		const config = profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration, {});
		profile.settings().set(Contracts.ProfileSetting.DashboardConfiguration, {
			...config,
			activeNetworkId: wallet.networkId(),
		});

		await wallet.synchroniser().identity();

		await syncValidators(profile);
		await syncFees(profile);
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	describe("Validator Resignation", () => {
		beforeEach(() => {
			resignationUrl = `/profiles/${profile.id()}/wallets/${wallet.id()}/send-validator-resignation`;

			mnemonicMock = vi
				.spyOn(AddressService.prototype, "fromMnemonic")
				.mockReturnValue({ address: wallet.address() });

			server.use(
				requestMock(
					"https://dwallets-evm.mainsailhq.com/api/transactions/8e4a8c3eaf2f9543a5bd61bb85ddd2205d5091597a77446c8b99692e0854b978",
					transactionFixture,
				),
				requestMock(
					"https://dwallets-evm.mainsailhq.com/api/blocks/f7054cf37ce49e17cf2b06a0a868cac183bf78e2f1b4a6fe675f2412364fe0ae",
					{ data: {} }, // Basic mock for block data
				),
			);
		});

		it("should show mnemonic authentication error", async () => {
			mnemonicMock.mockRestore();

			renderPage();

			await expect(formStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
			await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), "wrong passphrase");
			await waitFor(() =>
				expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue("wrong passphrase"),
			);

			expect(sendButton()).toBeDisabled();

			await waitFor(() => {
				expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveAttribute("aria-invalid");
			});
		});

		it("should render 1st step", async () => {
			const { asFragment } = renderPage();

			await expect(formStep()).resolves.toBeVisible();

			expect(asFragment()).toMatchSnapshot();
		});

		it("should change fee", async () => {
			const { asFragment } = renderPage();

			await expect(formStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			// Fee (simple)
			expect(screen.getAllByRole("radio")[1]).toBeChecked();

			await userEvent.click(within(screen.getByTestId("InputFee")).getAllByRole("radio")[2]);
			await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());

			// Fee (advanced)
			await userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

			const gasPriceInput: HTMLInputElement = screen.getByTestId("Input_GasPrice");
			await userEvent.clear(gasPriceInput);
			await userEvent.type(gasPriceInput, "10");

			await waitFor(() => expect(gasPriceInput).toHaveValue("10"));

			const gasLimitInput: HTMLInputElement = screen.getByTestId("Input_GasLimit");
			await userEvent.clear(gasLimitInput);
			await userEvent.type(gasLimitInput, "210000");

			await waitFor(() => expect(gasLimitInput).toHaveValue("210000"));

			expect(asFragment()).toMatchSnapshot();
		});

		it("should render 2nd step", async () => {
			const { asFragment } = renderPage();

			await expect(formStep()).resolves.toBeVisible();

			await waitFor(() => expect(continueButton()).toBeEnabled());

			await userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			expect(asFragment()).toMatchSnapshot();
		});

		it("should go back to dashboard", async () => {
			const { router } = renderPage();

			await expect(formStep()).resolves.toBeVisible();

			await userEvent.click(screen.getByTestId("StepNavigation__back-button"));

			expect(router.state.location.pathname).toBe(`/profiles/${profile.id()}/dashboard`);
		});

		it("should navigate between 1st and 2nd step", async () => {
			renderPage();

			await expect(formStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			await userEvent.click(screen.getByTestId("StepNavigation__back-button"));

			await expect(formStep()).resolves.toBeVisible();
		});

		it("should render 3rd step", async () => {
			const { asFragment } = renderPage();

			await expect(formStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			expect(asFragment()).toMatchSnapshot();
		});

		it("should show error step and go back", async () => {
			const signMock = vi
				.spyOn(wallet.transaction(), "signValidatorResignation")
				.mockReturnValue(Promise.resolve(transactionFixture.data.hash));

			const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockImplementation(() => {
				throw new Error("broadcast error");
			});

			const { asFragment, router } = renderPage();

			await expect(formStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
			await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
			await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

			await waitFor(() => {
				expect(sendButton()).toBeEnabled();
			});

			await userEvent.click(sendButton());

			await waitFor(() => {
				expect(screen.getByTestId("ErrorStep")).toBeInTheDocument();
			});

			expect(screen.getByTestId("ErrorStep__errorMessage")).toHaveTextContent("broadcast error");
			expect(asFragment()).toMatchSnapshot();

			await userEvent.click(screen.getByTestId("ErrorStep__close-button"));

			const dashboardPage = `/profiles/${profile.id()}/dashboard`;
			await waitFor(() => expect(router.state.location.pathname).toBe(dashboardPage));

			signMock.mockRestore();
			broadcastMock.mockRestore();
		});

		it("should successfully sign and submit resignation transaction", async () => {
			const signMock = vi
				.spyOn(wallet.transaction(), "signValidatorResignation")
				.mockReturnValue(Promise.resolve(transactionFixture.data.hash));

			const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
				accepted: [transactionFixture.data.hash],
				errors: {},
				rejected: [],
			});

			const transactionMock = createTransactionMock(wallet);

			renderPage();

			await expect(formStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
			await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
			await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

			await waitFor(() => {
				expect(sendButton()).toBeEnabled();
			});

			await userEvent.click(sendButton());

			await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

			await act(() => vi.runOnlyPendingTimers());

			await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

			signMock.mockRestore();
			broadcastMock.mockRestore();
			transactionMock.mockRestore();
		});

		it("should successfully sign and submit resignation transaction with keyboard", async () => {
			const signMock = vi
				.spyOn(wallet.transaction(), "signValidatorResignation")
				.mockReturnValue(Promise.resolve(transactionFixture.data.hash));

			const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
				accepted: [transactionFixture.data.hash],
				errors: {},
				rejected: [],
			});

			const transactionMock = createTransactionMock(wallet);

			renderPage();

			await expect(formStep()).resolves.toBeVisible();

			await waitFor(() => expect(continueButton()).toBeEnabled());

			await userEvent.keyboard("{enter}");

			await expect(reviewStep()).resolves.toBeVisible();

			await userEvent.keyboard("{enter}");

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
			await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

			await waitFor(() => expect(sendButton()).toBeEnabled());
			await userEvent.keyboard("{enter}");

			await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

			await act(() => vi.runOnlyPendingTimers());

			await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

			signMock.mockRestore();
			broadcastMock.mockRestore();
			transactionMock.mockRestore();
		});

		it("should click back button after successful submission", async () => {
			const signMock = vi
				.spyOn(wallet.transaction(), "signValidatorResignation")
				.mockReturnValue(Promise.resolve(transactionFixture.data.hash));

			const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
				accepted: [transactionFixture.data.hash],
				errors: {},
				rejected: [],
			});

			const transactionMock = createTransactionMock(wallet);

			const { router } = renderPage();

			await expect(formStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
			await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);

			await waitFor(() => {
				expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase);
			});

			await waitFor(() => {
				expect(sendButton()).toBeEnabled();
			});

			await userEvent.click(sendButton());

			await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

			await act(() => vi.runOnlyPendingTimers());

			await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

			await userEvent.click(screen.getByTestId("StepNavigation__back-to-wallet-button"));

			const dashboardPage = `/profiles/${profile.id()}/dashboard`;
			await waitFor(() => expect(router.state.location.pathname).toBe(dashboardPage));

			signMock.mockRestore();
			broadcastMock.mockRestore();
			transactionMock.mockRestore();
		});

		it("should successfully sign and submit resignation transaction using encryption password", async () => {
			const actsWithMnemonicMock = vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);
			const actsWithSecretWithEncryptionMock = vi
				.spyOn(wallet, "actsWithMnemonicWithEncryption")
				.mockReturnValue(true);
			const passphraseMock = vi.spyOn(wallet.signingKey(), "get").mockReturnValue(passphrase);

			const secondPublicKeyMock = vi.spyOn(wallet, "isSecondSignature").mockReturnValue(false);
			const signMock = vi
				.spyOn(wallet.transaction(), "signValidatorResignation")
				.mockReturnValue(Promise.resolve(transactionFixture.data.hash));

			const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
				accepted: [transactionFixture.data.hash],
				errors: {},
				rejected: [],
			});

			const transactionMock = createTransactionMock(wallet);

			const resignationEncryptedUrl = `/profiles/${profile.id()}/wallets/${wallet.id()}/send-validator-resignation`;

			render(<SendValidatorResignation />, {
				route: resignationEncryptedUrl,
			});

			await expect(formStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(reviewStep()).resolves.toBeVisible();

			await userEvent.click(continueButton());

			await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

			await userEvent.clear(screen.getByTestId("AuthenticationStep__encryption-password"));
			await userEvent.type(screen.getByTestId("AuthenticationStep__encryption-password"), passphrase);
			await waitFor(() =>
				expect(screen.getByTestId("AuthenticationStep__encryption-password")).toHaveValue(passphrase),
			);

			await waitFor(() => expect(sendButton()).not.toBeDisabled());

			await userEvent.click(sendButton());

			await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

			await act(() => vi.runOnlyPendingTimers());

			await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

			secondPublicKeyMock.mockRestore();
			signMock.mockRestore();
			broadcastMock.mockRestore();
			transactionMock.mockRestore();
			actsWithMnemonicMock.mockRestore();
			actsWithSecretWithEncryptionMock.mockRestore();
			passphraseMock.mockRestore();
		});
	});
});
