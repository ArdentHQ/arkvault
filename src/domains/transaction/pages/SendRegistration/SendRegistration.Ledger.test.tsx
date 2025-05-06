import React, { useEffect } from "react";
import {
	env,
	getDefaultProfileId,
	mockNanoSTransport,
	mockNanoXTransport,
	render,
	screen,
	syncValidators,
	syncFees,
	waitFor,
} from "@/utils/testing-library";
import { minVersionList, useLedgerContext } from "@/app/contexts";
import { requestMock, server } from "@/tests/mocks/server";

import { BigNumber } from "@/app/lib/helpers";
import { Contracts } from "@/app/lib/profiles";
import { DateTime } from "@/app/lib/intl";
import MultisignatureRegistrationFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/multisignature-registration.json";
import { Route } from "react-router-dom";
import { SendRegistration } from "./SendRegistration";
import { createHashHistory } from "history";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import userEvent from "@testing-library/user-event";
import walletFixture from "@/tests/fixtures/coins/mainsail/devnet/wallets/D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb.json";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let secondWallet: Contracts.IReadWriteWallet;
const history = createHashHistory();
let getVersionSpy: vi.SpyInstance;

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const path = "/profiles/:profileId/wallets/:walletId/send-registration/:registrationType";

const renderPage = async (wallet: Contracts.IReadWriteWallet, type = "validatorRegistration") => {
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

const createMultiSignatureRegistrationMock = (wallet: Contracts.IReadWriteWallet, isConfirmed = true) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => 0,
		blockId: () => "1",
		confirmations: () => BigNumber.make(0),
		convertedAmount: () => BigNumber.make(10),
		data: () => ({
			data: MultisignatureRegistrationFixture.data,
			toSignedData: () => MultisignatureRegistrationFixture.data,
		}),
		explorerLink: () => `https://test.arkscan.io/transaction/${MultisignatureRegistrationFixture.data.id}`,
		explorerLinkForBlock: () => `https://test.arkscan.io/block/${MultisignatureRegistrationFixture.data.id}`,
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
		isConfirmed: () => isConfirmed,
		isIpfs: () => false,
		isMultiPayment: () => false,
		isMultiSignatureRegistration: () => true,
		isSent: () => true,
		isTransfer: () => false,
		isUnvote: () => false,
		isValidatorRegistration: () => false,
		isValidatorResignation: () => false,
		isVote: () => false,
		isVoteCombination: () => false,
		memo: () => null,
		nonce: () => BigNumber.make(1),
		recipient: () => MultisignatureRegistrationFixture.data.recipient,
		sender: () => MultisignatureRegistrationFixture.data.sender,
		timestamp: () => DateTime.make(),
		type: () => "multiSignature",
		usesMultiSignature: () => false,
		wallet: () => wallet,
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

		await syncValidators(profile);
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

	it("should show ledger error screen in authentication if nanoS is connected", async () => {
		const nanoSSpy = mockNanoSTransport();
		await renderPage(wallet, "multiSignature");

		// Ledger mocks
		const isLedgerMock = vi.spyOn(wallet, "isLedger").mockImplementation(() => true);
		vi.spyOn(wallet.coin(), "__construct").mockImplementation(vi.fn());

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

		await userEvent.clear(screen.getByTestId("SelectDropdown__input"));
		await userEvent.type(screen.getByTestId("SelectDropdown__input"), wallet2.address());

		await userEvent.click(screen.getByText(transactionTranslations.MULTISIGNATURE.ADD_PARTICIPANT));

		await waitFor(() => expect(screen.getAllByTestId("AddParticipantItem")).toHaveLength(2));
		await waitFor(() => expect(continueButton()).toBeEnabled());

		// Step 2
		await userEvent.click(continueButton());

		const mockDerivationPath = vi.spyOn(wallet.data(), "get").mockReturnValue("m/44'/1'/1'/0/0");
		// Skip Authentication Step
		await userEvent.click(continueButton());

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
		const envPersistMock = vi.spyOn(env, "persist").mockImplementation(vi.fn());
		const pendingMusigWalletsAddMock = vi
			.spyOn(wallet.profile(), "pendingMusigWallets")
			.mockImplementation(vi.fn());

		// Ledger mocks
		const nanoXTransportMock = mockNanoXTransport();
		const isLedgerMock = vi.spyOn(wallet, "isLedger").mockImplementation(() => true);
		vi.spyOn(wallet.coin(), "__construct").mockImplementation(vi.fn());

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

		const multiSignatureRegistrationMock = createMultiSignatureRegistrationMock(wallet, false);
		vi.spyOn(wallet.transaction(), "isAwaitingOurSignature").mockReturnValue(true);
		vi.spyOn(wallet.transaction(), "isAwaitingOtherSignatures").mockReturnValue(true);

		const wallet2 = profile.wallets().last();

		await renderPage(wallet, "multiSignature");

		await expect(screen.findByTestId("Registration__form")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getByTestId("header__title")).toHaveTextContent(multisignatureTitle));

		await userEvent.clear(screen.getByTestId("SelectDropdown__input"));
		await userEvent.type(screen.getByTestId("SelectDropdown__input"), wallet2.address());

		await userEvent.click(screen.getByText(transactionTranslations.MULTISIGNATURE.ADD_PARTICIPANT));

		await waitFor(() => expect(screen.getAllByTestId("AddParticipantItem")).toHaveLength(2));
		await waitFor(() => expect(continueButton()).toBeEnabled());

		// Step 2
		await userEvent.click(continueButton());

		const mockDerivationPath = vi.spyOn(wallet.data(), "get").mockReturnValue("m/44'/1'/1'/0/0");

		// Skip Authentication Step
		await userEvent.click(continueButton());

		await waitFor(() => expect(screen.getByTestId("header__title")).toHaveTextContent("Transaction Created"));

		multiSignatureRegistrationMock.mockRestore();
		getPublicKeyMock.mockRestore();
		isLedgerMock.mockRestore();
		signTransactionMock.mockRestore();
		addSignatureMock.mockRestore();
		mockDerivationPath.mockRestore();
		nanoXTransportMock.mockRestore();
		envPersistMock.mockRestore();
		pendingMusigWalletsAddMock.mockRestore();
	});
});
