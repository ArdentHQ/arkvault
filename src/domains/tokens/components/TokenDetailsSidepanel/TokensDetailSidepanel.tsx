import { DetailsCondensed, DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { useState } from "react";
import { SidePanel, SidePanelButtons } from "@/app/components/SidePanel/SidePanel";
import { useTranslation } from "react-i18next";
import { Amount } from "@/app/components/Amount";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { TokenNameInitials } from "@/domains/portfolio/components/Tokens/TokensSummary";
import { Icon } from "@/app/components/Icon";
import cn from "classnames";
import { Address } from "@/app/components/Address";
import { Divider } from "@/app/components/Divider";
import { Link } from "@/app/components/Link";
import { Button } from "@/app/components/Button";

const TokenDetailSidepanelFooter = () => {
	const { t } = useTranslation();
	return (
		<SidePanelButtons>
			<>
				<Button variant="secondary">{t("COMMON.CLOSE")}</Button>

				<Button className="hidden md:block">{t("COMMON.SEND_TOKENS")}</Button>

				<Button className="md:hidden">{t("COMMON.SEND")}</Button>
			</>
		</SidePanelButtons>
	);
};

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
		<SidePanel
			title={t("TOKENS.TOKEN_INFORMATION")}
			open={isOpen}
			onOpenChange={setIsOpen}
			footer={<TokenDetailSidepanelFooter />}
		>
			<DetailsCondensed>
				<div className="space-y-4" data-testid="TokenDetailSidepanel">
					<div className="dark:bg-theme-dark-950 dim:bg-theme-dim-950 dark:text-theme-dark-50 bg-theme-primary-100 dim:text-theme-dim-50 rounded-xl border-none px-6 py-3 sm:border">
						<div className="flex justify-between">
							<div className="flex items-center space-x-2">
								<TokenNameInitials
									tokenName={walletToken.token().name()}
									className="text-md h-8 w-8 p-3 leading-8"
								/>
								<div className="text-lg leading-4 font-semibold">{walletToken.token().name()}</div>
							</div>

							<div className="flex items-center space-x-4">
								<Icon
									name="ArrowRotateLeft"
									style={{ animationDirection: "reverse" }}
									className="text-theme-secondary-700 dark:text-theme-dark-200 dark:hover:text-theme-dark-50 hover:text-theme-primary-700 dim:text-theme-dim-200 dim:hover:text-theme-dim-50 cursor-pointer"
								/>
								<Icon
									name="Star"
									className="text-theme-secondary-700 dark:text-theme-dark-200 dark:hover:text-theme-dark-50 hover:text-theme-primary-700 dim:text-theme-dim-200 dim:hover:text-theme-dim-50 cursor-pointer"
								/>
							</div>
						</div>
					</div>

					<DetailWrapper label={t("COMMON.BALANCE")} className="rounded-xl">
						<div className="space-y-3">
							<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0" >
								<DetailTitle className="w-auto sm:min-w-28 sm:pr-6">{t("COMMON.AMOUNT")}</DetailTitle>

								<div className="flex flex-1 flex-row items-center justify-end gap-2 sm:w-full sm:justify-start">
									<Amount
										ticker="ARK"
										value={walletToken.balance()}
										className="text-sm font-semibold md:text-base"
									/>
								</div>
							</div>

							<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
								<DetailTitle className="w-auto sm:min-w-28 sm:pr-6">{t("COMMON.FIAT")}</DetailTitle>

								<div className="text-theme-secondary-500 dark:text-theme-dark-500 flex flex-1 flex-row items-center justify-end gap-2 font-semibold sm:w-full sm:justify-start">
									{t("COMMON.NOT_AVAILABLE")}
								</div>
							</div>
						</div>
					</DetailWrapper>

					<DetailWrapper label={t("COMMON.DETAILS")} className="rounded-xl">
						<div className="space-y-3">
							<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
								<DetailTitle className="w-auto sm:min-w-28 sm:pr-6">{t("COMMON.SYMBOL")}</DetailTitle>

								<div className="font-semibold">{walletToken.token().symbol()}</div>
							</div>

							<div className="flex justify-between space-x-2 sm:justify-start sm:space-x-0 md:items-center">
								<DetailTitle className="w-auto pt-1 sm:min-w-28 sm:pr-6 md:pt-0">
									{t("COMMON.CONTRACT")}
								</DetailTitle>

								<div className="flex flex-1 flex-col justify-end gap-2 sm:w-full sm:justify-start md:flex-row md:items-center">
									<Address
										truncateOnTable
										address={walletToken.token().address()}
										showCopyButton
										walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
										wrapperClass="justify-end sm:justify-start"
										addressClass={cn(
											"text-sm leading-[17px] sm:leading-5 sm:text-base w-full w-3/4",
										)}
									/>

									<div className="hidden md:block">
										<Divider type="vertical" />
									</div>

									<Link
										isExternal
										to={walletToken.contractExplorerLink()}
										className="flex items-center justify-end whitespace-nowrap"
									>
										{t("COMMON.EXPLORER")}
									</Link>
								</div>
							</div>

							<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
								<DetailTitle className="w-auto sm:min-w-28 sm:pr-6">{t("COMMON.DECIMALS")}</DetailTitle>

								<div className="font-semibold">{walletToken.token().decimals()}</div>
							</div>
						</div>
					</DetailWrapper>
				</div>
			</DetailsCondensed>
		</SidePanel>
	);
};
