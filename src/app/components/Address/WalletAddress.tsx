import cn from "classnames";

import { TruncateEnd } from "@/app/components/TruncateEnd";
import { MiddleTruncation } from "@/app/components/MiddleTruncation";
import { CopyButton } from "./CopyButton";

interface Properties {
	walletName?: string;
	address: string;
	showCopyButton?: boolean;
}

export const WalletAddress = ({ walletName, address, showCopyButton }: Properties) => {
	return (
		<div className="flex w-full min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap">
			{walletName && (
				<span data-testid="WalletAddress__alias" className="text-base font-semibold text-theme-text">
					<TruncateEnd text={walletName} maxChars={16} showTooltip={walletName.length > 16} />
				</span>
			)}

			<div className="min-w-0 grow">
				<MiddleTruncation
					data-testid="WalletAddress__address"
					className={cn("font-semibold", {
						"text-base text-theme-secondary-500 dim:text-theme-dim-200 dark:text-theme-secondary-700":
							walletName,
						"text-base text-theme-text": !walletName,
					})}
				>
					{address}
				</MiddleTruncation>
			</div>

			{showCopyButton && (
				<div className="shrink-0">
					<CopyButton value={address} />
				</div>
			)}
		</div>
	);
};
