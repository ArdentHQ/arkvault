/* eslint-disable @typescript-eslint/require-await */
import { Signatories } from "@ardenthq/sdk";
import { BIP39 } from "@ardenthq/sdk-cryptography";
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";
import { SendRegistration } from "./SendRegistration";
import * as randomWordPositionsMock from "@/domains/wallet/components/MnemonicVerification/utils/randomWordPositions";
import { minVersionList } from "@/app/contexts";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import SecondSignatureRegistrationFixture from "@/tests/fixtures/coins/ark/devnet/transactions/second-signature-registration.json";
import walletFixture from "@/tests/fixtures/coins/ark/devnet/wallets/D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb.json";
import {
	env,
	getDefaultProfileId,
	getDefaultWalletMnemonic,
	render,
	screen,
	syncDelegates,
	syncFees,
	waitFor,
	within,
	mockNanoXTransport,
} from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let secondWallet: Contracts.IReadWriteWallet;
const history = createHashHistory();
const passphrase = getDefaultWalletMnemonic();
let getVersionSpy: vi.SpyInstance;

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const path = "/profiles/:profileId/wallets/:walletId/send-registration/:registrationType";

const renderPage = async (wallet: Contracts.IReadWriteWallet, type = "delegateRegistration") => {
	const registrationURL = `/profiles/${profile.id()}/wallets/${wallet.id()}/send-registration/${type}`;

	history.push(registrationURL);

	const utils = render(
		<Route path={path}>
			<SendRegistration />
		</Route>,
		{
			history,
			route: registrationURL,
			withProviders: true,
		},
	);

	await expect(screen.findByTestId("Registration__form")).resolves.toBeVisible();

	return {
		...utils,
		history,
	};
};

const createSecondSignatureRegistrationMock = (wallet: Contracts.IReadWriteWallet) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => 0,
		data: () => ({ data: () => SecondSignatureRegistrationFixture.data }),
		explorerLink: () => `https://test.arkscan.io/transaction/${SecondSignatureRegistrationFixture.data.id}`,
		fee: () => +SecondSignatureRegistrationFixture.data.fee / 1e8,
		id: () => SecondSignatureRegistrationFixture.data.id,
		isConfirmed: () => true,
		isDelegateRegistration: () => false,
		isDelegateResignation: () => false,
		isIpfs: () => false,
		isMultiSignatureRegistration: () => false,
		isVote: () => false,
		recipient: () => SecondSignatureRegistrationFixture.data.recipient,
		sender: () => SecondSignatureRegistrationFixture.data.sender,
		type: () => "secondSignature",
		usesMultiSignature: () => false,
	} as any);

const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const sendButton = () => screen.getByTestId("StepNavigation__send-button");

const multisignatureTitle = "Multisignature Registration";

describe("Second Signature Registration", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().findByAddressWithNetwork("D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD", "ark.devnet")!;

		secondWallet = profile.wallets().push(
			await profile.walletFactory().fromAddress({
				address: "DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
				coin: "ARK",
				network: "ark.devnet",
			}),
		);

		await wallet.synchroniser().identity();
		await secondWallet.synchroniser().identity();

		getVersionSpy = vi
			.spyOn(wallet.coin().ledger(), "getVersion")
			.mockResolvedValue(minVersionList[wallet.network().coin()]);

		profile.wallets().push(
			await profile.walletFactory().fromAddress({
				address: "D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib",
				coin: "ARK",
				network: "ark.devnet",
			}),
		);

		await syncDelegates(profile);
		await syncFees(profile);
	});

	afterAll(() => {
		getVersionSpy.mockRestore();
	});

	beforeEach(() => {
		server.use(
			requestMock(
				"https://ark-test-musig.arkvault.io/api/wallets/DDA5nM7KEqLeTtQKv5qGgcnc6dpNBKJNTS",
				walletFixture,
			),
			requestMock(
				"https://ark-test-musig.arkvault.io",
				{ result: { id: "03df6cd794a7d404db4f1b25816d8976d0e72c5177d17ac9b19a92703b62cdbbbc" } },
				{ method: "post" },
			),
		);
	});

	it("should register second signature", async () => {
		vi.spyOn(randomWordPositionsMock, "randomWordPositions").mockReturnValue([1, 2, 3]);

		const nanoXTransportMock = mockNanoXTransport();
		const bip39GenerateMock = vi.spyOn(BIP39, "generate").mockReturnValue(passphrase);

		const { asFragment } = await renderPage(wallet, "secondSignature");

		await expect(screen.findByTestId("SecondSignatureRegistrationForm__generation-step")).resolves.toBeVisible();

		await waitFor(() => {
			expect(screen.getByTestId("InputFee")).toBeInTheDocument();
		});

		const fees = within(screen.getByTestId("InputFee")).getAllByTestId("ButtonGroupOption");
		await userEvent.click(fees[1]);

		await userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
		);

		await waitFor(() => expect(screen.getByTestId("InputCurrency")).not.toHaveValue("0"));

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("SecondSignatureRegistrationForm__backup-step")).resolves.toBeVisible();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("SecondSignatureRegistrationForm__verification-step")).resolves.toBeVisible();

		const [firstInput, secondInput, thirdInput] = screen.getAllByTestId("MnemonicVerificationInput__input");
		await userEvent.type(firstInput, "master");
		await userEvent.type(secondInput, "dizzy");
		await userEvent.type(thirdInput, "era");

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("SecondSignatureRegistrationForm__review-step")).resolves.toBeVisible();

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		await waitFor(() => expect(sendButton()).toBeEnabled());

		expect(asFragment()).toMatchSnapshot();

		const signMock = vi
			.spyOn(wallet.transaction(), "signSecondSignature")
			.mockReturnValue(Promise.resolve(SecondSignatureRegistrationFixture.data.id));

		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [SecondSignatureRegistrationFixture.data.id],
			errors: {},
			rejected: [],
		});

		const transactionMock = createSecondSignatureRegistrationMock(wallet);

		const mnemonicValidationMock = vi
			.spyOn(wallet.coin().address(), "fromMnemonic")
			.mockResolvedValue({ address: wallet.address() });

		await userEvent.click(sendButton());

		await waitFor(() =>
			expect(signMock).toHaveBeenCalledWith({
				data: { mnemonic: passphrase },
				fee: 0.1,
				signatory: expect.any(Signatories.Signatory),
			}),
		);

		await waitFor(() => expect(broadcastMock).toHaveBeenCalledWith(SecondSignatureRegistrationFixture.data.id));
		await waitFor(() => expect(transactionMock).toHaveBeenCalledWith(SecondSignatureRegistrationFixture.data.id));

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		bip39GenerateMock.mockRestore();
		nanoXTransportMock.mockRestore();
		mnemonicValidationMock.mockRestore();
	});

	it.each([
		["delegateRegistration", "Register Delegate"],
		["secondSignature", "Register Second Signature"],
		["multiSignature", multisignatureTitle],
	])("should handle registrationType param (%s)", async (type, label) => {
		const registrationPath = `/profiles/${getDefaultProfileId()}/wallets/${secondWallet.id()}/send-registration/${type}`;
		history.push(registrationPath);

		render(
			<Route path={path}>
				<SendRegistration />
			</Route>,
			{
				history,
				route: registrationPath,
			},
		);

		await expect(screen.findByTestId("Registration__form")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("header__title")).toHaveTextContent(label));
	});
});
