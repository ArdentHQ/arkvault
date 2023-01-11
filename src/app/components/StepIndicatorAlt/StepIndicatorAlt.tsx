import classNames from "classnames";
import React, { useMemo } from "react";
import { Icon } from "@/app/components/Icon";

interface Properties extends React.HTMLAttributes<HTMLDivElement> {
	activeIndex?: number;
	length: number;
}

export const StepIndicatorAlt: React.FC<Properties> = ({
	activeIndex = 1,
	length,
	className,
	...properties
}: Properties) => {
	const steps = useMemo(() => [...Array.from({ length }).keys()], [length]);

	return (
		<div
			data-testid="StepIndicatorAlt"
			className={classNames(className, "relative flex justify-between")}
			{...properties}
		>
			<div className="absolute mt-3 w-full border-t-2 border-theme-secondary-300 dark:border-theme-secondary-800" />
			<div
				className="absolute mt-3 w-full border-t-2 border-theme-primary-600"
				style={{
					width: `${((activeIndex - 1) / (length - 1)) * 100}%`,
				}}
			/>
			{steps.map((index) => (
				<div
					data-testid="StepIndicatorAlt__step"
					key={index}
					className={classNames(
						"relative z-0 flex h-6 w-6 items-center justify-center rounded-full border-2 dark:bg-theme-secondary-900",
						{
							"bg-theme-navy-100": index < activeIndex - 1,
							"border-theme-primary-600": index < activeIndex,
							"border-theme-secondary-300 dark:border-theme-secondary-800": index >= activeIndex,
						},
					)}
				>
					{index === activeIndex - 1 && activeIndex !== length && (
						<div
							data-testid="StepIndicatorAlt__activestep"
							className="h-2 w-2 rounded-full bg-theme-primary-600"
						/>
					)}

					{(index < activeIndex - 1 || activeIndex === length) && (
						<Icon
							data-testid="StepIndicatorAlt__prevstep"
							name="CheckmarkSmall"
							size="sm"
							className="text-theme-primary-600"
						/>
					)}
				</div>
			))}
		</div>
	);
};
