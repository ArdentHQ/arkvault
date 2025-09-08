import {
	MAINSAIL_MNEMONICS,
	act,
	env,
	getDefaultMainsailWalletMnemonic,
	getMainsailProfileId,
	mockNanoXTransport,
	render,
	screen,
	syncValidators,
	syncFees,
	waitFor,
	within,
} from "@/utils/testing-library";
import { requestMock, server } from "@/tests/mocks/server";

import { BigNumber } from "@/app/lib/helpers";
import { Contracts, DTO } from "@/app/lib/profiles";
import { DateTime } from "@/app/lib/intl";
import ValidatorResignationFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/validator-resignation.json";
import React from "react";
import { SendValidatorResignationSidePanel } from "./SendValidatorResignationSidePanel";
import userEvent from "@testing-library/user-event";
import { PublicKeyService } from "@/app/lib/mainsail/public-key.service";
import { expect, vi } from "vitest";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
const passphrase = getDefaultMainsailWalletMnemonic();

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const renderPanel = async () => {
	const mockOnOpenChange = vi.fn();

	const view = render(<SendValidatorResignationSidePanel open={true} onOpenChange={mockOnOpenChange} />, {
		route: `/profiles/${profile.id()}/dashboard`,
		withProviders: true,
	});

	await expect(screen.findByTestId("SendRegistrationSidePanel")).resolves.toBeVisible();

	return { ...view, mockOnOpenChange };
};

const signedTransactionMock = {
	blockHash: () => {},
	confirmations: () => BigNumber.make(154_178),
	convertedAmount: () => BigNumber.make(10),
	convertedFee: () => {
		const fee = BigNumber.make(ValidatorResignationFixture.data.gasPrice)
			.times(ValidatorResignationFixture.data.gas)
			.dividedBy(1e8);
		return fee.toNumber();
	},
	convertedTotal: () => BigNumber.ZERO,
	data: () => ValidatorResignationFixture.data,
	explorerLink: () => `https://mainsail-explorer.ihost.org/transactions/${ValidatorResignationFixture.data.hash}`,
	explorerLinkForBlock: () =>
		`https://mainsail-explorer.ihost.org/transactions/${ValidatorResignationFixture.data.hash}`,
	fee: () => BigNumber.make(107),
	from: () => ValidatorResignationFixture.data.from,
	gasLimit: () => ValidatorResignationFixture.data.gasLimit,
	gasUsed: () => ValidatorResignationFixture.data.gas,
	hash: () => ValidatorResignationFixture.data.hash,
	isConfirmed: () => false,
	isMultiPayment: () => false,
	isMultiSignatureRegistration: () => false,
	isReturn: () => false,
	isSecondSignature: () => false,
	isSent: () => true,
	isSuccess: () => true,
	isTransfer: () => false,
	isUnvote: () => false,
	isUpdateValidator: () => false,
	isUsernameRegistration: () => false,
	isUsernameResignation: () => false,
	isValidatorRegistration: () => false,
	isValidatorResignation: () => true,
	isVote: () => false,
	isVoteCombination: () => false,
	memo: () => ValidatorResignationFixture.data.memo || undefined,
	nonce: () => BigNumber.make(ValidatorResignationFixture.data.nonce),
	payments: () => [],
	recipients: () => [],
	sender: () => ValidatorResignationFixture.data.from,
	timestamp: () => DateTime.make(ValidatorResignationFixture.data.timestamp),
	to: () => ValidatorResignationFixture.data.to,
	total: () => {
		const value = BigNumber.make(ValidatorResignationFixture.data.value);
		const feeVal = BigNumber.make(ValidatorResignationFixture.data.gasPrice).times(
			ValidatorResignationFixture.data.gas,
		);
		return value.plus(feeVal);
	},
	type: () => "validatorResignation",
	usesMultiSignature: () => false,
	value: () => BigNumber.make(0),
	wallet: () => wallet,
} as DTO.ExtendedSignedTransactionData;

const transactionResponse = {
	...signedTransactionMock,
	isTransfer: () => false,
	isValidatorResignation: () => true,
	type: () => "validatorResignation",
};

const createValidatorResignationMock = (wallet: Contracts.IReadWriteWallet) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(transactionResponse as any);

const continueButton = () => screen.getByTestId("SendRegistration__continue-button");
const formStep = () => screen.findByTestId("SendValidatorResignation__form-step");
const sendButton = () => screen.getByTestId("SendRegistration__send-button");

const reviewStepID = "SendValidatorResignation__review-step";

describe("SendValidatorResignationSidePanel", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId())!;

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile
			.wallets()
			.findByAddressWithNetwork("0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6", "mainsail.devnet")!;

		vi.spyOn(wallet, "isValidator").mockImplementation(() => true);

		vi.spyOn(PublicKeyService.prototype, "verifyPublicKeyWithBLS").mockReturnValue(true);

		await wallet.synchroniser().identity();
		await syncValidators(profile);
		await syncFees(profile);

		vi.spyOn(env.fees(), "sync").mockImplementation(vi.fn());
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	beforeEach(() => {
		vi.useFakeTimers({
			shouldAdvanceTime: true,
			toFake: ["setInterval", "clearInterval", "Date"],
		});

		server.use(
			requestMock("https://dwallets-evm.mainsailhq.com/api*", {
				meta: {
					count: 0,
				},
			}),
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api/transactions/a10a238d4ea8076532ba38282be6f35b4dd652066312d2fe7c45ba8c91c9c837",
				ValidatorResignationFixture,
			),
		);
	});

	it("should show mnemonic authentication error", async () => {
		await renderPanel();

		await expect(formStep()).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), "wrong passphrase");
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue("wrong passphrase"));

		expect(sendButton()).toBeDisabled();

		await waitFor(() => {
			expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveAttribute("aria-invalid");
		});
	});

	it("should render form step", async () => {
		const { asFragment } = await renderPanel();

		await expect(formStep()).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should change fee settings", async () => {
		const { asFragment } = await renderPanel();

		await expect(formStep()).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Fee (simple)
		expect(screen.getAllByRole("radio")[1]).toBeChecked();

		await userEvent.click(within(screen.getByTestId("InputFee")).getAllByRole("radio")[2]);
		await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());

		// Fee (advanced)
		await userEvent.click(screen.getByText("Advanced"));

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

	it("should render review step", async () => {
		const { asFragment } = await renderPanel();

		await expect(formStep()).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should close side panel when clicking back on form step", async () => {
		const { mockOnOpenChange } = await renderPanel();

		await expect(formStep()).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("SendRegistration__back-button"));

		expect(mockOnOpenChange).toHaveBeenCalledWith(false);
	});

	it("should navigate between form and review steps", async () => {
		await renderPanel();

		await expect(formStep()).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("SendRegistration__back-button"));

		await expect(formStep()).resolves.toBeVisible();
	});

	it("should render authentication step", async () => {
		const { asFragment } = await renderPanel();

		await expect(formStep()).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should show error step and go back", async () => {
		const signMock = vi
			.spyOn(wallet.transaction(), "signValidatorResignation")
			.mockReturnValue(Promise.resolve(ValidatorResignationFixture.data.hash));

		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockImplementation(() => {
			throw new Error("broadcast error");
		});

		const { asFragment, mockOnOpenChange } = await renderPanel();

		await expect(formStep()).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		await waitFor(() => expect(sendButton()).toBeEnabled());
		await userEvent.click(sendButton());

		await waitFor(() => {
			expect(screen.getByTestId("ErrorStep")).toBeInTheDocument();
		});

		expect(screen.getByTestId("ErrorStep__errorMessage")).toHaveTextContent("broadcast error");
		expect(asFragment()).toMatchSnapshot();

		await userEvent.click(screen.getByTestId("ErrorStep__close-button"));

		expect(mockOnOpenChange).toHaveBeenCalledWith(false);

		signMock.mockRestore();
		broadcastMock.mockRestore();
	});

	it("should successfully sign and submit resignation transaction", async () => {
		const signMock = vi
			.spyOn(wallet.transaction(), "signValidatorResignation")
			.mockReturnValue(Promise.resolve(ValidatorResignationFixture.data.hash));

		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [ValidatorResignationFixture.data.hash],
			errors: {},
			rejected: [],
		});

		const transactionMock = createValidatorResignationMock(wallet);

		await renderPanel();

		await expect(formStep()).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		await waitFor(() => expect(sendButton()).toBeEnabled());
		await userEvent.click(sendButton());

		await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});

	it("should handle validator resignation with keyboard navigation", async () => {
		vi.spyOn(wallet, "client").mockImplementation(() => ({
			transaction: vi.fn().mockReturnValue(signedTransactionMock),
		}));

		const nanoXTransportMock = mockNanoXTransport();
		await renderPanel();

		// Step 1 - Form step
		await expect(formStep()).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).toBeEnabled());

		// Navigate to review step with Enter key
		await userEvent.keyboard("{enter}");

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Navigate back to form step
		await userEvent.click(screen.getByTestId("SendRegistration__back-button"));
		await expect(formStep()).resolves.toBeVisible();

		// Continue to review step again
		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Continue to authentication step
		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		// Enter mnemonic and submit
		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		await userEvent.type(passwordInput, passphrase);
		await waitFor(() => expect(passwordInput).toHaveValue(passphrase));

		await waitFor(() => expect(sendButton()).toBeEnabled());

		const signMock = vi
			.spyOn(wallet.transaction(), "signValidatorResignation")
			.mockReturnValue(Promise.resolve(ValidatorResignationFixture.data.hash));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [ValidatorResignationFixture.data.hash],
			errors: {},
			rejected: [],
		});
		const transactionMock = createValidatorResignationMock(wallet);

		await userEvent.click(sendButton());

		await waitFor(() => {
			expect(signMock).toHaveBeenCalledWith(
				expect.objectContaining({
					gasLimit: expect.any(BigNumber),
					gasPrice: expect.any(BigNumber),
					signatory: expect.any(Object),
				}),
			);
		});

		await waitFor(() => expect(broadcastMock).toHaveBeenCalledWith(ValidatorResignationFixture.data.hash));
		await waitFor(() => expect(transactionMock).toHaveBeenCalledWith(ValidatorResignationFixture.data.hash));

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		await act(() => vi.runOnlyPendingTimers());

		// Step 4 - summary screen
		await waitFor(
			() => {
				expect(screen.getByTestId("TransactionPending")).toBeVisible();
			},
			{ timeout: 4000 },
		);

		// Close the side panel
		await userEvent.click(screen.getByTestId("SendRegistration__close-button"));

		nanoXTransportMock.mockRestore();
	});

	it("should successfully sign and submit resignation transaction with keyboard", async () => {
		const signMock = vi
			.spyOn(wallet.transaction(), "signValidatorResignation")
			.mockReturnValue(Promise.resolve(ValidatorResignationFixture.data.hash));

		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [ValidatorResignationFixture.data.hash],
			errors: {},
			rejected: [],
		});

		const transactionMock = createValidatorResignationMock(wallet);

		await renderPanel();

		await expect(formStep()).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.keyboard("{enter}");

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.keyboard("{enter}");

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		await waitFor(() => expect(sendButton()).toBeEnabled());
		await userEvent.keyboard("{enter}");

		await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});

	it("should close side panel after successful submission", async () => {
		const signMock = vi
			.spyOn(wallet.transaction(), "signValidatorResignation")
			.mockReturnValue(Promise.resolve(ValidatorResignationFixture.data.hash));

		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [ValidatorResignationFixture.data.hash],
			errors: {},
			rejected: [],
		});

		const transactionMock = createValidatorResignationMock(wallet);

		const { mockOnOpenChange } = await renderPanel();

		await expect(formStep()).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);

		await waitFor(() => {
			expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase);
		});

		await waitFor(() => expect(sendButton()).toBeEnabled());
		await userEvent.click(sendButton());

		await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("SendRegistration__close-button"));

		expect(mockOnOpenChange).toHaveBeenCalledWith(false);

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
			.mockReturnValue(Promise.resolve(ValidatorResignationFixture.data.hash));

		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [ValidatorResignationFixture.data.hash],
			errors: {},
			rejected: [],
		});

		const transactionMock = createValidatorResignationMock(wallet);

		await renderPanel();

		await expect(formStep()).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

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

		secondPublicKeyMock.mockRestore();
		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		actsWithMnemonicMock.mockRestore();
		actsWithSecretWithEncryptionMock.mockRestore();
		passphraseMock.mockRestore();
	});
});
