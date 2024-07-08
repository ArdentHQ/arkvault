import cn from "classnames";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, LinkProps } from "react-router-dom";
import tw, { styled } from "twin.macro";

import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { toasts } from "@/app/services";
import { useLink } from "@/app/hooks/use-link";

const AnchorStyled = styled.a<{ isDisabled?: boolean }>(({ isDisabled }) => {
	const styles = [
		tw`relative space-x-1 font-semibold`,
		tw`transition-colors`,
		tw`cursor-pointer no-underline`,
		tw`focus:outline-none`,
	];

	if (isDisabled) {
		styles.push(tw`text-theme-secondary-text cursor-not-allowed`);
	} else {
		styles.push(tw`text-theme-primary-600 hover:text-theme-primary-700 active:text-theme-primary-400`);
	}

	return styles;
});

const Content = styled.span<{ isDisabled?: boolean }>(({ isDisabled }) => {
	const styles = [
		tw`break-all border-b border-transparent`,
		tw`[transition-property:color,_border-color]`,
		tw`[transition-duration:200ms,_350ms]`,
		tw`[transition-delay:0s, _100ms]`,
	];

	if (!isDisabled) {
		styles.push(tw`group-hover:border-current`);
	}

	return styles;
});

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
			className={cn("ring-focus group inline-block", className)}
			data-testid="Link"
			rel={isExternal ? "noopener noreferrer" : rel}
			ref={reference}
			onClick={onClick}
			href={href}
			data-ring-focus-margin="-m-1"
			isDisabled={isDisabled}
		>
			<Content isDisabled={isDisabled}>{children}</Content>
			{isExternal && showExternalIcon && (
				<Icon
					data-testid="Link__external"
					name="ArrowExternal"
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
				<></>
				// <RouterLink component={Anchor} {...properties} />
			)}
		</Tooltip>
	);
};
