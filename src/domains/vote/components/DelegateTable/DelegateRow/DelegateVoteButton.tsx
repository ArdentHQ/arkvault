import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/Button";
import { ButtonVariant } from "@/types";
import { Tooltip } from "@/app/components/Tooltip";
import { selectDelegateValidatorTranslation } from "@/domains/wallet/utils/selectDelegateValidatorTranslation";

interface VoteButtonProperties {
	index: number;
	disabled?: boolean;
	variant?: ButtonVariant;
	compactClassName: string;
	onClick?: () => void;
	isCompact?: boolean;
	children: React.ReactNode;
}

type DelegateVoteButtonProperties = VoteButtonProperties & { selectedWallet: Contracts.IReadWriteWallet };

const CompactButton = ({ index, disabled, compactClassName, onClick, children }: VoteButtonProperties) => (
	<Button
		size="icon"
		variant="transparent"
		disabled={disabled}
		className={cn("-mr-3", compactClassName)}
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
	selectedWallet,
}: DelegateVoteButtonProperties) => {
	const { t } = useTranslation();

	if (disabled) {
		return (
			<Tooltip
				content={selectDelegateValidatorTranslation({
					delegateStr: t("VOTE.DELEGATE_TABLE.TOOLTIP.MAX_VOTES_DELEGATE"),
					network: selectedWallet.network(),
					validatorStr: t("VOTE.DELEGATE_TABLE.TOOLTIP.MAX_VOTES"),
				})}
				className={cn({ "-mr-3": isCompact })}
			>
				<span>
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
