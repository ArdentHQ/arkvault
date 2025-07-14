import React from "react";

import cn from "classnames";
import { twMerge } from "tailwind-merge";

interface StepIndicatorProperties extends React.HTMLAttributes<HTMLDivElement> {
	activeIndex?: number;
	steps: string[];
}

const StepStyled = ({ isActive, ...props }: React.HTMLProps<HTMLLIElement> & { isActive: boolean }) => (
	<li
		{...props}
		className={twMerge(
			"h-1 flex-1 rounded-[4px] transition-colors duration-300",
			cn({
				"bg-theme-primary-100 dark:bg-theme-secondary-800 dim:bg-theme-dim-700": !isActive,
				"bg-theme-warning-300": isActive,
			}),
			props.className,
		)}
	/>
);

export const StepIndicator: React.FC<StepIndicatorProperties> = ({
	activeIndex = 1,
	steps,
	className,
	...props
}: StepIndicatorProperties) => {
	if (steps.length === 0) {
		return <></>;
	}

	return (
		<div className={cn("flex flex-col", className)} {...props}>
			<ul className="flex flex-row gap-2">
				{steps.map((_, index) => (
					<StepStyled key={index} isActive={activeIndex >= index + 1} />
				))}
			</ul>
		</div>
	);
};
