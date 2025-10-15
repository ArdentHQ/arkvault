import React from "react";
import { useTranslation } from "react-i18next";

import { DetailLabelText, DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Address } from "@/app/components/Address";
import cn from "classnames";
import { Label } from "@/app/components/Label";
import { Amount } from "@/app/components/Amount";
import { ConfirmationTimeFooter } from "@/domains/transaction/components/TotalAmountBox";
import { Link } from "@/app/components/Link";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { Networks } from "@/app/lib/mainsail";
import { TransactionFee } from "./components/TransactionFee";
import { Contracts } from "@/app/lib/profiles";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";

export const LedgerTransactionOverview = ({
	network,
	senderWallet,
	recipients,
	profile,
	children,
	onVerifyAddress,
}: {
	onVerifyAddress?: () => void;
	children: React.ReactElement;
	profile: Contracts.IProfile;
	senderWallet: Contracts.IReadWriteWallet;
	network: Networks.Network;
	recipients: RecipientItem[];
}) => {
	const { t } = useTranslation();

	return (
		<div data-testid="LedgerMigration__Review-step">
			<div className="space-y-4">
				<DetailWrapper label={t("TRANSACTION.ADDRESSING")}>
					<div className="space-y-3">
						<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
							<DetailTitle>{t("COMMON.OLD")}</DetailTitle>
							<Address
								truncateOnTable
								address={senderWallet.address()}
								walletName={senderWallet.alias()}
								showCopyButton
								walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
								wrapperClass="justify-end sm:justify-start"
								addressClass={cn("text-sm leading-[17px] sm:leading-5 sm:text-base w-full w-3/4", {
									"text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-200":
										!!senderWallet.alias(),
								})}
							/>
						</div>

						<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
							<DetailTitle>{t("COMMON.NEW")}</DetailTitle>
							<Address
								truncateOnTable
								address={senderWallet.address()}
								showCopyButton
								walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
								wrapperClass="justify-end sm:justify-start w-full"
								addressClass={cn("text-sm leading-[17px] sm:leading-5 sm:text-base w-full w-3/4", {
									"text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-200":
										!!senderWallet.alias(),
								})}
							/>
						</div>

						<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
							<DetailTitle> </DetailTitle>
							<Link to="" onClick={onVerifyAddress}>
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
					footer={
						<ConfirmationTimeFooter
							confirmationTime={network.fees().confirmationTime("Average", network.blockTime())}
						/>
					}
				>
					<div className="space-y-3">
						<div className="flex w-full items-center justify-between gap-2 sm:justify-start">
							<DetailLabelText>{t("COMMON.AMOUNT")}</DetailLabelText>
							<Amount
								ticker={network.ticker()}
								value={senderWallet.balance()}
								className="text-sm leading-[17px] font-semibold sm:text-base sm:leading-5"
							/>
							<span className="text-theme-secondary-700 dark:text-theme-secondary-500">
								(
								<Amount
									ticker={senderWallet.exchangeCurrency()}
									value={senderWallet.convertedBalance()}
									className="text-sm leading-[17px] font-semibold sm:text-base sm:leading-5"
								/>
								)
							</span>
						</div>

						<div className="flex w-full items-center justify-between gap-2 sm:justify-start">
							<DetailLabelText>{t("COMMON.FEE")}</DetailLabelText>
							<TransactionFee
								profile={profile}
								network={network}
								senderWallet={senderWallet}
								recipients={recipients}
							/>
						</div>
					</div>
				</DetailWrapper>
			</div>

			{children}
		</div>
	);
};
