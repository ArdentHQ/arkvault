import React from "react";
import { images } from "@/app/assets/images";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { NavbarVariant } from "@/types";
import { useBreakpoint } from "@/app/hooks";

const { ARKVaultLogo } = images.common;

export const Logo = ({ height }: { height?: number }) => (
	<span className="relative">
		<ARKVaultLogo height={height} />
	</span>
);

export const LogoAlpha = ({ height, onClick, variant }: { height?: number, onClick?: () => void, variant?: NavbarVariant | "default" }) => {
	const { t } = useTranslation()
	const { isXs } = useBreakpoint()

	return (
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

			<div className={cn("py-[0.313rem] px-2 bg-theme- dark:bg-theme-dark-navy-900 dark:text-theme-dark-navy-300 dim:bg-theme-dim-navy-900 dim:text-theme-dim-navy-300 bg-theme-navy-100 text-theme-navy-600 font-semibold text-xs text-center leading-[0.938rem] flex items-center",
				{
					"h-11 rounded-xl rounded-l-none": variant === "logo-only" && !isXs,
					"h-6 rounded rounded-l-none": variant === "default",
					"h-8 rounded rounded-l-none": variant === "logo-only" && isXs,
				},
			)}>{t("COMMON.ALPHA")}</div>
		</div>
	)
};

Logo.displayName = "Logo";
