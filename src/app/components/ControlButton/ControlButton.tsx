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
			"relative flex cursor-pointer items-center justify-center py-2 font-semibold text-theme-secondary-700 transition-colors duration-200 focus:outline-none disabled:cursor-not-allowed disabled:text-theme-secondary-400 dark:text-theme-secondary-500 disabled:dark:text-theme-secondary-700",
			cn({
				"hover:bg-theme-primary-100 hover:text-theme-primary-700 hover:dark:text-theme-secondary-800 hover:dark:text-white":
					disabled || noBorder,
				"hover:border-b-theme-primary-400 hover:text-theme-primary-400 [&.active]:border-b-theme-primary-600 [&.active]:text-theme-primary-600 [&.active]:[&[data-focus-visible-added]]:rounded":
					!noBorder && !disabled,
				"hover:text-theme-primary-400": !disabled,
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
							"absolute right-1 top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-theme-background transition-all duration-100 ease-linear",
							{ "-mr-2.5": properties.noBorder },
						)}
					>
						<div className="h-2 w-2 rounded-full bg-theme-primary-500" />
					</div>
				)}
				{children}
			</>
		</ControlButtonStyled>
	</div>
);
