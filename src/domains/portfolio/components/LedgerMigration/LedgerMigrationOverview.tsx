import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { Icon } from "@/app/components/Icon";
import { TransactionFee } from "./components/TransactionFee";
import { type DraftTransfer } from "@/app/lib/mainsail/draft-transfer";
import { Button } from "@/app/components/Button";
import { TransactionDetailId } from "./components/TransactionDetailId";
import { Contracts } from "@/app/lib/profiles";
import { UpdateWalletName } from "@/domains/wallet/components/UpdateWalletName";

export const LedgerMigrationOverview = ({
	profile,
	transfer,
	children,
}: {
	profile: Contracts.IProfile;
	transfer: DraftTransfer;
	children?: React.ReactElement;
}) => {
	const { t } = useTranslation();
	const [editingWallet, setEditingWallet] = useState<Contracts.IReadWriteWallet | undefined>(undefined);

	return (
		<div data-testid="LedgerMigration__Review-step">
			<div className="space-y-4">
				<DetailWrapper label={t("COMMON.DETAILS")}>
					<div className="space-y-3">
						<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
							<DetailTitle>{t("COMMON.ADDRESS")}</DetailTitle>
							<Address
								address={transfer.recipient()?.address()}
								showCopyButton
								walletNameClass="text-theme-text"
								wrapperClass="justify-end sm:justify-start"
							/>
						</div>

						<div className="flex w-full items-center justify-between gap-2 sm:justify-start">
							<DetailTitle>{t("COMMON.BALANCE")}</DetailTitle>
							<Amount
								ticker={transfer.network().ticker()}
								value={transfer.amount()}
								className="font-semibold"
							/>
						</div>
					</div>
				</DetailWrapper>

				<DetailWrapper label={t("COMMON.ADDRESS_NAME")}>
					<div className="flex items-center justify-between">
						<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
							<DetailTitle>{t("COMMON.NAME")}</DetailTitle>
							<p className="font-semibold">{transfer.recipient()?.displayName()}</p>
						</div>

						<Button
							data-testid="LedgerMigration__Review-edit"
							variant="transparent"
							onClick={() => setEditingWallet(transfer.recipient()!)}
							className="text-theme-primary-600 dark:text-theme-secondary-500 dim:text-theme-dim-500 p-0!"
						>
							<Icon name="Pencil" />
							<span>{t("COMMON.EDIT")}</span>
						</Button>
					</div>
				</DetailWrapper>

				<DetailWrapper
					label={t("TRANSACTION.TRANSACTION_DETAILS")}
					footer={
						<DetailTitle className="w-auto leading-4! sm:min-w-36 sm:text-sm">
							{t("COMMON.LEDGER_MIGRATION.DETAILS_IN_ARKSCAN")}
						</DetailTitle>
					}
				>
					<div className="space-y-3">
						<div className="flex w-full items-center justify-between gap-2 sm:justify-start">
							<DetailTitle>{t("COMMON.TX_ID")}</DetailTitle>
							<TransactionDetailId transaction={transfer.signedTransaction()!} />
						</div>

						<div className="flex w-full items-center justify-between gap-2 sm:justify-start">
							<DetailTitle>{t("COMMON.FEE")}</DetailTitle>
							<TransactionFee transfer={transfer} />
						</div>
					</div>
				</DetailWrapper>
			</div>

			{children}

			{editingWallet && (
				<UpdateWalletName
					wallet={editingWallet}
					profile={profile}
					onCancel={() => setEditingWallet(undefined)}
					onAfterSave={() => setEditingWallet(undefined)}
				/>
			)}
		</div>
	);
};
