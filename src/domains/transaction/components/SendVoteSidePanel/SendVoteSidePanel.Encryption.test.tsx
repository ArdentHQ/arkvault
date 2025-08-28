/* eslint-disable testing-library/no-unnecessary-act */ // @TODO remove and fix test

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

import { Contracts, ReadOnlyWallet } from "@/app/lib/profiles";
import React, { useEffect } from "react";
import { SendVoteSidePanel } from "./SendVoteSidePanel";
import { VoteValidatorProperties } from "@/domains/vote/components/ValidatorsTable/ValidatorsTable.contracts";
import { data as validatorData } from "@/tests/fixtures/coins/mainsail/devnet/validators.json";
import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/transfer.json";
import userEvent from "@testing-library/user-event";
import { AddressService } from "@/app/lib/mainsail/address.service";
import { expect, vi } from "vitest";
import { Networks } from "@/app/lib/networks";
import { useVoteFormContext, VoteFormProvider } from "@/domains/vote/contexts/VoteFormContext";

const fixtureProfileId = getMainsailProfileId();

const passphrase = getDefaultWalletMnemonic();
let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

const continueButton = () => screen.getByTestId("SendVote__continue-button");
const sendButton = () => screen.getByTestId("SendVote__send-button");

const reviewStepID = "SendVote__review-step";
const authenticationStepID = "AuthenticationStep";

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

describe("SendVoteSidePanel Encryption", () => {
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
			requestMock("https://ark-test-musig.arkvault.io/", { result: [] }, { method: "post" }),
		);

		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should send a vote transaction using encryption password", async () => {
		vi.useRealTimers();

		const actsWithMnemonicMock = vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);
		const actsWithWifWithEncryptionMock = vi.spyOn(wallet, "actsWithMnemonicWithEncryption").mockReturnValue(true);
		const wifGetMock = vi.spyOn(wallet.signingKey(), "get").mockReturnValue(passphrase);

		const voteURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-vote`;

		const fromMnemonicMock = vi.spyOn(AddressService.prototype, "fromMnemonic").mockReturnValue({
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
					search: "",
				},
			},
		);

		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await waitFor(() => expect(screen.getByTestId(reviewStepID)).toHaveTextContent(validatorData[0].address));

		await waitFor(() => {
			expect(screen.getAllByRole("radio")[1]).toBeChecked();
		});

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

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

		const passwordInput = screen.getByTestId("AuthenticationStep__encryption-password");
		await userEvent.clear(passwordInput);
		await userEvent.type(passwordInput, "password");

		await waitFor(() => expect(passwordInput).toHaveValue("password"));

		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		await act(async () => {
			await userEvent.click(sendButton());
		});

		signMock.mockRestore();
		broadcastMock.mockRestore();
		actsWithMnemonicMock.mockRestore();
		actsWithWifWithEncryptionMock.mockRestore();
		wifGetMock.mockRestore();
		fromMnemonicMock.mockRestore();
	});
});
