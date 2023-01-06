import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { DateTime } from "@ardenthq/sdk-intl";
import { Amount } from "@/app/components/Amount";
import { Button } from "@/app/components/Button";
import { FormButtons } from "@/app/components/Form";
import { Image } from "@/app/components/Image";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import MigrationStep from "@/domains/migration/components/MigrationStep";
import { useTimeFormat } from "@/app/hooks/use-time-format";
import { MigrationPolygonIcon } from "@/domains/migration/components/MigrationPolygonIcon";
import { MigrationAddress, MigrationDetail } from "@/domains/migration/components/MigrationAddress";

const migrationTransaction: any = {
	address: "AXzxJ8Ts3dQ2bvBR1tPE7GUee9iSEJb8HX",
	amount: 123,
	id: "id",
	migrationAddress: "0x0000000000000000000000000000000000000000",
	timestamp: Date.now() / 1000,
};

export const MigrationPendingStep: React.FC = () => {
	const timeFormat = useTimeFormat();

	const { t } = useTranslation();
	const { isXs } = useBreakpoint();

	const activeProfile = useActiveProfile();
	const history = useHistory();

	const ButtonWrapper = isXs ? FormButtons : React.Fragment;

	return (
		<MigrationStep
			title={t("MIGRATION.MIGRATION_ADD.STEP_PENDING.TITLE")}
			description={t("MIGRATION.MIGRATION_ADD.STEP_PENDING.DESCRIPTION")}
		>
			<div className="my-5 flex flex-col">
				<div className="mx-auto mb-6 w-full sm:px-5">
					<Image name="MigrationPendingBanner" domain="migration" className="w-full" useAccentColor={false} />
				</div>

				<div className="flex flex-col rounded-xl border border-theme-secondary-300 dark:border-theme-secondary-800">
					<MigrationDetail label={t("COMMON.DATE")} className="px-5 pt-6 pb-5">
						<span className="font-semibold">
							{DateTime.fromUnix(migrationTransaction.timestamp).format(timeFormat)}
						</span>
					</MigrationDetail>

					<MigrationAddress
						address={migrationTransaction.address}
						className="px-5 pb-6"
						label={t("MIGRATION.MIGRATION_ADD.FROM_ARK_ADDRESS")}
					/>

					<div className="relative border-t border-theme-secondary-300 dark:border-theme-secondary-800">
						<div className="absolute top-1/2 right-6 flex h-11 w-11 -translate-y-1/2 items-center justify-center">
							<MigrationPolygonIcon />
						</div>
					</div>

					<MigrationAddress
						address={migrationTransaction.migrationAddress}
            className="px-5 pt-6 pb-5"
						label={t("MIGRATION.MIGRATION_ADD.TO_POLYGON_ADDRESS")}
						isEthereum
					/>

					<MigrationDetail label={t("COMMON.AMOUNT")} className="px-5 pb-6">
						<Amount value={migrationTransaction.amount} ticker="ARK" className="text-lg font-semibold" />
					</MigrationDetail>
				</div>

				<div className="mt-3 flex items-center justify-between overflow-hidden rounded-xl bg-theme-secondary-100 p-5 dark:bg-black">
					<span className="whitespace-pre-line text-sm">
						<Trans i18nKey="MIGRATION.MIGRATION_ADD.STEP_PENDING.MIGRATION_INFO" />
					</span>

					<ButtonWrapper>
						<Button
							variant="primary"
							onClick={() => history.push(`/profiles/${activeProfile.id()}/dashboard`)}
							className="my-auto whitespace-nowrap"
						>
							{t("COMMON.BACK_TO_DASHBOARD")}
						</Button>
					</ButtonWrapper>
				</div>
			</div>
		</MigrationStep>
	);
};
