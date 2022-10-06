/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import nock from "nock";
import React, { useEffect } from "react";
import { Route } from "react-router-dom";

import { SendRegistration } from "./SendRegistration";
import { minVersionList, useLedgerContext } from "@/app/contexts";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import MultisignatureRegistrationFixture from "@/tests/fixtures/coins/ark/devnet/transactions/multisignature-registration.json";
import {
	defaultNetMocks,
	env,
	getDefaultProfileId,
	render,
	screen,
	syncDelegates,
	syncFees,
	waitFor,
	mockNanoSTransport,
	mockNanoXTransport,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let secondWallet: Contracts.IReadWriteWallet;
const history = createHashHistory();
let getVersionSpy: vi.SpyInstance;

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const path = "/profiles/:profileId/wallets/:walletId/send-registration/:registrationType";

const renderPage = async (wallet: Contracts.IReadWriteWallet, type = "delegateRegistration") => {
	const registrationURL = `/profiles/${profile.id()}/wallets/${wallet.id()}/send-registration/${type}`;

	history.push(registrationURL);

	const SendRegistrationWrapper = () => {
		const { listenDevice } = useLedgerContext();

		useEffect(() => {
			listenDevice();
		}, []);

		return <SendRegistration />;
	};

	const utils = render(
		<Route path={path}>
			<SendRegistrationWrapper />
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

const createMultiSignatureRegistrationMock = (wallet: Contracts.IReadWriteWallet) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => 0,
		data: () => ({ toSignedData: () => MultisignatureRegistrationFixture.data }),
		explorerLink: () => `https://test.arkscan.io/transaction/${MultisignatureRegistrationFixture.data.id}`,
		fee: () => +MultisignatureRegistrationFixture.data.fee / 1e8,
		get: (attribute: string) => {
			if (attribute === "multiSignature") {
				return {
					min: 2,
					publicKeys: [
						"03df6cd794a7d404db4f1b25816d8976d0e72c5177d17ac9b19a92703b62cdbbbc",
						"034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192",
					],
				};
			}
		},
		id: () => MultisignatureRegistrationFixture.data.id,
		isMultiSignatureRegistration: () => true,
		recipient: () => MultisignatureRegistrationFixture.data.recipient,
		sender: () => MultisignatureRegistrationFixture.data.sender,
		type: () => "multiSignature",
		usesMultiSignature: () => false,
	} as any);

const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const multisignatureTitle = "Multisignature Registration";

describe("Registration", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().findByAddressWithNetwork("D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD", "ark.devnet")!;
		// secondWallet = profile.wallets().findByAddressWithNetwork("D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb", "ark.devnet")!;
		secondWallet = profile.wallets().push(
			await profile.walletFactory().fromAddress({
				address: "DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
				coin: "ARK",
				network: "ark.devnet",
			}),
		);

		getVersionSpy = vi
			.spyOn(wallet.coin().ledger(), "getVersion")
			.mockResolvedValue(minVersionList[wallet.network().coin()]);

		await wallet.synchroniser().identity();
		await secondWallet.synchroniser().identity();

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
		nock.cleanAll();
		defaultNetMocks();

		nock("https://ark-test-musig.arkvault.io/")
			.get("/api/wallets/DDA5nM7KEqLeTtQKv5qGgcnc6dpNBKJNTS")
			.reply(200, require("tests/fixtures/coins/ark/devnet/wallets/D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb.json"));

		nock("https://ark-test-musig.arkvault.io")
			.post("/")
			.reply(200, { result: { id: "03df6cd794a7d404db4f1b25816d8976d0e72c5177d17ac9b19a92703b62cdbbbc" } })
			.persist();
	});

	it("should show ledger error screen in authentication if nanoS is connected", async () => {
		const nanoSSpy = mockNanoSTransport();
		await renderPage(wallet, "multiSignature");

		// Ledger mocks
		const isLedgerMock = vi.spyOn(wallet, "isLedger").mockImplementation(() => true);
		vi.spyOn(wallet.coin(), "__construct").mockImplementation();

		const getPublicKeyMock = vi
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockResolvedValue("0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb");

		const signTransactionMock = vi
			.spyOn(wallet.transaction(), "signMultiSignature")
			.mockReturnValue(Promise.resolve(MultisignatureRegistrationFixture.data.id));

		const addSignatureMock = vi.spyOn(wallet.transaction(), "addSignature").mockResolvedValue({
			accepted: [MultisignatureRegistrationFixture.data.id],
			errors: {},
			rejected: [],
		});

		const multiSignatureRegistrationMock = createMultiSignatureRegistrationMock(wallet);

		const wallet2 = profile.wallets().last();

		await expect(screen.findByTestId("Registration__form")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("header__title")).toHaveTextContent(multisignatureTitle));

		userEvent.paste(screen.getByTestId("SelectDropdown__input"), wallet2.address());

		userEvent.click(screen.getByText(transactionTranslations.MULTISIGNATURE.ADD_PARTICIPANT));

		await waitFor(() => expect(screen.getAllByTestId("AddParticipantItem")).toHaveLength(2));
		await waitFor(() => expect(continueButton()).toBeEnabled());

		// Step 2
		userEvent.click(continueButton());

		const mockDerivationPath = vi.spyOn(wallet.data(), "get").mockReturnValue("m/44'/1'/1'/0/0");
		// Skip Authentication Step
		userEvent.click(continueButton());

		await waitFor(() => expect(screen.getByTestId("LedgerDeviceError")).toBeVisible(), { timeout: 4000 });

		isLedgerMock.mockRestore();
		getPublicKeyMock.mockRestore();
		signTransactionMock.mockRestore();
		multiSignatureRegistrationMock.mockRestore();
		addSignatureMock.mockRestore();
		mockDerivationPath.mockRestore();
		nanoSSpy.mockRestore();
	});

	it("should send multisignature registration with ledger wallet", async () => {
		const envPersistMock = vi.spyOn(env, "persist").mockImplementation();
		// Ledger mocks
		const nanoXTransportMock = mockNanoXTransport();
		const isLedgerMock = vi.spyOn(wallet, "isLedger").mockImplementation(() => true);
		vi.spyOn(wallet.coin(), "__construct").mockImplementation();

		const getPublicKeyMock = vi
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockResolvedValue("0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb");

		const signTransactionMock = vi
			.spyOn(wallet.transaction(), "signMultiSignature")
			.mockReturnValue(Promise.resolve(MultisignatureRegistrationFixture.data.id));

		const addSignatureMock = vi.spyOn(wallet.transaction(), "addSignature").mockResolvedValue({
			accepted: [MultisignatureRegistrationFixture.data.id],
			errors: {},
			rejected: [],
		});

		const multiSignatureRegistrationMock = createMultiSignatureRegistrationMock(wallet);

		const wallet2 = profile.wallets().last();

		await renderPage(wallet, "multiSignature");

		await expect(screen.findByTestId("Registration__form")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("header__title")).toHaveTextContent(multisignatureTitle));

		userEvent.paste(screen.getByTestId("SelectDropdown__input"), wallet2.address());

		userEvent.click(screen.getByText(transactionTranslations.MULTISIGNATURE.ADD_PARTICIPANT));

		await waitFor(() => expect(screen.getAllByTestId("AddParticipantItem")).toHaveLength(2));
		await waitFor(() => expect(continueButton()).toBeEnabled());

		// Step 2
		userEvent.click(continueButton());

		const mockDerivationPath = vi.spyOn(wallet.data(), "get").mockReturnValue("m/44'/1'/1'/0/0");
		// Skip Authentication Step
		userEvent.click(continueButton());

		await waitFor(() => expect(screen.getByTestId("header__title")).toHaveTextContent("Ledger Wallet"));

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		isLedgerMock.mockRestore();
		getPublicKeyMock.mockRestore();
		signTransactionMock.mockRestore();
		multiSignatureRegistrationMock.mockRestore();
		addSignatureMock.mockRestore();
		mockDerivationPath.mockRestore();
		nanoXTransportMock.mockRestore();
		envPersistMock.mockRestore();
	});
});
