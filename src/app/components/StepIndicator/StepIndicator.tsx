import { last } from "@ardenthq/sdk-helpers";
import React, { useMemo } from "react";
import tw, { css, styled } from "twin.macro";

interface StepIndicatorProperties {
	activeIndex?: number;
	steps: string[];
	activeStepTitle?: string;
}

const StepStyled = styled.li<{ isActive: boolean }>`
	${tw`h-0.5 flex-1 rounded-lg transition-colors duration-300`}
	${({ isActive }) =>
		isActive
			? css`
					${tw`bg-theme-warning-300`}
				`
			: css`
					${tw`bg-theme-primary-100 dark:bg-theme-secondary-800`}
				`}
`;

const StepWrapper = styled.ul`
	${tw`flex space-x-3`}
`;

const StepTitle = styled.span`
	${tw`inline-block sm:hidden mx-auto text-theme-secondary-text font-semibold mb-2`}
`;

export const StepIndicator: React.FC<StepIndicatorProperties> = ({
	activeIndex = 1,
	steps,
	activeStepTitle,
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
			<StepTitle>{title}</StepTitle>
			<StepWrapper>
				{steps.map((_, index) => (
					<StepStyled key={index} isActive={activeIndex >= index + 1} />
				))}
			</StepWrapper>
		</div>
	);
};
