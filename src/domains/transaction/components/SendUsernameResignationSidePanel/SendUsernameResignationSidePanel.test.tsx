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
} from "@/utils/testing-library";
import { requestMock, server } from "@/tests/mocks/server";

import { BigNumber } from "@/app/lib/helpers";
import { Contracts } from "@/app/lib/profiles";
import { DateTime } from "@/app/lib/intl";
import UsernameResignationFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/username-resignation.json";
import React from "react";
import { SendUsernameResignationSidePanel } from "./SendUsernameResignationSidePanel";
import userEvent from "@testing-library/user-event";
import { PublicKeyService } from "@/app/lib/mainsail/public-key.service";
import { vi } from "vitest";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
const passphrase = getDefaultMainsailWalletMnemonic();

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const renderPanel = async () => {
	const mockOnOpenChange = vi.fn();

	const view = render(<SendUsernameResignationSidePanel open={true} onOpenChange={mockOnOpenChange} />, {
		route: `/profiles/${profile.id()}/dashboard`,
		withProviders: true,
	});

	await expect(screen.findByTestId("SendUsernameResignationSidePanel")).resolves.toBeVisible();

	return { ...view, mockOnOpenChange };
};

const signedTransactionMock = {
	blockHash: () => {},
	confirmations: () => BigNumber.make(154_178),
	convertedAmount: () => BigNumber.make(10),
	convertedFee: () => {
		const fee = BigNumber.make(UsernameResignationFixture.data.gasPrice)
			.times(UsernameResignationFixture.data.gas)
			.dividedBy(1e8);
		return fee.toNumber();
	},
	convertedTotal: () => BigNumber.ZERO,
	data: () => UsernameResignationFixture.data,
	explorerLink: () => `https://mainsail-explorer.ihost.org/transactions/${UsernameResignationFixture.data.hash}`,
	explorerLinkForBlock: () =>
		`https://mainsail-explorer.ihost.org/transactions/${UsernameResignationFixture.data.hash}`,
	fee: () => BigNumber.make(107),
	from: () => UsernameResignationFixture.data.from,
	hash: () => UsernameResignationFixture.data.hash,
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
	isValidatorResignation: () => false,
	isVote: () => false,
	isVoteCombination: () => false,
	memo: () => UsernameResignationFixture.data.memo || undefined,
	nonce: () => BigNumber.make(UsernameResignationFixture.data.nonce),
	payments: () => [],
	recipients: () => [],
	timestamp: () => DateTime.make(UsernameResignationFixture.data.timestamp),
	to: () => UsernameResignationFixture.data.to,
	total: () => {
		const value = BigNumber.make(UsernameResignationFixture.data.value);
		const feeVal = BigNumber.make(UsernameResignationFixture.data.gasPrice).times(
			UsernameResignationFixture.data.gas,
		);
		return value.plus(feeVal);
	},
	type: () => "usernameResignation",
	usesMultiSignature: () => false,
	value: () => BigNumber.make(0),
	wallet: () => wallet,
};

const createUsernameResignationMock = (wallet: Contracts.IReadWriteWallet) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(signedTransactionMock);

const continueButton = () => screen.getByTestId("SendUsernameResignation__continue-button");
const formStep = () => screen.findByTestId("SendUsernameResignation__form-step");
const sendButton = () => screen.getByTestId("SendUsernameResignation__send-button");

const reviewStepID = "SendUsernameResignation__review-step";

describe("SendUsernameResignationSidePanel", () => {
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
				UsernameResignationFixture,
			),
		);
	});

	it("should handle username resignation with keyboard navigation", async () => {
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
		await userEvent.click(screen.getByTestId("SendUsernameResignation__back-button"));
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
			.spyOn(wallet.transaction(), "signUsernameResignation")
			.mockReturnValue(Promise.resolve(UsernameResignationFixture.data.hash));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [UsernameResignationFixture.data.hash],
			errors: {},
			rejected: [],
		});
		const transactionMock = createUsernameResignationMock(wallet);

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

		await waitFor(() => expect(broadcastMock).toHaveBeenCalledWith(UsernameResignationFixture.data.hash));
		await waitFor(() => expect(transactionMock).toHaveBeenCalledWith(UsernameResignationFixture.data.hash));

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		await act(() => vi.runOnlyPendingTimers());

		// Step 4 - summary screen
		await waitFor(
			() => {
				expect(screen.getByTestId("TransactionSuccessful")).toBeVisible();
			},
			{ timeout: 4000 },
		);

		// Close the side panel
		await userEvent.click(screen.getByTestId("SendUsernameResignation__close-button"));

		nanoXTransportMock.mockRestore();
	});

	it("should handle transaction error and go back", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		await renderPanel();

		await expect(formStep()).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		await userEvent.type(passwordInput, passphrase);
		await waitFor(() => expect(passwordInput).toHaveValue(passphrase));

		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		const signMock = vi.spyOn(wallet.transaction(), "signUsernameResignation").mockImplementation(() => {
			throw new Error("broadcast error");
		});

		await userEvent.click(sendButton());

		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

		expect(screen.getByTestId("ErrorStep__errorMessage")).toHaveTextContent("broadcast error");

		// Go back to form step
		await userEvent.click(screen.getByTestId("ErrorStep__back-button"));

		await expect(formStep()).resolves.toBeVisible();

		signMock.mockRestore();
		nanoXTransportMock.mockRestore();
	});

	it("should close the side panel when clicking back on form step", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		const { mockOnOpenChange } = await renderPanel();

		await expect(formStep()).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("SendUsernameResignation__back-button"));

		expect(mockOnOpenChange).toHaveBeenCalledWith(false);

		nanoXTransportMock.mockRestore();
	});

	it("should show mnemonic error with wrong passphrase", async () => {
		const nanoXTransportMock = mockNanoXTransport();

		await renderPanel();

		await expect(formStep()).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		const wrongPassphrase = "wrong passphrase";

		await userEvent.type(passwordInput, wrongPassphrase);
		await waitFor(() => expect(passwordInput).toHaveValue(wrongPassphrase));

		expect(sendButton()).toBeDisabled();

		await waitFor(() => expect(screen.getByTestId("Input__error")).toBeVisible());

		expect(screen.getByTestId("Input__error")).toHaveAttribute(
			"data-errortext",
			"This mnemonic does not correspond to your wallet",
		);

		nanoXTransportMock.mockRestore();
	});

	it("should prevent going to next step with enter on success step", async () => {
		vi.spyOn(wallet, "client").mockImplementation(() => ({
			transaction: vi.fn().mockReturnValue(signedTransactionMock),
		}));

		const nanoXTransportMock = mockNanoXTransport();
		await renderPanel();

		await expect(formStep()).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).toBeEnabled());
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.keyboard("{enter}");

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		await userEvent.type(passwordInput, passphrase);
		await waitFor(() => expect(passwordInput).toHaveValue(passphrase));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const signMock = vi
			.spyOn(wallet.transaction(), "signUsernameResignation")
			.mockReturnValue(Promise.resolve(UsernameResignationFixture.data.hash));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [UsernameResignationFixture.data.hash],
			errors: {},
			rejected: [],
		});
		const transactionMock = createUsernameResignationMock(wallet);

		await userEvent.keyboard("{enter}");

		await waitFor(() =>
			expect(signMock).toHaveBeenCalledWith(
				expect.objectContaining({
					gasLimit: expect.any(BigNumber),
					gasPrice: expect.any(BigNumber),
					signatory: expect.any(Object),
				}),
			),
		);

		await waitFor(() => expect(broadcastMock).toHaveBeenCalledWith(UsernameResignationFixture.data.hash));
		await waitFor(() => expect(transactionMock).toHaveBeenCalledWith(UsernameResignationFixture.data.hash));

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

		await userEvent.keyboard("{enter}");

		// Should stay on the same step, no navigation should occur
		await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

		nanoXTransportMock.mockRestore();
	});
});
