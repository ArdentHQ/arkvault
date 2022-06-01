import React from "react";
import tw, { css, styled } from "twin.macro";

interface DotNavigationProperties {
	activeIndex?: number;
	size: number;
	onClick?: (step: number) => void;
}

const StepStyled = styled.li<{ isActive: boolean }>`
	${tw`flex-1 rounded-lg transition-colors duration-300 h-2 w-2 cursor-pointer`}
	${({ isActive }) =>
		isActive
			? css`
					${tw`bg-theme-primary-600 hover:bg-theme-primary-500`}
			  `
			: css`
					${tw`bg-theme-primary-100 dark:bg-theme-secondary-800`}
			  `}
`;

const DotNavigationWrapper = styled.ul`
	${tw`flex space-x-3`}
`;

export const DotNavigation: React.FC<DotNavigationProperties> = ({
	activeIndex = 1,
	size = 2,
	onClick,
}: DotNavigationProperties) => {
	const steps = [...Array.from({ length: size })];

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
