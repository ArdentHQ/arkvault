import React, { useRef } from "react";
import { twMerge } from "tailwind-merge";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";

export const AddressLabel = ({ children, className }: { children: string; className?: string }) => {
	const reference = useRef(null);

	return (
		<div
			ref={reference}
			className={twMerge("no-ligatures text-theme-secondary-900 dark:text-theme-text", className)}
		>
			<TruncateMiddleDynamic value={children} parentRef={reference} />
		</div>
	);
};
