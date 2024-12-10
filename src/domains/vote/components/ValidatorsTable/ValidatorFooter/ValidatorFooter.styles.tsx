import React from "react";
import { Circle } from "@/app/components/Circle";
import { twMerge } from "tailwind-merge";
import cn from "classnames";

export const LabelWrapper = ({ ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div {...props} className="text-xs leading-[17px] text-theme-secondary-700 sm:text-sm" />
);

export const TextWrapper = ({ disabled, ...props }: React.HTMLAttributes<HTMLDivElement> & { disabled?: boolean }) => (
	<div
		{...props}
		className={twMerge(
			"leading-5",
			cn({
				"text-theme-secondary-500 dark:text-theme-secondary-700": disabled,
				"text-theme-text": !disabled,
			}),
		)}
	/>
);

export const StyledCircle = ({ disabled, ...props }: React.ComponentProps<typeof Circle> & { disabled?: boolean }) => (
	<Circle
		{...props}
		className={twMerge(
			cn({
				"border-theme-secondary-900 text-theme-secondary-900 dark:border-theme-secondary-600 dark:text-theme-secondary-600":
					!disabled,
				"border-theme-secondary-500 text-theme-secondary-500 dark:border-theme-secondary-700 dark:text-theme-secondary-700":
					disabled,
			}),
		)}
	/>
);
