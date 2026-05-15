import React from "react";
import { images } from "@/app/assets/images";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { NavbarVariant } from "@/types";
import { Tooltip } from "@/app/components/Tooltip";
import { Image } from "@/app/components/Image";

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

	return (
		<>
			{variant === "logo-only" && (
				<Tooltip content={t("COMMON.ALPHA_RELEASE")}>
					<div>
						<Image name="ARKVaultLogoAlpha" />
					</div>
				</Tooltip>
			)}

			{variant !== "logo-only" && (
				<Tooltip content={t("COMMON.ALPHA_RELEASE")}>
					<div className="flex items-center space-x-[2px]">
						<button
							data-testid="NavigationBarLogo--button"
							type="button"
							className={cn(
								"outline-hidden focus:outline-hidden my-auto flex cursor-pointer items-center justify-center bg-theme-primary-600 text-white focus:ring-2 focus:ring-theme-primary-400 dark:bg-theme-dark-navy-500",
								{
									"h-6 w-6 rounded rounded-r-none": variant === "default",
								},
							)}
							onClick={onClick}
						>
							<Logo height={height} />
						</button>
						<div
							className={cn(
								"flex cursor-pointer items-center bg-theme-navy-100 px-2 py-[0.313rem] text-center text-xs font-semibold leading-[0.938rem] text-theme-navy-600 dim:bg-theme-dim-navy-900 dim:text-theme-dim-navy-300 dark:bg-theme-dark-navy-900 dark:text-theme-dark-navy-300",
								{
									"h-6 rounded rounded-l-none": variant === "default",
								},
							)}
							onClick={onClick}
						>
							{t("COMMON.ALPHA")}
						</div>
					</div>
				</Tooltip>
			)}
		</>
	);
};

Logo.displayName = "Logo";
