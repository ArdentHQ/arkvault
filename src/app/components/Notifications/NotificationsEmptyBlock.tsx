import { Image } from "@/app/components/Image";
import { useTranslation } from "react-i18next";

export const NotificationsEmptyBlock = () => {
	const { t } = useTranslation();

	return (
		<div className="mt-11 flex flex-col items-center space-y-3 text-center">
			<Image name="EmptyNotifications" />
			<div className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 text-center leading-[28px] font-semibold">
				<p>{t("COMMON.ALL_CAUGHT_UP")}</p>
				<p>{t("COMMON.NOTIFICATIONS.EMPTY")}</p>
			</div>
		</div>
	);
};
