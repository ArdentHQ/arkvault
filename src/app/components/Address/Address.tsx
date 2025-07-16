import cn from "classnames";
import React, { useMemo, useRef, useState, useLayoutEffect, JSX } from "react";

import { useResizeDetector } from "react-resize-detector";
import { TruncateEnd } from "@/app/components/TruncateEnd";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";
import { Size } from "@/types";
import { Clipboard } from "@/app/components/Clipboard";
import { useTranslation } from "react-i18next";
import { Icon } from "@/app/components/Icon";
import { useTheme } from "@/app/hooks";
import { twMerge } from "tailwind-merge";

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
	truncateOnTable?: boolean;
	orientation?: "horizontal" | "vertical";
	showCopyButton?: boolean;
	showTooltip?: boolean;
}

const AddressWrapper = ({
	children,
	alignment,
	truncateOnTable,
}: {
	children: JSX.Element;
	alignment?: string;
	truncateOnTable?: boolean;
}) =>
	truncateOnTable ? (
		<div className={cn("relative grow leading-[17px] sm:leading-5", { "text-left": alignment !== "right" })}>
			{children}
			{/* The workaround used to make the truncating work on tables means
			wrapping the address on a DIV with an absolute position that doesn't
			keep the space for the element, so we need to add an empty element
			as a spacer. */}
			<span>&nbsp;</span>
		</div>
	) : (
		<>{children}</>
	);

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
	truncateOnTable,
	orientation = "horizontal",
	showCopyButton,
	showTooltip = true,
}: Properties) => {
	const aliasReference = useRef<HTMLSpanElement>(null);
	const { t } = useTranslation();
	const [aliasWidth, setAliasWidth] = useState(0);
	const { isDarkMode } = useTheme();

	const { ref, width } = useResizeDetector<HTMLDivElement>({ handleHeight: false });

	useLayoutEffect(() => {
		if (aliasReference.current) {
			setAliasWidth(aliasReference.current.getBoundingClientRect().width);
		}
	}, [walletName, width]);

	const availableWidth = useMemo(() => {
		if (width) {
			if (orientation === "horizontal") {
				return width - (walletName ? aliasWidth + 8 : 0) - (showCopyButton ? 22 : 0);
			} else {
				return width;
			}
		}
		return 0;
	}, [width, orientation, showCopyButton, walletName, aliasWidth]);

	return (
		<div
			ref={ref}
			className={twMerge("flex overflow-hidden whitespace-nowrap", cn(
				orientation === "horizontal" ? "items-center space-x-2" : "flex-col items-start",
				alignment === "center" ? "min-w-0" : "w-full",
				{
					"justify-end": alignment === "right",
				},
			), wrapperClass)}
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
					<AddressWrapper alignment={alignment} truncateOnTable={truncateOnTable}>
						<TruncateMiddleDynamic
							data-testid="Address__address"
							value={address}
							availableWidth={availableWidth}
							className={cn(
								addressClass ||
									(walletName
										? "text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-200"
										: "text-theme-text"),
								getFontWeight(fontWeight),
								getFontSize(size),
								{ "absolute w-full": truncateOnTable },
							)}
						/>
					</AddressWrapper>
					{showCopyButton && (
						<Clipboard
							variant="icon"
							data={address}
							tooltip={t("COMMON.COPY_ADDRESS")}
							tooltipDarkTheme={isDarkMode}
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
