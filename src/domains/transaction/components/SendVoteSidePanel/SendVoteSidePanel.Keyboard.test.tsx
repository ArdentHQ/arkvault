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
	within,
} from "@/utils/testing-library";
import { requestMock, server } from "@/tests/mocks/server";

import { Contracts } from "@/app/lib/profiles";
import React, { useEffect } from "react";
import { VoteValidatorProperties } from "@/domains/vote/components/ValidatorsTable/ValidatorsTable.contracts";
import { data as validatorData } from "@/tests/fixtures/coins/mainsail/devnet/validators.json";
import userEvent from "@testing-library/user-event";
import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/transfer.json";
import { expect, vi } from "vitest";
import { AddressService } from "@/app/lib/mainsail/address.service";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
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
	isVote: () => true,
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
};

const createVoteTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	// @ts-ignore
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		...transactionMethodsFixture,
		type: () => "vote",
		wallet: () => wallet,
	});

const passphrase = getDefaultWalletMnemonic();
let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

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

describe("SendVoteSidePanel Keyboard", () => {
	beforeAll(async () => {
		vi.useFakeTimers({
			shouldAdvanceTime: true,
			toFake: ["setInterval", "clearInterval"],
		});

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
			requestMock("https://ark-test-musig.arkvault.io/", { result: [] }, { method: "post" }),
		);

		vi.useFakeTimers({ shouldAdvanceTime: true });
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it.each(["with keyboard", "without keyboard"])("should send a vote transaction %s", async (inputMethod) => {
		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;
		const walletVoteSyncMock = vi.spyOn(wallet.synchroniser(), "votes").mockResolvedValue(undefined);

		const mnemonicMock = vi.spyOn(AddressService.prototype, "fromMnemonic").mockReturnValue({
			address: wallet.address(),
		});

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
			{
				route: {
					pathname: voteURL,
					search: ``,
				},
			},
		);

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(reviewStepID)).toHaveTextContent(validatorData[0].address));

		await waitFor(() => {
			expect(screen.getAllByRole("radio")[1]).toBeChecked();
		});

		// Fee selection
		await waitFor(() => {
			expect(screen.getAllByRole("radio")[1]).toBeChecked();
		});

		await userEvent.click(within(screen.getAllByTestId("InputFee")[0]).getAllByRole("radio")[2]);

		expect(screen.getAllByRole("radio")[2]).toBeChecked();

		// remove focus from fee button
		await userEvent.click(document.body);

		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { timeout: 3000 });

		if (inputMethod === "with keyboard") {
			await userEvent.keyboard("{enter}");
		} else {
			await userEvent.click(continueButton());
		}

		// AuthenticationStep
		expect(screen.getByTestId(authenticationStepID)).toBeInTheDocument();

		const signMock = vi
			.spyOn(wallet.transaction(), "signVote")
			.mockReturnValue(Promise.resolve(transactionFixture.data.hash));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.hash],
			errors: {},
			rejected: [],
		});
		const transactionMock = createVoteTransactionMock(wallet);

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		await userEvent.type(passwordInput, passphrase);

		await waitFor(() => {
			expect(passwordInput).toHaveValue(passphrase);
		});

		act(() => {
			vi.advanceTimersByTime(1000);
		});

		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		await act(async () => {
			if (inputMethod === "with keyboard") {
				await userEvent.keyboard("{enter}");
			} else {
				await userEvent.click(sendButton());
			}
		});

		await expect(screen.findByTestId("icon-PendingTransaction")).resolves.toBeVisible();

		await act(() => vi.runOnlyPendingTimers());

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		walletVoteSyncMock.mockRestore();
		mnemonicMock.mockRestore();
	});
});
