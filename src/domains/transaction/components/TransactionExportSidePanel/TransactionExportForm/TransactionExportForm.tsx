import React, { JSX, useEffect, useState } from "react";
import { BasicSettings, CSVSettings, ColumnSettings } from ".";
import { TransactionExportFormProperties } from "@/domains/transaction/components/TransactionExportSidePanel";

export const TransactionExportForm = ({ wallets, profile }: TransactionExportFormProperties): JSX.Element => {
	const [minStartDate, setMinStartDate] = useState<Date | undefined>();

	useEffect(() => {
		const wallet = wallets.at(0);

		if (!wallet) {
			return;
		}

		const fetchFirstTransaction = async () => {
			let date: Date | undefined = new Date(
				wallet.manifest().get<object>("networks")[wallet.networkId()].constants.epoch,
			);

			const queryParameters = {
				identifiers: wallets.map((wallet) => ({
					type: "address",
					value: wallet.address(),
				})),
				limit: 1,
				orderBy: "timestamp:asc",
				page: 1,
			};

			try {
				// @ts-ignore
				const transactions = await profile.transactionAggregate().all(queryParameters);
				date = transactions.first().timestamp()?.toDate();
			} catch {
				//
			}

			setMinStartDate(date);
		};

		void fetchFirstTransaction();
	}, [profile, wallets]);

	const showFiatColumn = !!wallets.at(0)?.network().isLive();

	return (
		<div data-testid="TransactionExportForm">
			<BasicSettings minStartDate={minStartDate} />

			<CSVSettings />

			<ColumnSettings showFiatColumn={showFiatColumn} />
		</div>
	);
};
