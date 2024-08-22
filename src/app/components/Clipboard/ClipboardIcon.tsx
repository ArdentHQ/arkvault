import React from "react";
import { useTranslation } from "react-i18next";

import { ClipboardIconProperties } from "./Clipboard.contracts";
import { Tooltip } from "@/app/components/Tooltip";
import { useClipboard } from "@/app/hooks";

export const ClipboardIcon = ({
	data,
	tooltip,
	tooltipDarkTheme,
	options,
	children,
	disabled,
}: Omit<ClipboardIconProperties, "variant">) => {
	const { t } = useTranslation();

	const [hasCopied, copy] = useClipboard({
		resetAfter: 1000,
		...options,
	});

	return (
		<Tooltip
			content={hasCopied ? t("COMMON.CLIPBOARD.SUCCESS") : tooltip || t("COMMON.CLIPBOARD.TOOLTIP_TEXT")}
			hideOnClick={false}
			theme={tooltipDarkTheme ? "dark" : undefined}
			disabled={disabled}
		>
			<button
				type="button"
				data-testid="clipboard-icon__wrapper"
				className="ring-focus relative focus:outline-none"
				onClick={(e) => {
					e.stopPropagation();
					copy(data);
				}}
				data-ring-focus-margin="-m-1"
			>
				{children}
			</button>
		</Tooltip>
	);
};
