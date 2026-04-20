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
import { Contracts } from "@/app/lib/profiles";
import { DateTime } from "@/app/lib/intl";
import React from "react";
import { SendRegistrationSidePanel } from "./SendRegistrationSidePanel";
import ValidatorRegistrationFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/validator-registration.json";
import userEvent from "@testing-library/user-event";
import { PublicKeyService } from "@/app/lib/mainsail/public-key.service";
import { afterAll, vi } from "vitest";
import * as ReactRouter from "react-router";
let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let secondWallet: Contracts.IReadWriteWallet;
let useSearchParamsMock;
const passphrase = getDefaultMainsailWalletMnemonic();

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const renderPanel = async (
	registrationType: "validatorRegistration" | "usernameRegistration" = "validatorRegistration",
) => {
	const mockOnOpenChange = vi.fn();

	const view = render(
		<SendRegistrationSidePanel open={true} onOpenChange={mockOnOpenChange} registrationType={registrationType} />,
		{
			route: `/profiles/${profile.id()}/dashboard`,
			withProviders: true,
		},
	);

	await expect(screen.findByTestId("SendRegistrationSidePanel")).resolves.toBeVisible();

	return { ...view, mockOnOpenChange };
};

const signedTransactionMock = {
	blockHash: () => {},
	confirmations: () => BigNumber.make(154_178),
	convertedAmount: () => BigNumber.make(10),
	convertedFee: () => {
		const fee = BigNumber.make(ValidatorRegistrationFixture.data.gasPrice)
			.times(ValidatorRegistrationFixture.data.gas)
			.dividedBy(1e8);
		return fee.toNumber();
	},
	convertedTotal: () => BigNumber.ZERO,
	data: () => ValidatorRegistrationFixture.data,
	explorerLink: () => `https://mainsail-explorer.ihost.org/transactions/${ValidatorRegistrationFixture.data.hash}`,
	explorerLinkForBlock: () =>
		`https://mainsail-explorer.ihost.org/transactions/${ValidatorRegistrationFixture.data.hash}`,
	fee: () => BigNumber.make(107),
	from: () => ValidatorRegistrationFixture.data.from,
	gasLimit: () => ValidatorRegistrationFixture.data.gasLimit,
	gasUsed: () => ValidatorRegistrationFixture.data.gas,
	hash: () => ValidatorRegistrationFixture.data.hash,
	isApprove: () => false,
	isConfirmed: () => false,
	isContractDeployment: () => false,
	isContractTransaction: () => true,
	isMultiPayment: () => false,
	isReturn: () => false,
	isRevoke: () => false,
	isSecondSignature: () => false,
	isSent: () => true,
	isSuccess: () => true,
	isTokenTransfer: () => false,
	isTransfer: () => false,
	isUnvote: () => false,
	isUpdateValidator: () => false,
	isUsernameRegistration: () => false,
	isUsernameResignation: () => false,
	isValidatorRegistration: () => false,
	isValidatorResignation: () => false,
	isVote: () => false,
	memo: () => ValidatorRegistrationFixture.data.memo || undefined,
	nonce: () => BigNumber.make(ValidatorRegistrationFixture.data.nonce),
	payments: () => [],
	recipients: () => [],
	setMeta: () => {},
	timestamp: () => DateTime.make(ValidatorRegistrationFixture.data.timestamp),
	to: () => ValidatorRegistrationFixture.data.to,
	token: () => {},
	total: () => {
		const value = BigNumber.make(ValidatorRegistrationFixture.data.value);
		const feeVal = BigNumber.make(ValidatorRegistrationFixture.data.gasPrice).times(
			ValidatorRegistrationFixture.data.gas,
		);
		return value.plus(feeVal);
	},
	type: () => "transfer",
	value: () => BigNumber.make(0),
	wallet: () => wallet,
};

const createValidatorRegistrationMock = (wallet: Contracts.IReadWriteWallet) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		...signedTransactionMock,
		confirmations: () => BigNumber.make(0),
	});
// @ts-ignore

const continueButton = () => screen.getByTestId("SendRegistration__continue-button");
const formStep = () => screen.findByTestId("ValidatorRegistrationForm_form-step");
const sendButton = () => screen.getByTestId("SendRegistration__send-button");

const reviewStepID = "ValidatorRegistrationForm__review-step";
const withKeyboard = "with keyboard";

describe("SendRegistrationSidePanel", () => {
	beforeAll(async () => {
		useSearchParamsMock = vi
			.spyOn(ReactRouter, "useSearchParams")
			.mockReturnValue([new URLSearchParams(), vi.fn()]);

		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile
			.wallets()
			.findByAddressWithNetwork("0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6", "mainsail.devnet")!;

		secondWallet = profile.wallets().push(
			await profile.walletFactory().fromAddress({
				address: "0x659A76be283644AEc2003aa8ba26485047fd1BFB",
				coin: "Mainsail",
				network: "mainsail.devnet",
			}),
		);

		vi.spyOn(secondWallet, "balance").mockReturnValue(BigNumber.make(1200));

		vi.spyOn(wallet, "isValidator").mockImplementation(() => false);
		vi.spyOn(secondWallet, "isValidator").mockImplementation(() => false);

		vi.spyOn(PublicKeyService.prototype, "verifyPublicKeyWithBLS").mockReturnValue(true);

		await wallet.synchroniser().identity();
		await secondWallet.synchroniser().identity();

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
				ValidatorRegistrationFixture,
			),
		);
	});

	afterAll(() => {
		useSearchParamsMock.mockRestore();
	});

	it("should handle registrationType param (%s)", async () => {
		const type = "validatorRegistration";
		const label = "Register Validator";

		await renderPanel(type);

		await expect(screen.findByTestId("SendRegistrationSidePanel")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("SidePanel__title")).toHaveTextContent(label));
	});

	it.each([withKeyboard, "without keyboard"])("should register validator %s", async (inputMethod) => {
		vi.spyOn(wallet, "client").mockImplementation(() => ({
			transaction: vi.fn().mockReturnValue(signedTransactionMock),
		}));

		const nanoXTransportMock = mockNanoXTransport();
		await renderPanel();

		// Step 1
		await expect(formStep()).resolves.toBeVisible();

		await inputValidatorPublicKey();

		await waitFor(() => expect(continueButton()).toBeEnabled());

		if (inputMethod === withKeyboard) {
			await userEvent.keyboard("{enter}");
		} else {
			await userEvent.click(continueButton());
		}

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		const fees = within(screen.getByTestId("InputFee")).getAllByTestId("ButtonGroupOption");
		await userEvent.click(fees[1]);

		// remove focus from fee button
		await userEvent.click(document.body);

		await userEvent.click(screen.getByTestId("SendRegistration__back-button"));

		await expect(formStep()).resolves.toBeVisible();

		// remove focus from back button
		await userEvent.click(document.body);

		await waitFor(() => expect(continueButton()).toBeEnabled());
		if (inputMethod === withKeyboard) {
			await userEvent.keyboard("{enter}");
		} else {
			await userEvent.click(continueButton());
		}

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		if (inputMethod === withKeyboard) {
			await userEvent.keyboard("{enter}");
		} else {
			await userEvent.click(continueButton());
		}

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		await userEvent.type(passwordInput, passphrase);
		await waitFor(() => expect(passwordInput).toHaveValue(passphrase));

		await waitFor(() => expect(sendButton()).toBeEnabled());

		const signMock = vi
			.spyOn(wallet.transaction(), "signValidatorRegistration")
			.mockReturnValue(Promise.resolve(ValidatorRegistrationFixture.data.hash));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [ValidatorRegistrationFixture.data.hash],
			errors: {},
			rejected: [],
		});
		const transactionMock = createValidatorRegistrationMock(wallet);

		if (inputMethod === withKeyboard) {
			await userEvent.keyboard("{enter}");
		} else {
			await userEvent.click(sendButton());
		}

		await waitFor(() => {
			expect(signMock).toHaveBeenCalledWith(
				expect.objectContaining({
					data: { validatorPublicKey: "validator-public-key", value: 0 },
				}),
			);
		});

		await waitFor(() => expect(broadcastMock).toHaveBeenCalledWith(ValidatorRegistrationFixture.data.hash));
		await waitFor(() => expect(transactionMock).toHaveBeenCalledWith(ValidatorRegistrationFixture.data.hash));

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
		await userEvent.click(screen.getByTestId("SendRegistration__close-button"));

		nanoXTransportMock.mockRestore();
	});

	it("should show mnemonic error", async () => {
		const nanoXTransportMock = mockNanoXTransport();

		const actsWithMnemonicMock = vi.spyOn(secondWallet, "actsWithMnemonic").mockReturnValue(true);

		const selectedWalletSpy = vi.spyOn(profile.wallets(), "selected").mockReturnValue([secondWallet]);

		await renderPanel();

		await expect(formStep()).resolves.toBeVisible();

		await inputValidatorPublicKey();

		await waitFor(() => {
			expect(continueButton()).toBeEnabled();
		});

		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const mnemonic = screen.getByTestId("AuthenticationStep__mnemonic");

		const wrongPassphrase = "wrong passphrase";

		await userEvent.type(mnemonic, wrongPassphrase);
		await waitFor(() => expect(mnemonic).toHaveValue(wrongPassphrase));

		expect(sendButton()).toBeDisabled();

		await waitFor(() => expect(screen.getByTestId("Input__error")).toBeVisible());

		expect(screen.getByTestId("Input__error")).toHaveAttribute(
			"data-errortext",
			"This mnemonic does not correspond to your address",
		);

		actsWithMnemonicMock.mockRestore();
		nanoXTransportMock.mockRestore();
		selectedWalletSpy.mockRestore();
	});

	it("should prevent going to the next step with enter on the success step", async () => {
		vi.spyOn(wallet, "client").mockImplementation(() => ({
			transaction: vi.fn().mockResolvedValue(signedTransactionMock),
		}));

		const nanoXTransportMock = mockNanoXTransport();
		await renderPanel();

		await expect(formStep()).resolves.toBeVisible();

		await inputValidatorPublicKey();

		await waitFor(() => {
			expect(continueButton()).toBeEnabled();
		});

		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		await userEvent.keyboard("{enter}");

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const mnemonicInput = screen.getByTestId("AuthenticationStep__mnemonic");

		await userEvent.type(mnemonicInput, passphrase);
		await waitFor(() => expect(mnemonicInput).toHaveValue(passphrase));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const signMock = vi
			.spyOn(wallet.transaction(), "signValidatorRegistration")
			.mockReturnValue(Promise.resolve(ValidatorRegistrationFixture.data.hash));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [ValidatorRegistrationFixture.data.hash],
			errors: {},
			rejected: [],
		});
		const transactionMock = createValidatorRegistrationMock(wallet);

		await userEvent.keyboard("{enter}");

		await waitFor(() =>
			expect(signMock).toHaveBeenCalledWith(
				expect.objectContaining({
					data: { validatorPublicKey: "validator-public-key", value: 0 },
				}),
			),
		);

		await waitFor(() => expect(broadcastMock).toHaveBeenCalledWith(ValidatorRegistrationFixture.data.hash));
		await waitFor(() => expect(transactionMock).toHaveBeenCalledWith(ValidatorRegistrationFixture.data.hash));

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

		await act(async () => {
			vi.runOnlyPendingTimers(); // Run the setInterval callback
			await new Promise((resolve) => setImmediate(resolve)); // Ensure microtasks complete
		});

		// Step 4 - success screen
		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		await userEvent.keyboard("{enter}");

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		nanoXTransportMock.mockRestore();
	});

	it("should close the side panel when clicking back on form step", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		const { mockOnOpenChange } = await renderPanel();

		await expect(formStep()).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("SendRegistration__back-button"));

		expect(mockOnOpenChange).toHaveBeenCalledWith(false);

		nanoXTransportMock.mockRestore();
	});

	it("should show error step and go back", async () => {
		const nanoXTransportMock = mockNanoXTransport();

		const actsWithMnemonicMock = vi.spyOn(secondWallet, "actsWithMnemonic").mockReturnValue(true);

		const selectedWalletSpy = vi.spyOn(profile.wallets(), "selected").mockReturnValue([secondWallet]);

		await renderPanel();

		await expect(formStep()).resolves.toBeVisible();

		await inputValidatorPublicKey();

		await waitFor(() => {
			expect(continueButton()).toBeEnabled();
		});

		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const mnemonic = screen.getByTestId("AuthenticationStep__mnemonic");

		await userEvent.type(mnemonic, MAINSAIL_MNEMONICS[0]);
		await waitFor(() => expect(mnemonic).toHaveValue(MAINSAIL_MNEMONICS[0]));

		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		const signMock = vi
			.spyOn(secondWallet.transaction(), "signValidatorRegistration")
			.mockReturnValue(Promise.resolve(ValidatorRegistrationFixture.data.hash));

		const broadcastMock = vi.spyOn(secondWallet.transaction(), "broadcast").mockImplementation(() => {
			throw new Error("broadcast error");
		});

		await waitFor(() => expect(sendButton()).toBeEnabled());
		await userEvent.click(sendButton());

		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

		expect(screen.getByTestId("ErrorStep__errorMessage")).toHaveTextContent("broadcast error");

		await userEvent.click(screen.getByTestId("SendRegistration__back-button"));

		await expect(formStep()).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		actsWithMnemonicMock.mockRestore();
		nanoXTransportMock.mockRestore();
		selectedWalletSpy.mockRestore();
	});

	it("should disable send button if the encryption password is not provided", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		await renderPanel();

		await expect(formStep()).resolves.toBeVisible();

		await inputValidatorPublicKey();

		await waitFor(() => {
			expect(continueButton()).toBeEnabled();
		});
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await waitFor(() => expect(sendButton()).toBeDisabled());

		nanoXTransportMock.mockRestore();
	});
});

const inputValidatorPublicKey = async (key: string = "validator-public-key") => {
	await userEvent.clear(screen.getByTestId("Input__validator_public_key"));
	await userEvent.type(screen.getByTestId("Input__validator_public_key"), key);
	await waitFor(() => expect(screen.getByTestId("Input__validator_public_key")).toHaveValue(key));
};
