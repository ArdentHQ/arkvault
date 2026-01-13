import cn from "classnames";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { TableRow } from "@/app/components/Table";
import { MobileCard } from "@/app/components/Table/Mobile/MobileCard";
import { MobileSection } from "@/app/components/Table/Mobile/MobileSection";
import { TokenRowProperties } from "@/domains/tokens/components/TokenRow/TokenRow";
import { TokenNameInitials } from "@/domains/portfolio/components/Tokens/TokensSummary";
import { Button } from "@/app/components/Button";
import { Amount } from "@/app/components/Amount";
import { Link } from "@/app/components/Link";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { Icon } from "@/app/components/Icon";
import { Divider } from "@/app/components/Divider";
import { TokenRowMobileSkeleton } from "./TokenRowMobileSkeleton";

export const TokenRowMobile = memo(
	({ className, onClick, isLoading = false, onSend, walletToken, ...properties }: TokenRowProperties) => {
		const { t } = useTranslation();

		if (isLoading) {
			return <TokenRowMobileSkeleton />;
		}

		return (
			<TableRow onClick={onClick} className={cn("group border-b-0!", className)} {...properties}>
				<td data-testid="TableRow__mobile">
					<MobileCard className="mb-3">
						<div className="bg-theme-secondary-100 dim:bg-theme-dim-950 flex h-10 w-full items-center justify-between pr-3 pl-4 sm:pl-3 dark:bg-black">
							<div className="flex flex-row items-center gap-3">
								<div className="hidden flex-row items-center sm:flex">
									<Button
										size="icon"
										variant="transparent"
										className="mr-2 p-1"
										onClick={(event) => {
											/* istanbul ignore next -- @preserve */
											event.stopPropagation();
										}}
									>
										<Icon name="Star" className="text-theme-warning-400" />
									</Button>
									<Divider
										type="vertical"
										className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-700 m-0 h-[17px]"
									/>
								</div>

								<TokenNameInitials tokenName={walletToken.token().name()} />
								<span className="dark:text-theme-dark-50 dim:text-theme-dim-50 text-sm leading-[17px] font-semibold">
									{walletToken.token().name()}
								</span>
							</div>

							<div className="flex flex-row items-center">
								<Button
									size="icon"
									variant="transparent"
									className="text-theme-primary-600 hover:text-theme-primary-700 dark:text-theme-dark-navy-400 dark:hover:text-theme-navy-500 dim:text-theme-dim-navy-600 dim-hover:text-theme-dim-navy-700 p-1 text-sm hover:underline"
									onClick={(event) => {
										event.stopPropagation();
										onSend();
									}}
								>
									{t("COMMON.SEND")}
								</Button>
							</div>
						</div>

						<div className="flex w-full flex-col gap-4 px-4 pt-3 pb-4 sm:grid sm:grid-cols-[200px_auto_180px] sm:pb-4">
							<MobileSection
								title={t("COMMON.TOKEN_BALANCE")}
								className="w-full"
								data-testid="TokenRow__balance"
							>
								<Amount
									ticker={walletToken.token().symbol()}
									showTicker={false}
									value={walletToken.balance()}
									className="dark:text-theme-dark-50 dim:text-theme-dim-50 text-sm leading-[17px] font-semibold"
								/>
							</MobileSection>

							<MobileSection title={t("COMMON.VALUE")} className="w-full">
								<div className="text-theme-secondary-500 dark:text-theme-dark-500 dim:text-theme-dim-500 text-sm font-semibold">
									{t("COMMON.NOT_AVAILABLE")}
								</div>
							</MobileSection>

							<MobileSection title={t("COMMON.CONTRACT")} className="w-full">
								<Link
									to={walletToken.contractExplorerLink()}
									showExternalIcon={false}
									isExternal={true}
								>
									<div className="flex w-40 flex-row items-center gap-2 text-sm leading-[17px] font-semibold">
										<TruncateMiddle
											text={walletToken.token().address()}
											className="text-theme-navy-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600"
										/>
										<Icon
											data-testid="Link__external"
											name="ArrowExternal"
											dimensions={[12, 12]}
											className="text-theme-secondary-500 dark:text-theme-dark-500 dim:text-theme-dim-500 shrink-0 align-middle duration-200"
										/>
									</div>
								</Link>
							</MobileSection>

							<div className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-700 border-t border-dashed pt-4 sm:hidden">
								<Button
									variant="transparent"
									className="-m-1 mr-2 p-1"
									onClick={(event) => {
										/* istanbul ignore next -- @preserve */
										event.stopPropagation();
									}}
								>
									<Icon name="Star" className="text-theme-warning-400" />
									<div className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 text-sm leading-[17px] font-semibold">
										{t("COMMON.FAVORITE")}
									</div>
								</Button>
							</div>
						</div>
					</MobileCard>
				</td>
			</TableRow>
		);
	},
);
