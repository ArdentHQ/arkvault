import { useBalanceVisibilityContext } from "@/app/contexts/BalanceVisibility";
import { Icon } from "@/app/components/Icon";
import { twMerge } from "tailwind-merge";
import { Button } from "@/app/components/Button";

export const HideBalance = ({ className }: { className?: string;}) => {
	const { hideBalance, setHideBalance } = useBalanceVisibilityContext();

	return (
		<div className={twMerge("flex items-center gap-2 space-x-0 m-0", className)}>
			<Button variant="transparent" onClick={() => setHideBalance(!hideBalance)} className="p-0 text-theme-secondary-700 dark:text-theme-dark-200" data-testid="HideBalance-button">
				{hideBalance ? (
					<Icon name="EyeSlash" size="lg" data-testid="HideBalance-icon-hide" />
				) : (
					<Icon name="Eye" size="lg" data-testid="HideBalance-icon-show" />
				)}
			</Button>
		</div>
	);
};
