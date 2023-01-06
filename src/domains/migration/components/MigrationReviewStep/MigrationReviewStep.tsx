import React from "react";
import { useTranslation } from "react-i18next";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useFormContext } from "react-hook-form";
import MigrationStep from "@/domains/migration/components/MigrationStep";
import { MigrationAmountBox } from "@/domains/migration/components/MigrationAmountBox";
import { MigrationAddress } from "@/domains/migration/components/MigrationAddress";
import { MigrationPolygonIcon } from "@/domains/migration/components/MigrationPolygonIcon";

export const MigrationReviewStep = ({
	wallet,
	onContinue,
	onBack,
}: {
	wallet: Contracts.IReadWriteWallet;
	onContinue: () => void;
	onBack: () => void;
}) => {
	const { t } = useTranslation();
	const { getValues } = useFormContext();

	return (
		<MigrationStep
			title={t("MIGRATION.MIGRATION_ADD.STEP_REVIEW.TITLE")}
			description={t("MIGRATION.MIGRATION_ADD.STEP_REVIEW.DESCRIPTION")}
			onBack={onBack}
			onContinue={onContinue}
			isValid
		>
			<div className="space-y-3">
				<div className="relative rounded-lg border border-theme-secondary-300 dark:border-theme-secondary-800">
					<MigrationAddress
						address={wallet.address()}
						label={t("MIGRATION.MIGRATION_ADD.FROM_ARK_ADDRESS")}
					/>

					<div className="relative border-t border-theme-secondary-300 dark:border-theme-secondary-800">
						<div className="absolute top-1/2 right-6 h-11 w-11 -translate-y-1/2 flex items-center justify-center">
              <MigrationPolygonIcon />
						</div>
					</div>

					<MigrationAddress
						address={getValues("receiverAddress")}
						isEthereum
						label={t("MIGRATION.MIGRATION_ADD.TO_POLYGON_ADDRESS")}
					/>
				</div>

				<MigrationAmountBox amount={wallet.balance()} fee={getValues("fee")} ticker={wallet.currency()} />
			</div>
		</MigrationStep>
	);
};
