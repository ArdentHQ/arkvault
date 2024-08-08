import { Contracts, ReadOnlyWallet } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { DelegateFooter } from "./DelegateFooter";
import { buildTranslations } from "@/app/i18n/helpers";
import { VoteDelegateProperties } from "@/domains/vote/components/DelegateTable/DelegateTable.contracts";
import { translations as voteTranslations } from "@/domains/vote/i18n";
import { data } from "@/tests/fixtures/coins/ark/devnet/delegates.json";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

let wallet: Contracts.IReadWriteWallet;
let delegate: Contracts.IReadOnlyWallet;

const translations = buildTranslations();

const continueButton = () => screen.getByTestId("DelegateTable__continue-button");

describe("DelegateFooter", () => {
	beforeAll(() => {
		const profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().values()[0];

		delegate = new ReadOnlyWallet({
			address: data[0].address,
			explorerLink: "",
			governanceIdentifier: "address",
			isDelegate: true,
			isResignedDelegate: false,
			publicKey: data[0].publicKey,
			username: data[0].username,
		});
	});

	it("should render", () => {
		const { container, asFragment } = render(
			<DelegateFooter
				selectedWallet={wallet}
				availableBalance={wallet.balance()}
				selectedVotes={[]}
				selectedUnvotes={[]}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should show available balance if network requires vote amount", () => {
		const { rerender } = render(
			<DelegateFooter
				selectedWallet={wallet}
				availableBalance={wallet.balance()}
				selectedVotes={[]}
				selectedUnvotes={[]}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(screen.queryByTestId("DelegateTable__available-balance")).not.toBeInTheDocument();

		const votesAmountMinimumMock = vi.spyOn(wallet.network(), "votesAmountMinimum").mockReturnValue(10);

		rerender(
			<DelegateFooter
				selectedWallet={wallet}
				availableBalance={wallet.balance()}
				selectedVotes={[]}
				selectedUnvotes={[]}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(screen.getByTestId("DelegateTable__available-balance")).toBeInTheDocument();

		votesAmountMinimumMock.mockRestore();
	});

	it("should calculate remaining balance show it", () => {
		const votesAmountMinimumMock = vi.spyOn(wallet.network(), "votesAmountMinimum").mockReturnValue(10);

		render(
			<DelegateFooter
				selectedWallet={wallet}
				availableBalance={wallet.balance() / 2}
				selectedVotes={[]}
				selectedUnvotes={[]}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(screen.getByTestId("DelegateTable__available-balance")).toBeInTheDocument();

		expect(
			screen.getByText(
				translations.VOTE.DELEGATE_TABLE.VOTE_AMOUNT.AVAILABLE_TO_VOTE.replace("{{percent}}", "50"),
			),
		).toBeInTheDocument();

		expect(screen.getByText(`16.87544901 ${wallet.network().ticker()}`)).toBeInTheDocument();

		votesAmountMinimumMock.mockRestore();
	});

	it("should disable continue button with tooltip if user doesn't select a delegate", async () => {
		const selectedDelegate: VoteDelegateProperties[] = [
			{
				amount: 0,
				delegateAddress: delegate.address(),
			},
		];

		const { rerender, baseElement } = render(
			<DelegateFooter
				selectedWallet={wallet}
				availableBalance={wallet.balance()}
				selectedVotes={[]}
				selectedUnvotes={[]}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
				onContinue={vi.fn()}
			/>,
		);

		expect(continueButton()).toBeDisabled();

		await userEvent.hover(screen.getByTestId("DelegateTable__continue--wrapper"));

		expect(baseElement).toHaveTextContent(voteTranslations.DELEGATE_TABLE.TOOLTIP.SELECTED_DELEGATE);

		rerender(
			<DelegateFooter
				selectedWallet={wallet}
				availableBalance={wallet.balance()}
				selectedVotes={selectedDelegate}
				selectedUnvotes={[]}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(continueButton()).not.toBeDisabled();

		rerender(
			<DelegateFooter
				selectedWallet={wallet}
				availableBalance={wallet.balance()}
				selectedVotes={[]}
				selectedUnvotes={selectedDelegate}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(continueButton()).not.toBeDisabled();

		await userEvent.hover(screen.getByTestId("DelegateTable__continue--wrapper"));

		expect(baseElement).not.toHaveTextContent(voteTranslations.DELEGATE_TABLE.TOOLTIP.SELECTED_DELEGATE);
	});

	it("should disable continue button with tooltip if there is at least 1 empty amount field when network requires vote amount", async () => {
		const votesAmountMinimumMock = vi.spyOn(wallet.network(), "votesAmountMinimum").mockReturnValue(10);

		const selectedDelegate: VoteDelegateProperties[] = [
			{
				amount: 0,
				delegateAddress: delegate.address(),
			},
		];

		const { rerender, baseElement } = render(
			<DelegateFooter
				selectedWallet={wallet}
				availableBalance={wallet.balance()}
				selectedVotes={selectedDelegate}
				selectedUnvotes={[]}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
				onContinue={vi.fn()}
			/>,
		);

		expect(continueButton()).toBeDisabled();

		await userEvent.hover(screen.getByTestId("DelegateTable__continue--wrapper"));

		expect(baseElement).toHaveTextContent(voteTranslations.DELEGATE_TABLE.TOOLTIP.INVALID_AMOUNT);

		rerender(
			<DelegateFooter
				selectedWallet={wallet}
				availableBalance={wallet.balance()}
				selectedVotes={[
					{
						amount: 10,
						delegateAddress: delegate.address(),
					},
				]}
				selectedUnvotes={[]}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(continueButton()).not.toBeDisabled();

		votesAmountMinimumMock.mockRestore();
	});
});
