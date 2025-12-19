import { DetailsCondensed, DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { useState } from "react";
import { SidePanel } from "@/app/components/SidePanel/SidePanel";
import { useTranslation } from "react-i18next";
import { Amount } from "@/app/components/Amount";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { TokenNameInitials } from "@/domains/portfolio/components/Tokens/TokensSummary";
import { Icon } from "@/app/components/Icon";
import cn from "classnames";
import { Address } from "@/app/components/Address";
import { Divider } from "@/app/components/Divider";
import { Link } from "@/app/components/Link";

export const TokenDetailSidepanel = ({
	isOpen: isSidePanelOpen,
	walletToken,
}: {
	isOpen: boolean;
	walletToken: WalletToken;
}) => {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(isSidePanelOpen);

	return (
		<SidePanel title={t("TOKENS.TOKEN_INFORMATION")} open={isOpen} onOpenChange={setIsOpen}>
			<DetailsCondensed>
				<div className="space-y-4">
					<div className="rounded-xl sm:border px-6 py-3 border-none dark:bg-theme-dark-950 dim:bg-theme-dim-950 dark:text-theme-dark-50 bg-theme-primary-100 dim:text-theme-dim-50">
						<div className="flex justify-between">
							<div className="flex items-center space-x-2">
								<TokenNameInitials tokenName={walletToken.token().name()} className="w-8 h-8 text-md p-3 leading-8" />
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
								<DetailTitle className="w-auto sm:min-w-28 sm:pr-6">
									{t("COMMON.AMOUNT")}
								</DetailTitle>

								<div className="flex flex-1 flex-row items-center justify-end gap-2 sm:w-full sm:justify-start">
									<Amount
										ticker="ARK"
										value={walletToken.balance()}
										className="text-sm font-semibold md:text-base"
									/>
								</div>
							</div>

							<div
								className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0"
								data-testid="FiatAmountSection"
							>
								<DetailTitle className="w-auto sm:min-w-28 sm:pr-6">
									{t("COMMON.FIAT")}
								</DetailTitle>

								<div className="flex flex-1 flex-row items-center justify-end gap-2 sm:w-full sm:justify-start text-theme-secondary-500 dark:text-theme-dark-500 font-semibold">
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
								<DetailTitle className="w-auto sm:min-w-28 sm:pr-6">
									{t("COMMON.SYMBOL")}
								</DetailTitle>

								<div className="font-semibold">{walletToken.token().symbol()}</div>
							</div>

							<div
								className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0"
								data-testid="FiatAmountSection"
							>
								<DetailTitle className="w-auto sm:min-w-28 sm:pr-6">
									{t("COMMON.CONTRACT")}
								</DetailTitle>

								<div className="flex flex-1 flex-row items-center justify-end gap-2 sm:w-full sm:justify-start">
									<Address
										truncateOnTable
										address={walletToken.token().address()}
										showCopyButton
										walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
										wrapperClass="justify-end sm:justify-start"
										addressClass={cn("text-sm leading-[17px] sm:leading-5 sm:text-base w-full w-3/4")}
									/>

									<Divider type="vertical" />

									<Link isExternal to={walletToken.contractExplorerLink()} className="whitespace-nowrap">
										{t("COMMON.EXPLORER")}
									</Link>

								</div>
							</div>

							<div
								className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0"
								data-testid="FiatAmountSection"
							>
								<DetailTitle className="w-auto sm:min-w-28 sm:pr-6">
									{t("COMMON.DECIMALS")}
								</DetailTitle>

								<div className="font-semibold">{walletToken.token().decimals()}</div>
							</div>
						</div>
					</DetailWrapper>
				</div>
			</DetailsCondensed>
		</SidePanel>
	);
};
