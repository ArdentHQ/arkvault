import React from "react";
import { Link } from "@/app/components/Link";
import { Clipboard } from "@/app/components/Clipboard";
import { Icon } from "@/app/components/Icon";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/app/hooks/use-theme";
import Truncate from "@konforti/react-truncate";
import { twMerge } from "tailwind-merge";

export const AddressLink = ({ children, explorerLink }: { explorerLink: string; children: React.ReactNode }) => (
	<Link to={explorerLink} showExternalIcon={false} isExternal>
		<Truncate truncFrom="middle">{children}</Truncate>
	</Link>
);

export const AddressLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
	<div className={twMerge("text-theme-secondary-900 dark:text-theme-text", className)}>
		<Truncate truncFrom="middle">{children}</Truncate>
	</div>
);

export const AddressCopy = ({ address }: { address: string }) => {
	const { t } = useTranslation();
	const { isDarkMode } = useTheme();

	return (
		<Clipboard variant="icon" data={address} tooltip={t("COMMON.COPY_ID")} tooltipDarkTheme={isDarkMode}>
			<Icon
				name="Copy"
				className="text-theme-primary-400 dark:text-theme-secondary-700 dark:hover:text-theme-secondary-500"
			/>
		</Clipboard>
	);
};
