import { Clipboard } from "@/app/components/Clipboard";
import { useTranslation } from "react-i18next";
import { Icon } from "@/app/components/Icon";

interface Properties {
	value: string;
}

export const CopyButton = ({ value }: Properties) => {
	const { t } = useTranslation();

	return (
		<Clipboard
			variant="icon"
			data={value}
			tooltip={t("COMMON.COPY_ADDRESS")}
			iconButtonClassName="flex items-center shrink-0"
		>
			<Icon
				name="Copy"
				className="text-theme-secondary-700 hover:text-theme-primary-700 dim:text-theme-dim-200 dim:hover:text-theme-dim-50 dark:text-theme-dark-200 dark:hover:text-theme-dark-50"
			/>
		</Clipboard>
	);
};
