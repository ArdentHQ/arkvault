import React from "react";
import { Circle } from "@/app/components/Circle";
import { twMerge } from "tailwind-merge";
import cn from "classnames";

export const LabelWrapper = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		{...props}
		className={twMerge(
			"text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 text-sm sm:text-base",
			className,
		)}
	/>
);

export const TextWrapper = ({ disabled, ...props }: React.HTMLAttributes<HTMLDivElement> & { disabled?: boolean }) => (
	<div
		{...props}
		className={twMerge(
			"text-sm sm:text-base",
			cn({
				"text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-500": disabled,
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
				"border-theme-secondary-500 text-theme-secondary-500 dark:border-theme-secondary-700 dark:text-theme-secondary-700 dim:border-theme-dim-700 dim:text-theme-dim-500":
					disabled,
				"border-theme-secondary-900 text-theme-secondary-900 dark:border-theme-secondary-600 dark:text-theme-secondary-600 dim:border-theme-dim-700 dim:text-theme-dim-500":
					!disabled,
			}),
		)}
	/>
);
