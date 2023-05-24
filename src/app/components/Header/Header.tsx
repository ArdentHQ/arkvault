import cn from "classnames";
import React from "react";
import { Section } from "@/app/components/Layout";
import { useBreakpoint } from "@/app/hooks";

interface Properties {
	title: string;
	titleSuffix?: string | React.ReactNode;
	subtitle?: string | React.ReactNode;
	className?: string;
	extra?: React.ReactNode;
	border?: boolean;
}

export const Header = ({ title, titleSuffix, className, subtitle, extra }: Properties) => (
	<div className={cn("flex items-end justify-between bg-theme-background", className)}>
		<div className="space-y-4">
			<h1 className="mb-0 text-2xl" data-testid="header__title">
				{title}
				{titleSuffix && <span> {titleSuffix}</span>}
			</h1>
			{subtitle && (
				<div className="flex items-center text-theme-secondary-text" data-testid="header__subtitle">
					{subtitle}
				</div>
			)}
		</div>

		{extra && <div>{extra}</div>}
	</div>
);

export const PageHeader = ({ title, titleSuffix, subtitle, extra, border = false }: Properties) => {
	const { isMdAndAbove } = useBreakpoint();

	if (isMdAndAbove) {
		return (
			<Section border={border}>
				<Header title={title} titleSuffix={titleSuffix} subtitle={subtitle} extra={extra} />
			</Section>
		);
	}

	return (
		<section className="h-13 flex w-full items-center justify-between bg-theme-secondary-100 py-1.5 px-8 dark:bg-black">
			<h1 className="mb-0 text-lg">{title}</h1>
			{extra}
		</section>
	);
};
