import React, { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { DTO } from "@ardenthq/sdk-profiles";
import { Amount } from "@/app/components/Amount";
import { Clipboard } from "@/app/components/Clipboard";
import { Header } from "@/app/components/Header";
import { Icon } from "@/app/components/Icon";
import { Image } from "@/app/components/Image";
import { Link } from "@/app/components/Link";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";
import { MigrationAddress, MigrationDetail } from "@/domains/migration/components/MigrationAddress";
import { polygonTransactionLink } from "@/utils/polygon-migration";

interface MigrationSuccessStepProperties {
	migrationTransaction: DTO.ExtendedSignedTransactionData;
}
export const MigrationSuccessStep: React.FC<MigrationSuccessStepProperties> = ({ migrationTransaction }) => {
	const { t } = useTranslation();

	const reference = useRef(null);

	const polygonId = useMemo(() => `0x${migrationTransaction.id()}`, [migrationTransaction]);

	return (
		<div data-testid="MigrationSuccessStep">
			<div className="flex flex-col">
				<Header
					title={t("MIGRATION.MIGRATION_ADD.STEP_SUCCESS.TITLE")}
					subtitle={t("MIGRATION.MIGRATION_ADD.STEP_SUCCESS.DESCRIPTION")}
					className="mx-auto text-center"
					headerClassName="text-lg sm:text-2xl"
				/>

				<div className="mx-auto my-6 max-w-2xl">
					<Image name="MigrationSuccessBanner" domain="migration" className="w-full" useAccentColor={false} />
				</div>
			</div>

			<div className="sm:-mx-5">
				<div className="flex flex-col rounded-xl border border-theme-secondary-300 dark:border-theme-secondary-800">
					<MigrationAddress
						label={t("MIGRATION.POLYGON_ADDRESS")}
						address={migrationTransaction.memo() || ""}
					/>

					<div className="relative border-t border-theme-secondary-300 dark:border-theme-secondary-800">
						<div className="absolute top-1/2 right-6 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-theme-secondary-300 bg-theme-background dark:border-theme-secondary-800">
							<div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-theme-navy-600 bg-theme-navy-100 text-theme-navy-600 dark:bg-transparent">
								<Icon name="CheckmarkSmall" size="sm" />
							</div>
						</div>
					</div>

					<MigrationDetail label={t("COMMON.AMOUNT")}>
						<Amount value={migrationTransaction.amount()} ticker="ARK" className="text-lg font-semibold" />
					</MigrationDetail>
				</div>

				<div className="mt-3 flex overflow-hidden rounded-xl">
					<div className="flex flex-1 flex-col bg-theme-secondary-100 p-5 dark:bg-black">
						<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
							{t("MIGRATION.TRANSACTION_ID")}
						</span>
						<span ref={reference} className="overflow-hidden">
							<Link
								to={polygonTransactionLink(polygonId)}
								tooltip={polygonId}
								showExternalIcon={false}
								isExternal
							>
								<TruncateMiddleDynamic value={polygonId} parentRef={reference} />
							</Link>
						</span>
					</div>

					<div className="flex items-center bg-theme-navy-100 px-5 text-theme-navy-600 dark:bg-theme-secondary-800 dark:text-theme-secondary-200">
						<Clipboard variant="icon" data={polygonId}>
							<Icon name="Copy" />
						</Clipboard>
					</div>
				</div>
			</div>
		</div>
	);
};
