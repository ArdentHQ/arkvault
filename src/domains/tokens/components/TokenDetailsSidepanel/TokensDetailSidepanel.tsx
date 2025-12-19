import { DetailsCondensed, DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { useEffect, useState } from "react";
import { SidePanel } from "@/app/components/SidePanel/SidePanel";
import { useTranslation } from "react-i18next";
import { Amount } from "@/app/components/Amount";
import { SIDE_PANEL_TRANSITION_DURATION } from "@/app/contexts";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { TokenNameInitials } from "@/domains/portfolio/components/Tokens/TokensSummary";
import { Icon } from "@/app/components/Icon";

export const TokenDetailSidepanel = ({
	isOpen: isSidePanelOpen,
	walletToken,
	onClose,
}: {
	isOpen: boolean;
	walletToken: WalletToken;
	onClose: () => void;
}) => {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(isSidePanelOpen);

	useEffect(() => {
		let timeoutId: NodeJS.Timeout | undefined;

		if (!isOpen) {
			timeoutId = setTimeout(() => {
				onClose?.();
			}, SIDE_PANEL_TRANSITION_DURATION);
		}

		return () => clearTimeout(timeoutId);
	}, [isOpen]);

	return (
		<SidePanel title={t("TOKENS.TOKEN_INFORMATION")} open={isOpen} onOpenChange={setIsOpen}>
			<DetailsCondensed>
				<div className="space-y-4">
					<div className="rounded-xl sm:border px-6 py-3 border-none dark:bg-theme-dark-950 dim:bg-theme-dim-950 dark:text-theme-dark-50 dim:text-theme-dim-50">
						<div className="flex justify-between">
							<div className="flex items-center space-x-2">
								<TokenNameInitials tokenName={walletToken.token().name()} className="w-8 h-8 text-lg leading-4" />
								<div className="text-lg font-semibold leading-4">{walletToken.token().name()}</div>
							</div>

							<div className="flex items-center space-x-4">
								<Icon
									name="ArrowRotateLeft"
									style={{ animationDirection: "reverse" }}
									className="cursor-pointer text-theme-secondary-700 dark:text-theme-dark-200 dark:hover:text-theme-dark-50 hover:text-theme-primary-700 dim:text-theme-dim-200 dim:hover:text-theme-dim-50"
								/>
								<Icon
									name="Star"
									className="cursor-pointer text-theme-secondary-700 dark:text-theme-dark-200 dark:hover:text-theme-dark-50 hover:text-theme-primary-700 dim:text-theme-dim-200 dim:hover:text-theme-dim-50"
								/>
							</div>
						</div>
					</div>

					<DetailWrapper label={t("COMMON.BALANCE")} className="rounded-xl">
						<div className="space-y-3">
							<div
								className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0"
								data-testid="AmountSection"
							>
								<DetailTitle className="w-auto sm:min-w-[85px] sm:pr-6">
									{t("COMMON.AMOUNT")}
								</DetailTitle>

								<div className="flex flex-1 flex-row items-center justify-end gap-2 sm:w-full sm:justify-start">
									<Amount
										ticker="ARK"
										value={10}
										className="text-sm font-semibold md:text-base"
									/>
								</div>
							</div>

							<div
								className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0"
								data-testid="FiatAmountSection"
							>
								<DetailTitle className="w-auto sm:min-w-[85px] sm:pr-6">
									{t("COMMON.FIAT")}
								</DetailTitle>

								<div className="flex flex-1 flex-row items-center justify-end gap-2 sm:w-full sm:justify-start text-theme-secondary-500 font-semibold">
									{t("COMMON.NOT_AVAILABLE")}
								</div>
							</div>
						</div>
					</DetailWrapper>

					<DetailWrapper label={t("COMMON.DETAILS")} className="rounded-xl">
						<div className="space-y-3">
							<div
								className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0"
								data-testid="AmountSection"
							>
								<DetailTitle className="w-auto sm:min-w-[85px] sm:pr-6">
									{t("COMMON.SYMBOL")}
								</DetailTitle>

								<div className="flex flex-1 flex-row items-center justify-end gap-2 sm:w-full sm:justify-start">
									<Amount
										ticker="ARK"
										value={10}
										className="text-sm font-semibold md:text-base"
									/>
								</div>
							</div>

							<div
								className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0"
								data-testid="FiatAmountSection"
							>
								<DetailTitle className="w-auto sm:min-w-[85px] sm:pr-6">
									{t("COMMON.CONTRACT")}
								</DetailTitle>

								<div className="flex flex-1 flex-row items-center justify-end gap-2 sm:w-full sm:justify-start">
									<Amount
										ticker="ARK"
										value={10}
										className="text-sm font-semibold md:text-base"
									/>
								</div>
							</div>

							<div
								className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0"
								data-testid="FiatAmountSection"
							>
								<DetailTitle className="w-auto sm:min-w-[85px] sm:pr-6">
									{t("COMMON.DECIMALS")}
								</DetailTitle>

								<div className="flex flex-1 flex-row items-center justify-end gap-2 sm:w-full sm:justify-start">
									<Amount
										ticker="ARK"
										value={10}
										className="text-sm font-semibold md:text-base"
									/>
								</div>
							</div>
						</div>
					</DetailWrapper>
				</div>
			</DetailsCondensed>
		</SidePanel>
	);
};
