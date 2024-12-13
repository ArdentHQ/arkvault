import React from "react";
import { Circle } from "@/app/components/Circle";
import { Icon } from "@/app/components/Icon";
import { useBreakpoint } from "@/app/hooks";

export const TransactionResponsiveIcon = ({ icon }: { icon: string }) => {
	const { isSm, isXs } = useBreakpoint();

	if (isXs || isSm) {
		return (
			<span className="text-theme-text dark:text-theme-secondary-600">
				<Icon name={icon} size="md" />
			</span>
		);
	}

	return (
		<Circle
			className="border-theme-text text-theme-text dark:border-theme-secondary-600 dark:text-theme-secondary-600"
			size="lg"
		>
			<Icon name={icon} size="lg" />
		</Circle>
	);
};

export const TransactionDelegateIcon = () => <TransactionResponsiveIcon icon="Delegate" />;
