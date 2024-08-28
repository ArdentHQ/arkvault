import cn from "classnames";
import React from "react";
import tw, { css, styled } from "twin.macro";
import { useTheme } from "@/app/hooks";
import {
	AccordionHeaderProperties,
	AccordionContentProperties,
	AccordionHeaderSkeletonWrapperProperties,
} from "@/app/components/Accordion";
import { Icon } from "@/app/components/Icon";
import { twMerge } from "tailwind-merge";

export const AccordionWrapper = styled.div<{ isInactive?: boolean; isCollapsed?: boolean }>`
	${tw`
		flex gap-x-3 flex-col duration-200
		border-b border-theme-secondary-300
		md:(mb-4 border-0 rounded-xl)
		dark:(bg-theme-background border-theme-secondary-800)
	`}

	${({ isInactive }) =>
		isInactive
			? tw`md:ring-1 ring-theme-secondary-300 dark:ring-theme-secondary-800`
			: tw`md:ring-2 ring-theme-primary-100 dark:ring-theme-secondary-800`}

	${({ isCollapsed }) => (isCollapsed ? tw`transition-all` : tw`transition-shadow`)}

	${({ isCollapsed }) => {
		if (isCollapsed) {
			return css`
				@media not all and (hover: none) {
					${tw`hover:(ring-theme-background shadow-xl dark:(ring-theme-secondary-800 bg-theme-secondary-800 shadow-none))`}}
				}
			`;
		}
	}}
`;

export const AccordionHeader: React.VFC<AccordionHeaderProperties> = ({
	onClick,
	isExpanded,
	children,
	className,
	...properties
}) => {
	const { isDarkMode } = useTheme();

	const wrapperClassName = twMerge(
		"md:h-20 py-6 px-8 md:p-4 flex flex-row items-center border-theme-secondary-300 dark:border-theme-secondary-800",
		isDarkMode && "bg-transparent",
		isExpanded && "md:border-b",
		className,
	);

	return (
		<div
			data-testid="AccordionHeader"
			className={cn(
				"select-none",
				{
					"cursor-pointer": !!onClick,
					group: !!onClick && !isExpanded,
				},
				wrapperClassName,
			)}
			onClick={onClick}
			{...properties}
		>
			<div className="flex flex-grow flex-row items-center">{children}</div>

			{!!onClick && (
				<div
					className={cn("ml-4 flex flex-shrink-0 items-center self-stretch", {
						"transition-all duration-100": !isExpanded,
					})}
					css={css`
						@media not all and (hover: none) {
							${tw`dark:group-hover:border-theme-secondary-700`};
						}
					`}
				>
					<AccordionToggleWrapper data-testid="Accordion__toggle">
						<Icon
							name="ChevronDownSmall"
							className={cn("transition-transform", { "rotate-180": isExpanded })}
							size="sm"
						/>
					</AccordionToggleWrapper>
				</div>
			)}
		</div>
	);
};

export const AccordionContent: React.VFC<AccordionContentProperties> = ({ children, className, ...properties }) => (
	<div
		data-testid="AccordionContent"
		className={twMerge("px-8 pb-6 md:px-4 md:pb-0 md:pt-6", className)}
		{...properties}
	>
		{children}
	</div>
);

const AccordionToggleWrapper = styled.div`
	flex-basis: 2rem;

	${tw`flex h-full w-8 min-h-8 content-center items-center justify-center rounded-lg text-theme-secondary-text ring-2 transition-all sm:h-8`}

	${tw`ring-theme-primary-100 dark:ring-theme-secondary-700`}

	${css`
		@media not all and (hover: none) {
			${tw`hover:ring-theme-primary-400 dark:hover:ring-theme-primary-500`}}
		}
	`}
`;

export const AccordionHeaderSkeletonWrapper: React.VFC<AccordionHeaderSkeletonWrapperProperties> = ({
	children,
	...properties
}) => (
	<div
		data-testid="AccordionHeaderSkeletonWrapper"
		className="flex h-20 items-center px-8 py-4 md:px-4"
		{...properties}
	>
		{children}

		<div className="flex h-full items-center border-theme-secondary-300 pl-4 dark:border-theme-secondary-800 dark:group-hover:border-theme-secondary-700">
			<div className="flex h-8 w-8 content-center items-center justify-center rounded-lg bg-theme-background text-theme-secondary-500 ring-1 ring-theme-secondary-300 dark:text-theme-secondary-700 dark:ring-theme-secondary-800">
				<Icon name="ChevronDownSmall" size="sm" />
			</div>
		</div>
	</div>
);
