import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { MobileCard } from "@/app/components/Table/Mobile/MobileCard";
import { MobileSection } from "@/app/components/Table/Mobile/MobileSection";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { Link } from "@/app/components/Link";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { MigrationTransaction } from "@/app/lib/mainsail/ledger.migrator";
import { Amount } from "@/app/components/Amount";
import { UpdateWalletNameForm } from "@/domains/wallet/components/UpdateWalletName/UpdateWalletNameForm";
import { Contracts } from "@/app/lib/profiles";

export const MigratedAddressRowMobile = ({
	profile,
	transaction,
}: {
	profile: Contracts.IProfile;
	transaction: MigrationTransaction;
}) => {
	const [editingWallet, setEditingWallet] = useState<Contracts.IReadWriteWallet | undefined>(undefined);
	const { t } = useTranslation();

	return (
		<MobileCard className="mb-3" data-testid="MigratedAddressRowMobile">
			<div className="dim:bg-theme-dim-950 dark:bg-theme-dark-950 flex h-10 w-full items-center justify-between px-4">
				<div className="max-w-32">
					<div className="text-sm font-semibold">{transaction.recipient()?.alias()}</div>
				</div>
				<div className="flex h-full items-center">
					<Button
						variant="transparent"
						onClick={() => setEditingWallet(transaction.recipient())}
						className="text-theme-primary-600 dark:text-theme-secondary-500 dim:text-theme-dim-500 pr-3!"
					>
						<Icon name="Pencil" />
						<span>{t("COMMON.EDIT")}</span>
					</Button>
				</div>
			</div>

			<div className="flex w-full flex-col gap-4 px-4 pt-3 pb-4 sm:grid sm:grid-cols-[200px_auto_130px] sm:pb-4">
				<MobileSection title={t("COMMON.ADDRESS")} className="w-full">
					<TruncateMiddle
						className="text-sm font-semibold"
						text={transaction.recipient()?.address()!}
						maxChars={14}
					/>
				</MobileSection>

				<MobileSection title={t("COMMON.ARK_BALANCE")} className="w-full">
					<Amount
						ticker={transaction.network().ticker()}
						value={transaction.amount()}
						className="font-semibold"
					/>
				</MobileSection>

				<MobileSection title={t("COMMON.TX_ID")} className="w-full">
					<Link to={transaction.signedTransaction()?.explorerLink()!} isExternal>
						{t("COMMON.VIEW")}
					</Link>
				</MobileSection>
			</div>

			{editingWallet && (
				<UpdateWalletNameForm
					className="dim:bg-theme-dim-950 dark:bg-theme-dark-950 mt-0 w-full space-y-2 px-4 py-3"
					wallet={editingWallet}
					profile={profile}
					onCancel={() => setEditingWallet(undefined)}
					onAfterSave={() => setEditingWallet(undefined)}
				>
					<div className="mt-0 flex items-center justify-end">
						<Button
							className="text-theme-primary-600 dark:text-theme-secondary-500 dim:text-theme-dim-500"
							variant="transparent"
							onClick={() => setEditingWallet(undefined)}
						>
							{t("COMMON.CANCEL")}
						</Button>

						<Button
							className="text-theme-primary-600 dark:text-theme-secondary-500 dim:text-theme-dim-500"
							variant="transparent"
							type="submit"
						>
							{t("COMMON.SAVE")}
						</Button>
					</div>
				</UpdateWalletNameForm>
			)}
		</MobileCard>
	);
};
