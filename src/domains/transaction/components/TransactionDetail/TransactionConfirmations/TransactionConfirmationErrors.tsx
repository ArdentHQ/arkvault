import { useTranslation } from "react-i18next";

import { DTO } from "@/app/lib/mainsail";

export const TransactionConfirmationErrors = ({ transaction }: { transaction: DTO.RawTransactionData }) => {
	const { t } = useTranslation();

	if (transaction.data().receipt().error()) {
		return (
			<p className="border-t border-theme-danger-200 px-3 pt-2 font-semibold text-theme-secondary-700 dim:border-theme-danger-400 dim:text-theme-dim-200 dark:border-theme-secondary-800 dark:text-theme-secondary-500 sm:px-6 sm:pt-4">
				{t("TRANSACTION.TRANSACTION_EXECUTION_ERROR_WITH_MESSAGE", {
					error: transaction.data().receipt().prettyError(),
				})}
			</p>
		);
	}

	if (transaction.data().receipt().hasUnknownError()) {
		return (
			<p className="border-t border-theme-danger-200 px-3 pt-2 font-semibold text-theme-secondary-700 dim:border-theme-danger-400 dim:text-theme-dim-200 dark:border-theme-secondary-800 dark:text-theme-secondary-500 sm:px-6 sm:pt-4">
				{t("TRANSACTION.TRANSACTION_EXECUTION_ERROR")}
			</p>
		);
	}

	return <></>;
};
