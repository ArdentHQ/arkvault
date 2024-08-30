import cn from "classnames";
import React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/Button";
import { Tooltip } from "@/app/components/Tooltip";
import { ButtonVariant } from "@/types";

interface VoteButtonProperties {
	index: number;
	disabled?: boolean;
	variant?: ButtonVariant;
	compactClassName: string;
	onClick?: () => void;
	isCompact?: boolean;
	children: React.ReactNode;
}

const CompactButton = ({ index, disabled, compactClassName, onClick, children }: VoteButtonProperties) => (
	<Button
		size="icon"
		variant="transparent"
		disabled={disabled}
		className={cn("-mr-3 py-3 w-full rounded-none sm:rounded sm:w-auto sm:py-0 text-sm", compactClassName)}
		onClick={onClick}
		data-testid={`DelegateRow__toggle-${index}`}
	>
		{children}
	</Button>
);

export const DelegateVoteButton = ({
	index,
	disabled,
	variant,
	compactClassName,
	onClick,
	isCompact,
	children,
}: VoteButtonProperties) => {
	const { t } = useTranslation();

	if (disabled) {
		return (
			<Tooltip content={t("VOTE.DELEGATE_TABLE.TOOLTIP.MAX_VOTES")} className={cn({ "-mr-3": isCompact })}>
				<span className="w-full sm:w-auto">
					{isCompact ? (
						<CompactButton disabled index={index} compactClassName={cn("relative", compactClassName)}>
							{children}
						</CompactButton>
					) : (
						<Button disabled variant="primary" data-testid={`DelegateRow__toggle-${index}`}>
							{children}
						</Button>
					)}
				</span>
			</Tooltip>
		);
	}

	if (isCompact) {
		return (
			<CompactButton index={index} compactClassName={cn("relative", compactClassName)} onClick={onClick}>
				{children}
			</CompactButton>
		);
	}

	return (
		<Button variant={variant} onClick={onClick} data-testid={`DelegateRow__toggle-${index}`}>
			{children}
		</Button>
	);
};
