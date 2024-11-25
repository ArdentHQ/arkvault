import React from "react";
import cn from "classnames";
import { Helpers } from "@ardenthq/sdk-profiles";
import { Size } from "@/types";
import { twMerge } from "tailwind-merge";

interface AvatarWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
	address?: string;
	className?: string;
	innerClassName?: string;
	shadowClassName?: string;
	highlight?: boolean;
	noShadow?: boolean;
	size?: Size;
	children?: React.ReactNode;
}

const AvatarWrapper = ({ size, noShadow, shadowClassName, ...props }: AvatarWrapperProps) => (
	<div
		{...props}
		className={twMerge(
			"relative inline-flex h-10 w-10 items-center justify-center rounded-full align-middle transition-all duration-100",
			cn({
				"h-11 w-11 text-sm": size === "lg",
				"h-16 w-16 text-xl": size === "xl",
				"h-5 w-5 text-sm": size === "xs",
				"h-8 w-8 text-sm": size === "sm",
				"h-[25px] w-[25px] text-sm": size === "avatarMobile",
				"ring-6": !noShadow && shadowClassName,
				"ring-6 ring-theme-background": !noShadow && !shadowClassName,
			}),
			props.className,
		)}
	>
		{props.children}
	</div>
);

export const Avatar = ({
	address = "",
	className,
	innerClassName = "rounded-full",
	highlight,
	noShadow,
	shadowClassName,
	size,
	children,
}: AvatarWrapperProps) => {
	const svg = React.useMemo(() => (address ? Helpers.Avatar.make(address) : undefined), [address]);

	return (
		<AvatarWrapper
			data-testid="Avatar"
			size={size}
			noShadow={!!noShadow}
			className={cn(className, shadowClassName, "shrink-0")}
			shadowClassName={shadowClassName}
		>
			<div
				className={cn(
					"inline-flex h-full w-full items-center justify-center overflow-hidden align-middle",
					{ "ring-2 ring-theme-primary-600": highlight },
					innerClassName,
				)}
			>
				{svg && <img alt={address} title={address} src={`data:image/svg+xml;utf8,${svg}`} />}
				{children}
			</div>
		</AvatarWrapper>
	);
};
