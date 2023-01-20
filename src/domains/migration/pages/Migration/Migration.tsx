import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DTO } from "@ardenthq/sdk-profiles";
import { useTranslation } from "react-i18next";
import { generatePath, useHistory } from "react-router-dom";
import { ContractPausedAlert, MigrationHeader, MigrationNewMigrationMobileButton } from "./Migration.blocks";
import { MigrationDetails } from "@/domains/migration/pages/MigrationDetails/MigrationDetails";
import { Page, Section } from "@/app/components/Layout";
import { MigrationDisclaimer } from "@/domains/migration/components/MigrationDisclaimer";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import { MigrationTransactionsTable } from "@/domains/migration/components/MigrationTransactionsTable";
import { ProfilePaths } from "@/router/paths";
import { useMigrationTransactions } from "@/domains/migration/hooks/use-migration-transactions";
import { useConfiguration, useMigrations } from "@/app/contexts";
import { Migration as MigrationTransaction } from "@/domains/migration/migration.contracts";

export const Migration = () => {
	const { t } = useTranslation();
	const { isMd } = useBreakpoint();

	const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
	const history = useHistory();
	const profile = useActiveProfile();
	const { migrations, isLoading } = useMigrationTransactions({ profile });
	const { profileIsSyncing } = useConfiguration();
	const [transactions, setTransactions] = useState<DTO.ExtendedConfirmedTransactionData[]>([]);
	const { contractIsPaused } = useMigrations();
	const [expandedTransaction, setExpandedTransaction] = useState<DTO.ExtendedSignedTransactionData>();

	const isCompact = useMemo(() => !profile.appearance().get("useExpandedTables") || isMd, [profile, isMd]);

	const onNewMigrationHandler = () => {
		setIsDisclaimerOpen(true);
	};

	const confirmHandler = useCallback(() => {
		const path = generatePath(ProfilePaths.MigrationAdd, { profileId: profile.id() });
		history.push(path);
	}, [history, profile]);

	const loadTransactions = useCallback(async () => {
		const addresses = migrations
			.map((migration) => migration.address)
			.filter((address, index, self) => self.indexOf(address) === index);

		const transactions = await profile.transactionAggregate().sent({
			identifiers: addresses.map((address) => ({
				type: "address",
				value: address,
			})),
			limit: 1000,
		});

		console.log({
			identifiers: migrations.map((migration) => ({
				transactionType: "sent",
				type: "address",
				value: migration.address,
			})),
			migrations,
			transactions: transactions.items(),
		});
		setTransactions(transactions.items());
	}, [migrations, profile]);

	useEffect(() => {
		console.log({ transactions });
	}, [transactions]);

	useEffect(() => {
		if (profileIsSyncing) {
			return;
		}

		loadTransactions();
	}, [profileIsSyncing, loadTransactions]);

	const detailsHandler = useCallback(async (migrationTransaction: MigrationTransaction) => {
		console.log(await loadTransactions());

		return;
		// const transaction = latestTransactions.find((transaction) => transaction.id() === migrationTransaction.id);
		// console.log({ transaction });
		// setExpandedTransaction(transaction as unknown as DTO.ExtendedSignedTransactionData);
	}, []);

	if (expandedTransaction) {
		return (
			<MigrationDetails transaction={expandedTransaction} handleBack={() => setExpandedTransaction(undefined)} />
		);
	}

	return (
		<>
			<Page pageTitle={t("MIGRATION.PAGE_MIGRATION.TITLE")} isBackDisabled={true} data-testid="Migration">
				<ContractPausedAlert />

				<MigrationHeader onNewMigration={onNewMigrationHandler} contractIsPaused={contractIsPaused} />

				<Section className="mt-4">
					<MigrationTransactionsTable
						migrationTransactions={migrations}
						isCompact={isCompact}
						isLoading={isLoading}
						onClick={(migrationTransaction) => detailsHandler(migrationTransaction)}
					/>
				</Section>

				<MigrationNewMigrationMobileButton
					onNewMigration={onNewMigrationHandler}
					contractIsPaused={contractIsPaused}
				/>

				<MigrationDisclaimer
					isOpen={isDisclaimerOpen}
					onClose={() => setIsDisclaimerOpen(false)}
					onCancel={() => setIsDisclaimerOpen(false)}
					onConfirm={confirmHandler}
				/>
			</Page>
		</>
	);
};
