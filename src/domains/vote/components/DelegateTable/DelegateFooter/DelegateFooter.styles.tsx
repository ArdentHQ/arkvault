import tw, { styled } from "twin.macro";

import { Circle } from "@/app/components/Circle";

const disabledColor = tw`text-theme-secondary-500 dark:text-theme-secondary-700`;

export const LabelWrapper = styled.div`
	${tw`text-sm leading-tighter`};
	${disabledColor};
`;

export const TextWrapper = styled.div<{ disabled?: boolean }>`
	${tw`text-lg leading-tighter`};

	${({ disabled }) => {
		if (disabled) {
			return disabledColor;
		}

		return tw`text-theme-text`;
	}}
`;

export const StyledCircle = styled(Circle)<{ disabled?: boolean }>`
	${tw`bg-theme-background`};

	${({ disabled }) => {
		if (disabled) {
			return [tw`border-theme-secondary-500 dark:border-theme-secondary-700`, disabledColor];
		}

		return tw`border-theme-secondary-900 text-theme-secondary-900 dark:(border-theme-secondary-600 text-theme-secondary-600)`;
	}}
`;
