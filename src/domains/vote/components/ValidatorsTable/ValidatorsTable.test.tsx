import { Contracts, ReadOnlyWallet } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { ValidatorsTable } from "./ValidatorsTable";
import { VoteValidatorProperties } from "./ValidatorsTable.contracts";
import * as useRandomNumberHook from "@/app/hooks/use-random-number";
import { translations } from "@/app/i18n/common/i18n";
import { data } from "@/tests/fixtures/coins/mainsail/devnet/validators.json";
import { env, getMainsailProfileId, render, screen, waitFor } from "@/utils/testing-library";

let useRandomNumberSpy: vi.SpyInstance;

let wallet: Contracts.IReadWriteWallet;
let validators: Contracts.IReadOnlyWallet[];
let votes: Contracts.VoteRegistryItem[];

const pressingContinueButton = async () => await userEvent.click(screen.getByTestId("ValidatorTable__continue-button"));
const firstValidatorVoteButton = () => screen.getByTestId("ValidatorRow__toggle-0");
const footerUnvotes = () => screen.getByTestId("ValidatorTable__footer--unvotes");
const footerVotes = () => screen.getByTestId("ValidatorTable__footer--votes");

describe("ValidatorsTable", () => {
	beforeAll(() => {
		useRandomNumberSpy = vi.spyOn(useRandomNumberHook, "useRandomNumber").mockImplementation(() => 1);

		const profile = env.profiles().findById(getMainsailProfileId());
		wallet = profile.wallets().values()[0];

		validators = [0, 1, 2].map(
			(index) =>
				new ReadOnlyWallet({
					address: data[index].address,
					explorerLink: "",
					governanceIdentifier: "address",
					isResignedValidator: false,
					isValidator: true,
					publicKey: data[index].publicKey,
					username: data[index].attributes.username,
				}),
		);

		votes = [
			{
				amount: 0,
				wallet: validators[0],
			},
		];
	});

	afterAll(() => {
		useRandomNumberSpy.mockRestore();
	});

	//it("should render", () => {
	//	const { container, asFragment } = render(
	//		<ValidatorsTable
	//			validators={validators}
	//			votes={[]}
	//			voteValidators={[]}
	//			unvoteValidators={[]}
	//			selectedWallet={wallet}
	//			maxVotes={wallet.network().maximumVotesPerTransaction()}
	//		/>,
	//	);
	//
	//	expect(container).toBeInTheDocument();
	//	expect(asFragment()).toMatchSnapshot();
	//});
	//
	//it("should render mobile view in XS screen", () => {
	//	renderResponsive(
	//		<ValidatorsTable
	//			validators={validators}
	//			votes={[]}
	//			voteValidators={[]}
	//			unvoteValidators={[]}
	//			selectedWallet={wallet}
	//			maxVotes={wallet.network().maximumVotesPerTransaction()}
	//		/>,
	//		"xs",
	//	);
	//
	//	expect(screen.getAllByTestId("ValidatorRowMobile")[0]).toBeInTheDocument();
	//});
	//
	//it("should render vote amount column", () => {
	//	const votesAmountMinimumMock = vi.spyOn(wallet.network(), "votesAmountMinimum").mockReturnValue(10);
	//
	//	const { container, asFragment } = render(
	//		<ValidatorsTable
	//			validators={validators}
	//			votes={[]}
	//			voteValidators={[]}
	//			unvoteValidators={[]}
	//			selectedWallet={wallet}
	//			maxVotes={wallet.network().maximumVotesPerTransaction()}
	//		/>,
	//	);
	//
	//	expect(container).toBeInTheDocument();
	//	expect(asFragment()).toMatchSnapshot();
	//
	//	votesAmountMinimumMock.mockRestore();
	//});
	//
	//describe.each(["base", "requiresAmount"])("loading state for %s", (voteType) => {
	//	it("should render when isCompact = %s", () => {
	//		const votesAmountMinimumMock = vi
	//			.spyOn(wallet.network(), "votesAmountMinimum")
	//			.mockReturnValue(voteType === "requiresAmount" ? 10 : 0);
	//
	//		const { container, asFragment } = render(
	//			<ValidatorsTable
	//				validators={[]}
	//				votes={[]}
	//				isLoading={true}
	//				voteValidators={[]}
	//				unvoteValidators={[]}
	//				selectedWallet={wallet}
	//				maxVotes={wallet.network().maximumVotesPerTransaction()}
	//			/>,
	//		);
	//
	//		expect(container).toBeInTheDocument();
	//		expect(asFragment()).toMatchSnapshot();
	//
	//		votesAmountMinimumMock.mockRestore();
	//	});
	//});
	//
	//it("should render with empty list", () => {
	//	const { container, asFragment } = render(
	//		<ValidatorsTable
	//			validators={[]}
	//			votes={[]}
	//			voteValidators={[]}
	//			unvoteValidators={[]}
	//			selectedWallet={wallet}
	//			maxVotes={wallet.network().maximumVotesPerTransaction()}
	//		/>,
	//	);
	//
	//	expect(container).toBeInTheDocument();
	//	expect(asFragment()).toMatchSnapshot();
	//});
	//
	//it("should render with subtitle", () => {
	//	const { container, asFragment } = render(
	//		<ValidatorsTable
	//			validators={validators}
	//			votes={[]}
	//			voteValidators={[]}
	//			unvoteValidators={[]}
	//			selectedWallet={wallet}
	//			maxVotes={wallet.network().maximumVotesPerTransaction()}
	//			subtitle={<p>test</p>}
	//		/>,
	//	);
	//
	//	expect(container).toBeInTheDocument();
	//	expect(screen.getByText("test")).toBeInTheDocument();
	//	expect(asFragment()).toMatchSnapshot();
	//});
	//
	//it("should select a validator to vote", async () => {
	//	const { asFragment } = render(
	//		<ValidatorsTable
	//			validators={validators}
	//			votes={[]}
	//			voteValidators={[]}
	//			unvoteValidators={[]}
	//			selectedWallet={wallet}
	//			maxVotes={wallet.network().maximumVotesPerTransaction()}
	//		/>,
	//	);
	//
	//	await userEvent.click(firstValidatorVoteButton());
	//
	//	expect(screen.getByTestId("ValidatorTable__footer")).toBeInTheDocument();
	//	expect(footerVotes()).toHaveTextContent("1");
	//
	//	await userEvent.click(firstValidatorVoteButton());
	//
	//	expect(firstValidatorVoteButton()).toHaveTextContent(translations.SELECT);
	//	expect(asFragment()).toMatchSnapshot();
	//});
	//
	//it("should unselect a validator to vote", async () => {
	//	const { asFragment } = render(
	//		<ValidatorsTable
	//			validators={validators}
	//			votes={votes}
	//			voteValidators={[]}
	//			unvoteValidators={[]}
	//			selectedWallet={wallet}
	//			maxVotes={wallet.network().maximumVotesPerTransaction()}
	//		/>,
	//	);
	//	const selectButton = screen.getByTestId("ValidatorRow__toggle-1");
	//
	//	await userEvent.click(selectButton);
	//
	//	expect(screen.getByTestId("ValidatorTable__footer")).toBeInTheDocument();
	//	expect(footerVotes()).toHaveTextContent("1");
	//
	//	await userEvent.click(selectButton);
	//
	//	expect(selectButton).toHaveTextContent(translations.SELECTED);
	//	expect(asFragment()).toMatchSnapshot();
	//});
	//
	//it("should select a validator to unvote", async () => {
	//	const { asFragment } = render(
	//		<ValidatorsTable
	//			validators={validators}
	//			votes={votes}
	//			voteValidators={[]}
	//			unvoteValidators={[]}
	//			selectedWallet={wallet}
	//			maxVotes={wallet.network().maximumVotesPerTransaction()}
	//		/>,
	//	);
	//
	//	await userEvent.click(firstValidatorVoteButton());
	//
	//	expect(screen.getByTestId("ValidatorTable__footer")).toBeInTheDocument();
	//	expect(footerUnvotes()).toHaveTextContent("1");
	//
	//	await userEvent.click(firstValidatorVoteButton());
	//
	//	expect(firstValidatorVoteButton()).toHaveTextContent(translations.CURRENT);
	//	expect(asFragment()).toMatchSnapshot();
	//});
	//
	//it("should select a validator with vote amount and make it unvote", async () => {
	//	const votesAmountMinimumMock = vi.spyOn(wallet.network(), "votesAmountMinimum").mockReturnValue(10);
	//
	//	const votes: Contracts.VoteRegistryItem[] = [
	//		{
	//			amount: 10,
	//			wallet: validators[0],
	//		},
	//	];
	//
	//	const { asFragment } = render(
	//		<ValidatorsTable
	//			validators={validators}
	//			votes={votes}
	//			voteValidators={[]}
	//			unvoteValidators={[]}
	//			selectedWallet={wallet}
	//			maxVotes={wallet.network().maximumVotesPerTransaction()}
	//		/>,
	//	);
	//
	//	await userEvent.click(firstValidatorVoteButton());
	//
	//	expect(screen.getByTestId("ValidatorTable__footer")).toBeInTheDocument();
	//	expect(footerUnvotes()).toHaveTextContent("1");
	//
	//	await userEvent.click(firstValidatorVoteButton());
	//
	//	expect(firstValidatorVoteButton()).toHaveTextContent(translations.CURRENT);
	//	expect(asFragment()).toMatchSnapshot();
	//
	//	votesAmountMinimumMock.mockRestore();
	//});

	it("should select a changed validator to unvote", async () => {
		const votesAmountMinimumMock = vi.spyOn(wallet.network(), "votesAmountMinimum").mockReturnValue(10);
		const votesAmountStepMock = vi.spyOn(wallet.network(), "votesAmountStep").mockReturnValue(10);

		const votes: Contracts.VoteRegistryItem[] = [
			{
				amount: 20,
				wallet: validators[0],
			},
		];

		const Table = () => (
			<ValidatorsTable
				validators={validators}
				votes={votes}
				voteValidators={[]}
				unvoteValidators={[]}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>
		);

		const { asFragment, rerender } = render(<Table />);
		const amountField = screen.getAllByTestId("InputCurrency")[0];

		await userEvent.clear(amountField);
		await userEvent.type(amountField, "30");

		expect(screen.getByTestId("ValidatorTable__footer")).toBeInTheDocument();

		await waitFor(() => {
			expect(footerVotes()).toHaveTextContent("1");
		});

		expect(firstValidatorVoteButton()).toHaveTextContent(translations.CHANGED);

		await userEvent.click(firstValidatorVoteButton());

		expect(screen.getByTestId("ValidatorTable__footer")).toBeInTheDocument();
		expect(footerUnvotes()).toHaveTextContent("1");

		await userEvent.click(firstValidatorVoteButton());

		expect(firstValidatorVoteButton()).toHaveTextContent(translations.CURRENT);
		expect(amountField).toHaveValue("20");

		rerender();

		const amountInput = screen.getAllByTestId("InputCurrency")[0];
		await userEvent.clear(amountInput);
		await userEvent.type(amountInput, "10");

		await waitFor(() => {
			expect(footerUnvotes()).toHaveTextContent("1");
		});

		expect(firstValidatorVoteButton()).toHaveTextContent(translations.CHANGED);

		await userEvent.click(firstValidatorVoteButton());

		expect(screen.getByTestId("ValidatorTable__footer")).toBeInTheDocument();
		expect(footerUnvotes()).toHaveTextContent("1");

		await userEvent.click(firstValidatorVoteButton());

		expect(firstValidatorVoteButton()).toHaveTextContent(translations.CURRENT);
		expect(amountField).toHaveValue("20");
		expect(asFragment()).toMatchSnapshot();

		votesAmountMinimumMock.mockRestore();
		votesAmountStepMock.mockRestore();
	});

	it("should unselect a validator to unvote", async () => {
		const { asFragment } = render(
			<ValidatorsTable
				validators={validators}
				votes={votes}
				voteValidators={[]}
				unvoteValidators={[]}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);
		const selectVoteButton = screen.getByTestId("ValidatorRow__toggle-1");

		await userEvent.click(firstValidatorVoteButton());

		await userEvent.click(selectVoteButton);

		expect(screen.getByTestId("ValidatorTable__footer")).toBeInTheDocument();
		expect(footerUnvotes()).toHaveTextContent("1");
		expect(footerVotes()).toHaveTextContent("1");

		await userEvent.click(firstValidatorVoteButton());

		expect(firstValidatorVoteButton()).toHaveTextContent(translations.CURRENT);
		expect(selectVoteButton).toHaveTextContent(translations.SELECTED);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should select a validator to unvote/vote", async () => {
		const { asFragment } = render(
			<ValidatorsTable
				validators={validators}
				votes={votes}
				voteValidators={[]}
				unvoteValidators={[]}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);
		const selectVoteButton = screen.getByTestId("ValidatorRow__toggle-1");

		await userEvent.click(firstValidatorVoteButton());
		await userEvent.click(selectVoteButton);

		expect(screen.getByTestId("ValidatorTable__footer")).toBeInTheDocument();
		expect(footerUnvotes()).toHaveTextContent("1");
		expect(footerVotes()).toHaveTextContent("1");

		expect(firstValidatorVoteButton()).toHaveTextContent(translations.UNSELECTED);
		expect(selectVoteButton).toHaveTextContent(translations.SELECTED);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should select multiple validators to unvote/vote", async () => {
		const { asFragment } = render(
			<ValidatorsTable
				validators={validators}
				votes={votes}
				voteValidators={[]}
				unvoteValidators={[]}
				selectedWallet={wallet}
				maxVotes={10}
			/>,
		);
		const selectButtons = [0, 1, 2].map((index) => screen.getByTestId(`ValidatorRow__toggle-${index}`));

		await userEvent.click(selectButtons[0]);
		await userEvent.click(selectButtons[1]);
		await userEvent.click(selectButtons[2]);

		expect(screen.getByTestId("ValidatorTable__footer")).toBeInTheDocument();
		expect(footerVotes()).toHaveTextContent("2");
		expect(footerUnvotes()).toHaveTextContent("1");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should emit action on continue button to vote", async () => {
		const voteValidators: VoteValidatorProperties[] = [
			{
				amount: 0,
				validatorAddress: validators[0].address(),
			},
		];

		const onContinue = vi.fn();
		const { container, asFragment } = render(
			<ValidatorsTable
				validators={validators}
				votes={[]}
				onContinue={onContinue}
				voteValidators={[]}
				unvoteValidators={[]}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		await userEvent.click(firstValidatorVoteButton());

		expect(screen.getByTestId("ValidatorTable__footer")).toBeInTheDocument();

		await pressingContinueButton();

		expect(container).toBeInTheDocument();
		expect(onContinue).toHaveBeenCalledWith([], voteValidators);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should add resigned validator to the unvote list", () => {
		const resignedValidators: Contracts.VoteRegistryItem[] = [
			{
				amount: 0,
				wallet: validators[1],
			},
		];
		const unvoteValidators: VoteValidatorProperties[] = [
			{
				amount: 0,
				validatorAddress: validators[1].address(),
			},
		];

		const onContinue = vi.fn();
		const { asFragment, rerender } = render(
			<ValidatorsTable
				validators={validators}
				votes={[]}
				resignedValidatorVotes={resignedValidators}
				voteValidators={[]}
				unvoteValidators={unvoteValidators}
				onContinue={onContinue}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(screen.getByTestId("ValidatorTable__footer")).toBeInTheDocument();
		expect(footerUnvotes()).toHaveTextContent("1");

		rerender();

		expect(footerUnvotes()).toHaveTextContent("1");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with a validator to vote", async () => {
		const voteValidators: VoteValidatorProperties[] = [
			{
				amount: 0,
				validatorAddress: validators[0].address(),
			},
		];

		const onContinue = vi.fn();
		const { container, asFragment } = render(
			<ValidatorsTable
				validators={validators}
				votes={[]}
				voteValidators={voteValidators}
				unvoteValidators={[]}
				onContinue={onContinue}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(screen.getByTestId("ValidatorTable__footer")).toBeInTheDocument();

		await pressingContinueButton();

		expect(container).toBeInTheDocument();
		expect(onContinue).toHaveBeenCalledWith([], voteValidators);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with a validator to unvote", async () => {
		const unvoteValidators: VoteValidatorProperties[] = [
			{
				amount: 0,
				validatorAddress: validators[0].address(),
			},
		];

		const onContinue = vi.fn();
		const { container, asFragment } = render(
			<ValidatorsTable
				validators={validators}
				voteValidators={[]}
				votes={[]}
				unvoteValidators={unvoteValidators}
				onContinue={onContinue}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(screen.getByTestId("ValidatorTable__footer")).toBeInTheDocument();

		await pressingContinueButton();

		expect(container).toBeInTheDocument();
		expect(onContinue).toHaveBeenCalledWith(unvoteValidators, []);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with a validator to unvote/vote", async () => {
		const unvoteValidators: VoteValidatorProperties[] = [
			{
				amount: 0,
				validatorAddress: validators[0].address(),
			},
		];
		const voteValidators: VoteValidatorProperties[] = [
			{
				amount: 0,
				validatorAddress: validators[1].address(),
			},
		];

		const onContinue = vi.fn();
		const { container, asFragment } = render(
			<ValidatorsTable
				validators={validators}
				votes={votes}
				voteValidators={voteValidators}
				unvoteValidators={unvoteValidators}
				onContinue={onContinue}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(screen.getByTestId("ValidatorTable__footer")).toBeInTheDocument();
		expect(footerUnvotes()).toHaveTextContent("1");
		expect(footerVotes()).toHaveTextContent("1");

		await pressingContinueButton();

		expect(container).toBeInTheDocument();
		expect(onContinue).toHaveBeenCalledWith(unvoteValidators, voteValidators);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should emit action on continue button to unvote", async () => {
		const voteValidators: VoteValidatorProperties[] = [
			{
				amount: 0,
				validatorAddress: votes[0].wallet!.address(),
			},
		];

		const onContinue = vi.fn();
		const { container, asFragment } = render(
			<ValidatorsTable
				validators={validators}
				votes={votes}
				voteValidators={[]}
				unvoteValidators={[]}
				onContinue={onContinue}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		await userEvent.click(firstValidatorVoteButton());

		expect(screen.getByTestId("ValidatorTable__footer")).toBeInTheDocument();

		await pressingContinueButton();

		expect(container).toBeInTheDocument();
		expect(onContinue).toHaveBeenCalledWith(voteValidators, []);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should navigate to the next and previous pages according", async () => {
		const validatorsList = Array.from({ length: 55 }).fill(validators[0]) as Contracts.IReadOnlyWallet[];

		render(
			<ValidatorsTable
				validators={validatorsList}
				votes={votes}
				voteValidators={[]}
				unvoteValidators={[]}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(firstValidatorVoteButton()).toBeInTheDocument();

		expect(screen.queryByTestId("ValidatorRow__toggle-54")).not.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("Pagination__next"));

		expect(screen.getByTestId("ValidatorRow__toggle-54")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("Pagination__previous"));

		expect(firstValidatorVoteButton()).toBeInTheDocument();
	});

	it("should change pagination size from network validator count", async () => {
		const validatorCountSpy = vi.spyOn(wallet.network(), "validatorCount").mockReturnValue(10);

		const validatorsList = Array.from({ length: 12 }).fill(validators[0]) as Contracts.IReadOnlyWallet[];

		render(
			<ValidatorsTable
				validators={validatorsList}
				votes={votes}
				voteValidators={[]}
				unvoteValidators={[]}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(firstValidatorVoteButton()).toBeInTheDocument();

		expect(screen.queryByTestId("ValidatorRow__toggle-11")).not.toBeInTheDocument();

		await userEvent.click(screen.getByTestId("Pagination__next"));

		expect(screen.getByTestId("ValidatorRow__toggle-11")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("Pagination__previous"));

		expect(firstValidatorVoteButton()).toBeInTheDocument();

		validatorCountSpy.mockRestore();
	});

	it("should not show pagination", () => {
		render(
			<ValidatorsTable
				validators={validators}
				votes={votes}
				voteValidators={[]}
				unvoteValidators={[]}
				selectedWallet={wallet}
				maxVotes={wallet.network().maximumVotesPerTransaction()}
			/>,
		);

		expect(screen.queryByTestId("Pagination__next")).not.toBeInTheDocument();
	});
});
