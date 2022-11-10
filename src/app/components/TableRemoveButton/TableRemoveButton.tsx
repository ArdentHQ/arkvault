import React, { MouseEvent } from "react";

import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";

interface TableRemoveButtonProperties extends JSX.IntrinsicAttributes {
	className?: string;
	isCompact?: boolean;
	isDisabled?: boolean;
	onClick: (event: MouseEvent) => void;
}

export const TableRemoveButton = ({
	className,
	isCompact,
	isDisabled,
	onClick,
	...properties
}: TableRemoveButtonProperties) => {
	const handleClick = (event: MouseEvent) => {
		if (isDisabled) {
			return;
		}

		onClick(event);
	};

	if (isCompact) {
		return (
			<Button
				className={className}
				data-testid="TableRemoveButton--compact"
				variant="danger-icon"
				disabled={isDisabled}
				onClick={handleClick}
				{...properties}
			>
				<Icon name="Trash" />
			</Button>
		);
	}

	return (
		<Button
			className={className}
			data-testid="TableRemoveButton"
			variant="danger"
			disabled={isDisabled}
			onClick={handleClick}
			{...properties}
		>
			<Icon name="Trash" size="lg" />
		</Button>
	);
};
