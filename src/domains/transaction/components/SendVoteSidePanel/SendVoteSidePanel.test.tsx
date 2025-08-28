/* eslint-disable testing-library/no-unnecessary-act */ // @TODO remove and fix test
import { Contracts, ReadOnlyWallet } from "@/app/lib/profiles";
import {
	act,
	env,
	getMainsailProfileId,
	getDefaultMainsailWalletId,
	getDefaultWalletMnemonic,
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
import { DateTime } from "@/app/lib/intl";
import React, { useEffect } from "react";
import { Signatories } from "@/app/lib/mainsail";
import { VoteValidatorProperties } from "@/domains/vote/components/ValidatorsTable/ValidatorsTable.contracts";
import { data as validatorData } from "@/tests/fixtures/coins/mainsail/devnet/validators.json";
import { toasts } from "@/app/services";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import userEvent from "@testing-library/user-event";
import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/transfer.json";
import { expect, vi } from "vitest";
import { SendVoteSidePanel } from "./SendVoteSidePanel";
import { Networks } from "@/app/lib/networks";
import { useVoteFormContext, VoteFormProvider } from "@/domains/vote/contexts/VoteFormContext";

const fixtureProfileId = getMainsailProfileId();

const transactionMethodsFixture = {
	blockHash: () => transactionFixture.data.blockHash,
	convertedAmount: () => BigNumber.make(10),
	data: () => transactionFixture.data,
	explorerLink: () => `https://test.arkscan.io/transaction/${transactionFixture.data.id}`,
	explorerLinkForBlock: () => `https://test.arkscan.io/block/${transactionFixture.data.id}`,
	fee: () => +transactionFixture.data.fee / 1e18,
	from: () => transactionFixture.data.from,
	hash: () => transactionFixture.data.hash,
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
	memo: () => transactionFixture.data.memo || undefined,
	nonce: () => BigNumber.make(transactionFixture.data.nonce),
	payments: () => [],
	recipients: () => [],
	sender: () => transactionFixture.data.sender,
	timestamp: () => DateTime.make(transactionFixture.data.timestamp),
	to: () => transactionFixture.data.to,
	total: () => {
		const value = BigNumber.make(transactionFixture.data.value);
		const feeVal = BigNumber.make(transactionFixture.data.gasPrice).times(transactionFixture.data.gas);
		return value.plus(feeVal);
	},
	usesMultiSignature: () => false,
	value: () => +transactionFixture.data.value / 1e8,
	wallet: () => wallet,
};
const createVoteTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	// @ts-ignore
	vi
		.spyOn(wallet.transaction(), "transaction")
		.mockReturnValue({ ...transactionMethodsFixture, isVote: () => true, type: () => "vote" });

const createUnvoteTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	// @ts-ignore
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		...transactionMethodsFixture,
		isUnvote: () => true,
		type: () => "unvote",
	});

const passphrase = getDefaultWalletMnemonic();
let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

const votingMockImplementation = () => [
	{
		amount: 10,
		wallet: new ReadOnlyWallet({
			address: validatorData[1].address,
			explorerLink: "",
			governanceIdentifier: "address",
			isResignedvalidator: false,
			isValidator: true,
			publicKey: validatorData[1].publicKey,
			username: validatorData[1].username,
		}),
	},
];

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const continueButton = () => screen.getByTestId("SendVote__continue-button");
const backButton = () => screen.getByTestId("SendVote__back-button");
const sendButton = () => screen.getByTestId("SendVote__send-button");

const reviewStepID = "SendVote__review-step";
const formStepID = "SendVote__form-step";
const authenticationStepID = "AuthenticationStep";

const ComponentWraper = ({
	votes,
	unvotes,
}: {
	votes: VoteValidatorProperties[];
	unvotes: VoteValidatorProperties[];
}) => {
	const { openSendVotePanel, showSendVotePanel, setShowSendVotePanel } = useVoteFormContext();

	useEffect(() => {
		openSendVotePanel(unvotes, votes);
	}, []);

	return <SendVoteSidePanel open={showSendVotePanel} onOpenChange={setShowSendVotePanel} />;
};

const Component = ({
	activeProfile,
	activeNetwork,
	activeWallet,
	votes = [],
	unvotes = [],
}: {
	activeProfile: Contracts.IProfile;
	activeNetwork: Networks.Network;
	activeWallet?: Contracts.IReadWriteWallet;
	votes?: VoteValidatorProperties[];
	unvotes?: VoteValidatorProperties[];
}) => (
	<VoteFormProvider profile={activeProfile} network={activeNetwork} wallet={activeWallet}>
		<ComponentWraper votes={votes} unvotes={unvotes} />
	</VoteFormProvider>
);

describe("SendVote", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().findById(getDefaultMainsailWalletId());
		await wallet.synchroniser().identity();

		vi.spyOn(wallet, "isValidator").mockImplementation(() => true);

		await syncValidators(profile);
		await syncFees(profile);

		for (const index of [0, 1]) {
			/* eslint-disable-next-line testing-library/prefer-explicit-assert */
			profile.validators().findByAddress(wallet.networkId(), validatorData[index].address);
		}

		vi.spyOn(wallet.synchroniser(), "votes").mockImplementation(vi.fn());
	});

	beforeEach(() => {
		server.use(
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api/transactions/f7054cf37ce49e17cf2b06a0a868cac183bf78e2f1b4a6fe675f2412364fe0a",
				transactionFixture,
			),
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api/transactions/8e4a8c3eaf2f9543a5bd61bb85ddd2205d5091597a77446c8b99692e0854b978",
				transactionFixture,
			),
			requestMock(
				"https://dwallets-evm.mainsailhq.com/api/blocks/f7054cf37ce49e17cf2b06a0a868cac183bf78e2f1b4a6fe675f2412364fe0ae",
				{ data: {} }, // Basic mock for block data
			),
			requestMock("https://ark-test-musig.arkvault.io/", { result: [] }, { method: "post" }),
		);

		vi.useFakeTimers({
			shouldAdvanceTime: true,
			toFake: ["setInterval", "clearInterval"],
		});
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should close the side panel and return to the select a validator page to unvote", async () => {
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const unvotes: VoteValidatorProperties[] = [{ amount: 10, validatorAddress: validatorData[1].address }];

		const { router } = render(
			<Component
				activeProfile={profile}
				activeNetwork={wallet.network()}
				activeWallet={wallet}
				votes={[]}
				unvotes={unvotes}
			/>,
			{ route: `${voteURL}` },
		);

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(reviewStepID)).toHaveTextContent(validatorData[1].address));

		// Back to select a validator page
		await waitFor(() => expect(backButton()).not.toBeDisabled());

		await userEvent.click(backButton());

		expect(router.state.location.pathname).toBe(`/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`);

		// reviewStepID should not be in the document
		await waitFor(() => expect(screen.queryByTestId(reviewStepID)).not.toBeInTheDocument());
	});

	it("should close the side panel and return to the select a validator page to unvote/vote", async () => {
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const unvotes: VoteValidatorProperties[] = [{ amount: 10, validatorAddress: validatorData[1].address }];
		const votes: VoteValidatorProperties[] = [{ amount: 10, validatorAddress: validatorData[0].address }];

		const { router } = render(
			<Component
				activeProfile={profile}
				activeNetwork={wallet.network()}
				activeWallet={wallet}
				votes={votes}
				unvotes={unvotes}
			/>,
			{ route: `${voteURL}` },
		);

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();
		await waitFor(() => expect(screen.getByTestId(reviewStepID)).toHaveTextContent(validatorData[0].address));

		// Back to select a validator page
		await waitFor(() => expect(backButton()).not.toBeDisabled());

		await userEvent.click(backButton());
		expect(router.state.location.pathname).toBe(`/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`);

		// reviewStepID should not be in the document
		await waitFor(() => expect(screen.queryByTestId(reviewStepID)).not.toBeInTheDocument());
	});

	it("should send a vote transaction", async () => {
		const votesMock = vi.spyOn(wallet.voting(), "current").mockReturnValue([]);
		await wallet.synchroniser().votes();

		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const votes: VoteValidatorProperties[] = [
			{
				amount: 10,
				validatorAddress: validatorData[0].address,
			},
		];

		const { router } = render(
			<Component activeProfile={profile} activeNetwork={wallet.network()} activeWallet={wallet} votes={votes} />,
			{
				route: `${voteURL}`,
			},
		);

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(reviewStepID)).toHaveTextContent(validatorData[0].address));

		expect(screen.getAllByRole("radio")[1]).toBeChecked();

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// AuthenticationStep
		expect(screen.getByTestId(authenticationStepID)).toBeInTheDocument();

		const signVoteMock = vi
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastVoteMock = vi
			.spyOn(wallet.transaction(), "broadcast")
			.mockResolvedValue({ accepted: [transactionFixture.data.id], errors: {}, rejected: [] });
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

		// Go back to dashboard
		await userEvent.click(screen.getByTestId("SendVote__close-button"));

		expect(router.state.location.pathname).toBe(`/profiles/${profile.id()}/dashboard`);

		signVoteMock.mockRestore();
		broadcastVoteMock.mockRestore();
		transactionVoteMock.mockRestore();
		votingMock.mockRestore();
	});

	it.skip("should warning in toast if wallet is already voting the validator", async () => {
		await wallet.synchroniser().votes();

		const toastMock = vi.spyOn(toasts, "warning").mockImplementation(vi.fn());
		const votesMock = vi.spyOn(wallet.voting(), "current").mockReturnValue([
			{
				amount: 10,
				wallet: new ReadOnlyWallet({
					address: validatorData[0].address,
					explorerLink: "",
					governanceIdentifier: "address",
					isResignedvalidator: false,
					isValidator: true,
					publicKey: validatorData[0].publicKey,
					rank: 1,
					username: "arkx",
				}),
			},
		]);

		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const votes: VoteValidatorProperties[] = [
			{
				amount: 10,
				validatorAddress: validatorData[0].address,
			},
		];

		render(
			<Component
				activeProfile={profile}
				activeNetwork={wallet.network()}
				activeWallet={wallet}
				votes={votes}
				unvotes={[]}
			/>,
			{ route: `${voteURL}` },
		);

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await waitFor(() => {
			expect(toastMock).toHaveBeenCalledWith(
				"Mainsail Wallet 1 is already voting for 0xB8Be76b31E402a2D89294Aa107056484Bef94362.",
			);
		});

		votesMock.mockRestore();
		toastMock.mockRestore();
	});

	it("should send a unvote & vote transaction and use split voting method", async () => {
		const votesMock = vi.spyOn(wallet.voting(), "current").mockImplementation(votingMockImplementation);

		await wallet.synchroniser().votes();

		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const unvotes: VoteValidatorProperties[] = [
			{
				amount: 10,
				validatorAddress: validatorData[1].address,
			},
		];

		const votes: VoteValidatorProperties[] = [
			{
				amount: 10,
				validatorAddress: validatorData[0].address,
			},
		];

		render(
			<Component
				activeProfile={profile}
				activeNetwork={wallet.network()}
				activeWallet={wallet}
				votes={votes}
				unvotes={unvotes}
			/>,
			{ route: `${voteURL}` },
		);

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(reviewStepID)).toHaveTextContent(validatorData[0].address));

		expect(screen.getAllByRole("radio")[1]).toBeChecked();

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// AuthenticationStep
		expect(screen.getByTestId(authenticationStepID)).toBeInTheDocument();

		const signMock = vi
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValueOnce(Promise.resolve(transactionFixture.data.id))
			.mockReturnValueOnce(Promise.resolve(transactionFixture.data.id));

		const broadcastMock = vi
			.spyOn(wallet.transaction(), "broadcast")
			.mockResolvedValueOnce({
				accepted: [transactionFixture.data.id],
				errors: {},
				rejected: [],
			})
			.mockResolvedValueOnce({
				accepted: [transactionFixture.data.id],
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

		// reset the votes mock so it no longer returns that is voting
		votesMock.mockRestore();

		act(() => {
			vi.runOnlyPendingTimers();
		});

		await waitFor(() => {
			expect(signMock).toHaveBeenNthCalledWith(1, {
				data: {
					unvotes: [
						{
							amount: 10,
							id: validatorData[1].address,
						},
					],
				},
				gasLimit: expect.any(BigNumber),
				gasPrice: expect.any(BigNumber),
				signatory: expect.any(Signatories.Signatory),
			});
		});

		await waitFor(() => expect(broadcastMock).toHaveBeenNthCalledWith(1, transactionFixture.data.id));

		await waitFor(() =>
			expect(signMock).toHaveBeenNthCalledWith(2, {
				data: {
					votes: [
						{
							amount: 10,
							id: validatorData[0].address,
						},
					],
				},
				gasLimit: expect.any(BigNumber),
				gasPrice: expect.any(BigNumber),
				signatory: expect.any(Signatories.Signatory),
			}),
		);

		await waitFor(() => expect(broadcastMock).toHaveBeenNthCalledWith(2, transactionFixture.data.id));

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

		render(
			<Component
				activeProfile={profile}
				activeNetwork={wallet.network()}
				activeWallet={undefined}
				votes={[]}
				unvotes={[]}
			/>,
			{
				route: {
					pathname: voteURL,
					search: ``,
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

		render(
			<Component
				activeProfile={profile}
				activeNetwork={wallet.network()}
				activeWallet={wallet}
				votes={[]}
				unvotes={[]}
			/>,
			{
				route: {
					pathname: voteURL,
					search: ``,
				},
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await userEvent.click(backButton());
	});

	it("should select sender wallet and sync if not yet synced", async () => {
		const voteURL = `/profiles/${fixtureProfileId}/send-vote`;
		const walletSyncMock = vi.spyOn(profile.wallets().first(), "hasBeenFullyRestored").mockReturnValue(false);

		render(
			<Component
				activeProfile={profile}
				activeNetwork={wallet.network()}
				activeWallet={undefined}
				votes={[]}
				unvotes={[]}
			/>,
			{
				route: {
					pathname: voteURL,
					search: ``,
				},
			},
		);

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();

		await waitFor(() =>
			expect(
				within(screen.getByTestId("sender-address")).getByTestId("SelectAddress__wrapper"),
			).not.toBeDisabled(),
		);

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

		render(
			<Component
				activeProfile={profile}
				activeNetwork={wallet.network()}
				activeWallet={undefined}
				votes={[]}
				unvotes={[]}
			/>,
			{
				route: {
					pathname: voteURL,
					search: ``,
				},
			},
		);

		await expect(screen.findByTestId("SelectAddress__input")).resolves.toHaveValue("");
	});

	it("should keep the fee when user step back", async () => {
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const unvotes: VoteValidatorProperties[] = [
			{
				amount: 10,
				validatorAddress: validatorData[0].address,
			},
		];

		render(
			<Component
				activeProfile={profile}
				activeNetwork={wallet.network()}
				activeWallet={wallet}
				votes={[]}
				unvotes={unvotes}
			/>,
			{ route: `${voteURL}` },
		);

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(reviewStepID)).toHaveTextContent(validatorData[0].address));

		await userEvent.click(screen.getAllByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED)[0]);

		const inputElement: HTMLInputElement = screen.getByTestId("Input_GasPrice");

		await userEvent.clear(inputElement);
		await userEvent.type(inputElement, "20");

		await waitFor(() => expect(inputElement).toHaveValue("20"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// AuthenticationStep
		expect(screen.getByTestId(authenticationStepID)).toBeInTheDocument();

		// Back to form
		await userEvent.click(backButton());
		await waitFor(() => expect(screen.getByTestId("Input_GasPrice")).toHaveValue("20"));

		// Back to AuthenticationStep
		await userEvent.click(continueButton());

		expect(screen.getByTestId(authenticationStepID)).toBeInTheDocument();
	});

	it("should move back and forth between steps", async () => {
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const unvotes: VoteValidatorProperties[] = [
			{
				amount: 10,
				validatorAddress: validatorData[0].address,
			},
		];

		render(
			<Component
				activeProfile={profile}
				activeNetwork={wallet.network()}
				activeWallet={wallet}
				votes={[]}
				unvotes={unvotes}
			/>,
			{ route: `${voteURL}` },
		);

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(reviewStepID)).toHaveTextContent(validatorData[0].address));

		await userEvent.click(screen.getAllByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED)[0]);

		const inputElement: HTMLInputElement = screen.getByTestId("Input_GasPrice");

		await userEvent.clear(inputElement);
		await userEvent.type(inputElement, "20");

		await waitFor(() => expect(inputElement).toHaveValue("20"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// Back to form
		await userEvent.click(backButton());
		await waitFor(() => expect(screen.getByTestId("Input_GasPrice")).toHaveValue("20"));

		// Back to review step
		await userEvent.click(continueButton());

		expect(screen.getByTestId(authenticationStepID)).toBeInTheDocument();

		await userEvent.click(backButton());

		// Back to Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await userEvent.click(continueButton());

		// Back to AuthenticationStep
		expect(screen.getByTestId(authenticationStepID)).toBeInTheDocument();

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
					address: validatorData[0].address,
					explorerLink: "",
					governanceIdentifier: "address",
					isResignedvalidator: false,
					isValidator: true,
					publicKey: validatorData[0].publicKey,
					username: validatorData[0].username,
				}),
			},
			{
				amount: 10,
				wallet: new ReadOnlyWallet({
					address: validatorData[1].address,
					explorerLink: "",
					governanceIdentifier: "address",
					isResignedvalidator: false,
					isValidator: true,
					publicKey: validatorData[1].publicKey,
					username: validatorData[1].username,
				}),
			},
		]);
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const unvotes: VoteValidatorProperties[] = [
			{
				amount: 10,
				validatorAddress: validatorData[0].address,
			},
		];

		render(
			<Component
				activeProfile={profile}
				activeNetwork={wallet.network()}
				activeWallet={wallet}
				votes={[]}
				unvotes={unvotes}
			/>,
			{ route: `${voteURL}` },
		);

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(reviewStepID)).toHaveTextContent(validatorData[0].address));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// AuthenticationStep
		expect(screen.getByTestId(authenticationStepID)).toBeInTheDocument();

		const signMock = vi
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
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

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		votesMock.mockRestore();
	});

	it("should show error if wrong mnemonic", async () => {
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const votes: VoteValidatorProperties[] = [
			{
				amount: 10,
				validatorAddress: validatorData[0].address,
			},
		];

		const { container } = render(
			<Component
				activeProfile={profile}
				activeNetwork={wallet.network()}
				activeWallet={wallet}
				votes={votes}
				unvotes={[]}
			/>,
			{ route: `${voteURL}` },
		);

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(reviewStepID)).toHaveTextContent(validatorData[0].address));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// AuthenticationStep
		expect(screen.getByTestId(authenticationStepID)).toBeInTheDocument();

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

		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const votes: VoteValidatorProperties[] = [
			{
				amount: 10,
				validatorAddress: validatorData[0].address,
			},
		];

		const { container } = render(
			<Component
				activeProfile={profile}
				activeNetwork={wallet.network()}
				activeWallet={wallet}
				votes={votes}
				unvotes={[]}
			/>,
			{ route: `${voteURL}` },
		);

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(reviewStepID)).toHaveTextContent(validatorData[0].address));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// AuthenticationStep
		await expect(screen.findByTestId(authenticationStepID)).resolves.toBeVisible();

		const signMock = vi.spyOn(wallet.transaction(), "signVote").mockImplementation(() => {
			throw new Error("broadcast error");
		});

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		await userEvent.type(passwordInput, passphrase);
		await waitFor(() => expect(passwordInput).toHaveValue(passphrase));

		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		await userEvent.click(sendButton());

		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

		expect(screen.getByTestId("ErrorStep__errorMessage")).toHaveTextContent("broadcast error");
		expect(screen.getByTestId("ErrorStep__close-button")).toBeInTheDocument();
		expect(container).toMatchSnapshot();

		await userEvent.click(screen.getByTestId("ErrorStep__close-button"));

		signMock.mockRestore();
	});

	it("should send a vote transaction with a ledger wallet", async () => {
		const nanoXMock = mockNanoXTransport();
		const isLedgerSpy = vi.spyOn(wallet, "isLedger").mockImplementation(() => true);

		const getPublicKeySpy = vi
			.spyOn(wallet.ledger(), "getPublicKey")
			.mockResolvedValue("0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb");

		const signTransactionSpy = vi
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));

		const voteTransactionMock = createVoteTransactionMock(wallet);

		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});

		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const unvotes: VoteValidatorProperties[] = [
			{
				amount: 10,
				validatorAddress: validatorData[0].address,
			},
		];

		render(
			<Component
				activeProfile={profile}
				activeNetwork={wallet.network()}
				activeWallet={wallet}
				votes={[]}
				unvotes={unvotes}
			/>,
			{ route: `${voteURL}` },
		);

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(reviewStepID)).toHaveTextContent(validatorData[0].address));

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
			.spyOn(wallet.ledger(), "getPublicKey")
			.mockResolvedValue("0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb");

		const signTransactionSpy = vi
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));

		const voteTransactionMock = createVoteTransactionMock(wallet);

		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});

		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const unvotes: VoteValidatorProperties[] = [
			{
				amount: 10,
				validatorAddress: validatorData[0].address,
			},
		];

		render(
			<Component
				activeProfile={profile}
				activeNetwork={wallet.network()}
				activeWallet={wallet}
				votes={[]}
				unvotes={unvotes}
			/>,
			{ route: `${voteURL}` },
		);

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(reviewStepID)).toHaveTextContent(validatorData[0].address));

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
