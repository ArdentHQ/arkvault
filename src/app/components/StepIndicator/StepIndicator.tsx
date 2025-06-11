import React, { useMemo } from "react";

import cn from "classnames";
import { last } from "@/app/lib/helpers";
import { twMerge } from "tailwind-merge";

interface StepIndicatorProperties {
	activeIndex?: number;
	steps: string[];
	activeStepTitle?: string;
	showTitle?: boolean;
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
	activeStepTitle,
	showTitle = true,
}: StepIndicatorProperties) => {
	const title = useMemo(() => {
		if (activeStepTitle) {
			return activeStepTitle;
		}

		if (activeIndex > steps?.length) {
			return last(steps);
		}

		return steps[activeIndex - 1];
	}, [activeIndex, last, steps, activeStepTitle]);

	if (steps.length === 0) {
		return <></>;
	}

	return (
		<div className="flex flex-col">
			{showTitle && (
				<span className="text-theme-secondary-text mx-auto mb-2 inline-block font-semibold sm:hidden">
					{title}
				</span>
			)}
			<ul className="flex flex-row gap-2">
				{steps.map((_, index) => (
					<StepStyled key={index} isActive={activeIndex >= index + 1} />
				))}
			</ul>
		</div>
	);
};
