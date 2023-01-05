import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { DateTime } from "@ardenthq/sdk-intl";
import { Amount } from "@/app/components/Amount";
import { Address } from "@/app/components/Address";
import { Avatar, EthereumAvatar } from "@/app/components/Avatar";
import { Button } from "@/app/components/Button";
import { FormButtons } from "@/app/components/Form";
import { Image } from "@/app/components/Image";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import MigrationStep from "@/domains/migration/components/MigrationStep";
import { useTimeFormat } from "@/app/hooks/use-time-format";

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
			onCancel={() => {}}
			onContinue={() => {}}
			isValid={false}
		>
			<div className="my-5 flex flex-col">
        <div className="mx-auto w-full mb-6 sm:px-6">
					<Image
						name="MigrationPendingBanner"
						domain="migration"
						className="w-full"
						useAccentColor={false}
					/>
				</div>

				<div className="flex flex-col rounded-xl border border-theme-secondary-300 dark:border-theme-secondary-800">
					<div className="flex flex-col space-y-4 py-5 px-6">
						<div className="flex flex-col">
							<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
								{t("COMMON.DATE")}
							</span>
							<span className="font-semibold">
								{DateTime.fromUnix(migrationTransaction.timestamp).format(timeFormat)}
							</span>
						</div>

						<div className="flex flex-col">
							<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
								{t("MIGRATION.MIGRATION_ADD.STEP_PENDING.FROM_ADDRESS")}
							</span>
							<div className="flex items-center gap-x-2">
								<Avatar address={migrationTransaction.address} size="xs" />
								<Address address={migrationTransaction.address} />
							</div>
						</div>
					</div>

					<div className="relative border-t border-theme-secondary-300 dark:border-theme-secondary-800">
						<div className="absolute top-1/2 right-6 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-theme-background">
							{/* <MigrationPolygonIcon /> */}
						</div>
					</div>

					<div className="flex flex-col space-y-5 py-5 px-6">
						<div className="flex flex-col">
							<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
								{t("MIGRATION.MIGRATION_ADD.STEP_PENDING.TO_ADDRESS")}
							</span>
							<div className="flex items-center gap-x-2">
								<EthereumAvatar address={migrationTransaction.migrationAddress} size="xs" />
								<Address address={migrationTransaction.migrationAddress} />
							</div>
						</div>

						<div className="flex flex-col">
							<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
								{t("COMMON.AMOUNT")}
							</span>
							<Amount
								value={migrationTransaction.amount}
								ticker="ARK"
								className="text-lg font-semibold"
							/>
						</div>
					</div>
				</div>

				<div className="mt-3 flex justify-between overflow-hidden rounded-xl bg-theme-secondary-100 p-5 dark:bg-black">
					<span className="whitespace-pre-line">
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
