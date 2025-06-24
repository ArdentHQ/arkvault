import { Contracts, ReadOnlyWallet } from "@/app/lib/profiles";
import { renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { JSX } from "react";
import { useTranslation } from "react-i18next";

import { ValidatorVoteAmount } from "./ValidatorVoteAmount";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import { VoteValidatorProperties } from "@/domains/vote/components/ValidatorsTable/ValidatorsTable.contracts";
import { data } from "@/tests/fixtures/coins/mainsail/devnet/validators.json";
import { env, render, screen, waitFor, fireEvent, getMainsailProfileId } from "@/utils/testing-library";

let wallet: Contracts.IReadWriteWallet;
let validator: Contracts.IReadOnlyWallet;

let Component: () => JSX.Element;
let walletBalanceMock: vi.SpyInstance;
let votesAmountMinimumMock: vi.SpyInstance;
let votesAmountStepMock: vi.SpyInstance;

const Wrapper = ({ children }: { children: React.ReactNode }) => (
	<table>
		<tbody>
			<tr>{children}</tr>
		</tbody>
	</table>
);

describe("ValidatorVoteAmount", () => {
	beforeAll(() => {
		const profile = env.profiles().findById(getMainsailProfileId());
		wallet = profile.wallets().values()[0];

		validator = new ReadOnlyWallet({
			address: data[0].address,
			explorerLink: "",
			governanceIdentifier: "address",
			isResignedValidator: false,
			isValidator: true,
			publicKey: data[0].publicKey,
			username: data[0].username,
		});

		walletBalanceMock = vi.spyOn(wallet, "balance").mockReturnValue(90);
		votesAmountMinimumMock = vi.spyOn(wallet.network(), "votesAmountMinimum").mockReturnValue(10);
		votesAmountStepMock = vi.spyOn(wallet.network(), "votesAmountStep").mockReturnValue(10);

		const selectedVotes: VoteValidatorProperties[] = [
			{
				amount: 0,
				validatorAddress: validator.address(),
			},
		];

		Component = () => (
			<Wrapper>
				<ValidatorVoteAmount
					isSelectedVote={true}
					isSelectedUnvote={false}
					selectedWallet={wallet}
					selectedUnvotes={[]}
					selectedVotes={selectedVotes}
					toggleUnvotesSelected={vi.fn()}
					toggleVotesSelected={vi.fn()}
					validatorAddress={validator.address()}
					availableBalance={wallet.balance()}
					setAvailableBalance={vi.fn()}
				/>
			</Wrapper>
		);
	});

	afterAll(() => {
		walletBalanceMock.mockRestore();
		votesAmountMinimumMock.mockRestore();
		votesAmountStepMock.mockRestore();
	});

	it("should focus on the input by clicking on ticker", async () => {
		render(
			<Wrapper>
				<ValidatorVoteAmount
					isSelectedVote={true}
					isSelectedUnvote={false}
					selectedWallet={wallet}
					selectedUnvotes={[]}
					selectedVotes={[]}
					toggleUnvotesSelected={vi.fn()}
					toggleVotesSelected={vi.fn()}
					validatorAddress={validator.address()}
					availableBalance={wallet.balance()}
					setAvailableBalance={vi.fn()}
				/>
			</Wrapper>,
		);

		const amountField = screen.getByTestId("InputCurrency");

		await userEvent.click(screen.getByTestId("ValidatorVoteAmount__ticker"));

		await waitFor(() => expect(amountField).toHaveFocus());
	});

	it("should not focus on the input by clicking on ticker if it is selected unvote", async () => {
		render(
			<Wrapper>
				<ValidatorVoteAmount
					isSelectedVote={true}
					isSelectedUnvote={true}
					selectedWallet={wallet}
					selectedUnvotes={[]}
					selectedVotes={[]}
					toggleUnvotesSelected={vi.fn()}
					toggleVotesSelected={vi.fn()}
					validatorAddress={validator.address()}
					availableBalance={wallet.balance()}
					setAvailableBalance={vi.fn()}
				/>
			</Wrapper>,
		);

		const amountField = screen.getByTestId("InputCurrency");

		await userEvent.click(screen.getByTestId("ValidatorVoteAmount__ticker"));

		await waitFor(() => expect(amountField).not.toHaveFocus());
	});

	describe("Validations", () => {
		it("should show error if value is below minimum", async () => {
			const {
				result: {
					current: { t },
				},
			} = renderHook(() => useTranslation());
			render(<Component />);

			await userEvent.clear(screen.getByTestId("InputCurrency"));
			await userEvent.type(screen.getByTestId("InputCurrency"), "3");

			await waitFor(() => expect(screen.getByTestId("Input__error")).toBeVisible());

			expect(screen.getByTestId("Input__error")).toHaveAttribute(
				"data-errortext",
				t("VOTE.VALIDATOR_TABLE.VOTE_AMOUNT.VALIDATION.MINIMUM_AMOUNT", {
					coinId: wallet.network().coin(),
					minimumAmount: wallet.network().votesAmountMinimum(),
				}),
			);
		});

		it("should show error if value isn't multiple of votesAmountStep", async () => {
			const {
				result: {
					current: { t },
				},
			} = renderHook(() => useTranslation());
			render(<Component />);

			await userEvent.clear(screen.getByTestId("InputCurrency"));
			await userEvent.type(screen.getByTestId("InputCurrency"), "12");

			await waitFor(() => expect(screen.getByTestId("Input__error")).toBeVisible());

			expect(screen.getByTestId("Input__error")).toHaveAttribute(
				"data-errortext",
				t("VOTE.VALIDATOR_TABLE.VOTE_AMOUNT.VALIDATION.AMOUNT_STEP", {
					coinId: wallet.network().coin(),
					step: wallet.network().votesAmountStep(),
				}),
			);
		});

		it("should show error if value is more than the available balance", async () => {
			render(<Component />);

			await userEvent.clear(screen.getByTestId("InputCurrency"));
			await userEvent.type(screen.getByTestId("InputCurrency"), "10000");

			await waitFor(() => expect(screen.getByTestId("Input__error")).toBeVisible());

			expect(screen.getByTestId("Input__error")).toHaveAttribute(
				"data-errortext",
				transactionTranslations.VALIDATION.LOW_BALANCE,
			);
		});

		it("should show error if value isn't number", async () => {
			const {
				result: {
					current: { t },
				},
			} = renderHook(() => useTranslation());
			render(<Component />);

			await userEvent.clear(screen.getByTestId("InputCurrency"));
			await userEvent.type(screen.getByTestId("InputCurrency"), "test");

			await waitFor(() => expect(screen.getByTestId("Input__error")).toBeVisible());

			expect(screen.getByTestId("Input__error")).toHaveAttribute(
				"data-errortext",
				t("VOTE.VALIDATOR_TABLE.VOTE_AMOUNT.VALIDATION.MINIMUM_AMOUNT", {
					coinId: wallet.network().coin(),
					minimumAmount: wallet.network().votesAmountMinimum(),
				}),
			);
		});
	});

	it("should hide error after inputs changed", async () => {
		render(<Component />);

		const amountField: HTMLInputElement = screen.getByTestId("InputCurrency");

		await userEvent.clear(amountField);
		await userEvent.type(amountField, "3");

		await waitFor(() => expect(screen.getByTestId("Input__error")).toBeVisible());

		await userEvent.clear(amountField);
		await userEvent.type(amountField, "10");

		await waitFor(() => expect(screen.queryByTestId("Input__error")).not.toBeInTheDocument());
	});

	describe("Rendering initial amount", () => {
		it("should render with selectedVotes", async () => {
			const selectedVotes: VoteValidatorProperties[] = [
				{
					amount: 10,
					validatorAddress: validator.address(),
				},
			];

			render(
				<Wrapper>
					<ValidatorVoteAmount
						isSelectedVote={true}
						isSelectedUnvote={false}
						selectedWallet={wallet}
						selectedUnvotes={[]}
						selectedVotes={selectedVotes}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={vi.fn()}
						validatorAddress={validator.address()}
						availableBalance={wallet.balance()}
						setAvailableBalance={vi.fn()}
					/>
				</Wrapper>,
			);

			await waitFor(() => expect(screen.getByTestId("InputCurrency")).toHaveValue("10"));
		});

		it("should render with selectedUnvotes", async () => {
			const voted: Contracts.VoteRegistryItem = {
				amount: 30,
				wallet: validator,
			};
			const selectedUnvotes: VoteValidatorProperties[] = [
				{
					amount: 20,
					validatorAddress: validator.address(),
				},
			];

			render(
				<Wrapper>
					<ValidatorVoteAmount
						isSelectedVote={true}
						isSelectedUnvote={false}
						selectedWallet={wallet}
						selectedUnvotes={selectedUnvotes}
						selectedVotes={[]}
						voted={voted}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={vi.fn()}
						validatorAddress={validator.address()}
						availableBalance={wallet.balance()}
						setAvailableBalance={vi.fn()}
					/>
				</Wrapper>,
			);

			await waitFor(() => expect(screen.getByTestId("InputCurrency")).toHaveValue("10"));
		});

		it("should render with voted validator", async () => {
			const voted: Contracts.VoteRegistryItem = {
				amount: 30,
				wallet: validator,
			};

			render(
				<Wrapper>
					<ValidatorVoteAmount
						isSelectedVote={true}
						isSelectedUnvote={false}
						selectedWallet={wallet}
						selectedUnvotes={[]}
						selectedVotes={[]}
						voted={voted}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={vi.fn()}
						validatorAddress={validator.address()}
						availableBalance={wallet.balance()}
						setAvailableBalance={vi.fn()}
					/>
				</Wrapper>,
			);

			await waitFor(() => expect(screen.getByTestId("InputCurrency")).toHaveValue("30"));
		});

		it("should render with changed the amount voted when there is voted validator", async () => {
			const voted: Contracts.VoteRegistryItem = {
				amount: 30,
				wallet: validator,
			};

			const VoteAmount = ({
				selectedUnvotes,
				selectedVotes,
			}: {
				selectedUnvotes: VoteValidatorProperties[];
				selectedVotes: VoteValidatorProperties[];
			}) => (
				<Wrapper>
					<ValidatorVoteAmount
						isSelectedVote={true}
						isSelectedUnvote={false}
						selectedWallet={wallet}
						selectedUnvotes={selectedUnvotes}
						selectedVotes={selectedVotes}
						voted={voted}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={vi.fn()}
						validatorAddress={validator.address()}
						availableBalance={wallet.balance()}
						setAvailableBalance={vi.fn()}
					/>
				</Wrapper>
			);

			const selectedVotes: VoteValidatorProperties[] = [
				{
					amount: 20,
					validatorAddress: validator.address(),
				},
			];
			const { unmount } = render(<VoteAmount selectedUnvotes={[]} selectedVotes={selectedVotes} />);

			await waitFor(() => expect(screen.getByTestId("InputCurrency")).toHaveValue("50"));

			unmount();

			// when there is an error
			selectedVotes[0].amount = 0;

			render(<VoteAmount selectedUnvotes={[]} selectedVotes={selectedVotes} />);

			await waitFor(() => expect(screen.getAllByTestId("InputCurrency")[0]).not.toHaveValue());

			unmount();

			const selectedUnvotes: VoteValidatorProperties[] = [
				{
					amount: 20,
					validatorAddress: validator.address(),
				},
			];

			render(<VoteAmount selectedUnvotes={selectedUnvotes} selectedVotes={[]} />);

			await waitFor(() => expect(screen.getAllByTestId("InputCurrency")[1]).toHaveValue("10"));

			unmount();

			// when there is an error
			selectedUnvotes[0].amount = 0;

			render(<VoteAmount selectedUnvotes={selectedUnvotes} selectedVotes={[]} />);

			await waitFor(() => expect(screen.getAllByTestId("InputCurrency")[0]).not.toHaveValue());
		});
	});

	it("should calculate remaining balance and update votes", async () => {
		const toggleVotesSelected = vi.fn();
		let availableBalance = wallet.balance();
		const setAvailableBalance = vi.fn((balance: number) => (availableBalance = balance));
		const selectedVotes: VoteValidatorProperties[] = [
			{
				amount: 0,
				validatorAddress: validator.address(),
			},
		];

		const VoteAmount = () => (
			<Wrapper>
				<ValidatorVoteAmount
					isSelectedVote={true}
					isSelectedUnvote={false}
					selectedWallet={wallet}
					selectedUnvotes={[]}
					selectedVotes={selectedVotes}
					toggleUnvotesSelected={vi.fn()}
					toggleVotesSelected={toggleVotesSelected}
					validatorAddress={validator.address()}
					availableBalance={availableBalance}
					setAvailableBalance={setAvailableBalance}
				/>
			</Wrapper>
		);

		const { rerender } = render(<VoteAmount />);

		const amountField: HTMLInputElement = screen.getByTestId("InputCurrency");

		await userEvent.clear(amountField);
		await userEvent.type(amountField, "10");

		await waitFor(() => expect(toggleVotesSelected).toHaveBeenLastCalledWith(validator.address(), 10));

		expect(setAvailableBalance).toHaveBeenLastCalledWith(80);

		rerender();

		const amountInputField: HTMLInputElement = screen.getByTestId("InputCurrency");
		await userEvent.clear(amountInputField);
		await userEvent.type(amountInputField, "20");

		await waitFor(() => expect(toggleVotesSelected).toHaveBeenLastCalledWith(validator.address(), 20));

		expect(setAvailableBalance).toHaveBeenLastCalledWith(60);
	});

	it("should calculate net amount", async () => {
		let availableBalance = wallet.balance();
		const setAvailableBalance = vi.fn((balance: number) => (availableBalance = balance));

		const VoteAmount = () => (
			<Wrapper>
				<ValidatorVoteAmount
					isSelectedVote={true}
					isSelectedUnvote={false}
					selectedWallet={wallet}
					selectedUnvotes={[]}
					selectedVotes={[]}
					toggleUnvotesSelected={vi.fn()}
					toggleVotesSelected={vi.fn()}
					validatorAddress={validator.address()}
					availableBalance={availableBalance}
					setAvailableBalance={setAvailableBalance}
				/>
			</Wrapper>
		);

		const { rerender } = render(<VoteAmount />);

		const amountField: HTMLInputElement = screen.getByTestId("InputCurrency");

		await userEvent.clear(amountField);
		await userEvent.type(amountField, "10");

		await waitFor(() => expect(setAvailableBalance).toHaveBeenLastCalledWith(80));

		rerender();

		const amountInput: HTMLInputElement = screen.getByTestId("InputCurrency");
		await userEvent.clear(amountInput);
		await userEvent.type(amountInput, "20");

		await waitFor(() => expect(setAvailableBalance).toHaveBeenLastCalledWith(60));

		rerender();

		const amountInputField: HTMLInputElement = screen.getByTestId("InputCurrency");
		await userEvent.clear(amountInputField);
		await userEvent.type(amountInputField, "10");

		await waitFor(() => expect(setAvailableBalance).toHaveBeenLastCalledWith(70));
	});

	it("should calculate net amount when there is a voted validator", async () => {
		let availableBalance = wallet.balance();

		const toggleUnvotesSelected = vi.fn();
		const toggleVotesSelected = vi.fn();
		const setAvailableBalance = vi.fn((balance: number) => (availableBalance = balance));

		const voted: Contracts.VoteRegistryItem = {
			amount: 30,
			wallet: validator,
		};

		const VoteAmount = () => (
			<Wrapper>
				<ValidatorVoteAmount
					isSelectedVote={true}
					isSelectedUnvote={false}
					selectedWallet={wallet}
					selectedUnvotes={[]}
					selectedVotes={[]}
					voted={voted}
					toggleUnvotesSelected={toggleUnvotesSelected}
					toggleVotesSelected={toggleVotesSelected}
					validatorAddress={validator.address()}
					availableBalance={availableBalance}
					setAvailableBalance={setAvailableBalance}
				/>
			</Wrapper>
		);

		const { rerender } = render(<VoteAmount />);

		const amountField: HTMLInputElement = screen.getByTestId("InputCurrency");

		expect(amountField).toHaveValue("30");

		await waitFor(() => expect(toggleUnvotesSelected).not.toHaveBeenCalled());

		await userEvent.clear(amountField);
		await userEvent.type(amountField, "40");

		await waitFor(() => {
			expect(toggleVotesSelected).toHaveBeenLastCalledWith(validator.address(), 10);
		});
		expect(setAvailableBalance).toHaveBeenLastCalledWith(80);

		rerender();

		const amountInput: HTMLInputElement = screen.getByTestId("InputCurrency");
		await userEvent.clear(amountInput);
		await userEvent.type(amountInput, "50");

		await waitFor(() => {
			expect(toggleVotesSelected).toHaveBeenLastCalledWith(validator.address(), 20);
		});

		expect(setAvailableBalance).toHaveBeenLastCalledWith(60);

		rerender();

		const amountInput2: HTMLInputElement = screen.getByTestId("InputCurrency");
		await userEvent.clear(amountInput2);
		await userEvent.type(amountInput2, "0");

		await waitFor(() => expect(toggleUnvotesSelected).toHaveBeenLastCalledWith(validator.address(), 0));

		expect(toggleVotesSelected).toHaveBeenLastCalledWith(validator.address());
		expect(setAvailableBalance).toHaveBeenLastCalledWith(100);

		rerender();

		const amountInput3: HTMLInputElement = screen.getByTestId("InputCurrency");
		await userEvent.clear(amountInput3);
		await userEvent.type(amountInput3, "10");

		await waitFor(() => expect(toggleUnvotesSelected).toHaveBeenLastCalledWith(validator.address(), 20));

		expect(setAvailableBalance).toHaveBeenLastCalledWith(80);

		rerender();

		const amountInput4: HTMLInputElement = screen.getByTestId("InputCurrency");
		await userEvent.clear(amountInput4);
		await userEvent.type(amountInput4, "30");

		await waitFor(() => expect(toggleUnvotesSelected).toHaveBeenLastCalledWith(validator.address()));

		expect(setAvailableBalance).toHaveBeenLastCalledWith(80);

		rerender();

		const amountInput5: HTMLInputElement = screen.getByTestId("InputCurrency");
		await userEvent.clear(amountInput5);
		await userEvent.type(amountInput5, "20");

		await waitFor(() => expect(toggleUnvotesSelected).toHaveBeenLastCalledWith(validator.address(), 10));

		expect(setAvailableBalance).toHaveBeenLastCalledWith(80);

		rerender();

		const amountInput6: HTMLInputElement = screen.getByTestId("InputCurrency");
		await userEvent.clear(amountInput6);
		await userEvent.type(amountInput6, "60");

		await waitFor(() => expect(toggleUnvotesSelected).toHaveBeenLastCalledWith(validator.address()));

		expect(toggleVotesSelected).toHaveBeenLastCalledWith(validator.address(), 30);
		expect(setAvailableBalance).toHaveBeenLastCalledWith(50);

		rerender();

		const amountInput7: HTMLInputElement = screen.getByTestId("InputCurrency");
		await userEvent.clear(amountInput7);
		await userEvent.type(amountInput7, "30");

		await waitFor(() => expect(toggleUnvotesSelected).toHaveBeenLastCalledWith(validator.address()));

		await waitFor(() => {
			expect(setAvailableBalance).toHaveBeenLastCalledWith(80);
		});
	});

	describe("disabled", () => {
		it("should render disabled", () => {
			render(
				<Wrapper>
					<ValidatorVoteAmount
						isSelectedVote={false}
						isSelectedUnvote={false}
						selectedWallet={wallet}
						selectedUnvotes={[]}
						selectedVotes={[]}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={vi.fn()}
						validatorAddress={validator.address()}
						availableBalance={wallet.balance()}
						setAvailableBalance={vi.fn()}
					/>
				</Wrapper>,
			);

			expect(screen.getByTestId("InputCurrency")).toBeDisabled();
		});

		it("should hide error after disabled", async () => {
			const VoteAmount = ({ isSelectedVote }: { isSelectedVote: boolean }) => (
				<Wrapper>
					<ValidatorVoteAmount
						isSelectedVote={isSelectedVote}
						isSelectedUnvote={false}
						selectedWallet={wallet}
						selectedUnvotes={[]}
						selectedVotes={[]}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={vi.fn()}
						validatorAddress={validator.address()}
						availableBalance={wallet.balance()}
						setAvailableBalance={vi.fn()}
					/>
				</Wrapper>
			);

			const { rerender } = render(<VoteAmount isSelectedVote />);

			await userEvent.clear(screen.getByTestId("InputCurrency"));
			await userEvent.type(screen.getByTestId("InputCurrency"), "3");

			await waitFor(() => expect(screen.getByTestId("Input__error")).toBeVisible());

			rerender(<VoteAmount isSelectedVote={false} />);

			await waitFor(() => expect(screen.queryByTestId("Input__error")).not.toBeInTheDocument());
		});

		it("should reset fields and calculate remaining balance", async () => {
			let availableBalance = wallet.balance();
			const toggleVotesSelected = vi.fn();
			const setAvailableBalance = vi.fn((balance: number) => (availableBalance = balance));

			const VoteAmount = ({ isSelectedVote }: { isSelectedVote: boolean }) => (
				<Wrapper>
					<ValidatorVoteAmount
						isSelectedVote={isSelectedVote}
						isSelectedUnvote={false}
						selectedWallet={wallet}
						selectedUnvotes={[]}
						selectedVotes={[]}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={toggleVotesSelected}
						validatorAddress={validator.address()}
						availableBalance={availableBalance}
						setAvailableBalance={setAvailableBalance}
					/>
				</Wrapper>
			);

			const { rerender } = render(<VoteAmount isSelectedVote />);

			await userEvent.clear(screen.getByTestId("InputCurrency"));
			await userEvent.type(screen.getByTestId("InputCurrency"), "10");

			await waitFor(() => expect(setAvailableBalance).toHaveBeenLastCalledWith(80));

			expect(toggleVotesSelected).toHaveBeenCalledTimes(1);

			rerender(<VoteAmount isSelectedVote={false} />);

			expect(screen.getByTestId("InputCurrency")).not.toHaveValue();

			await waitFor(() => expect(setAvailableBalance).toHaveBeenLastCalledWith(80));

			expect(toggleVotesSelected).toHaveBeenCalledTimes(1);
		});

		it("should reset fields and calculate remaining balance when unvote if there is voted validator", async () => {
			let availableBalance = wallet.balance();
			const setAvailableBalance = vi.fn((balance: number) => (availableBalance = balance));
			const voted: Contracts.VoteRegistryItem = {
				amount: 30,
				wallet: validator,
			};

			const VoteAmount = ({ isSelectedUnvote }: { isSelectedUnvote: boolean }) => (
				<Wrapper>
					<ValidatorVoteAmount
						isSelectedVote={true}
						isSelectedUnvote={isSelectedUnvote}
						selectedWallet={wallet}
						selectedUnvotes={[]}
						selectedVotes={[]}
						voted={voted}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={vi.fn()}
						validatorAddress={validator.address()}
						availableBalance={availableBalance}
						setAvailableBalance={setAvailableBalance}
					/>
				</Wrapper>
			);

			const { rerender } = render(<VoteAmount isSelectedUnvote={false} />);

			const amountField = screen.getByTestId("InputCurrency");

			expect(amountField).toHaveValue("30");

			await userEvent.clear(amountField);
			await userEvent.type(amountField, "20");

			await waitFor(() => expect(setAvailableBalance).toHaveBeenLastCalledWith(90));

			rerender(<VoteAmount isSelectedUnvote />);

			await waitFor(() => expect(setAvailableBalance).toHaveBeenLastCalledWith(90));

			rerender(<VoteAmount isSelectedUnvote={false} />);

			const amountInput = screen.getByTestId("InputCurrency");
			await userEvent.clear(amountInput);
			await userEvent.type(amountInput, "50");

			await waitFor(() => expect(setAvailableBalance).toHaveBeenLastCalledWith(70));
		});
	});

	it("should calculate net amount when isGreaterThanAmountVoted is true", async () => {
		let availableBalance = 90;
		const toggleVotesSelected = vi.fn();
		const setAvailableBalance = vi.fn((balance) => (availableBalance = balance));

		const voted = { amount: 30, wallet: validator };

		const VoteAmount = () => (
			<Wrapper>
				<ValidatorVoteAmount
					isSelectedVote={true}
					isSelectedUnvote={false}
					selectedWallet={wallet}
					selectedUnvotes={[]}
					selectedVotes={[]}
					voted={voted}
					toggleUnvotesSelected={vi.fn()}
					toggleVotesSelected={toggleVotesSelected}
					validatorAddress={validator.address()}
					availableBalance={availableBalance}
					setAvailableBalance={setAvailableBalance}
				/>
			</Wrapper>
		);

		const { rerender } = render(<VoteAmount />);

		const amountField = screen.getByTestId("InputCurrency");

		// eslint-disable-next-line testing-library/prefer-user-event
		fireEvent.change(amountField, { target: { value: "40" } });

		await waitFor(() => {
			expect(toggleVotesSelected).toHaveBeenLastCalledWith(validator.address(), 10);
		});

		expect(setAvailableBalance).toHaveBeenLastCalledWith(80); // 90 - 10

		rerender(<VoteAmount />);

		const amountInput = screen.getByTestId("InputCurrency");
		// eslint-disable-next-line testing-library/prefer-user-event
		fireEvent.change(amountInput, { target: { value: "50" } });

		await waitFor(() => {
			expect(toggleVotesSelected).toHaveBeenLastCalledWith(validator.address(), 20); // 50 - 30
		});

		expect(setAvailableBalance).toHaveBeenLastCalledWith(60);
	});
});
