/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable testing-library/no-unnecessary-act */ // @TODO remove and fix test
import { Signatories } from "@ardenthq/sdk";
import { Contracts, ReadOnlyWallet } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { SendVote } from "./SendVote";
import { toasts } from "@/app/services";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import { VoteDelegateProperties } from "@/domains/vote/components/DelegateTable/DelegateTable.contracts";
import { appendParameters } from "@/domains/vote/utils/url-parameters";
import { data as delegateData } from "@/tests/fixtures/coins/ark/devnet/delegates.json";
import unvoteFixture from "@/tests/fixtures/coins/ark/devnet/transactions/unvote.json";
import voteFixture from "@/tests/fixtures/coins/ark/devnet/transactions/vote.json";
import {
	act,
	env,
	getDefaultProfileId,
	getDefaultWalletId,
	getDefaultWalletMnemonic,
	render,
	screen,
	syncDelegates,
	syncFees,
	waitFor,
	within,
	mockProfileWithPublicAndTestNetworks,
	mockNanoXTransport,
} from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";

const fixtureProfileId = getDefaultProfileId();

const createVoteTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	// @ts-ignore
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => voteFixture.data.amount / 1e8,
		data: () => ({ data: () => voteFixture.data }),
		explorerLink: () => `https://test.arkscan.io/transaction/${voteFixture.data.id}`,
		fee: () => voteFixture.data.fee / 1e8,
		id: () => voteFixture.data.id,
		isMultiSignatureRegistration: () => false,
		recipient: () => voteFixture.data.recipient,
		sender: () => voteFixture.data.sender,
		type: () => "vote",
		usesMultiSignature: () => false,
	});

const createUnvoteTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	// @ts-ignore
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => unvoteFixture.data.amount / 1e8,
		data: () => ({ data: () => voteFixture.data }),
		explorerLink: () => `https://test.arkscan.io/transaction/${unvoteFixture.data.id}`,
		fee: () => unvoteFixture.data.fee / 1e8,
		id: () => unvoteFixture.data.id,
		isMultiSignatureRegistration: () => false,
		recipient: () => unvoteFixture.data.recipient,
		sender: () => unvoteFixture.data.sender,
		type: () => "unvote",
		usesMultiSignature: () => false,
	});

const passphrase = getDefaultWalletMnemonic();
let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

const votingMockImplementation = () => [
	{
		amount: 10,
		wallet: new ReadOnlyWallet({
			address: delegateData[1].address,
			explorerLink: "",
			governanceIdentifier: "address",
			isDelegate: true,
			isResignedDelegate: false,
			publicKey: delegateData[1].publicKey,
			username: delegateData[1].username,
		}),
	},
];

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const backButton = () => screen.getByTestId("StepNavigation__back-button");
const sendButton = () => screen.getByTestId("StepNavigation__send-button");

const reviewStepID = "SendVote__review-step";
const formStepID = "SendVote__form-step";

describe("SendVote", () => {
	let resetProfileNetworksMock: () => void;

	beforeAll(async () => {
		vi.useFakeTimers({
			shouldAdvanceTime: true,
			toFake: ["setInterval", "clearInterval"],
		});

		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().findById("ac38fe6d-4b67-4ef1-85be-17c5f6841129");
		await wallet.synchroniser().identity();

		vi.spyOn(wallet, "isDelegate").mockImplementation(() => true);

		await syncDelegates(profile);
		await syncFees(profile);

		for (const index of [0, 1]) {
			/* eslint-disable-next-line testing-library/prefer-explicit-assert */
			env.delegates().findByAddress(wallet.coinId(), wallet.networkId(), delegateData[index].address);
		}

		vi.spyOn(wallet.synchroniser(), "votes").mockImplementation(vi.fn());
	});

	beforeEach(() => {
		server.use(
			requestMock(
				"https://ark-test.arkvault.io/api/transactions/d819c5199e323a62a4349948ff075edde91e509028329f66ec76b8518ad1e493",
				voteFixture,
			),
			requestMock(
				"https://ark-test.arkvault.io/api/transactions/32e5278cb72f24f2c04c4797dbfbffa7072f6a30e016093fdd3f7660a2ee2faf",
				unvoteFixture,
			),
			requestMock("https://ark-test-musig.arkvault.io/", { result: [] }, { method: "post" }),
		);

		vi.useFakeTimers({ shouldAdvanceTime: true });
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		vi.useRealTimers();
		resetProfileNetworksMock();
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	it("should return to the select a delegate page to unvote", async () => {
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;
		const parameters = new URLSearchParams(`?walletId=${wallet.id()}&nethash=${wallet.network().meta().nethash}`);

		const unvotes: VoteDelegateProperties[] = [{ amount: 10, delegateAddress: delegateData[1].address }];
		appendParameters(parameters, "unvote", unvotes);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<SendVote />
			</Route>,
			{ route: { pathname: voteURL, search: `?${parameters}` } },
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[1].username));

		// Back to select a delegate page
		await waitFor(() => expect(backButton()).not.toBeDisabled());

		await userEvent.click(backButton());

		expect(container).toMatchSnapshot();
	});

	it("should return to the select a delegate page to unvote/vote", async () => {
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;
		const parameters = new URLSearchParams(`?walletId=${wallet.id()}&nethash=${wallet.network().meta().nethash}`);

		const unvotes: VoteDelegateProperties[] = [{ amount: 10, delegateAddress: delegateData[1].address }];
		appendParameters(parameters, "unvote", unvotes);

		const votes: VoteDelegateProperties[] = [{ amount: 10, delegateAddress: delegateData[0].address }];
		appendParameters(parameters, "vote", votes);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<SendVote />
			</Route>,
			{
				route: {
					pathname: voteURL,
					search: `?${parameters}`,
				},
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();
		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		// Back to select a delegate page
		await waitFor(() => expect(backButton()).not.toBeDisabled());

		await userEvent.click(backButton());

		expect(container).toMatchSnapshot();
	});

	it("should send a vote transaction", async () => {
		const votesMock = vi.spyOn(wallet.voting(), "current").mockReturnValue([]);
		await wallet.synchroniser().votes();

		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const parameters = new URLSearchParams(`?walletId=${wallet.id()}&nethash=${wallet.network().meta().nethash}`);

		const votes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "vote", votes);

		const { history } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<SendVote />
			</Route>,
			{
				route: {
					pathname: voteURL,
					search: `?${parameters}`,
				},
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		expect(screen.getAllByRole("radio")[1]).toBeChecked();

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await userEvent.click(continueButton());

		// AuthenticationStep
		expect(screen.getByTestId("AuthenticationStep")).toBeInTheDocument();

		const signVoteMock = vi
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValue(Promise.resolve(voteFixture.data.id));
		const broadcastVoteMock = vi
			.spyOn(wallet.transaction(), "broadcast")
			.mockResolvedValue({ accepted: [voteFixture.data.id], errors: {}, rejected: [] });
		const transactionVoteMock = createVoteTransactionMock(wallet);

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		await userEvent.clear(passwordInput);
		await userEvent.type(passwordInput, passphrase);

		expect(passwordInput).toHaveValue(passphrase);

		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		await act(async () => {
			await userEvent.click(sendButton());
		});

		votesMock.mockRestore();
		const votingMock = vi.spyOn(wallet.voting(), "current").mockImplementation(votingMockImplementation);

		await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

		await act(() => vi.runOnlyPendingTimers());

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		const historySpy = vi.spyOn(history, "push");

		// Go back to wallet
		await userEvent.click(screen.getByTestId("StepNavigation__back-to-wallet-button"));

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		historySpy.mockRestore();

		signVoteMock.mockRestore();
		broadcastVoteMock.mockRestore();
		transactionVoteMock.mockRestore();
		votingMock.mockRestore();
	});

	it("should warning in toast if wallet is already voting the delegate", async () => {
		await wallet.synchroniser().votes();

		const toastMock = vi.spyOn(toasts, "warning").mockImplementation(vi.fn());
		const votesMock = vi.spyOn(wallet.voting(), "current").mockReturnValue([
			{
				amount: 10,
				wallet: new ReadOnlyWallet({
					address: delegateData[0].address,
					explorerLink: "",
					governanceIdentifier: "address",
					isDelegate: true,
					isResignedDelegate: false,
					publicKey: delegateData[0].publicKey,
					rank: 1,
					username: "arkx",
				}),
			},
		]);

		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const parameters = new URLSearchParams(`?walletId=${wallet.id()}&nethash=${wallet.network().meta().nethash}`);

		const votes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "vote", votes);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<SendVote />
			</Route>,
			{
				route: {
					pathname: voteURL,
					search: `?${parameters}`,
				},
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => {
			expect(toastMock).toHaveBeenCalledWith("ARK Wallet 1 is already voting for arkx.");
		});

		votesMock.mockRestore();
		toastMock.mockRestore();
	});

	it("should send a unvote & vote transaction and use split voting method", async () => {
		const votesMock = vi.spyOn(wallet.voting(), "current").mockImplementation(votingMockImplementation);

		await wallet.synchroniser().votes();

		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;
		const parameters = new URLSearchParams(`?walletId=${wallet.id()}&nethash=${wallet.network().meta().nethash}`);

		const unvotes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[1].address,
			},
		];

		appendParameters(parameters, "unvote", unvotes);

		const votes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "vote", votes);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<SendVote />
			</Route>,
			{
				route: {
					pathname: voteURL,
					search: `?${parameters}`,
				},
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		expect(screen.getAllByRole("radio")[1]).toBeChecked();

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await userEvent.click(continueButton());

		// AuthenticationStep
		expect(screen.getByTestId("AuthenticationStep")).toBeInTheDocument();

		const signMock = vi
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValueOnce(Promise.resolve(unvoteFixture.data.id))
			.mockReturnValueOnce(Promise.resolve(voteFixture.data.id));

		const broadcastMock = vi
			.spyOn(wallet.transaction(), "broadcast")
			.mockResolvedValueOnce({
				accepted: [unvoteFixture.data.id],
				errors: {},
				rejected: [],
			})
			.mockResolvedValueOnce({
				accepted: [voteFixture.data.id],
				errors: {},
				rejected: [],
			});

		const splitVotingMethodMock = vi.spyOn(wallet.network(), "votingMethod").mockReturnValue("split");

		const transactionUnvoteMock = createUnvoteTransactionMock(wallet);
		const transactionVoteMock = createVoteTransactionMock(wallet);

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		await userEvent.clear(passwordInput);
		await userEvent.type(passwordInput, passphrase);

		expect(passwordInput).toHaveValue(passphrase);

		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		await act(async () => {
			await userEvent.click(sendButton());
		});

		act(() => {
			vi.advanceTimersByTime(1000);
		});

		setTimeout(() => {
			votesMock.mockRestore();
		}, 3000);

		act(() => {
			vi.runOnlyPendingTimers();
		});

		await waitFor(() => {
			expect(signMock).toHaveBeenNthCalledWith(1, {
				data: {
					unvotes: [
						{
							amount: 10,
							id: delegateData[1].address,
						},
					],
				},
				fee: 0.01,
				signatory: expect.any(Signatories.Signatory),
			});
		});

		await waitFor(() => expect(broadcastMock).toHaveBeenNthCalledWith(1, unvoteFixture.data.id));

		await waitFor(() =>
			expect(signMock).toHaveBeenNthCalledWith(2, {
				data: {
					votes: [
						{
							amount: 10,
							id: delegateData[0].publicKey,
						},
					],
				},
				fee: 0.01,
				signatory: expect.any(Signatories.Signatory),
			}),
		);

		await waitFor(() => expect(broadcastMock).toHaveBeenNthCalledWith(2, voteFixture.data.id));

		await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

		await act(() => vi.runOnlyPendingTimers());

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionUnvoteMock.mockRestore();
		transactionVoteMock.mockRestore();
		splitVotingMethodMock.mockRestore();
	});

	it("should select sender", async () => {
		const voteURL = `/profiles/${fixtureProfileId}/send-vote`;
		const parameters = new URLSearchParams(`&nethash=${wallet.network().meta().nethash}`);

		render(
			<Route path="/profiles/:profileId/send-vote">
				<SendVote />
			</Route>,
			{
				route: {
					pathname: voteURL,
					search: `?${parameters}`,
				},
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await userEvent.click(within(screen.getByTestId("sender-address")).getByTestId("SelectAddress__wrapper"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		const firstAddress = screen.getByTestId("SearchWalletListItem__select-1");
		await userEvent.click(firstAddress);

		await expect(screen.findByTestId("SelectAddress__input")).resolves.toHaveValue(
			profile.wallets().last().address(),
		);
	});

	it("should redirect to dashboard when clicking back and wallet is not provided in url", async () => {
		const voteURL = `/profiles/${fixtureProfileId}/send-vote`;
		const parameters = new URLSearchParams(`&nethash=${wallet.network().meta().nethash}`);

		const { history } = render(
			<Route path="/profiles/:profileId/send-vote">
				<SendVote />
			</Route>,
			{
				route: {
					pathname: voteURL,
					search: `?${parameters}`,
				},
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		const historySpy = vi.spyOn(history, "push");

		await userEvent.click(backButton());

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/dashboard`);
	});

	it("should select sender wallet and sync if not yet synced", async () => {
		const voteURL = `/profiles/${fixtureProfileId}/send-vote`;
		const parameters = new URLSearchParams(`&nethash=${wallet.network().meta().nethash}`);
		const walletSyncMock = vi.spyOn(profile.wallets().first(), "hasBeenFullyRestored").mockReturnValue(false);

		render(
			<Route path="/profiles/:profileId/send-vote">
				<SendVote />
			</Route>,
			{
				route: {
					pathname: voteURL,
					search: `?${parameters}`,
				},
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await userEvent.click(within(screen.getByTestId("sender-address")).getByTestId("SelectAddress__wrapper"));

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		const firstAddress = screen.getByTestId("SearchWalletListItem__select-0");
		await userEvent.click(firstAddress);

		await expect(screen.findByTestId("SelectAddress__input")).resolves.toHaveValue(
			profile.wallets().first().address(),
		);

		walletSyncMock.mockRestore();
	});

	it("should render without selected wallet", async () => {
		const voteURL = `/profiles/${fixtureProfileId}/send-vote`;
		const parameters = new URLSearchParams(`?&nethash=${wallet.network().meta().nethash}`);

		render(
			<Route path="/profiles/:profileId/send-vote">
				<SendVote />
			</Route>,
			{
				route: {
					pathname: voteURL,
					search: `?${parameters}`,
				},
			},
		);

		await expect(screen.findByTestId("SelectAddress__input")).resolves.toHaveValue("");
	});

	it("should keep the fee when user step back", async () => {
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;
		const parameters = new URLSearchParams(`?walletId=${wallet.id()}&nethash=${wallet.network().meta().nethash}`);

		const unvotes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "unvote", unvotes);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<SendVote />
			</Route>,
			{
				route: {
					pathname: voteURL,
					search: `?${parameters}`,
				},
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		await userEvent.click(screen.getAllByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED)[0]);

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		await userEvent.clear(inputElement);
		await userEvent.type(inputElement, "0.02");

		await waitFor(() => expect(inputElement).toHaveValue("0.02"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		// Back to form
		await userEvent.click(backButton());
		await waitFor(() => expect(screen.getByTestId("InputCurrency")).toHaveValue("0.02"));

		// Back to review step
		await userEvent.click(continueButton());

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		expect(screen.getAllByTestId("Amount")[3]).toHaveTextContent("0.02");
	});

	it("should move back and forth between steps", async () => {
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;
		const parameters = new URLSearchParams(`?walletId=${wallet.id()}&nethash=${wallet.network().meta().nethash}`);

		const unvotes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "unvote", unvotes);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<SendVote />
			</Route>,
			{
				route: {
					pathname: voteURL,
					search: `?${parameters}`,
				},
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		await userEvent.click(screen.getAllByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED)[0]);

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		await userEvent.clear(inputElement);
		await userEvent.type(inputElement, "0.02");

		await waitFor(() => expect(inputElement).toHaveValue("0.02"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		// Back to form
		await userEvent.click(backButton());
		await waitFor(() => expect(screen.getByTestId("InputCurrency")).toHaveValue("0.02"));

		// Back to review step
		await userEvent.click(continueButton());

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await userEvent.click(continueButton());

		// Authentication Step
		expect(screen.getByTestId("AuthenticationStep")).toBeInTheDocument();

		await userEvent.click(backButton());

		// Back to Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await userEvent.click(continueButton());

		// Back to AuthenticationStep
		expect(screen.getByTestId("AuthenticationStep")).toBeInTheDocument();

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		await userEvent.clear(passwordInput);
		await userEvent.type(passwordInput, passphrase);
		await waitFor(() => expect(passwordInput).toHaveValue(passphrase));
	});

	it("should send a unvote transaction", async () => {
		const votesMock = vi.spyOn(wallet.voting(), "current").mockImplementation(() => [
			{
				amount: 10,
				wallet: new ReadOnlyWallet({
					address: delegateData[0].address,
					explorerLink: "",
					governanceIdentifier: "address",
					isDelegate: true,
					isResignedDelegate: false,
					publicKey: delegateData[0].publicKey,
					username: delegateData[0].username,
				}),
			},
			{
				amount: 10,
				wallet: new ReadOnlyWallet({
					address: delegateData[1].address,
					explorerLink: "",
					governanceIdentifier: "address",
					isDelegate: true,
					isResignedDelegate: false,
					publicKey: delegateData[1].publicKey,
					username: delegateData[1].username,
				}),
			},
		]);
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;
		const parameters = new URLSearchParams(`?walletId=${wallet.id()}&nethash=${wallet.network().meta().nethash}`);

		const unvotes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "unvote", unvotes);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<SendVote />
			</Route>,
			{
				route: {
					pathname: voteURL,
					search: `?${parameters}`,
				},
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await userEvent.click(continueButton());

		// AuthenticationStep
		expect(screen.getByTestId("AuthenticationStep")).toBeInTheDocument();

		const signMock = vi
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValue(Promise.resolve(unvoteFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [unvoteFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createUnvoteTransactionMock(wallet);

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		await userEvent.clear(passwordInput);
		await userEvent.type(passwordInput, passphrase);

		expect(passwordInput).toHaveValue(passphrase);

		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		await act(async () => {
			await userEvent.click(sendButton());
		});

		act(() => {
			vi.advanceTimersByTime(1000);
		});

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		expect(container).toMatchSnapshot();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		votesMock.mockRestore();
	});

	it("should return to form step by cancelling fee warning", async () => {
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;
		const parameters = new URLSearchParams(`?walletId=${wallet.id()}&nethash=${wallet.network().meta().nethash}`);

		const votes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "vote", votes);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<SendVote />
			</Route>,
			{
				route: {
					pathname: voteURL,
					search: `?${parameters}`,
				},
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		// Fee
		await userEvent.click(screen.getAllByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED)[0]);

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		await userEvent.clear(inputElement);
		await userEvent.type(inputElement, "5");

		await waitFor(() => expect(inputElement).toHaveValue("5"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await userEvent.click(continueButton());

		// Fee warning
		expect(screen.getByTestId("FeeWarning__cancel-button")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("FeeWarning__cancel-button"));

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
	});

	it("should proceed to authentication step by confirming fee warning", async () => {
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;
		const parameters = new URLSearchParams(`?walletId=${wallet.id()}&nethash=${wallet.network().meta().nethash}`);

		const votes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "vote", votes);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<SendVote />
			</Route>,
			{
				route: {
					pathname: voteURL,
					search: `?${parameters}`,
				},
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		// Fee
		await userEvent.click(screen.getAllByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED)[0]);

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		await userEvent.clear(inputElement);
		await userEvent.type(inputElement, "10");

		await waitFor(() => expect(inputElement).toHaveValue("10"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await userEvent.click(continueButton());

		// Fee warning
		expect(screen.getByTestId("FeeWarning__continue-button")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("FeeWarning__continue-button"));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();
	});

	it("should show error if wrong mnemonic", async () => {
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;
		const parameters = new URLSearchParams(`?walletId=${wallet.id()}&nethash=${wallet.network().meta().nethash}`);

		const votes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "vote", votes);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<SendVote />
			</Route>,
			{
				route: {
					pathname: voteURL,
					search: `?${parameters}`,
				},
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await userEvent.click(continueButton());

		// AuthenticationStep
		expect(screen.getByTestId("AuthenticationStep")).toBeInTheDocument();

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		await userEvent.clear(passwordInput);
		await userEvent.type(passwordInput, "wrong passphrase");
		await waitFor(() => expect(passwordInput).toHaveValue("wrong passphrase"));

		await waitFor(() => expect(sendButton()).toBeDisabled());

		expect(screen.getByTestId("Input__error")).toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});

	it("should show error step and go back", async () => {
		vi.useRealTimers();

		const history = createHashHistory();

		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;
		const parameters = new URLSearchParams(`?walletId=${wallet.id()}&nethash=${wallet.network().meta().nethash}`);

		const votes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "vote", votes);

		const { container } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<SendVote />
			</Route>,
			{
				history,
				route: {
					pathname: voteURL,
					search: `?${parameters}`,
				},
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// Review Step
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(continueButton());

		// AuthenticationStep
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const signMock = vi.spyOn(wallet.transaction(), "signVote").mockImplementation(() => {
			throw new Error("broadcast error");
		});

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		await userEvent.type(passwordInput, passphrase);
		await waitFor(() => expect(passwordInput).toHaveValue(passphrase));

		const historyMock = vi.spyOn(history, "push").mockReturnValue();
		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		await userEvent.click(sendButton());

		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

		expect(screen.getByTestId("ErrorStep__errorMessage")).toHaveTextContent("broadcast error");
		expect(screen.getByTestId("ErrorStep__close-button")).toBeInTheDocument();
		expect(container).toMatchSnapshot();

		await userEvent.click(screen.getByTestId("ErrorStep__close-button"));

		const walletDetailPage = `/profiles/${getDefaultProfileId()}/wallets/${getDefaultWalletId()}`;
		await waitFor(() => expect(historyMock).toHaveBeenCalledWith(walletDetailPage));

		signMock.mockRestore();
	});

	it("should send a unvote transaction with a multisignature wallet", async () => {
		const isMultiSignatureSpy = vi.spyOn(wallet, "isMultiSignature").mockReturnValue(true);
		const multisignatureSpy = vi
			.spyOn(wallet.multiSignature(), "all")
			.mockReturnValue({ min: 2, publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!] });

		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;
		const parameters = new URLSearchParams(`?walletId=${wallet.id()}&nethash=${wallet.network().meta().nethash}`);

		const unvotes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[1].address,
			},
		];

		appendParameters(parameters, "unvote", unvotes);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<SendVote />
			</Route>,
			{
				route: {
					pathname: voteURL,
					search: `?${parameters}`,
				},
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[1].username));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		const signMock = vi
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValue(Promise.resolve(unvoteFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [unvoteFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createUnvoteTransactionMock(wallet);

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		await act(async () => {
			await userEvent.click(continueButton());
		});

		act(() => {
			vi.advanceTimersByTime(1000);
		});

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		expect(signMock).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.anything(),
				fee: expect.any(Number),
				signatory: expect.any(Object),
			}),
		);

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();

		isMultiSignatureSpy.mockRestore();
		multisignatureSpy.mockRestore();
	});

	it("should send a vote transaction with a ledger wallet", async () => {
		const nanoXMock = mockNanoXTransport();
		const isLedgerSpy = vi.spyOn(wallet, "isLedger").mockImplementation(() => true);

		const getPublicKeySpy = vi
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockResolvedValue("0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb");

		const signTransactionSpy = vi
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValue(Promise.resolve(voteFixture.data.id));

		const voteTransactionMock = createVoteTransactionMock(wallet);

		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [voteFixture.data.id],
			errors: {},
			rejected: [],
		});

		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;
		const parameters = new URLSearchParams(`?walletId=${wallet.id()}&nethash=${wallet.network().meta().nethash}`);

		const unvotes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "unvote", unvotes);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<SendVote />
			</Route>,
			{
				route: {
					pathname: voteURL,
					search: `?${parameters}`,
				},
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		const address = wallet.address();
		const balance = wallet.balance();
		const derivationPath = "m/44'/1'/1'/0/0";
		const votes = wallet.voting().current();
		const publicKey = wallet.publicKey();

		const mockWalletData = vi.spyOn(wallet.data(), "get").mockImplementation((key) => {
			if (key == Contracts.WalletData.Address) {
				return address;
			}
			if (key == Contracts.WalletData.Address) {
				return address;
			}

			if (key == Contracts.WalletData.Balance) {
				return balance;
			}

			if (key == Contracts.WalletData.PublicKey) {
				return publicKey;
			}

			if (key == Contracts.WalletData.Votes) {
				return votes;
			}

			if (key == Contracts.WalletData.DerivationPath) {
				return derivationPath;
			}
		});

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		await act(async () => {
			await userEvent.click(continueButton());
		});

		act(() => {
			vi.advanceTimersByTime(1000);
		});

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		getPublicKeySpy.mockRestore();
		signTransactionSpy.mockRestore();
		isLedgerSpy.mockRestore();
		broadcastMock.mockRestore();
		voteTransactionMock.mockRestore();
		mockWalletData.mockRestore();
		nanoXMock.mockRestore();
	});

	it("should error if ledger is not supported", async () => {
		const nanoXMock = mockNanoXTransport();
		const isLedgerSpy = vi.spyOn(wallet, "isLedger").mockImplementation(() => true);
		process.env.REACT_APP_IS_UNIT = undefined;

		const getPublicKeySpy = vi
			.spyOn(wallet.coin().ledger(), "getPublicKey")
			.mockResolvedValue("0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb");

		const signTransactionSpy = vi
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValue(Promise.resolve(voteFixture.data.id));

		const voteTransactionMock = createVoteTransactionMock(wallet);

		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [voteFixture.data.id],
			errors: {},
			rejected: [],
		});

		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;
		const parameters = new URLSearchParams(`?walletId=${wallet.id()}&nethash=${wallet.network().meta().nethash}`);

		const unvotes: VoteDelegateProperties[] = [
			{
				amount: 10,
				delegateAddress: delegateData[0].address,
			},
		];

		appendParameters(parameters, "unvote", unvotes);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-vote">
				<SendVote />
			</Route>,
			{
				route: {
					pathname: voteURL,
					search: `?${parameters}`,
				},
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(formStepID)).toHaveTextContent(delegateData[0].username));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();
		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		await userEvent.click(continueButton());
		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

		getPublicKeySpy.mockRestore();
		signTransactionSpy.mockRestore();
		isLedgerSpy.mockRestore();
		broadcastMock.mockRestore();
		voteTransactionMock.mockRestore();
		nanoXMock.mockRestore();
	});
});
