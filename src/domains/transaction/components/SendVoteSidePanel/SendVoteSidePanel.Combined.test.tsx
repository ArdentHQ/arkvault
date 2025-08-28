/* eslint-disable testing-library/no-unnecessary-act */ // @TODO remove and fix test

import { Contracts, ReadOnlyWallet } from "@/app/lib/profiles";
import {
	act,
	env,
	getMainsailProfileId,
	getDefaultMainsailWalletId,
	getDefaultWalletMnemonic,
	render,
	screen,
	syncValidators,
	syncFees,
	waitFor,
} from "@/utils/testing-library";
import { requestMock, server } from "@/tests/mocks/server";

import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import React, { useEffect } from "react";
import { Signatories } from "@/app/lib/mainsail";
import { VoteValidatorProperties } from "@/domains/vote/components/ValidatorsTable/ValidatorsTable.contracts";
import { data as validatorData } from "@/tests/fixtures/coins/mainsail/devnet/validators.json";
import { SendVoteSidePanel } from "./SendVoteSidePanel";
import userEvent from "@testing-library/user-event";
import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/transfer.json";
import { expect, vi } from "vitest";
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
const sendButton = () => screen.getByTestId("SendVote__send-button");

const reviewStepID = "SendVote__review-step";
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
		// The side panel context expects (unvotes, votes)
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

describe("SendVoteSidePanel Combined", () => {
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
				{ data: {} },
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

	it("should send a unvote & vote transaction (split)", async () => {
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

		await expect(screen.findByTestId("icon-PendingTransaction")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionUnvoteMock.mockRestore();
		transactionVoteMock.mockRestore();
		splitVotingMethodMock.mockRestore();
	});
});
