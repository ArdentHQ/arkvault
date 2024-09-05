import cn from "classnames";
import React from "react";
import tw, { css, styled } from "twin.macro";
import { twMerge } from "tailwind-merge";

interface SectionProperties {
	children: React.ReactNode;
	borderClassName?: string;
	backgroundClassName?: string;
	border?: boolean;
	className?: string;
	innerClassName?: string;
}

const SectionWrapper = styled.div<{ backgroundClassName?: string; border?: boolean }>`
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
		className={twMerge(
			"w-full py-4 first:pt-8 last:pb-8",
			cn(backgroundClassName, { [borderClassName]: border, hasBorder: border }),
			className,
		)}
	>
		<div className={twMerge("mx-auto px-6 md:px-10 lg:container", innerClassName)}>{children}</div>
	</SectionWrapper>
);
