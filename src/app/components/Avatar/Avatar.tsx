import blockie from "ethereum-blockies-base64";
import { Helpers } from "@ardenthq/sdk-profiles";
import cn from "classnames";
import React from "react";
import tw, { styled } from "twin.macro";

import { Size } from "@/types";

interface Properties {
	variant?: "default" | "ethereum";
	address?: string;
	className?: string;
	shadowClassName?: string;
	highlight?: boolean;
	noShadow?: boolean;
	size?: Size;
	children?: React.ReactNode;
}

const AvatarWrapper = styled.div<Properties>`
	${tw`transition-all duration-100 relative inline-flex items-center justify-center align-middle rounded-full`}

	${({ size }) => {
		const sizes = {
			default: () => tw`w-10 h-10`,
			lg: () => tw`w-11 h-11 text-sm`,
			sm: () => tw`w-8 h-8 text-sm`,
			xl: () => tw`w-16 h-16 text-xl`,
			xs: () => tw`w-5 h-5 text-sm`,
		};

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		return (sizes[size as keyof typeof sizes] || sizes.default)();
	}}

	${({ noShadow, shadowClassName }) => {
		if (noShadow) {
			return;
		}

		if (shadowClassName) {
			return tw`ring-6`;
		}

		return tw`ring-6 ring-theme-background`;
	}}
`;

export const EthereumAvatar: React.FC<Properties> = (properties) => <Avatar {...properties } variant="ethereum" />;

export const Avatar = ({
	variant,
	address = "",
	className,
	highlight,
	noShadow,
	shadowClassName,
	size,
	children,
}: Properties) => {
	const image = React.useMemo(() => {
		if (!address) {
			return undefined;
		}

		if (variant === "ethereum") {
			return blockie(address);
		}

		return `data:image/svg+xml;utf8,${Helpers.Avatar.make(address)}`;
	}, [address]);

	return (
		<AvatarWrapper
			data-testid={variant === "ethereum" ? "EthereumAvatar" : "Avatar"}
			size={size}
			noShadow={!!noShadow}
			className={cn(className, shadowClassName, "shrink-0")}
			shadowClassName={shadowClassName}
		>
			<div
				className={cn(
					"inline-flex h-full w-full items-center justify-center overflow-hidden rounded-full align-middle",
					{ "ring-2 ring-theme-primary-600": highlight },
				)}
			>
				{image && <img alt={address} title={address} src={image} />}
				{children}
			</div>
		</AvatarWrapper>
	);
};
