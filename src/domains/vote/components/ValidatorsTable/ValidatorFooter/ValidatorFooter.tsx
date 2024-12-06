import { Contracts } from "@ardenthq/sdk-profiles";
import cn from "classnames";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { DefaultTReturn, TOptions } from "i18next";
import { LabelWrapper, TextWrapper } from "./DelegateFooter.styles";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { Button } from "@/app/components/Button";
import { Tooltip } from "@/app/components/Tooltip";
import { VoteValidatorProperties } from "@/domains/vote/components/ValidatorsTable/ValidatorsTable.contracts";
import { useNavigationContext } from "@/app/contexts";

interface FooterContentProperties {
	label: string;
	value: string | number;
	disabled?: boolean;
	className?: string;
}

const FooterContent = ({ label, value, disabled, className }: FooterContentProperties) => (
	<div className={cn("flex space-x-3 pl-4 pr-4 first:pl-6 last:pr-6", className)}>
		<div className="flex flex-col justify-between sm:text-right">
			<LabelWrapper>{label}</LabelWrapper>
			<TextWrapper disabled={disabled} data-testid={`DelegateTable__footer--${label.toLocaleLowerCase()}`}>
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
			className="fixed inset-x-0 bottom-0 mb-14 h-auto w-screen bg-theme-background py-3 shadow-footer-smooth dark:bg-black dark:shadow-footer-smooth-dark sm:mb-0 md:py-4"
			data-testid="DelegateTable__footer"
		>
			<div className="mx-auto px-8 lg:container md:px-10">
				<div className="flex flex-col space-y-3 font-semibold sm:h-11 sm:flex-row sm:space-x-3 sm:space-y-0">
					<div className="flex flex-grow divide-theme-secondary-300 overflow-x-auto dark:divide-theme-secondary-800 sm:mr-auto sm:divide-x">
						<div className={cn("flex flex-grow overflow-x-auto", { "pr-5": requiresStakeAmount })}>
							<div
								className={cn("flex h-full flex-grow flex-col justify-between overflow-x-auto", {
									"w-36": requiresStakeAmount,
								})}
							>
								<LabelWrapper className="hidden sm:block">{t("COMMON.ADDRESS")}</LabelWrapper>
								<div className="flex h-5 items-center overflow-hidden lg:h-auto lg:space-y-2">
									<div className="lg:text flex w-full overflow-x-auto xl:-mt-px">
										<Address
											address={selectedWallet.address()}
											walletName={selectedWallet.alias()}
											addressClass="text-xs leading-[17px] sm:text-base sm:leading-5 text-theme-secondary-500 dark:text-theme-secondary-700"
											walletNameClass="text-xs leading-[17px] sm:text-base sm:leading-5 text-theme-text"
										/>
									</div>
								</div>
							</div>
						</div>

						{requiresStakeAmount && (
							<div
								className="flex flex-col space-y-2 px-6"
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
					<div className="flex h-full border-t border-theme-secondary-300 pt-3 dark:border-theme-secondary-800 sm:border-l sm:border-t-0 sm:pt-0 md:border-l-0">
						<div className="-ml-6 flex divide-x divide-theme-secondary-300 dark:divide-theme-secondary-800 sm:ml-0">
							<FooterContent
								disabled={selectedVotes.length === 0}
								label={t("VOTE.VALIDATOR_TABLE.VOTES")}
								value={selectedVotes.length}
							/>

							<FooterContent
								disabled={selectedUnvotes.length === 0}
								label={t("VOTE.VALIDATOR_TABLE.UNVOTES")}
								value={selectedUnvotes.length}
							/>

							<FooterContent
								className="hidden md:flex"
								label={t("VOTE.VALIDATOR_TABLE.TOTAL")}
								value={`${totalVotes}/${maxVotes}`}
							/>
						</div>

						<Tooltip content={tooltipContent} disabled={!isContinueDisabled}>
							<span data-testid="DelegateTable__continue--wrapper" className="ml-auto">
								<Button
									disabled={isContinueDisabled}
									onClick={() => onContinue?.(selectedUnvotes, selectedVotes)}
									data-testid="DelegateTable__continue-button"
								>
									{t("COMMON.CONTINUE")}
								</Button>
							</span>
						</Tooltip>
					</div>
				</div>
			</div>
		</div>
	);
};
