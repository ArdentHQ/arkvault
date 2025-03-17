import { last } from "@ardenthq/sdk-helpers";
import React, { useMemo } from "react";
import { twMerge } from "tailwind-merge";
import cn from "classnames";

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
				"bg-theme-primary-100 dark:bg-theme-secondary-800": !isActive,
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
				<span className="mx-auto mb-2 inline-block font-semibold text-theme-secondary-text sm:hidden">
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
