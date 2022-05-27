import React, { MouseEvent } from "react";

import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";

interface TableRemoveButtonProperties extends JSX.IntrinsicAttributes {
	className?: string;
	isCompact?: boolean;
	onClick: (event: MouseEvent) => void;
}

export const TableRemoveButton = ({ className, isCompact, onClick, ...properties }: TableRemoveButtonProperties) => {
	if (isCompact) {
		return (
			<Button
				className={className}
				data-testid="TableRemoveButton--compact"
				variant="danger-icon"
				onClick={onClick}
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
			onClick={onClick}
			{...properties}
		>
			<Icon name="Trash" size="lg" />
		</Button>
	);
};
