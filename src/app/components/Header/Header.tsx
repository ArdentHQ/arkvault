import cn from "classnames";
import React from "react";
import { Section } from "@/app/components/Layout";
import { useBreakpoint } from "@/app/hooks";

interface Properties {
	title: string;
	titleIcon?: React.ReactNode;
	mobileTitleIcon?: React.ReactNode;
	subtitle?: string | React.ReactNode;
	className?: string;
	titleClassName?: string;
	extra?: React.ReactNode;
	border?: boolean;
	isPageHeader?: boolean;
}

export const Header = ({ title, titleIcon, className, subtitle, extra, titleClassName, isPageHeader }: Properties) => {
	const renderSubtitle = () => (
		<>
			{subtitle && (
				<div
					className="text-theme-secondary-text mt-0.5 flex items-center text-xs leading-5 font-semibold sm:mt-1 sm:text-sm sm:leading-[17px] sm:font-normal md:text-base md:leading-5"
					data-testid="header__subtitle"
				>
					{subtitle}
				</div>
			)}
		</>
	);

	const renderTitle = () => (
		<h1
			className={cn(
				"mb-0",
				{
					"text-lg leading-[21px] md:text-2xl md:leading-[29px]": !titleClassName,
				},
				titleClassName,
			)}
			data-testid="header__title"
		>
			{title}
		</h1>
	);

	return (
		<div className={cn("bg-theme-background flex items-end justify-between", className)}>
			<div className="space-y-2">
				<div className="mb-1 flex items-center gap-3">
					<div className="hidden sm:inline">{titleIcon ?? undefined}</div>
					{isPageHeader ? (
						<div className="flex flex-col gap-2">
							{renderTitle()} {renderSubtitle()}
						</div>
					) : (
						renderTitle()
					)}
				</div>
				{!isPageHeader && renderSubtitle()}
			</div>

			{extra && <div>{extra}</div>}
		</div>
	);
};

export const PageHeader = ({
	title,
	subtitle,
	extra,
	border = false,
	mobileTitleIcon,
	...parameters
}: Omit<Properties, "isPageHeader">) => {
	const { isMdAndAbove } = useBreakpoint();

	if (isMdAndAbove) {
		return (
			<Section border={border}>
				<Header title={title} subtitle={subtitle} isPageHeader={true} extra={extra} {...parameters} />
			</Section>
		);
	}

	return (
		<section className="bg-theme-secondary-100 dim:bg-theme-dim-950 flex w-full items-center justify-between px-6 py-3 md:h-13 dark:bg-black">
			<div className="flex items-center gap-2">
				{mobileTitleIcon && <div className="inline">{mobileTitleIcon}</div>}
				<h1 className="mb-0 text-lg leading-[21px] font-semibold">{title}</h1>
			</div>
			{extra}
		</section>
	);
};
