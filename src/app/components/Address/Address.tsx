import cn from "classnames";
import { useRef } from "react";

import { TruncateEnd } from "@/app/components/TruncateEnd";
import { Size } from "@/types";
import { Clipboard } from "@/app/components/Clipboard";
import { useTranslation } from "react-i18next";
import { Icon } from "@/app/components/Icon";
import { twMerge } from "tailwind-merge";
import { MiddleTruncate } from "@/app/components/MiddleTruncate";

interface Properties {
	walletName?: string;
	addressClass?: string;
	address?: string;
	alignment?: string;
	maxNameChars?: number;
	walletNameClass?: string;
	wrapperClass?: string;
	size?: Size;
	fontWeight?: "normal";
	orientation?: "horizontal" | "vertical";
	showCopyButton?: boolean;
	showTooltip?: boolean;
}

const getFontSize = (size?: Size) => {
	const fontSizes = {
		default: "text-base",
		lg: "text-lg",
		sm: "text-sm",
		xl: "text-xl",
	};
	return fontSizes[size as keyof typeof fontSizes] || fontSizes.default;
};

const getFontWeight = (fontWeight = "semibold") => `font-${fontWeight}`;

export const Address = ({
	address,
	addressClass,
	alignment,
	walletNameClass,
	fontWeight,
	walletName,
	wrapperClass,
	maxNameChars = 16,
	size,
	orientation = "horizontal",
	showCopyButton,
	showTooltip = true,
}: Properties) => {
	const aliasReference = useRef<HTMLSpanElement>(null);
	const { t } = useTranslation();

	return (
		<div
			className={twMerge(
				"flex items-center overflow-hidden whitespace-nowrap",
				cn(
					orientation === "horizontal" ? "items-center space-x-2" : "flex-col items-start",
					alignment === "center" ? "min-w-0" : "w-full",
					{
						"justify-end": alignment === "right",
					},
				),
				wrapperClass,
			)}
		>
			{walletName && (
				<span
					ref={aliasReference}
					data-testid="Address__alias"
					className={cn(getFontWeight(fontWeight), getFontSize(size), walletNameClass || "text-theme-text", {
						"w-full truncate": orientation === "vertical",
					})}
				>
					<TruncateEnd
						text={walletName}
						maxChars={maxNameChars}
						showTooltip={showTooltip ? !!maxNameChars && walletName.length > maxNameChars : false}
					/>
				</span>
			)}

			{address && (
				<>
					<div
						className={cn("relative flex grow items-center leading-[17px] sm:leading-5", {
							"text-left": alignment !== "right",
						})}
					>
						<div
							data-testid="Address__address"
							className={cn(
								addressClass ||
									(walletName
										? "text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-200"
										: "text-theme-text"),
								getFontWeight(fontWeight),
								getFontSize(size),
							)}
						>
							<MiddleTruncate text={address} />
						</div>
					</div>
					{showCopyButton && (
						<Clipboard
							variant="icon"
							data={address}
							tooltip={t("COMMON.COPY_ADDRESS")}
							iconButtonClassName="flex items-center"
						>
							<Icon
								name="Copy"
								className="text-theme-secondary-700 dark:text-theme-dark-200 dark:hover:text-theme-dark-50 hover:text-theme-primary-700 dim:text-theme-dim-200 dim:hover:text-theme-dim-50"
							/>
						</Clipboard>
					)}
				</>
			)}
		</div>
	);
};
