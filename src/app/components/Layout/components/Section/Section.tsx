import cn from "classnames";
import React from "react";
import { twMerge } from "tailwind-merge";

interface SectionProperties {
	children: React.ReactNode;
	borderClassName?: string;
	backgroundClassName?: string;
	border?: boolean;
	className?: string;
	innerClassName?: string;
}

const SectionWrapper = ({
	backgroundClassName,
	border,
	...props
}: { backgroundClassName?: string; border?: boolean } & React.HTMLAttributes<HTMLDivElement>) => (
	<div
		{...props}
		className={twMerge(
			cn({
				"border-b": border,
				"pb-8": !backgroundClassName && border,
				"pt-8": border && props.className?.includes("hasBorder"),
				"py-8": backgroundClassName && !border,
			}),
			props.className,
		)}
	/>
);

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
		<div className={twMerge("mx-auto px-6 lg:container md:px-10", innerClassName)}>{children}</div>
	</SectionWrapper>
);
