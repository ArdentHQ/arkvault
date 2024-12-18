import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { BIP39 } from "@ardenthq/sdk-cryptography";
import React from "react";
import { Route } from "react-router-dom";

import { SendIpfs } from "./SendIpfs";
import { translations } from "@/domains/transaction/i18n";
import {
	env,
	getDefaultProfileId,
	getDefaultWalletMnemonic,
	render,
	screen,
	syncFees,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
	act,
	MNEMONICS,
} from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";

import transactionsFixture from "@/tests/fixtures/coins/ark/devnet/transactions.json";
import ipfsFixture from "@/tests/fixtures/coins/ark/devnet/transactions/ipfs.json";
import { BigNumber } from "@ardenthq/sdk-helpers";
import { DateTime } from "@ardenthq/sdk-intl";

const passphrase = getDefaultWalletMnemonic();
const fixtureProfileId = getDefaultProfileId();

const ipfsTransactionFixture = {
	amount: () => +ipfsFixture.data.amount / 1e8,
	blockId: () => ipfsFixture.data.blockId,
	convertedAmount: () => BigNumber.make(10),
	data: () => ({ data: () => ipfsFixture.data }),
	explorerLink: () => `https://test.arkscan.io/transaction/${ipfsFixture.data.id}`,
	explorerLinkForBlock: () => `https://test.arkscan.io/block/${ipfsFixture.data.id}`,
	fee: () => +ipfsFixture.data.fee / 1e8,
	hash: () => ipfsFixture.data.asset.ipfs,
	id: () => ipfsFixture.data.id,
	isConfirmed: () => true,
	isDelegateRegistration: () => false,
	isDelegateResignation: () => false,
	isIpfs: () => true,
	isMultiPayment: () => false,
	isMultiSignatureRegistration: () => false,
	isSent: () => true,
	isTransfer: () => false,
	isUnvote: () => false,
	isVote: () => false,
	isVoteCombination: () => false,
	memo: () => null,
	nonce: () => BigNumber.make(6),
	recipient: () => ipfsFixture.data.recipient,
	sender: () => ipfsFixture.data.sender,
	timestamp: () => DateTime.make(),
	type: () => "ipfs",
	usesMultiSignature: () => false,
	wallet: () => wallet,
};

const createTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	// @ts-ignore
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(ipfsTransactionFixture);

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const sendButton = () => screen.getByTestId("StepNavigation__send-button");
const formStep = () => screen.findByTestId("SendIpfs__form-step");

const feeWarningContinueID = "FeeWarning__continue-button";
const reviewStepID = "SendIpfs__review-step";

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

vi.mock("@/utils/debounce", () => ({
	debounceAsync: (callback: () => void) =>
		async function (...arguments_: any) {
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve(callback.apply(this, arguments_));
				}, 0);
			});
		},
}));

describe("SendIpfs", () => {
	let resetProfileNetworksMock: () => void;

	beforeAll(async () => {
		vi.useFakeTimers({
			shouldAdvanceTime: true,
			toFake: ["setInterval", "clearInterval", "Date"],
		});

		profile = env.profiles().findById(fixtureProfileId);

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().findById("ac38fe6d-4b67-4ef1-85be-17c5f6841129");

		await wallet.synchroniser().identity();

		const signatory = await wallet.signatory().stub(MNEMONICS[0]);

		vi.spyOn(wallet.signatory(), "secret").mockResolvedValue(signatory);
		vi.spyOn(wallet.coin().transaction(), "ipfs").mockResolvedValue(ipfsTransactionFixture);

		await syncFees(profile);
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		server.use(
			requestMock(
				"https://ark-test.arkvault.io/api/transactions/1e9b975eff66a731095876c3b6cbff14fd4dec3bb37a4127c46db3d69131067e",
				ipfsFixture,
			),
			requestMock("https://ark-test.arkvault.io/api/transactions", transactionsFixture, {
				query: { address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD" },
			}),
		);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	it("should send an IPFS transaction using encryption password", async () => {
		const bip39ValidateMock = vi.spyOn(BIP39, "validate").mockReturnValue(true);
		const encryptedWallet = profile.wallets().first();
		const actsWithMnemonicMock = vi.spyOn(encryptedWallet, "actsWithMnemonic").mockReturnValue(false);
		const actsWithWifWithEncryptionMock = vi
			.spyOn(encryptedWallet, "actsWithWifWithEncryption")
			.mockReturnValue(true);

		const fromMnemonicMock = vi
			.spyOn(wallet.coin().address(), "fromMnemonic")
			.mockResolvedValue({ address: wallet.address() });

		const wifGetMock = vi.spyOn(encryptedWallet.signingKey(), "get").mockReturnValue(passphrase);

		const ipfsURL = `/profiles/${fixtureProfileId}/wallets/${encryptedWallet.id()}/send-ipfs`;

		const { asFragment } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-ipfs">
				<SendIpfs />
			</Route>,
			{
				route: ipfsURL,
			},
		);

		await expect(formStep()).resolves.toBeVisible();

		await expect(screen.findByText(encryptedWallet.address())).resolves.toBeVisible();

		await userEvent.type(screen.getByTestId("Input__hash"), "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco");
		await waitFor(() =>
			expect(screen.getByTestId("Input__hash")).toHaveValue("QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"),
		);

		await userEvent.click(screen.getByText(translations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		await userEvent.clear(inputElement);
		await userEvent.type(inputElement, "10");

		await waitFor(() => expect(inputElement).toHaveValue("10"));

		expect(continueButton()).not.toBeDisabled();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(continueButton());

		if (!profile.settings().get(Contracts.ProfileSetting.DoNotShowFeeWarning)) {
			await expect(screen.findByTestId(feeWarningContinueID)).resolves.toBeVisible();

			await userEvent.click(screen.getByTestId(feeWarningContinueID));
		}

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.type(screen.getByTestId("AuthenticationStep__encryption-password"), "password");
		await waitFor(() =>
			expect(screen.getByTestId("AuthenticationStep__encryption-password")).toHaveValue("password"),
		);

		const signMock = vi
			.spyOn(encryptedWallet.transaction(), "signIpfs")
			.mockReturnValue(Promise.resolve(ipfsFixture.data.id));

		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [ipfsFixture.data.id],
			errors: {},
			rejected: [],
		});

		const transactionMock = createTransactionMock(encryptedWallet);

		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		await userEvent.click(sendButton());

		await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

		await act(() => vi.runOnlyPendingTimers());
		await expect(screen.findByText("IPFS")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		actsWithMnemonicMock.mockRestore();
		actsWithWifWithEncryptionMock.mockRestore();
		wifGetMock.mockRestore();
		bip39ValidateMock.mockRestore();
		fromMnemonicMock.mockRestore();
	});
});
