import cn from "classnames";

import { TruncateEnd } from "@/app/components/TruncateEnd";
import { MiddleTruncation } from "@/app/components/MiddleTruncation";
import { CopyButton } from "./CopyButton";

interface Properties {
	walletName?: string;
	address?: string;
	showCopyButton?: boolean;
	wrapperClass?: string;
	walletNameClass?: string;
	addressClass?: string;
	showTooltip?: boolean;
}

export const Address = ({
	walletName,
	address,
	showCopyButton,
	wrapperClass,
	walletNameClass,
	addressClass,
	showTooltip,
}: Properties) => (
	<div className={cn("flex w-full min-w-0 items-center overflow-hidden whitespace-nowrap", wrapperClass)}>
		{walletName && (
			<span
				data-testid="Address__alias"
				className={cn("mr-2 text-base font-semibold text-theme-text", walletNameClass)}
			>
				<TruncateEnd text={walletName} maxChars={16} showTooltip={walletName.length > 16} />
			</span>
		)}

		<div className="min-w-0 grow">
			<MiddleTruncation
				data-testid="Address__address"
				tooltip={showTooltip}
				className={cn("font-semibold", addressClass, {
					"text-base text-theme-secondary-500 dim:text-theme-dim-200 dark:text-theme-secondary-700":
						walletName,
					"text-base text-theme-text": !walletName,
				})}
			>
				{address ?? ""}
			</MiddleTruncation>
		</div>

		{showCopyButton && (
			<div className="ml-1 shrink-0">
				<CopyButton value={address!} />
			</div>
		)}
	</div>
);
