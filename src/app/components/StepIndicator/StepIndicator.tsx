import React, { useMemo } from "react";

import cn from "classnames";
import { last } from "@/app/lib/helpers";
import { twMerge } from "tailwind-merge";

interface StepIndicatorProperties {
	activeIndex?: number;
	steps: string[];
	activeStepTitle?: string;
	activeStepSubtitle?: string;
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
	activeStepSubtitle,
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
				<div className="mb-3 flex flex-col gap-1.5">
					<span className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 inline-block text-lg leading-[21px] font-semibold sm:hidden">
						{title}
					</span>
					{activeStepSubtitle && (
						<span className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 text-xs leading-5 font-semibold sm:hidden">
							{activeStepSubtitle}
						</span>
					)}
				</div>
			)}
			<ul className="flex flex-row gap-2">
				{steps.map((_, index) => (
					<StepStyled key={index} isActive={activeIndex >= index + 1} />
				))}
			</ul>
		</div>
	);
};
