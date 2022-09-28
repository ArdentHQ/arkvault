/* eslint-disable @typescript-eslint/require-await */
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import nock from "nock";
import React from "react";
import { Route, Router } from "react-router-dom";

import { SendIpfs } from "./SendIpfs";
import { LedgerProvider, minVersionList } from "@/app/contexts";
import { translations } from "@/domains/transaction/i18n";
import ipfsFixture from "@/tests/fixtures/coins/ark/devnet/transactions/ipfs.json";
import {
	env,
	getDefaultProfileId,
	getDefaultWalletMnemonic,
	render,
	screen,
	syncFees,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

const passphrase = getDefaultWalletMnemonic();
const fixtureProfileId = getDefaultProfileId();

const createTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	// @ts-ignore
	jest.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => +ipfsFixture.data.amount / 1e8,
		data: () => ({ data: () => ipfsFixture.data }),
		explorerLink: () => `https://test.arkscan.io/transaction/${ipfsFixture.data.id}`,
		fee: () => +ipfsFixture.data.fee / 1e8,
		hash: () => ipfsFixture.data.asset.ipfs,
		id: () => ipfsFixture.data.id,
		isMultiSignatureRegistration: () => false,
		recipient: () => ipfsFixture.data.recipient,
		sender: () => ipfsFixture.data.sender,
		type: () => "ipfs",
		usesMultiSignature: () => false,
	});

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let getVersionSpy: jest.SpyInstance;

const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const sendButton = () => screen.getByTestId("StepNavigation__send-button");
const formStep = () => screen.findByTestId("SendIpfs__form-step");

const feeWarningContinueID = "FeeWarning__continue-button";
const reviewStepID = "SendIpfs__review-step";

jest.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

jest.mock("@/utils/debounce", () => ({
	debounceAsync: (callback: () => void) => {
		return async function (...arguments_: any) {
			return new Promise((resolve) => {
				setTimeout(async () => {
					resolve(await callback.apply(this, arguments_));
				}, 0);
			});
		};
	},
}));

describe("SendIpfs", () => {
	let resetProfileNetworksMock: () => void;

	beforeAll(async () => {
		profile = env.profiles().findById(fixtureProfileId);

		nock("https://ark-test.arkvault.io")
			.get("/api/transactions")
			.query({ address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD" })
			.reply(200, require("tests/fixtures/coins/ark/devnet/transactions.json"))
			.get("/api/transactions/1e9b975eff66a731095876c3b6cbff14fd4dec3bb37a4127c46db3d69131067e")
			.reply(200, ipfsFixture);

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().findById("ac38fe6d-4b67-4ef1-85be-17c5f6841129");

		getVersionSpy = jest
			.spyOn(wallet.coin().ledger(), "getVersion")
			.mockResolvedValue(minVersionList[wallet.network().coin()]);

		await wallet.synchroniser().identity();

		await syncFees(profile);
	});

	afterAll(() => {
		getVersionSpy.mockRestore();
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	it("should send an IPFS transaction using encryption password", async () => {
		const encryptedWallet = profile.wallets().first();
		const actsWithMnemonicMock = jest.spyOn(encryptedWallet, "actsWithMnemonic").mockReturnValue(false);
		const actsWithWifWithEncryptionMock = jest
			.spyOn(encryptedWallet, "actsWithWifWithEncryption")
			.mockReturnValue(true);
		const wifGetMock = jest.spyOn(encryptedWallet.signingKey(), "get").mockReturnValue(passphrase);

		const ipfsURL = `/profiles/${fixtureProfileId}/wallets/${encryptedWallet.id()}/send-ipfs`;

		const { asFragment } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-ipfs">
				<LedgerProvider>
					<SendIpfs />
				</LedgerProvider>
			</Route>,
			{
				route: ipfsURL,
			},
		);

		await expect(formStep()).resolves.toBeVisible();

		const networkLabel = `${wallet.network().coin()} ${wallet.network().name()}`;
		await waitFor(() => expect(screen.getByTestId("TransactionNetwork")).toHaveTextContent(networkLabel));
		await waitFor(() =>
			expect(screen.getByTestId("TransactionSender")).toHaveTextContent(encryptedWallet.address()),
		);

		userEvent.paste(screen.getByTestId("Input__hash"), "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco");
		await waitFor(() =>
			expect(screen.getByTestId("Input__hash")).toHaveValue("QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"),
		);

		userEvent.click(screen.getByText(translations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "10");

		await waitFor(() => expect(inputElement).toHaveValue("10"));

		expect(continueButton()).not.toBeDisabled();

		userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		userEvent.click(continueButton());

		if (!profile.settings().get(Contracts.ProfileSetting.DoNotShowFeeWarning)) {
			await expect(screen.findByTestId(feeWarningContinueID)).resolves.toBeVisible();

			userEvent.click(screen.getByTestId(feeWarningContinueID));
		}

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__encryption-password"), "password");
		await waitFor(() =>
			expect(screen.getByTestId("AuthenticationStep__encryption-password")).toHaveValue("password"),
		);

		const signMock = jest
			.spyOn(encryptedWallet.transaction(), "signIpfs")
			.mockReturnValue(Promise.resolve(ipfsFixture.data.id));

		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [ipfsFixture.data.id],
			errors: {},
			rejected: [],
		});

		const transactionMock = createTransactionMock(encryptedWallet);

		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		userEvent.click(sendButton());

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		actsWithMnemonicMock.mockRestore();
		actsWithWifWithEncryptionMock.mockRestore();
		wifGetMock.mockRestore();

		expect(asFragment()).toMatchSnapshot();
	});
});
