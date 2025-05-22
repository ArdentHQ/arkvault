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
			<TextWrapper disabled={disabled} data-testid={`DelegateTable__footer--${label.toLocaleLowerCase()}`}>
				<div className="flex justify-start items-center md:justify-end">
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
			className="fixed inset-x-0 bottom-0 py-3 mb-14 w-screen h-auto border-t sm:mb-0 border-theme-secondary-300 bg-theme-background dark:bg-dark-700 dark:border-theme-dark-700"
			data-testid="DelegateTable__footer"
		>
			<div className="px-8 mx-auto md:px-10 lg:container">
				<div className="flex flex-col font-semibold sm:flex-row sm:space-x-3">
					<div className="hidden overflow-x-auto sm:mr-auto sm:divide-x md:flex divide-theme-secondary-300 grow dark:divide-theme-secondary-800">
						<div className={cn("flex grow overflow-x-auto", { "pr-5": requiresStakeAmount })}>
							<div
								className={cn("flex h-full flex-1 grow flex-row items-center overflow-x-auto", {
									"w-36": requiresStakeAmount,
								})}
							>
								<div className="flex overflow-hidden items-center space-x-2">
									<LabelWrapper className="hidden whitespace-nowrap sm:block">
										{t("VOTE.VALIDATOR_TABLE.VOTING_ADDRESS")}:
									</LabelWrapper>

									<div className="flex overflow-x-auto w-full xl:-mt-px lg:text">
										<Address
											address={selectedWallet.address()}
											walletName={selectedWallet.alias()}
											addressClass="text-xs leading-[17px] sm:text-base sm:leading-5 text-theme-secondary-700 dark:text-theme-dark-200"
											walletNameClass="text-xs leading-[17px] sm:text-base sm:leading-5 text-theme-text"
										/>
									</div>
								</div>
							</div>
						</div>

						{requiresStakeAmount && (
							<div
								className="flex flex-row px-6 space-x-2"
								data-testid="DelegateTable__available-balance"
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
					<div className="flex flex-col flex-1 justify-center items-center sm:flex-row">
						<div className="flex flex-1 items-center sm:-ml-6 md:flex-none md:ml-0">
							<FooterContent
								className="pl-0 lg:pl-4 first:pl-0 md:first:pl-6"
								disabled={selectedVotes.length === 0}
								label={t("VOTE.VALIDATOR_TABLE.VOTES")}
								value={selectedVotes.length}
							/>

							<span className="block w-px h-5 bg-theme-secondary-300 dark:bg-theme-secondary-800" />

							<FooterContent
								disabled={selectedUnvotes.length === 0}
								label={t("VOTE.VALIDATOR_TABLE.UNVOTES")}
								value={selectedUnvotes.length}
							/>

							<span className="block w-px h-5 md:hidden lg:block bg-theme-secondary-300 dark:bg-theme-secondary-800" />

							<FooterContent
								className="flex md:hidden lg:flex"
								label={t("VOTE.VALIDATOR_TABLE.TOTAL")}
								value={`${totalVotes}/${maxVotes}`}
							/>
						</div>

						<div className="pt-3 w-full sm:flex sm:items-center sm:pt-0 sm:w-auto">
							<span className="hidden w-px h-5 md:block bg-theme-secondary-300 dark:bg-theme-secondary-800" />

							<Tooltip content={tooltipContent} disabled={!isContinueDisabled}>
								<span data-testid="DelegateTable__continue--wrapper" className="sm:pl-6 sm:ml-auto">
									<Button
										disabled={isContinueDisabled}
										onClick={() => onContinue?.(selectedUnvotes, selectedVotes)}
										data-testid="DelegateTable__continue-button"
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
