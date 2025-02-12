import React from "react";
import { Icon } from "@/app/components/Icon";
import { twMerge } from "tailwind-merge";
import { Button } from "@/app/components/Button";
import { useBalanceVisibility } from "@/app/hooks/use-balance-visibility";
import { Contracts } from "@ardenthq/sdk-profiles";

export const HideBalance = ({ profile, className }: { profile: Contracts.IProfile; className?: string }) => {
	const { hideBalance, setHideBalance } = useBalanceVisibility({ profile });

	return (
		<div className={twMerge("m-0 flex items-center gap-2 space-x-0", className)}>
			<Button
				variant="transparent"
				onClick={() => setHideBalance(!hideBalance)}
				className="p-0 text-theme-secondary-700 dark:text-theme-dark-200"
				data-testid="HideBalance-button"
			>
				{hideBalance ? (
					<Icon name="EyeSlash" size="lg" data-testid="HideBalance-icon-hide" />
				) : (
					<Icon name="Eye" size="lg" data-testid="HideBalance-icon-show" />
				)}
			</Button>
		</div>
	);
};
