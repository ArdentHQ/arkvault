import React, { useRef } from "react";
import { twMerge } from "tailwind-merge";
import { MiddleTruncation } from "@/app/components/MiddleTruncation";

export const AddressLabel = ({ children, className }: { children: string; className?: string }) => {
	const reference = useRef(null);

	return (
		<div
			ref={reference}
			className={twMerge("no-ligatures text-theme-secondary-900 dark:text-theme-text", className)}
		>
			<MiddleTruncation>{children}</MiddleTruncation>
		</div>
	);
};
