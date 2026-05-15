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
					className="mt-0.5 flex items-center text-xs font-semibold leading-5 text-theme-secondary-text sm:mt-1 sm:text-sm sm:font-normal sm:leading-[17px] md:text-base md:leading-5"
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
		<div className={cn("flex items-end justify-between bg-theme-background", className)}>
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
		<section className="md:h-13 flex w-full items-center justify-between bg-theme-secondary-100 px-6 py-3 dim:bg-theme-dim-950 dark:bg-black">
			<div className="flex items-center gap-2">
				{mobileTitleIcon && <div className="inline">{mobileTitleIcon}</div>}
				<h1 className="mb-0 text-lg font-semibold leading-[21px]">{title}</h1>
			</div>
			{extra}
		</section>
	);
};
