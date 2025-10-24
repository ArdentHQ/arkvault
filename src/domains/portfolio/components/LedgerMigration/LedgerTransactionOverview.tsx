import React from "react";
import { useTranslation } from "react-i18next";

import { DetailLabelText, DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Label } from "@/app/components/Label";
import { Amount } from "@/app/components/Amount";
import { ConfirmationTimeFooter } from "@/domains/transaction/components/TotalAmountBox";
import { TransactionFee } from "./components/TransactionFee";
import { type DraftTransfer } from "@/app/lib/mainsail/draft-transfer";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";
import { Transactions } from "./components/Transactions";
import { LedgerAddressVerification } from "./components/LedgerAddressVerification";
import { Address } from "@/app/components/Address";
import cn from "classnames";

export const LedgerTransactionOverview = ({
	migrator,
	transfer,
	children,
	showStatusBanner,
	showVerification,
}: {
	transfer: DraftTransfer;
	onVerifyAddress?: () => void;
	children?: React.ReactElement;
	migrator: LedgerMigrator;
	showStatusBanner?: boolean;
	showVerification?: boolean;
}) => {
	const { t } = useTranslation();
	return (
		<div data-testid="LedgerMigration__Review-step">
			<div className="space-y-4 pb-10">
				{migrator.transactions().length > 1 && (
					<Transactions migrator={migrator} showStatusBanner={showStatusBanner} />
				)}

				{showVerification && <LedgerAddressVerification transfer={transfer} />}
				{!showVerification && (
					<DetailWrapper label={t("TRANSACTION.ADDRESSING")}>
						<div className="space-y-3">
							<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
								<DetailTitle>{t("COMMON.OLD")}</DetailTitle>
								<Address
									address={transfer.sender().address()}
									walletName={transfer.sender().displayName()}
									showCopyButton
									walletNameClass="text-theme-text text-sm sm:text-base"
									wrapperClass="justify-end sm:justify-start"
									addressClass={cn("text-sm sm:text-base w-full w-3/4", {
										"text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-200":
											!!transfer.sender().displayName(),
									})}
								/>
							</div>

							<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
								<DetailTitle>{t("COMMON.NEW")}</DetailTitle>
								<Address
									address={transfer.recipient()?.address()}
									showCopyButton
									walletNameClass="text-theme-text text-sm sm:text-base"
									wrapperClass="justify-end sm:justify-start w-full"
								/>
							</div>
						</div>
					</DetailWrapper>
				)}

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
					footer={<ConfirmationTimeFooter confirmationTime={transfer.confirmationTime("avg")} />}
				>
					<div className="space-y-3">
						<div className="flex w-full items-center justify-between gap-2 sm:justify-start">
							<DetailLabelText>{t("COMMON.AMOUNT")}</DetailLabelText>
							<Amount
								ticker={transfer.network().ticker()}
								value={transfer.amount()}
								className="text-sm font-semibold sm:text-base"
							/>
							<span className="text-theme-secondary-700 dark:text-theme-secondary-500">
								(
								<Amount
									ticker={transfer.sender().exchangeCurrency()}
									value={transfer.sender().convertedBalance()}
									className="text-sm font-semibold sm:text-base"
								/>
								)
							</span>
						</div>

						<div className="flex w-full items-center justify-between gap-2 sm:justify-start">
							<DetailLabelText>{t("COMMON.FEE")}</DetailLabelText>
							<TransactionFee transfer={transfer} />
						</div>
					</div>
				</DetailWrapper>
			</div>

			{children}
		</div>
	);
};
