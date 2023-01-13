import React from "react";
import { useTranslation } from "react-i18next";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useFormContext } from "react-hook-form";
import cn from "classnames";

import { MigrationAmountBox } from "@/domains/migration/components/MigrationAmountBox";
import { MigrationAddress } from "@/domains/migration/components/MigrationAddress";
import { MigrationPolygonIcon } from "@/domains/migration/components/MigrationPolygonIcon";
import { Header } from "@/app/components/Header";

export const MigrationReview = ({
	fee,
	wallet,
	migrationAddress,
	className,
}: {
	fee: number;
	wallet: Contracts.IReadWriteWallet;
	migrationAddress: string;
	className?: string;
}) => {
	const { t } = useTranslation();

	return (
		<div className={cn("space-y-3 sm:-mx-5", className)} data-testid="MigrationReview">
			<div className="relative rounded-lg border border-theme-secondary-300 dark:border-theme-secondary-800">
				<MigrationAddress address={wallet.address()} label={t("MIGRATION.MIGRATION_ADD.FROM_ARK_ADDRESS")} />

				<div className="relative border-t border-theme-secondary-300 dark:border-theme-secondary-800">
					<div className="absolute top-1/2 right-6 flex h-11 w-11 -translate-y-1/2 items-center justify-center">
						<MigrationPolygonIcon />
					</div>
				</div>

				<MigrationAddress
					address={migrationAddress}
					label={t("MIGRATION.MIGRATION_ADD.TO_POLYGON_ADDRESS")}
					isEthereum
				/>
			</div>

			<MigrationAmountBox amount={wallet.balance()} fee={fee} ticker={wallet.currency()} />
		</div>
	);
};

export const MigrationReviewStep = () => {
	const { t } = useTranslation();

	const { getValues } = useFormContext();
	const { fee, migrationAddress, wallet } = getValues(["fee", "migrationAddress", "wallet"]);

	return (
		<>
			<Header
				title={t("MIGRATION.MIGRATION_ADD.STEP_REVIEW.TITLE")}
				subtitle={t("MIGRATION.MIGRATION_ADD.STEP_REVIEW.DESCRIPTION")}
				className="mb-6"
				headerClassName="text-lg sm:text-2xl"
			/>

			<MigrationReview fee={fee} migrationAddress={migrationAddress} wallet={wallet} />
		</>
	);
};
