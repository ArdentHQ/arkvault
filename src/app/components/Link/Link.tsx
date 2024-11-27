import cn from "classnames";
import React, { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, LinkProps } from "react-router-dom";

import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { useLink } from "@/app/hooks/use-link";
import { toasts } from "@/app/services";
import { assertString } from "@/utils/assertions";
import { twMerge } from "tailwind-merge";

interface AnchorStyledProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	isDisabled?: boolean;
}

const AnchorStyled = forwardRef<HTMLAnchorElement, AnchorStyledProps>(({ isDisabled, ...props }, ref) => (
	<a
		{...props}
		ref={ref}
		className={twMerge(
			"relative cursor-pointer space-x-1 font-semibold no-underline transition-colors focus:outline-none",
			cn({
				"cursor-not-allowed text-theme-secondary-text": isDisabled,
				"text-theme-primary-600 hover:text-theme-primary-700 active:text-theme-primary-400 dark:hover:text-theme-primary-500":
					!isDisabled,
			}),
			props.className,
		)}
	/>
));

AnchorStyled.displayName = "AnchorStyled";

const Content = ({
	isDisabled,
	showExternalIcon,
	...props
}: { isDisabled?: boolean; showExternalIcon?: boolean } & React.HTMLProps<HTMLSpanElement>) => (
	<span
		{...props}
		className={twMerge(
			"break-all border-b border-transparent transition-colors delay-100 duration-200",
			cn({
				"group-hover/inner:border-current": !isDisabled && showExternalIcon,
				"hover:border-current": !isDisabled && !showExternalIcon,
			}),
			props.className,
		)}
	/>
);

type AnchorProperties = {
	isDisabled?: boolean;
	isExternal?: boolean;
	showExternalIcon?: boolean;
} & React.AnchorHTMLAttributes<any>;

const Anchor = React.forwardRef<HTMLAnchorElement, AnchorProperties>(
	(
		{ isDisabled, isExternal, showExternalIcon, onClick, href, children, rel, className }: AnchorProperties,
		reference,
	) => (
		<AnchorStyled
			className={cn("ring-focus group/inner inline-block", className)}
			data-testid="Link"
			rel={isExternal ? "noopener noreferrer" : rel}
			ref={reference}
			onClick={onClick}
			href={href}
			data-ring-focus-margin="-m-1"
			isDisabled={isDisabled}
		>
			<Content isDisabled={isDisabled} showExternalIcon={showExternalIcon}>
				{children}
			</Content>
			{isExternal && showExternalIcon && (
				<Icon
					data-testid="Link__external"
					name="ArrowExternal"
					dimensions={[12, 12]}
					className={cn("mb-[3px] shrink-0 align-middle duration-200", { "inline-block text-sm": children })}
				/>
			)}
		</AnchorStyled>
	),
);

Anchor.displayName = "Anchor";

type Properties = {
	isDisabled?: boolean;
	isExternal?: boolean;
	children?: React.ReactNode;
	tooltip?: string;
	showExternalIcon?: boolean;
} & Omit<LinkProps, "referrerPolicy">;

export const Link = ({
	className,
	tooltip,
	isDisabled = false,
	isExternal = false,
	showExternalIcon = true,
	...properties
}: Properties) => {
	const { t } = useTranslation();
	const { openExternal } = useLink();

	return (
		<Tooltip content={tooltip} disabled={!tooltip}>
			{isExternal ? (
				<Anchor
					className={className}
					onClick={(event) => {
						event.stopPropagation();
						event.preventDefault();

						if (!isDisabled) {
							try {
								assertString(properties.to);
								openExternal(properties.to.toString());
							} catch {
								toasts.error(t("COMMON.ERRORS.INVALID_URL", { url: properties.to }));
							}
						}
					}}
					href={properties.to as string}
					showExternalIcon={showExternalIcon}
					isDisabled={isDisabled}
					isExternal
				>
					{properties.children}
				</Anchor>
			) : (
				<RouterLink component={Anchor} {...properties} />
			)}
		</Tooltip>
	);
};
