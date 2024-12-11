import { Contracts } from "@ardenthq/sdk-profiles";
import cn from "classnames";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Divider } from "@/app/components/Divider";
import { InputCurrency } from "@/app/components/Input";
import { TableCell } from "@/app/components/Table";
import { VoteValidatorProperties } from "@/domains/vote/components/ValidatorsTable/ValidatorsTable.contracts";
import { validatorExistsInVotes } from "@/domains/vote/components/ValidatorsTable/ValidatorsTable.helpers";
import { VoteAmount } from "@/domains/vote/validations/VoteAmount";

interface DelegateVoteAmountProperties {
	rowColor?: string;
	isSelectedVote: boolean;
	isSelectedUnvote: boolean;
	selectedWallet: Contracts.IReadWriteWallet;
	selectedVotes: VoteValidatorProperties[];
	selectedUnvotes: VoteValidatorProperties[];
	voted?: Contracts.VoteRegistryItem;
	validatorAddress: string;
	availableBalance: number;
	setAvailableBalance: (balance: number) => void;
	toggleUnvotesSelected: (address: string, voteAmount?: number) => void;
	toggleVotesSelected: (address: string, voteAmount?: number) => void;
}

export const ValidatorVoteAmount = ({
	voted,
	rowColor,
	selectedWallet,
	isSelectedVote,
	isSelectedUnvote,
	selectedVotes,
	selectedUnvotes,
	validatorAddress,
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
			return toggleVotesSelected(validatorAddress, inputValue);
		}

		const wasGreaterThanAmountVoted = amount > voted.amount;

		if (voted.amount === inputValue) {
			if (wasGreaterThanAmountVoted) {
				return toggleVotesSelected(validatorAddress);
			}

			return toggleUnvotesSelected(validatorAddress);
		}

		// is less than the amount voted
		if (voted.amount > inputValue) {
			if (wasGreaterThanAmountVoted) {
				toggleVotesSelected(validatorAddress);
			}

			return toggleUnvotesSelected(validatorAddress, inputValue > 0 ? voted.amount - inputValue : 0);
		}

		// is more than the amount voted
		const wasLessThanAmountVoted = amount < voted.amount;
		if (wasLessThanAmountVoted) {
			toggleUnvotesSelected(validatorAddress);
		}

		return toggleVotesSelected(validatorAddress, inputValue - voted.amount);
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

		let validatorVoteAmount = 0;

		if (voted) {
			validatorVoteAmount = voted.amount;
		}

		const alreadyExistsInVotes = validatorExistsInVotes(selectedVotes, validatorAddress);
		const alreadyExistsInUnvotes = validatorExistsInVotes(selectedUnvotes, validatorAddress);
		// Calculate the changed amount
		if (alreadyExistsInVotes) {
			if (alreadyExistsInVotes.amount === 0) {
				return;
			}

			validatorVoteAmount += alreadyExistsInVotes.amount;
		} else if (alreadyExistsInUnvotes) {
			if (alreadyExistsInUnvotes.amount === 0) {
				return;
			}

			validatorVoteAmount -= alreadyExistsInUnvotes.amount;
		}

		if (validatorVoteAmount > 0) {
			setAmountField(validatorVoteAmount);
			setAmount(validatorVoteAmount);
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
			data-testid="ValidatorVoteAmount"
		>
			<div className="relative flex-1 px-3">
				<InputCurrency
					network={selectedWallet.network()}
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
					isCompact={true}
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
