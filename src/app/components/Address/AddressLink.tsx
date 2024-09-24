import React from "react";
import { Link } from "@/app/components/Link";
import { Clipboard } from "@/app/components/Clipboard";
import { Icon } from "@/app/components/Icon";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/app/hooks/use-theme";
import Truncate from '@konforti/react-truncate';

export const AddressLink = ({ explorerLink, address }: { explorerLink: string, address: string }) => {
	const { t } = useTranslation();
	const { isDarkMode } = useTheme();

	return (
		<div className="group flex items-center space-x-2 text-sm w-full">
			<Link to={explorerLink} showExternalIcon={false} isExternal>
				<Truncate truncFrom="middle">{address}</Truncate>
			</Link>
			<Clipboard
				variant="icon"
				data={address}
				tooltip={t("COMMON.COPY_ID")}
				tooltipDarkTheme={isDarkMode}
			>
				<Icon
					name="Copy"
					className="emotion-cache-v0ob3f text-theme-primary-400 dark:text-theme-secondary-700 dark:hover:text-theme-secondary-500"
				/>
			</Clipboard>
		</div>
	)
};
