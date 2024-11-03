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
	children: React.ReactNode;
}

const CompactButton = ({ index, disabled, compactClassName, onClick, children }: VoteButtonProperties) => (
	<Button
		size="icon"
		variant="transparent"
		disabled={disabled}
		className={cn(
			"-mr-3 w-full rounded-none py-3 text-sm leading-[17px] sm:w-auto sm:rounded sm:py-0 text-theme-primary-600 hover:text-theme-primary-700 dark:hover:text-theme-primary-500 hover:underline",
			compactClassName,
		)}
		onClick={onClick}
		data-testid={`DelegateRow__toggle-${index}`}
	>
		{children}
	</Button>
);

export const DelegateVoteButton = ({ index, disabled, compactClassName, onClick, children }: VoteButtonProperties) => {
	const { t } = useTranslation();

	if (disabled) {
		return (
			<Tooltip content={t("VOTE.DELEGATE_TABLE.TOOLTIP.MAX_VOTES")} className="-mr-3">
				<span className="w-full sm:w-auto">
					<CompactButton disabled index={index} compactClassName={cn("relative", compactClassName)}>
						{children}
					</CompactButton>
				</span>
			</Tooltip>
		);
	}

	return (
		<CompactButton index={index} compactClassName={cn("relative", compactClassName)} onClick={onClick}>
			{children}
		</CompactButton>
	);
};
