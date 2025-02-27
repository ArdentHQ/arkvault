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
			className="flex flex-col items-center rounded-b-lg bg-theme-danger-50 px-4 py-3 dark:bg-theme-dark-800"
		>
			<p className="text-sm text-theme-secondary-900 dark:text-theme-dark-50">{t("COMMON.DELETE_DESCRIPTION")}</p>

			<div className="mt-4 flex w-full items-center justify-center leading-[18px] sm:justify-end sm:leading-5">
				<Button
					data-testid="CancelDelete"
					size="icon"
					variant="transparent"
					onClick={onCancelDelete}
					className="px-2 py-[3px] text-sm leading-[18px] text-theme-primary-600 dark:text-theme-primary-400 sm:text-base sm:leading-5"
				>
					{t("COMMON.CANCEL")}
				</Button>

				<Divider type="vertical" className="mx-3 border-theme-secondary-400 dark:border-theme-dark-600" />

				<Button
					data-testid="ConfirmDelete"
					size="icon"
					variant="transparent"
					onClick={onConfirmDelete}
					className="px-2 py-[3px] text-sm leading-[18px] text-theme-danger-400 sm:text-base sm:leading-5"
				>
					{t("COMMON.DELETE_ADDRESS")}
				</Button>
			</div>
		</div>
	);
};
