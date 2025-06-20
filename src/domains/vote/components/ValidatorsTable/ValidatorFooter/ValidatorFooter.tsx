import { Contracts } from "@/app/lib/profiles";
import cn from "classnames";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { DefaultTReturn, TOptions } from "i18next";
import { LabelWrapper, TextWrapper } from "./ValidatorFooter.styles";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { Button } from "@/app/components/Button";
import { Tooltip } from "@/app/components/Tooltip";
import { VoteValidatorProperties } from "@/domains/vote/components/ValidatorsTable/ValidatorsTable.contracts";
import { useNavigationContext } from "@/app/contexts";
import { twMerge } from "tailwind-merge";

interface FooterContentProperties {
	label: string;
	value: string | number;
	disabled?: boolean;
	className?: string;
}

const FooterContent = ({ label, value, disabled, className }: FooterContentProperties) => (
	<div className={twMerge("flex space-x-3 pr-4 pl-4 first:pl-6 last:pr-6", className)}>
		<div className="flex flex-row items-center space-x-2">
			<LabelWrapper>{label}</LabelWrapper>
			<TextWrapper disabled={disabled} data-testid={`ValidatorTable__footer--${label.toLocaleLowerCase()}`}>
				<div className="flex items-center justify-start md:justify-end">
					<div>{value}</div>
				</div>
			</TextWrapper>
		</div>
	</div>
);

interface ValidatorFooterProperties {
	selectedWallet: Contracts.IReadWriteWallet;
	availableBalance: number;
	selectedVotes: VoteValidatorProperties[];
	selectedUnvotes: VoteValidatorProperties[];
	maxVotes: number;
	onContinue?: (unvotes: VoteValidatorProperties[], votes: VoteValidatorProperties[]) => void;
}

export const ValidatorFooter = ({
	selectedWallet,
	availableBalance,
	selectedVotes,
	selectedUnvotes,
	maxVotes,
	onContinue,
}: ValidatorFooterProperties) => {
	const { t } = useTranslation();
	const [tooltipContent, setTooltipContent] = useState<string | DefaultTReturn<TOptions>>("");
	const [isContinueDisabled, setIsContinueDisabled] = useState(true);
	const requiresStakeAmount = selectedWallet.network().votesAmountMinimum() > 0;

	const { setHasFixedFormButtons } = useNavigationContext();

	const totalVotes = useMemo(() => {
		if (maxVotes === 1) {
			if (selectedVotes.length > 0) {
				return selectedVotes.length;
			}

			return selectedUnvotes.length;
		}

		return selectedVotes.length + selectedUnvotes.length;
	}, [maxVotes, selectedUnvotes, selectedVotes]);

	useEffect(() => {
		if (totalVotes < 1) {
			setTooltipContent(t("VOTE.VALIDATOR_TABLE.TOOLTIP.SELECTED_VALIDATOR"));
			setIsContinueDisabled(true);
			return;
		}

		const hasZeroAmount =
			selectedVotes.some(({ amount }) => amount === 0) || selectedUnvotes.some(({ amount }) => amount === 0);

		if (requiresStakeAmount && hasZeroAmount) {
			setTooltipContent(t("VOTE.VALIDATOR_TABLE.TOOLTIP.INVALID_AMOUNT"));
			setIsContinueDisabled(true);
			return;
		}

		setTooltipContent("");
		setIsContinueDisabled(false);
	}, [totalVotes, requiresStakeAmount, selectedUnvotes, selectedVotes, t]);

	useEffect(() => {
		// Adds the separator between the mobile navigation and the voting controls
		// in xs screens
		setHasFixedFormButtons(true);
		return () => {
			setHasFixedFormButtons(false);
		};
	}, []);

	return (
		<div
			className="border-theme-secondary-300 bg-theme-background dark:bg-dark-700 dark:border-theme-dark-700 dim:border-theme-dim-700 fixed inset-x-0 bottom-0 mb-14 h-auto w-screen border-t py-3 sm:mb-0"
			data-testid="ValidatorTable__footer"
		>
			<div className="mx-auto px-8 md:px-10 lg:container">
				<div className="flex flex-col font-semibold sm:flex-row sm:space-x-3">
					<div className="divide-theme-secondary-300 dark:divide-theme-secondary-800 dim:divide-theme-dim-700 hidden grow overflow-x-auto sm:mr-auto sm:divide-x md:flex">
						<div className={cn("flex grow overflow-x-auto", { "pr-5": requiresStakeAmount })}>
							<div
								className={cn("flex h-full flex-1 grow flex-row items-center overflow-x-auto", {
									"w-36": requiresStakeAmount,
								})}
							>
								<div className="flex items-center space-x-2 overflow-hidden">
									<LabelWrapper className="hidden whitespace-nowrap sm:block">
										{t("VOTE.VALIDATOR_TABLE.VOTING_ADDRESS")}:
									</LabelWrapper>

									<div className="lg:text flex w-full overflow-x-auto xl:-mt-px">
										<Address
											address={selectedWallet.address()}
											walletName={selectedWallet.alias()}
											addressClass="text-xs leading-[17px] sm:text-base sm:leading-5 text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200"
											walletNameClass="text-xs leading-[17px] sm:text-base sm:leading-5 text-theme-text"
										/>
									</div>
								</div>
							</div>
						</div>

						{requiresStakeAmount && (
							<div
								className="flex flex-row space-x-2 px-6"
								data-testid="ValidatorTable__available-balance"
							>
								<LabelWrapper>
									{t("VOTE.VALIDATOR_TABLE.VOTE_AMOUNT.AVAILABLE_TO_VOTE", {
										percent: Math.ceil((availableBalance / selectedWallet.balance()) * 100),
									})}
								</LabelWrapper>
								<TextWrapper>
									<Amount value={availableBalance} ticker={selectedWallet.network().ticker()} />
								</TextWrapper>
							</div>
						)}
					</div>
					<div className="flex flex-1 flex-col items-center justify-center sm:flex-row">
						<div className="flex flex-1 items-center sm:-ml-6 md:ml-0 md:flex-none">
							<FooterContent
								className="pl-0 first:pl-0 md:first:pl-6 lg:pl-4"
								disabled={selectedVotes.length === 0}
								label={t("VOTE.VALIDATOR_TABLE.VOTES")}
								value={selectedVotes.length}
							/>

							<span className="bg-theme-secondary-300 dark:bg-theme-secondary-800 dim:bg-theme-dim-700 block h-5 w-px" />

							<FooterContent
								disabled={selectedUnvotes.length === 0}
								label={t("VOTE.VALIDATOR_TABLE.UNVOTES")}
								value={selectedUnvotes.length}
							/>

							<span className="bg-theme-secondary-300 dark:bg-theme-secondary-800 dim:bg-theme-dim-700 block h-5 w-px md:hidden lg:block" />

							<FooterContent
								className="flex md:hidden lg:flex"
								label={t("VOTE.VALIDATOR_TABLE.TOTAL")}
								value={`${totalVotes}/${maxVotes}`}
							/>
						</div>

						<div className="w-full pt-3 sm:flex sm:w-auto sm:items-center sm:pt-0">
							<span className="bg-theme-secondary-300 dark:bg-theme-secondary-800 dim:bg-theme-dim-700 hidden h-5 w-px md:block" />

							<Tooltip content={tooltipContent} disabled={!isContinueDisabled}>
								<span data-testid="ValidatorTable__continue--wrapper" className="sm:ml-auto sm:pl-6">
									<Button
										disabled={isContinueDisabled}
										onClick={() => onContinue?.(selectedUnvotes, selectedVotes)}
										data-testid="ValidatorTable__continue-button"
										size="sm"
										className="w-full sm:w-auto"
									>
										{t("COMMON.CONTINUE")}
									</Button>
								</span>
							</Tooltip>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
