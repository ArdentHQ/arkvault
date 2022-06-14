import { Contracts } from "@ardenthq/sdk-profiles";
import cn from "classnames";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Divider } from "@/app/components/Divider";
import { InputCurrency } from "@/app/components/Input";
import { TableCell } from "@/app/components/Table";
import { VoteDelegateProperties } from "@/domains/vote/components/DelegateTable/DelegateTable.contracts";
import { delegateExistsInVotes } from "@/domains/vote/components/DelegateTable/DelegateTable.helpers";
import { VoteAmount } from "@/domains/vote/validations/VoteAmount";

interface DelegateVoteAmountProperties {
	rowColor?: string;
	isSelectedVote: boolean;
	isSelectedUnvote: boolean;
	isCompact?: boolean;
	selectedWallet: Contracts.IReadWriteWallet;
	selectedVotes: VoteDelegateProperties[];
	selectedUnvotes: VoteDelegateProperties[];
	voted?: Contracts.VoteRegistryItem;
	delegateAddress: string;
	availableBalance: number;
	setAvailableBalance: (balance: number) => void;
	toggleUnvotesSelected: (address: string, voteAmount?: number) => void;
	toggleVotesSelected: (address: string, voteAmount?: number) => void;
}

export const DelegateVoteAmount = ({
	voted,
	rowColor,
	selectedWallet,
	isSelectedVote,
	isSelectedUnvote,
	isCompact,
	selectedVotes,
	selectedUnvotes,
	delegateAddress,
	availableBalance,
	setAvailableBalance,
	toggleUnvotesSelected,
	toggleVotesSelected,
}: DelegateVoteAmountProperties) => {
	const { t } = useTranslation();

	const [isFocused, setIsFocused] = useState(false);
	const input = useRef<HTMLInputElement>(null);

	const [amountField, setAmountField] = useState<number | undefined>();
	const [errorMessage, setErrorMessage] = useState<string | undefined>();
	const [amount, setAmount] = useState(0);

	const isInputDisabled = useMemo(() => isSelectedUnvote || !isSelectedVote, [isSelectedUnvote, isSelectedVote]);
	const remainingBalance = () => {
		if (!voted) {
			return availableBalance + amount;
		}

		let netAmount = 0;
		if (amount > voted.amount) {
			netAmount = amount - voted.amount;
		}
		return availableBalance + netAmount;
	};

	const amountSchema = VoteAmount({
		amountVoted: voted?.amount,
		remainingBalance: remainingBalance(),
		t,
		wallet: selectedWallet,
	});

	const resetFields = () => {
		setAmountField(undefined);
	};

	const updateSelectedVotes = (inputValue: number) => {
		if (!voted) {
			return toggleVotesSelected(delegateAddress, inputValue);
		}

		const wasGreaterThanAmountVoted = amount > voted.amount;

		if (voted.amount === inputValue) {
			if (wasGreaterThanAmountVoted) {
				return toggleVotesSelected(delegateAddress);
			}

			return toggleUnvotesSelected(delegateAddress);
		}

		// is less than the amount voted
		if (voted.amount > inputValue) {
			if (wasGreaterThanAmountVoted) {
				toggleVotesSelected(delegateAddress);
			}

			return toggleUnvotesSelected(delegateAddress, inputValue > 0 ? voted.amount - inputValue : 0);
		}

		// is more than the amount voted
		const wasLessThanAmountVoted = amount < voted.amount;
		if (wasLessThanAmountVoted) {
			toggleUnvotesSelected(delegateAddress);
		}

		return toggleVotesSelected(delegateAddress, inputValue - voted.amount);
	};

	const inputConditions = (inputValue: number, amountVoted: number, isDisabled: boolean) => ({
		hasAmount: amountVoted === amount && inputValue > amountVoted,
		isEqualToAmountVoted: amountVoted === inputValue && amount === 0,
		isEqualToAmountVotedAndHasAmount: amountVoted === inputValue && amountVoted !== amount,
		isGreaterThanAmountVoted: amount > 0 && inputValue > amountVoted,
		isLessThanAmountVoted: amountVoted > inputValue && inputValue !== 0 && amount <= amountVoted,
		isUnvoteOrZeroAmount: (isDisabled || inputValue === 0) && amountVoted === amount,
	});

	const calculateNetAmount = (inputValue: number, isDisabled: boolean) => {
		let netAmount = inputValue;

		if (!voted) {
			if (amount > 0) {
				netAmount -= amount;
			}
			return netAmount;
		}

		// Voted
		const { amount: amountVoted } = voted;

		const {
			hasAmount,
			isEqualToAmountVoted,
			isEqualToAmountVotedAndHasAmount,
			isGreaterThanAmountVoted,
			isLessThanAmountVoted,
			isUnvoteOrZeroAmount,
		} = inputConditions(inputValue, amountVoted, isDisabled);

		if (isEqualToAmountVoted || isUnvoteOrZeroAmount || isLessThanAmountVoted) {
			return 0;
		}

		// on copy/paste
		if (isEqualToAmountVotedAndHasAmount) {
			if (amountVoted > amount) {
				return 0;
			}

			netAmount -= amount;
			return netAmount;
		}

		// has changed from above to below of the amount voted
		if (inputValue < amountVoted && amount > amountVoted) {
			return amountVoted - amount;
		}
		// has changed from below to above of the amount voted
		if (inputValue > amountVoted && amount < amountVoted) {
			return inputValue - amountVoted;
		}

		if (hasAmount) {
			netAmount -= amountVoted;
			return netAmount;
		}

		if (isGreaterThanAmountVoted) {
			netAmount -= amount;
			return netAmount;
		}

		return 0;
	};

	const calculateRemainingBalance = (inputValue: number, isDisabled = false) => {
		if (inputValue === amount) {
			return;
		}

		setAvailableBalance(availableBalance - calculateNetAmount(inputValue, isDisabled));

		if (isDisabled) {
			setAmount(inputValue);
			return;
		}

		updateSelectedVotes(inputValue);
		setAmount(inputValue);
	};

	const onInputChange = async (value: number) => {
		try {
			await amountSchema.validate(value);

			calculateRemainingBalance(value);

			if (errorMessage) {
				setErrorMessage(undefined);
			}
		} catch (error) {
			calculateRemainingBalance(0);
			setErrorMessage(error.message);
		}

		setAmountField(value);
	};

	// Rendering initial amount in the page navigation
	useEffect(() => {
		if (isSelectedUnvote) {
			return;
		}

		let delegateVoteAmount = 0;

		if (voted) {
			delegateVoteAmount = voted.amount;
		}

		const alreadyExistsInVotes = delegateExistsInVotes(selectedVotes, delegateAddress);
		const alreadyExistsInUnvotes = delegateExistsInVotes(selectedUnvotes, delegateAddress);
		// Calculate the changed amount
		if (alreadyExistsInVotes) {
			if (alreadyExistsInVotes.amount === 0) {
				return;
			}

			delegateVoteAmount += alreadyExistsInVotes.amount;
		} else if (alreadyExistsInUnvotes) {
			if (alreadyExistsInUnvotes.amount === 0) {
				return;
			}

			delegateVoteAmount -= alreadyExistsInUnvotes.amount;
		}

		if (delegateVoteAmount > 0) {
			setAmountField(delegateVoteAmount);
			setAmount(delegateVoteAmount);
		}
	}, [isSelectedUnvote]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (isInputDisabled && amountField !== undefined) {
			resetFields();

			if (amount > 0) {
				calculateRemainingBalance(0, true);
			}

			if (errorMessage) {
				setErrorMessage(undefined);
			}
		}
	}, [isInputDisabled]); // eslint-disable-line react-hooks/exhaustive-deps

	const tickerColor = () => {
		if (!!amountField && !isFocused) {
			return "text-theme-text";
		}

		return "text-theme-secondary-400 dark:text-theme-secondary-700";
	};

	return (
		<TableCell
			className="w-68"
			innerClassName={cn("justify-center border-t-2 border-b-2 border-transparent", rowColor)}
			data-testid="DelegateVoteAmount"
			isCompact={isCompact}
		>
			<div className="relative flex-1 px-3">
				<InputCurrency
					ref={input}
					disabled={isInputDisabled}
					placeholder="0"
					innerClassName={cn(
						"text-right focus:text-left",
						{ "pr-8": !errorMessage },
						{ "pr-12": !!errorMessage },
					)}
					name="amount"
					value={amountField}
					isInvalid={!!errorMessage}
					errorMessage={errorMessage}
					onChange={(amount) => onInputChange(+amount)}
					ignoreContext
					noShadow
					isCompact={isCompact}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
				/>

				<span
					className={cn(
						"absolute inset-y-0 flex items-center space-x-3",
						{ "right-7": !errorMessage },
						{ "right-15": !!errorMessage },
						{ "cursor-default": isInputDisabled },
					)}
					onClick={() => {
						if (isInputDisabled) {
							return;
						}

						input.current?.focus();
						setIsFocused(true);
					}}
					data-testid="DelegateVoteAmount__ticker"
				>
					<span className={tickerColor()}>{selectedWallet.network().coin()}</span>

					{!!errorMessage && <Divider type="vertical" size="md" />}
				</span>
			</div>
		</TableCell>
	);
};
