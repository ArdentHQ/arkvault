import cn from "classnames";
import React from "react";
import { twMerge } from "tailwind-merge";

const ControlButtonStyled = ({
	noBorder,
	disabled,
	...properties
}: React.ButtonHTMLAttributes<HTMLButtonElement> & ControlButtonProperties) => (
	<button
		{...properties}
		className={twMerge(
			"text-theme-secondary-700 disabled:text-theme-secondary-400 dark:text-theme-secondary-500 dark:disabled:text-theme-secondary-700 dim:text-theme-dim-500 dim:disabled:text-theme-secondary-600 relative flex cursor-pointer items-center justify-center py-2 font-semibold transition-colors duration-200 focus:outline-hidden disabled:cursor-not-allowed",
			cn({
				"hover:bg-theme-primary-100 hover:text-theme-primary-700 dark:hover:bg-theme-secondary-800 dim-hover:bg-theme-dim-700 dim-hover:text-theme-dim-50 dark:hover:text-white":
					disabled || noBorder,
				"hover:border-b-theme-primary-400 hover:text-theme-primary-400 dim-hover:border-b-theme-dim-navy-600 dim-hover:text-theme-dim-navy-600 [&.active]:border-b-theme-primary-600 [&.active]:text-theme-primary-600 [&.active]:data-focus-visible-added:rounded":
					!noBorder && !disabled,
				"hover:text-theme-primary-400 dim-hover:text-theme-dim-navy-600": !disabled,
				"mx-0.5 px-2.5": !noBorder,
				"rounded px-2 py-1.5": noBorder,
			}),
			properties.className,
		)}
	/>
);

type ControlButtonProperties = {
	isChanged?: boolean;
	noBorder?: boolean;
} & React.ButtonHTMLAttributes<any>;

export const ControlButton = ({ isChanged, children, className, ...properties }: ControlButtonProperties) => (
	<div className="group">
		<ControlButtonStyled className={cn("ring-focus", className)} {...properties}>
			<>
				{isChanged && (
					<div
						className={cn(
							"bg-theme-background absolute top-0.5 right-1 flex h-3 w-3 items-center justify-center rounded-full transition-all duration-100 ease-linear",
							{ "-mr-2.5": properties.noBorder },
						)}
					>
						<div className="bg-theme-primary-500 dim:bg-theme-dim-navy-600 h-2 w-2 rounded-full" />
					</div>
				)}
				{children}
			</>
		</ControlButtonStyled>
	</div>
);
