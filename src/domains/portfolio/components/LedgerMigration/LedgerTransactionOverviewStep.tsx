import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { useActiveProfile } from "@/app/hooks";
import { SidepanelFooter } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";
import { Checkbox } from "@/app/components/Checkbox";
import { DetailLabelText, DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Address } from "@/app/components/Address";
import cn from "classnames";
import { Label } from "@/app/components/Label";
import { Amount } from "@/app/components/Amount";
import { ConfirmationTimeFooter } from "@/domains/transaction/components/TotalAmountBox";
import { Link } from "@/app/components/Link";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";

export const OverviewStep = ({ onContinue }: { onContinue?: () => void }) => {
	const { t } = useTranslation();
	const profile = useActiveProfile();
	const [acceptResponsibility, setAcceptResponsibility] = useState(false);

	// TODO: use migrating wallet.
	const wallet = profile.wallets().first();

	return (
		<div data-testid="LedgerMigration__Review-step">
			<div className="space-y-4">
				<DetailWrapper label={t("TRANSACTION.ADDRESSING")}>
					<div className="space-y-3">
						<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
							<DetailTitle>{t("COMMON.OLD")}</DetailTitle>
							<Address
								truncateOnTable
								address={wallet.address()}
								walletName={wallet.alias()}
								showCopyButton
								walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
								wrapperClass="justify-end sm:justify-start"
								addressClass={cn("text-sm leading-[17px] sm:leading-5 sm:text-base w-full w-3/4", {
									"text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-200":
										!!wallet.alias(),
								})}
							/>
						</div>

						<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
							<DetailTitle>{t("COMMON.NEW")}</DetailTitle>
							<Address
								truncateOnTable
								address={wallet.address()}
								showCopyButton
								walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
								wrapperClass="justify-end sm:justify-start w-full"
								addressClass={cn("text-sm leading-[17px] sm:leading-5 sm:text-base w-full w-3/4", {
									"text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-200":
										!!wallet.alias(),
								})}
							/>
						</div>

						<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
							<DetailTitle> </DetailTitle>
							<Link to="">
								<span className="flex items-center space-x-2">
									<span>{t("COMMON.VERIFY_ADDRESS")}</span>
									<Tooltip content={t("COMMON.LEDGER_MIGRATION.VERIFY_MESSAGE_HELP_TEXT")}>
										<span>
											<span className="bg-theme-secondary-100 block flex h-5 w-5 items-center justify-center rounded-full dark:hidden">
												<Icon name="QuestionMarkSmall" dimensions={[10, 10]} />
											</span>
											<span className="hidden dark:block">
												<Icon name="CircleQuestionMark" dimensions={[20, 20]} />
											</span>
										</span>
									</Tooltip>
								</span>
							</Link>
						</div>
					</div>
				</DetailWrapper>

				<DetailWrapper label={t("COMMON.ACTION")}>
					<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
						<DetailTitle>{t("COMMON.METHOD")}</DetailTitle>
						<Label color="neutral" size="xs">
							{t("TRANSACTION.TRANSACTION_TYPES.TRANSFER")}
						</Label>
					</div>
				</DetailWrapper>

				<DetailWrapper
					label={t("TRANSACTION.SUMMARY")}
					footer={<ConfirmationTimeFooter confirmationTime={20} />}
				>
					<div className="space-y-3">
						<div className="flex w-full items-center justify-between gap-2 sm:justify-start">
							<DetailLabelText>{t("COMMON.AMOUNT")}</DetailLabelText>
							<Amount
								ticker={"ARK"}
								value={0.000126}
								className="text-sm leading-[17px] font-semibold sm:text-base sm:leading-5"
								allowHideBalance
								profile={profile}
							/>
							<span className="text-theme-secondary-700 dark:text-theme-secondary-500">
								(
								<Amount
									ticker={wallet.exchangeCurrency()}
									value={0.000126}
									className="text-sm leading-[17px] font-semibold sm:text-base sm:leading-5"
									allowHideBalance
									profile={profile}
								/>
								)
							</span>
						</div>

						<div className="flex w-full items-center justify-between gap-2 sm:justify-start">
							<DetailLabelText>{t("COMMON.FEE")}</DetailLabelText>
							<Amount
								ticker={wallet.exchangeCurrency()}
								value={0.000126}
								className="text-sm leading-[17px] font-semibold sm:text-base sm:leading-5"
								allowHideBalance
								profile={profile}
							/>
							<span className="text-theme-secondary-700 dark:text-theme-secondary-500">
								(
								<Amount
									ticker={wallet.exchangeCurrency()}
									value={0.000126}
									className="text-sm leading-[17px] font-semibold sm:text-base sm:leading-5"
									allowHideBalance
									profile={profile}
								/>
								)
							</span>
						</div>
					</div>
				</DetailWrapper>
			</div>

			<SidepanelFooter className="fixed right-0 bottom-0">
				<div className="flex items-center space-x-5">
					<label className="flex w-full cursor-pointer space-x-3">
						<Checkbox
							name="VerifyResponsibility"
							onChange={(event) => setAcceptResponsibility(event.target.checked)}
						/>
						<span className="text-theme-secondary-700 dark:text-theme-secondary-500 text-sm">
							{t("COMMON.LEDGER_MIGRATION.ACCEPT_RESPONSIBILITY")}
						</span>
					</label>

					<Button
						data-testid="LedgerScanStep__continue-button"
						disabled={!acceptResponsibility}
						onClick={onContinue}
					>
						{t("COMMON.CONTINUE")}
					</Button>
				</div>
			</SidepanelFooter>
		</div>
	);
};
