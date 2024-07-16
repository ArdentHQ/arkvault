import { Contracts, ReadOnlyWallet } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { DelegateTable } from "./DelegateTable";
import { VoteDelegateProperties } from "./DelegateTable.contracts";
import * as useRandomNumberHook from "@/app/hooks/use-random-number";
import { translations } from "@/app/i18n/common/i18n";
import { data } from "@/tests/fixtures/coins/ark/devnet/delegates.json";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";

let useRandomNumberSpy: vi.SpyInstance;

let wallet: Contracts.IReadWriteWallet;
let delegates: Contracts.IReadOnlyWallet[];
let votes: Contracts.VoteRegistryItem[];

const pressingContinueButton = () => userEvent.click(screen.getByTestId("DelegateTable__continue-button"));
const firstDelegateVoteButton = () => screen.getByTestId("DelegateRow__toggle-0");
const footerUnvotes = () => screen.getByTestId("DelegateTable__footer--unvote");
const footerVotes = () => screen.getByTestId("DelegateTable__footer--vote");

describe("DelegateTable", () => {
	beforeAll(() => {
		useRandomNumberSpy = vi.spyOn(useRandomNumberHook, "useRandomNumber").mockImplementation(() => 1);

		const profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().values()[0];

		delegates = [0, 1, 2].map(
			(index) =>
				new ReadOnlyWallet({
					address: data[index].address,
					explorerLink: "",
					governanceIdentifier: "address",
					isDelegate: true,
					isResignedDelegate: false,
					publicKey: data[index].publicKey,
					username: data[index].username,
				}),
		);

		votes = [
			{
				amount: 0,
				wallet: delegates[0],
			},
		];
	});

	afterAll(() => {
		useRandomNumberSpy.mockRestore();
	});

	it("should render", () => {
		const { container, asFragment } = render(
			<DelegateTable
				delegates={delegates}
				votes={[]}
				voteDelegates={[]}
				unvoteDelegates={[]}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render vote amount column", () => {
		const votesAmountMinimumMock = vi.spyOn(wallet.network(), "votesAmountMinimum").mockReturnValue(10);

		const { container, asFragment } = render(
			<DelegateTable
				delegates={delegates}
				votes={[]}
				voteDelegates={[]}
				unvoteDelegates={[]}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		votesAmountMinimumMock.mockRestore();
	});

	describe.each(["base", "requiresAmount"])("loading state for %s", (voteType) => {
		it.each([true, false])("should render when isCompact = %s", (isCompact: boolean) => {
			const votesAmountMinimumMock = vi
				.spyOn(wallet.network(), "votesAmountMinimum")
				.mockReturnValue(voteType === "requiresAmount" ? 10 : 0);

			const { container, asFragment } = render(
				<DelegateTable
					delegates={[]}
					votes={[]}
					isLoading={true}
					voteDelegates={[]}
					unvoteDelegates={[]}
					selectedWallet={wallet}
					maxVotes={wallet.network().maximumVotesPerTransaction()}
					isCompact={isCompact}
				/>,
			);

			expect(container).toBeInTheDocument();
			expect(asFragment()).toMatchSnapshot();

			votesAmountMinimumMock.mockRestore();
		});
	});

	it("should render with empty list", () => {
		const { container, asFragment } = render(
			<DelegateTable
				delegates={[]}
				votes={[]}
				voteDelegates={[]}
				unvoteDelegates={[]}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with subtitle", () => {
		const { container, asFragment } = render(
			<DelegateTable
				delegates={delegates}
				votes={[]}
				voteDelegates={[]}
				unvoteDelegates={[]}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
				subtitle={<p>test</p>}
			/>,
		);

		expect(container).toBeInTheDocument();
		expect(screen.getByText("test")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should select a delegate to vote", () => {
		const { asFragment } = render(
			<DelegateTable
				delegates={delegates}
				votes={[]}
				voteDelegates={[]}
				unvoteDelegates={[]}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		userEvent.click(firstDelegateVoteButton());

		expect(screen.getByTestId("DelegateTable__footer")).toBeInTheDocument();
		expect(footerVotes()).toHaveTextContent("1");

		userEvent.click(firstDelegateVoteButton());

		expect(firstDelegateVoteButton()).toHaveTextContent(translations.SELECT);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should unselect a delegate to vote", () => {
		const { asFragment } = render(
			<DelegateTable
				delegates={delegates}
				votes={votes}
				voteDelegates={[]}
				unvoteDelegates={[]}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);
		const selectButton = screen.getByTestId("DelegateRow__toggle-1");

		userEvent.click(selectButton);

		expect(screen.getByTestId("DelegateTable__footer")).toBeInTheDocument();
		expect(footerVotes()).toHaveTextContent("1");

		userEvent.click(selectButton);

		expect(selectButton).toHaveTextContent(translations.SELECTED);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should select a delegate to unvote", () => {
		const { asFragment } = render(
			<DelegateTable
				delegates={delegates}
				votes={votes}
				voteDelegates={[]}
				unvoteDelegates={[]}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		userEvent.click(firstDelegateVoteButton());

		expect(screen.getByTestId("DelegateTable__footer")).toBeInTheDocument();
		expect(footerUnvotes()).toHaveTextContent("1");

		userEvent.click(firstDelegateVoteButton());

		expect(firstDelegateVoteButton()).toHaveTextContent(translations.CURRENT);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should select a delegate with vote amount and make it unvote", () => {
		const votesAmountMinimumMock = vi.spyOn(wallet.network(), "votesAmountMinimum").mockReturnValue(10);

		const votes: Contracts.VoteRegistryItem[] = [
			{
				amount: 10,
				wallet: delegates[0],
			},
		];

		const { asFragment } = render(
			<DelegateTable
				delegates={delegates}
				votes={votes}
				voteDelegates={[]}
				unvoteDelegates={[]}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		userEvent.click(firstDelegateVoteButton());

		expect(screen.getByTestId("DelegateTable__footer")).toBeInTheDocument();
		expect(footerUnvotes()).toHaveTextContent("1");

		userEvent.click(firstDelegateVoteButton());

		expect(firstDelegateVoteButton()).toHaveTextContent(translations.CURRENT);
		expect(asFragment()).toMatchSnapshot();

		votesAmountMinimumMock.mockRestore();
	});

	it("should select a changed delegate to unvote", async () => {
		const votesAmountMinimumMock = vi.spyOn(wallet.network(), "votesAmountMinimum").mockReturnValue(10);
		const votesAmountStepMock = vi.spyOn(wallet.network(), "votesAmountStep").mockReturnValue(10);

		const votes: Contracts.VoteRegistryItem[] = [
			{
				amount: 20,
				wallet: delegates[0],
			},
		];

		const Table = () => (
			<DelegateTable
				delegates={delegates}
				votes={votes}
				voteDelegates={[]}
				unvoteDelegates={[]}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>
		);

		const { asFragment, rerender } = render(<Table />);
		const amountField = screen.getAllByTestId("InputCurrency")[0];

		userEvent.clear(amountField);
		userEvent.paste(amountField, "30");

		expect(screen.getByTestId("DelegateTable__footer")).toBeInTheDocument();

		await waitFor(() => {
			expect(footerVotes()).toHaveTextContent("1");
		});

		expect(firstDelegateVoteButton()).toHaveTextContent(translations.CHANGED);

		userEvent.click(firstDelegateVoteButton());

		expect(screen.getByTestId("DelegateTable__footer")).toBeInTheDocument();
		expect(footerUnvotes()).toHaveTextContent("1");

		userEvent.click(firstDelegateVoteButton());

		expect(firstDelegateVoteButton()).toHaveTextContent(translations.CURRENT);
		expect(amountField).toHaveValue("20");

		rerender(<Table />);

		userEvent.clear(amountField);
		userEvent.paste(amountField, "10");

		await waitFor(() => {
			expect(footerUnvotes()).toHaveTextContent("1");
		});

		expect(firstDelegateVoteButton()).toHaveTextContent(translations.CHANGED);

		userEvent.click(firstDelegateVoteButton());

		expect(screen.getByTestId("DelegateTable__footer")).toBeInTheDocument();
		expect(footerUnvotes()).toHaveTextContent("1");

		userEvent.click(firstDelegateVoteButton());

		expect(firstDelegateVoteButton()).toHaveTextContent(translations.CURRENT);
		expect(amountField).toHaveValue("20");
		expect(asFragment()).toMatchSnapshot();

		votesAmountMinimumMock.mockRestore();
		votesAmountStepMock.mockRestore();
	});

	it("should unselect a delegate to unvote", () => {
		const { asFragment } = render(
			<DelegateTable
				delegates={delegates}
				votes={votes}
				voteDelegates={[]}
				unvoteDelegates={[]}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);
		const selectVoteButton = screen.getByTestId("DelegateRow__toggle-1");

		userEvent.click(firstDelegateVoteButton());

		userEvent.click(selectVoteButton);

		expect(screen.getByTestId("DelegateTable__footer")).toBeInTheDocument();
		expect(footerUnvotes()).toHaveTextContent("1");
		expect(footerVotes()).toHaveTextContent("1");

		userEvent.click(firstDelegateVoteButton());

		expect(firstDelegateVoteButton()).toHaveTextContent(translations.CURRENT);
		expect(selectVoteButton).toHaveTextContent(translations.SELECTED);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should select a delegate to unvote/vote", () => {
		const { asFragment } = render(
			<DelegateTable
				delegates={delegates}
				votes={votes}
				voteDelegates={[]}
				unvoteDelegates={[]}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);
		const selectVoteButton = screen.getByTestId("DelegateRow__toggle-1");

		userEvent.click(firstDelegateVoteButton());
		userEvent.click(selectVoteButton);

		expect(screen.getByTestId("DelegateTable__footer")).toBeInTheDocument();
		expect(footerUnvotes()).toHaveTextContent("1");
		expect(footerVotes()).toHaveTextContent("1");

		expect(firstDelegateVoteButton()).toHaveTextContent(translations.UNSELECTED);
		expect(selectVoteButton).toHaveTextContent(translations.SELECTED);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should select multiple delegates to unvote/vote", () => {
		const { asFragment } = render(
			<DelegateTable
				delegates={delegates}
				votes={votes}
				voteDelegates={[]}
				unvoteDelegates={[]}
				selectedWallet={wallet}
				maxVotes={10}
			/>,
		);
		const selectButtons = [0, 1, 2].map((index) => screen.getByTestId(`DelegateRow__toggle-${index}`));

		userEvent.click(selectButtons[0]);
		userEvent.click(selectButtons[1]);
		userEvent.click(selectButtons[2]);

		expect(screen.getByTestId("DelegateTable__footer")).toBeInTheDocument();
		expect(footerVotes()).toHaveTextContent("2");
		expect(footerUnvotes()).toHaveTextContent("1");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should emit action on continue button to vote", () => {
		const voteDelegates: VoteDelegateProperties[] = [
			{
				amount: 0,
				delegateAddress: delegates[0].address(),
			},
		];

		const onContinue = vi.fn();
		const { container, asFragment } = render(
			<DelegateTable
				delegates={delegates}
				votes={[]}
				onContinue={onContinue}
				voteDelegates={[]}
				unvoteDelegates={[]}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		userEvent.click(firstDelegateVoteButton());

		expect(screen.getByTestId("DelegateTable__footer")).toBeInTheDocument();

		pressingContinueButton();

		expect(container).toBeInTheDocument();
		expect(onContinue).toHaveBeenCalledWith([], voteDelegates);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should add resigned delegate to the unvote list", () => {
		const resignedDelegates: Contracts.VoteRegistryItem[] = [
			{
				amount: 0,
				wallet: delegates[1],
			},
		];
		const unvoteDelegates: VoteDelegateProperties[] = [
			{
				amount: 0,
				delegateAddress: delegates[1].address(),
			},
		];

		const onContinue = vi.fn();
		const { asFragment, rerender } = render(
			<DelegateTable
				delegates={delegates}
				votes={[]}
				resignedDelegateVotes={resignedDelegates}
				voteDelegates={[]}
				unvoteDelegates={[]}
				onContinue={onContinue}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(screen.getByTestId("DelegateTable__footer")).toBeInTheDocument();
		expect(footerUnvotes()).toHaveTextContent("1");

		rerender(
			<DelegateTable
				delegates={delegates}
				votes={[]}
				resignedDelegateVotes={resignedDelegates}
				voteDelegates={[]}
				unvoteDelegates={unvoteDelegates}
				onContinue={onContinue}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(footerUnvotes()).toHaveTextContent("1");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with a delegate to vote", () => {
		const voteDelegates: VoteDelegateProperties[] = [
			{
				amount: 0,
				delegateAddress: delegates[0].address(),
			},
		];

		const onContinue = vi.fn();
		const { container, asFragment } = render(
			<DelegateTable
				delegates={delegates}
				votes={[]}
				voteDelegates={voteDelegates}
				unvoteDelegates={[]}
				onContinue={onContinue}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(screen.getByTestId("DelegateTable__footer")).toBeInTheDocument();

		pressingContinueButton();

		expect(container).toBeInTheDocument();
		expect(onContinue).toHaveBeenCalledWith([], voteDelegates);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with a delegate to unvote", () => {
		const unvoteDelegates: VoteDelegateProperties[] = [
			{
				amount: 0,
				delegateAddress: delegates[0].address(),
			},
		];

		const onContinue = vi.fn();
		const { container, asFragment } = render(
			<DelegateTable
				delegates={delegates}
				voteDelegates={[]}
				votes={[]}
				unvoteDelegates={unvoteDelegates}
				onContinue={onContinue}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(screen.getByTestId("DelegateTable__footer")).toBeInTheDocument();

		pressingContinueButton();

		expect(container).toBeInTheDocument();
		expect(onContinue).toHaveBeenCalledWith(unvoteDelegates, []);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with a delegate to unvote/vote", () => {
		const unvoteDelegates: VoteDelegateProperties[] = [
			{
				amount: 0,
				delegateAddress: delegates[0].address(),
			},
		];
		const voteDelegates: VoteDelegateProperties[] = [
			{
				amount: 0,
				delegateAddress: delegates[1].address(),
			},
		];

		const onContinue = vi.fn();
		const { container, asFragment } = render(
			<DelegateTable
				delegates={delegates}
				votes={votes}
				voteDelegates={voteDelegates}
				unvoteDelegates={unvoteDelegates}
				onContinue={onContinue}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(screen.getByTestId("DelegateTable__footer")).toBeInTheDocument();
		expect(footerUnvotes()).toHaveTextContent("1");
		expect(footerVotes()).toHaveTextContent("1");

		pressingContinueButton();

		expect(container).toBeInTheDocument();
		expect(onContinue).toHaveBeenCalledWith(unvoteDelegates, voteDelegates);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should emit action on continue button to unvote", () => {
		const voteDelegates: VoteDelegateProperties[] = [
			{
				amount: 0,
				delegateAddress: votes[0].wallet!.address(),
			},
		];

		const onContinue = vi.fn();
		const { container, asFragment } = render(
			<DelegateTable
				delegates={delegates}
				votes={votes}
				voteDelegates={[]}
				unvoteDelegates={[]}
				onContinue={onContinue}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		userEvent.click(firstDelegateVoteButton());

		expect(screen.getByTestId("DelegateTable__footer")).toBeInTheDocument();

		pressingContinueButton();

		expect(container).toBeInTheDocument();
		expect(onContinue).toHaveBeenCalledWith(voteDelegates, []);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should navigate to the next and previous pages according", () => {
		const delegatesList = Array.from({ length: 52 }).fill(delegates[0]) as Contracts.IReadOnlyWallet[];

		render(
			<DelegateTable
				delegates={delegatesList}
				votes={votes}
				voteDelegates={[]}
				unvoteDelegates={[]}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(firstDelegateVoteButton()).toBeInTheDocument();

		expect(screen.queryByTestId("DelegateRow__toggle-51")).not.toBeInTheDocument();

		userEvent.click(screen.getByTestId("Pagination__next"));

		expect(screen.getByTestId("DelegateRow__toggle-51")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("Pagination__previous"));

		expect(firstDelegateVoteButton()).toBeInTheDocument();
	});

	it("should change pagination size from network delegate count", () => {
		const delegateCountSpy = vi.spyOn(wallet.network(), "delegateCount").mockReturnValue(10);

		const delegatesList = Array.from({ length: 12 }).fill(delegates[0]) as Contracts.IReadOnlyWallet[];

		render(
			<DelegateTable
				delegates={delegatesList}
				votes={votes}
				voteDelegates={[]}
				unvoteDelegates={[]}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(firstDelegateVoteButton()).toBeInTheDocument();

		expect(screen.queryByTestId("DelegateRow__toggle-11")).not.toBeInTheDocument();

		userEvent.click(screen.getByTestId("Pagination__next"));

		expect(screen.getByTestId("DelegateRow__toggle-11")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("Pagination__previous"));

		expect(firstDelegateVoteButton()).toBeInTheDocument();

		delegateCountSpy.mockRestore();
	});

	it("should not show pagination", () => {
		render(
			<DelegateTable
				delegates={delegates}
				votes={votes}
				voteDelegates={[]}
				unvoteDelegates={[]}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(screen.queryByTestId("Pagination__next")).not.toBeInTheDocument();
	});
});
