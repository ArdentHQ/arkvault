import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { BasicSettings, CSVSettings, ColumnSettings } from ".";
import { TransactionExportFormProperties } from "@/domains/transaction/components/TransactionExportModal";
import { Button } from "@/app/components/Button";
import { FormButtons } from "@/app/components/Form";
import { Contracts } from "@/app/lib/profiles";

export const TransactionExportForm = ({ wallets, onCancel, profile }: TransactionExportFormProperties) => {
	const { t } = useTranslation();

	const form = useFormContext();
	const { isDirty, isSubmitting, isValid } = form.formState;

	const [minStartDate, setMinStartDate] = useState<Date | undefined>();

	useEffect(() => {
		const fetchFirstTransaction = async () => {
			const wallet = wallets.at(0) as Contracts.IReadWriteWallet;

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

	const showFiatColumn = wallets[0].network().isLive();

	return (
		<div data-testid="TransactionExportForm">
			<BasicSettings minStartDate={minStartDate} />

			<CSVSettings />

			<ColumnSettings showFiatColumn={showFiatColumn} />

			<div className="modal-footer mt-4">
				<FormButtons>
					<Button
						variant="secondary"
						onClick={() => onCancel()}
						data-testid="TransactionExportForm__cancel-button"
					>
						{t("COMMON.CANCEL")}
					</Button>

					<Button
						type="submit"
						disabled={isSubmitting || (isDirty ? !isValid : false)}
						variant="primary"
						data-testid="TransactionExport__submit-button"
					>
						{t("COMMON.EXPORT")}
					</Button>
				</FormButtons>
			</div>
		</div>
	);
};
