import cn from "classnames";
import React from "react";

import { Avatar } from "@/app/components/Avatar";
import { Circle } from "@/app/components/Circle";
import { Icon } from "@/app/components/Icon";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";

interface Properties {
	type: string;
	recipient?: string;
	isCompact: boolean;
}

export const TransactionRowRecipientIcon = ({ type, recipient, isCompact }: Properties) => {
	const { getIcon } = useTransactionTypes();

	const size = isCompact ? "xs" : "lg";

	const shadowClasses =
		"ring-theme-background bg-theme-background group-hover:ring-theme-secondary-100 group-hover:bg-theme-secondary-100 dark:group-hover:ring-black dark:group-hover:bg-black";

	if (type === "transfer") {
		return <Avatar size={size} address={recipient} className={shadowClasses} noShadow={isCompact} />;
	}

	if (isCompact) {
		return (
			<span
				data-testid="TransactionRowRecipientIcon"
				className="flex h-5 w-5 items-center justify-center text-theme-text dark:text-theme-secondary-600"
			>
				<Icon name={getIcon(type)} size="lg" />
			</span>
		);
	}

	return (
		<Circle
			data-testid="TransactionRowRecipientIcon"
			size={size}
			className={cn(
				"border-theme-text text-theme-text dark:border-theme-secondary-600 dark:text-theme-secondary-600",
				shadowClasses,
			)}
		>
			<Icon name={getIcon(type)} size="lg" />
		</Circle>
	);
};
