import cn from "classnames";
import React, { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { DateTime } from "@ardenthq/sdk-intl";
import { Amount } from "@/app/components/Amount";
import { Button } from "@/app/components/Button";
import { FormButtons } from "@/app/components/Form";
import { Image } from "@/app/components/Image";
import { useActiveProfile, useBreakpoint, useTheme } from "@/app/hooks";
import MigrationStep from "@/domains/migration/components/MigrationStep";
import { useTimeFormat } from "@/app/hooks/use-time-format";
import { MigrationPolygonIcon } from "@/domains/migration/components/MigrationPolygonIcon";
import { MigrationAddress, MigrationDetail } from "@/domains/migration/components/MigrationAddress";

const migrationTransaction: any = {
	address: "AXzxJ8Ts3dQ2bvBR1tPE7GUee9iSEJb8HX",
	amount: 2,
	id: "id",
	migrationAddress: "0x11f3f6b4ebdf0379b7b4ba6fe132863fddf7d63b",
	timestamp: Date.now() / 1000,
};

const POLYGON_API_URL = import.meta.env.VITE_POLYGON_API_URL || "https://api-testnet.polygonscan.com/api";
const POLYGON_CONTRACT_ADDRESS =
	import.meta.env.VITE_POLYGON_CONTRACT_ADDRESS || "0x965100B9e75e76d421a497255756DEbD4c68a143";
const POLYGON_START_BLOCK = Number.parseInt(import.meta.env.VITE_POLYGON_START_BLOCK);

interface PolygonTransferEvent {
	blockNumber: string;
	timeStamp: string;
	hash: string;
	nonce: string;
	blockHash: string;
	from: string;
	contractAddress: string;
	to: string;
	value: string;
	tokenName: string;
	tokenSymbol: string;
	tokenDecimal: string;
	transactionIndex: string;
	gas: string;
	gasPrice: string;
	gasUsed: string;
	cumulativeGasUsed: string;
	input: string;
	confirmations: string;
}
interface PolygonResponse {
	status: string;
	message: string;
	result: PolygonTransferEvent[];
}

export const MigrationPendingStep: React.FC = () => {
	const timeFormat = useTimeFormat();

	const { t } = useTranslation();
	const { isXs } = useBreakpoint();
	const { isDarkMode } = useTheme();

	const activeProfile = useActiveProfile();
	const history = useHistory();

	const ButtonWrapper = isXs ? FormButtons : React.Fragment;

	const fetchTransaction = async () => {
		try {
			const response = await fetch(
				`${POLYGON_API_URL}?module=account&action=tokentx&page=1&sort=asc&startblock=${POLYGON_START_BLOCK}&contractaddress=${POLYGON_CONTRACT_ADDRESS}&address=${migrationTransaction.migrationAddress}`,
			);

			const { result }: PolygonResponse = await response.json();

			const transaction = result.find((transaction) => {
				const value =
					Number.parseInt(transaction.value) / (10 ** Number.parseInt(transaction.tokenDecimal) - 1);

				return value === migrationTransaction.amount;
			});

			// If transaction with the same amount is not found and more than
			// one transaction found try again in 5 seconds
			if (transaction === undefined && result.length > 1) {
				setTimeout(() => {
					fetchTransaction();
				}, 5000);
			} else {
				alert("Transaction found, go to next step?. See console for details.");

				console.log({ transaction });
			}
		} catch (error) {
			// @TODO: remove this and properly handle error
			// (send to error page?)
			console.error(error);
		}
	};

	useEffect(() => {
		fetchTransaction();
	}, []);

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
