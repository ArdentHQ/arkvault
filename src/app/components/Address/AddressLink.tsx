import { twMerge } from "tailwind-merge";
import { MiddleTruncate } from "@/app/components/MiddleTruncate";

export const AddressLabel = ({ children, className }: { children: string; className?: string }) => (
		<div className={twMerge("no-ligatures text-theme-secondary-900 dark:text-theme-text", className)}>
			<MiddleTruncate text={children} />
		</div>
	);
