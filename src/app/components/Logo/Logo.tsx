import React from "react";
import { images } from "@/app/assets/images";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { NavbarVariant } from "@/types";
import { useBreakpoint } from "@/app/hooks";
import { Tooltip } from "@/app/components/Tooltip";

const { ARKVaultLogo } = images.common;

export const Logo = ({ height }: { height?: number }) => (
	<span className="relative">
		<ARKVaultLogo height={height} />
	</span>
);

export const LogoAlpha = ({
	height,
	onClick,
	variant,
}: {
	height?: number;
	onClick?: () => void;
	variant?: NavbarVariant | "default";
}) => {
	const { t } = useTranslation();
	const { isXs } = useBreakpoint();

	return (
		<Tooltip content={t("COMMON.ALPHA_RELEASE")}>
			<div className="flex items-center space-x-[2px]">
				<button
					data-testid="NavigationBarLogo--button"
					type="button"
					className={cn(
						"bg-theme-primary-600 focus:ring-theme-primary-400 dark:bg-theme-dark-navy-500 my-auto flex cursor-pointer items-center justify-center text-white outline-hidden focus:ring-2 focus:outline-hidden",
						{
							"h-11 w-11 rounded-xl rounded-r-none": variant === "logo-only" && !isXs,
							"h-6 w-6 rounded rounded-r-none": variant === "default",
							"h-8 w-8 rounded rounded-r-none": variant === "logo-only" && isXs,
						},
					)}
					onClick={onClick}
				>
					<Logo height={height} />
				</button>
				<div
					className={cn(
						"dark:bg-theme-dark-navy-900 dark:text-theme-dark-navy-300 dim:bg-theme-dim-navy-900 dim:text-theme-dim-navy-300 bg-theme-navy-100 text-theme-navy-600 flex cursor-pointer items-center px-2 py-[0.313rem] text-center text-xs leading-[0.938rem] font-semibold",
						{
							"h-11 rounded-xl rounded-l-none": variant === "logo-only" && !isXs,
							"h-6 rounded rounded-l-none": variant === "default",
							"h-8 rounded rounded-l-none": variant === "logo-only" && isXs,
						},
					)}
					onClick={onClick}
				>
					{t("COMMON.ALPHA")}
				</div>
			</div>
		</Tooltip>
	);
};

Logo.displayName = "Logo";
