import cn from "classnames";
import React from "react";
import { Section } from "@/app/components/Layout";
import { useBreakpoint } from "@/app/hooks";

interface Properties {
	title: string;
	titleIcon?: React.ReactNode;
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
					className="flex items-center text-sm leading-5 text-theme-secondary-text md:text-base"
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
					"text-2xl leading-[29px]": !titleClassName,
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
				<div className="flex items-center gap-3">
					{titleIcon ?? undefined}
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
		<section className="h-13 flex w-full items-center justify-between bg-theme-secondary-100 px-8 py-6 dark:bg-black">
			<div className="flex flex-col gap-2">
				<h1 className="mb-0 text-lg font-semibold">{title}</h1>
				{subtitle && (
					<div className="flex items-center text-sm leading-5 text-theme-secondary-text">{subtitle}</div>
				)}
			</div>
			{extra}
		</section>
	);
};
