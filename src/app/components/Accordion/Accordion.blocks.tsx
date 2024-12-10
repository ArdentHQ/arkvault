import cn from "classnames";
import React from "react";
import { useTheme } from "@/app/hooks";
import {
	AccordionHeaderProperties,
	AccordionContentProperties,
	AccordionHeaderSkeletonWrapperProperties,
} from "@/app/components/Accordion";
import { Icon } from "@/app/components/Icon";
import { twMerge } from "tailwind-merge";

interface AccordionWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
	isInactive?: boolean;
	isCollapsed?: boolean;
	className?: string;
}

export const AccordionWrapper = ({ isInactive, isCollapsed, className, ...props }: AccordionWrapperProps) => (
	<div
		className={twMerge(
			"flex flex-col gap-x-3 border-b border-theme-secondary-300 duration-200 dark:border-theme-secondary-800 dark:bg-theme-background md:mb-4 md:rounded-xl md:border-0",
			cn({
				"ring-theme-primary-100 dark:ring-theme-secondary-800 md:ring-2": !isInactive,
				"ring-theme-secondary-300 dark:ring-theme-secondary-800 md:ring-1": isInactive,
				"transition-all": !isCollapsed,
				"transition-shadow not-all-hover-none:hover:shadow-xl not-all-hover-none:hover:ring-0 not-all-hover-none:hover:ring-theme-background not-all-hover-none:dark:hover:bg-theme-secondary-800 not-all-hover-none:dark:hover:shadow-none not-all-hover-none:dark:hover:ring-theme-secondary-800":
					isCollapsed,
			}),
			className,
		)}
		{...props}
	/>
);

interface AccordionToggleWrapperProps extends React.HTMLAttributes<HTMLDivElement> {}

const AccordionToggleWrapper = ({ ...props }: AccordionToggleWrapperProps) => (
	<div
		className={twMerge(
			"flex h-full min-h-8 w-8 basis-8 content-center items-center justify-center rounded-lg text-theme-secondary-700 ring-2 ring-theme-primary-100 transition-all dark:text-theme-secondary-500 dark:ring-theme-secondary-700 sm:h-8 not-all-hover-none:transition-colors not-all-hover-none:duration-100 not-all-hover-none:ease-linear not-all-hover-none:hover:bg-theme-primary-100 not-all-hover-none:hover:text-theme-primary-700 not-all-hover-none:hover:ring-theme-primary-100 not-all-hover-none:dark:hover:bg-theme-secondary-800 not-all-hover-none:dark:hover:text-white not-all-hover-none:dark:hover:ring-theme-secondary-800",
		)}
		{...props}
	/>
);

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
					className={cn(
						"ml-4 flex flex-shrink-0 items-center self-stretch not-all-hover-none:dark:group-hover:border-theme-secondary-700",
						{
							"transition-all duration-100": !isExpanded,
						},
					)}
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
