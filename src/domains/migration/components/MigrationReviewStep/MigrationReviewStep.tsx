import React from "react";
import { useTranslation } from "react-i18next";
import MigrationStep from "@/domains/migration/components/MigrationStep";
import { TotalAmountBox } from "@/domains/transaction/components/TotalAmountBox";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useFormContext } from "react-hook-form";
import { MigrationAddress } from "@/domains/migration/components/MigrationAddress";
import { MigrationPolygonIcon } from "./MigrationReviewStep.blocks";

export const MigrationReviewStep = ({
	wallet,
	onContinue,
	onCancel,
}: {
	wallet: Contracts.IReadWriteWallet;
	onContinue: () => void;
	onCancel: () => void;
}) => {
	const { t } = useTranslation();
	const { getValues } = useFormContext();

	return (
		<MigrationStep
			title={t("MIGRATION.MIGRATION_ADD.STEP_REVIEW.TITLE")}
			description={t("MIGRATION.MIGRATION_ADD.STEP_REVIEW.DESCRIPTION")}
			onCancel={onCancel}
			onContinue={onContinue}
			isValid
		>
			<div className="space-y-3">
				<div className="relative rounded-lg border border-theme-secondary-300 dark:border-theme-secondary-800">
					<MigrationAddress
						address={wallet.address()}
						label={t("MIGRATION.MIGRATION_ADD.STEP_REVIEW.FROM_ARK_ADDRESS")}
					/>
					<MigrationAddress
						className="border-t border-theme-secondary-300 p-4 dark:border-theme-secondary-800"
						address={getValues("receiverAddress")}
						isEthereum
						label={t("MIGRATION.MIGRATION_ADD.STEP_REVIEW.TO_POLYGON_ADDRESS")}
					/>
					<MigrationPolygonIcon />
				</div>

				<TotalAmountBox
					amount={wallet.balance()}
					fee={getValues("fee")}
					ticker={wallet.currency()}
					amountLabel={t("MIGRATION.MIGRATION_ADD.STEP_REVIEW.AMOUNT_SEND")}
					totalAmountLabel={t("MIGRATION.MIGRATION_ADD.STEP_REVIEW.AMOUNT_MIGRATED")}
					shouldSubtract
				/>
			</div>
		</MigrationStep>
	);
};
