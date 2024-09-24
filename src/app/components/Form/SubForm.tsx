import React from "react";
import tw, { css, styled } from "twin.macro";

const SubFormWrapper = styled.div<{ noBackground?: boolean; noPadding?: boolean }>`
	${tw`space-y-4 rounded-lg`};
	${({ noPadding }) => !noPadding && tw`p-4 -mx-4`};
	${({ noBackground }) =>
		!noBackground &&
		css`
			& {
				${tw`bg-theme-secondary-background`}
			}
		`};
`;

export const SubForm = ({
	className,
	children,
	noBackground,
	noPadding,
}: {
	className?: string;
	children: React.ReactNode;
	noBackground?: boolean;
	noPadding?: boolean;
}) => (
	<SubFormWrapper className={className} noBackground={noBackground} noPadding={noPadding}>
		{children}
	</SubFormWrapper>
);
