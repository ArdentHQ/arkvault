import React from "react";
import { twMerge } from "tailwind-merge";
import cn from "classnames";

interface DotNavigationProperties {
	activeIndex?: number;
	size: number;
	onClick?: (step: number) => void;
}

const StepStyled = ({ isActive, ...props }: { isActive: boolean } & React.HTMLProps<HTMLLIElement>) => (
	<li
		{...props}
		className={twMerge(
			"h-2 w-2 flex-1 cursor-pointer rounded-lg transition-colors duration-300",
			cn({
				"bg-theme-primary-100 dark:bg-theme-secondary-800": !isActive,
				"bg-theme-primary-600 hover:bg-theme-primary-500": isActive,
			}),
			props.className,
		)}
	/>
);

const DotNavigationWrapper = ({ ...props }: React.HTMLProps<HTMLUListElement>) => (
	<ul {...props} className={twMerge("flex space-x-3", props.className)} />
);

export const DotNavigation: React.FC<DotNavigationProperties> = ({
	activeIndex = 1,
	size = 2,
	onClick,
}: DotNavigationProperties) => {
	const steps = Array.from({ length: size });

	return (
		<DotNavigationWrapper data-testid="DotNavigation">
			{steps.map((_, index) => (
				<StepStyled
					data-testid={`DotNavigation-Step-${index}`}
					key={index}
					isActive={activeIndex === index}
					onClick={onClick ? () => onClick(index) : undefined}
				/>
			))}
		</DotNavigationWrapper>
	);
};
