import React from "react";

import { Circle } from "@/app/components/Circle";
import { Icon } from "@/app/components/Icon";
import { useBreakpoint } from "@/app/hooks";

export const TransactionIpfsIcon = () => {
	const { isSm, isXs } = useBreakpoint();

	if (isXs || isSm) {
		return (
			<span className="text-theme-text dark:text-theme-secondary-600">
				<Icon name="Ipfs" className="text-theme-secondary-900 dark:text-theme-secondary-600" size="md" />
			</span>
		);
	}

	return (
		<Circle
			className="border-theme-secondary-900 text-theme-secondary-900 dark:border-theme-secondary-600 dark:text-theme-secondary-600"
			size="lg"
		>
			<Icon name="Ipfs" className="text-theme-secondary-900 dark:text-theme-secondary-600" size="lg" />
		</Circle>
	);
};
