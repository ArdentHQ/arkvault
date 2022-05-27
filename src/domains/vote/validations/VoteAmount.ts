import { Contracts } from "@payvo/sdk-profiles";
import { useMemo } from "react";
import { number } from "yup";

interface VoteAmountProperties {
	t: any;
	wallet: Contracts.IReadWriteWallet;
	remainingBalance: number;
	amountVoted?: number;
}

export const VoteAmount = ({ t, wallet, remainingBalance, amountVoted }: VoteAmountProperties) =>
	useMemo(() => {
		const votesAmountMinimum = wallet.network().votesAmountMinimum();
		const votesAmountStep = wallet.network().votesAmountStep();

		const message = {
			amountBelowMinimum: t("TRANSACTION.VALIDATION.AMOUNT_BELOW_MINIMUM", {
				coinId: wallet.network().coin(),
				min: "0.00000001",
			}),
			invalid: t("COMMON.VALIDATION.FIELD_INVALID", {
				field: t("COMMON.AMOUNT"),
			}),
			lowBalance: t("TRANSACTION.VALIDATION.LOW_BALANCE"),
			required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
				field: t("COMMON.AMOUNT"),
			}),
			votesAmountMinimum: t("VOTE.DELEGATE_TABLE.VOTE_AMOUNT.VALIDATION.MINIMUM_AMOUNT", {
				coinId: wallet.network().coin(),
				minimumAmount: votesAmountMinimum,
			}),
			votesAmountStep: t("VOTE.DELEGATE_TABLE.VOTE_AMOUNT.VALIDATION.AMOUNT_STEP", {
				coinId: wallet.network().coin(),
				step: votesAmountStep,
			}),
		};

		const votesAmountStepOption = {
			message: message.votesAmountStep,
			name: "isMultipleOfAmountStep",
			test: (amount: any) => amount % votesAmountStep === 0,
		};

		const sufficientBalanceOption = {
			message: message.lowBalance,
			name: "hasSufficientBalance",
			test: (amount: any) => {
				if (!amountVoted) {
					return Number(remainingBalance) >= amount;
				}

				if (amountVoted > amount) {
					return true;
				}

				return Number(remainingBalance) >= amount - amountVoted;
			},
		};

		return number()
			.typeError(message.invalid)
			.positive(message.amountBelowMinimum)
			.min(votesAmountMinimum, message.votesAmountMinimum)
			.test(votesAmountStepOption)
			.test(sufficientBalanceOption)
			.required(message.required);
	}, [wallet, t, amountVoted, remainingBalance]);
