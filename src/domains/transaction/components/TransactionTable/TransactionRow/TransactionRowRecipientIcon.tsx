import React from "react";

import { Avatar } from "@/app/components/Avatar";
import { Icon } from "@/app/components/Icon";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";

interface Properties {
	type: string;
	recipient?: string;
}

export const TransactionRowRecipientIcon = ({ type, recipient, }: Properties) => {
	const { getIcon } = useTransactionTypes();

	const shadowClasses =
		"ring-theme-background bg-theme-background group-hover:ring-theme-secondary-100 group-hover:bg-theme-secondary-100 dark:group-hover:ring-black dark:group-hover:bg-black";

	if (type === "transfer") {
		return <Avatar size="xs" address={recipient} className={shadowClasses} noShadow />;
	}

	return (
		<span
			data-testid="TransactionRowRecipientIcon"
			className="flex h-5 w-5 items-center justify-center text-theme-text dark:text-theme-secondary-600"
		>
			<Icon name={getIcon(type)} size="lg" />
		</span>
	);
};
