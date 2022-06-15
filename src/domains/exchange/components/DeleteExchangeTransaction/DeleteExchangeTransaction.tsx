import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { DeleteResource } from "@/app/components/DeleteResource";
import { useEnvironmentContext } from "@/app/contexts";

interface DeleteExchangeTransactionProperties {
	isOpen: boolean;
	exchangeTransaction: Contracts.IExchangeTransaction;
	profile: Contracts.IProfile;
	onCancel?: any;
	onClose?: any;
	onDelete?: (exchangeTransaction: Contracts.IExchangeTransaction) => void;
}

export const DeleteExchangeTransaction = ({
	isOpen = false,
	exchangeTransaction,
	profile,
	onCancel,
	onClose,
	onDelete,
}: DeleteExchangeTransactionProperties) => {
	const { t } = useTranslation();

	const { persist } = useEnvironmentContext();

	const handleDelete = async () => {
		profile.exchangeTransactions().forget(exchangeTransaction.id());
		await persist();

		onDelete?.(exchangeTransaction);
	};

	return (
		<DeleteResource
			title={t("EXCHANGE.MODAL_DELETE_EXCHANGE_TRANSACTION.TITLE")}
			description={t("EXCHANGE.MODAL_DELETE_EXCHANGE_TRANSACTION.DESCRIPTION")}
			isOpen={isOpen}
			onClose={onClose}
			onCancel={onCancel}
			onDelete={handleDelete}
		/>
	);
};
