import React, { MouseEvent } from "react";

import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";

interface TableRemoveButtonProperties extends JSX.IntrinsicAttributes {
	className?: string;
	isDisabled?: boolean;
	onClick: (event: MouseEvent) => void;
}

export const TableRemoveButton = ({
	className,
	isDisabled,
	onClick,
	...properties
}: TableRemoveButtonProperties) => {
	const handleClick = (event: MouseEvent) => {
		event.stopPropagation();
		event.preventDefault();

		if (!isDisabled) {
			onClick(event);
		}
	};

	return (
		<Button
			className={className}
			data-testid="TableRemoveButton--compact"
			variant="secondary-icon"
			disabled={isDisabled}
			isCompact
			onClick={handleClick}
			{...properties}
		>
			<Icon name="Trash" size="lg" />
		</Button>
	);
};
