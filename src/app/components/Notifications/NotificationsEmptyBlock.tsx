import { Image } from "@/app/components/Image";
import { useTranslation } from "react-i18next";

export const NotificationsEmptyBlock = () => {
	const { t } = useTranslation();

	return (
		<div className="space-y-3 text-center flex flex-col items-center mt-11">
			<Image name="EmptyNotifications" />
			<div className="text-center font-semibold leading-[28px] text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200">
				<p>{t("COMMON.ALL_CAUGHT_UP")}</p>
				<p>{t("COMMON.NOTIFICATIONS.EMPTY")}</p>
			</div>
		</div>

	);
};
