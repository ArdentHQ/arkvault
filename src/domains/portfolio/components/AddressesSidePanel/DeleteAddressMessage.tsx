import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/Button";
import { Divider } from "@/app/components/Divider";

export const DeleteAddressMessage = ({
	onCancelDelete,
	onConfirmDelete,
}: {
	onConfirmDelete: () => void;
	onCancelDelete: () => void;
}): JSX.Element => {
	const { t } = useTranslation();
	return (
		<div
			data-testid="DeleteAddressMessage"
			className="flex flex-col items-center py-3 px-4 rounded-b-lg bg-theme-danger-50 dark:bg-theme-dark-800"
		>
			<p className="text-sm text-theme-secondary-900 dark:text-theme-dark-50">{t("COMMON.DELETE_DESCRIPTION")}</p>

			<div className="flex justify-center items-center mt-4 w-full sm:justify-end sm:leading-5 leading-[18px]">
				<Button
					data-testid="CancelDelete"
					size="icon"
					variant="transparent"
					onClick={onCancelDelete}
					className="px-2 text-sm sm:text-base sm:leading-5 text-theme-primary-600 py-[3px] leading-[18px] dark:text-theme-primary-400"
				>
					{t("COMMON.CANCEL")}
				</Button>

				<Divider type="vertical" className="mx-3 border-theme-secondary-400 dark:border-theme-dark-600" />

				<Button
					data-testid="ConfirmDelete"
					size="icon"
					variant="transparent"
					onClick={onConfirmDelete}
					className="px-2 text-sm sm:text-base sm:leading-5 text-theme-danger-400 py-[3px] leading-[18px]"
				>
					{t("COMMON.DELETE_ADDRESS")}
				</Button>
			</div>
		</div>
	);
};
