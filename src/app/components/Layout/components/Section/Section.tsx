import cn from "classnames";
import React from "react";
import tw, { css, styled } from "twin.macro";

interface SectionProperties {
	children: React.ReactNode;
	borderClassName?: string;
	backgroundClassName?: string;
	border?: boolean;
	className?: string;
	innerClassName?: string;
}

const SectionWrapper = styled.div<{ backgroundClassName?: string; border?: boolean }>`
	${tw`w-full py-4 first:pt-8 last:pb-8`};

	${({ border }) =>
		border && [
			tw`border-b`,
			css`
				&.hasBorder + & {
					${tw`pt-8`}
				}
			`,
		]};

	${({ backgroundClassName, border }) => {
		if (backgroundClassName) {
			return tw`py-8`;
		}

		if (border) {
			return tw`pb-8`;
		}
	}};
`;

export const Section = ({
	children,
	border,
	className,
	borderClassName = "border-theme-secondary-300 dark:border-theme-secondary-800",
	backgroundClassName,
	innerClassName,
}: SectionProperties) => (
	<SectionWrapper
		backgroundClassName={backgroundClassName}
		border={border}
		className={cn(className, backgroundClassName, { [borderClassName]: border, hasBorder: border })}
	>
		<div className={cn("mx-auto lg:container px-10", innerClassName)}>{children}</div>
	</SectionWrapper>
);
