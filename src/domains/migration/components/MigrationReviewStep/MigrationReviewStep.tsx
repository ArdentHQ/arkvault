import React from "react";
import { useTranslation } from "react-i18next";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useFormContext } from "react-hook-form";
import { MigrationPolygonIcon } from "./MigrationReviewStep.blocks";
import MigrationStep from "@/domains/migration/components/MigrationStep";
import { MigrationAmountBox } from "@/domains/migration/components/MigrationAmountBox";
import { MigrationAddress } from "@/domains/migration/components/MigrationAddress";

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
						className="w-5/6"
						address={wallet.address()}
						label={t("MIGRATION.MIGRATION_ADD.STEP_REVIEW.FROM_ARK_ADDRESS")}
					/>

					<div className="border-t border-theme-secondary-300 dark:border-theme-secondary-800" />

					<MigrationAddress
						address={getValues("receiverAddress")}
						isEthereum
						label={t("MIGRATION.MIGRATION_ADD.STEP_REVIEW.TO_POLYGON_ADDRESS")}
					/>
					<MigrationPolygonIcon />
				</div>

				<MigrationAmountBox amount={wallet.balance()} fee={getValues("fee")} ticker={wallet.currency()} />
			</div>
		</MigrationStep>
	);
};
