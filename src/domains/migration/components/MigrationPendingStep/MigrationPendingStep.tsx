import cn from "classnames";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { DTO } from "@ardenthq/sdk-profiles";
import { Amount } from "@/app/components/Amount";
import { Button } from "@/app/components/Button";
import { FormButtons } from "@/app/components/Form";
import { Image } from "@/app/components/Image";
import { useActiveProfile, useBreakpoint, useTheme } from "@/app/hooks";
import MigrationStep from "@/domains/migration/components/MigrationStep";
import { useTimeFormat } from "@/app/hooks/use-time-format";
import { MigrationPolygonIcon } from "@/domains/migration/components/MigrationPolygonIcon";
import { MigrationAddress, MigrationDetail } from "@/domains/migration/components/MigrationAddress";
import { assertSignedTransaction } from "@/utils/assertions";

export const MigrationPendingStep = ({ transaction }: { transaction?: DTO.ExtendedSignedTransactionData }) => {
	const timeFormat = useTimeFormat();

	const { t } = useTranslation();
	const { isXs } = useBreakpoint();
	const { isDarkMode } = useTheme();

	const activeProfile = useActiveProfile();
	const history = useHistory();

	const ButtonWrapper = isXs ? FormButtons : React.Fragment;
	assertSignedTransaction(transaction);

	return (
		<MigrationStep
			title={t("MIGRATION.MIGRATION_ADD.STEP_PENDING.TITLE")}
			description={t("MIGRATION.MIGRATION_ADD.STEP_PENDING.DESCRIPTION")}
		>
			<div className="my-5 flex flex-col">
				<div className="relative mx-auto mb-6 flex w-full items-center justify-between gap-x-5 sm:px-5">
					<Image name="MigrationPendingBanner" domain="migration" useAccentColor={false} className="w-full" />

					<div className="absolute inset-0 ml-[8%] mr-[5%] flex items-center justify-center">
						<div
							className={cn(
								"w-1/2 animate-move-bg-fast bg-gradient-to-r bg-500",
								isDarkMode
									? "from-theme-hint-400 via-theme-secondary-800 to-theme-hint-400"
									: "from-theme-hint-600 via-theme-secondary-300 to-theme-hint-600",
							)}
							style={{ clipPath: "url(#arrowsClipPath)" }}
						>
							<Image name="MigrationPendingBannerArrows" domain="migration" useAccentColor={false} />
						</div>
					</div>
				</div>

				<div className="flex flex-col rounded-xl border border-theme-secondary-300 dark:border-theme-secondary-800">
					<MigrationDetail label={t("COMMON.DATE")} className="px-5 pt-6 pb-5">
						<span className="font-semibold">{transaction.timestamp().format(timeFormat)}</span>
					</MigrationDetail>

					<MigrationAddress
						address={transaction.sender()}
						className="px-5 pb-6"
						label={t("MIGRATION.MIGRATION_ADD.FROM_ARK_ADDRESS")}
					/>

					<div className="relative border-t border-theme-secondary-300 dark:border-theme-secondary-800">
						<div className="absolute top-1/2 right-6 flex h-11 w-11 -translate-y-1/2 items-center justify-center">
							<MigrationPolygonIcon />
						</div>
					</div>

					<MigrationAddress
						address={transaction.memo() as string}
						className="px-5 pt-6 pb-5"
						label={t("MIGRATION.MIGRATION_ADD.TO_POLYGON_ADDRESS")}
						isEthereum
					/>

					<MigrationDetail label={t("COMMON.AMOUNT")} className="px-5 pb-6">
						<Amount value={transaction.amount()} ticker="ARK" className="text-lg font-semibold" />
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
							data-testid="BackToDashboard__button"
						>
							{t("COMMON.BACK_TO_DASHBOARD")}
						</Button>
					</ButtonWrapper>
				</div>
			</div>
		</MigrationStep>
	);
};
