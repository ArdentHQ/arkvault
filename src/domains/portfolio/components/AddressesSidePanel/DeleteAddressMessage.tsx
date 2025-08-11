import React, { JSX } from "react";
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
			className="bg-theme-danger-50 dark:bg-theme-dark-800 dim:bg-theme-dim-800 flex flex-col items-center rounded-b-sm md:rounded-b-lg px-4 py-3"
		>
			<p className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 text-sm">
				{t("COMMON.DELETE_DESCRIPTION")}
			</p>

			<div className="mt-4 flex w-full items-center justify-end leading-[18px] sm:leading-5">
				<Button
					data-testid="CancelDelete"
					size="icon"
					variant="transparent"
					onClick={onCancelDelete}
					className="text-theme-primary-600 dark:text-theme-primary-400 dim:text-theme-dim-navy-400 px-2 py-[3px] leading-5"
				>
					{t("COMMON.CANCEL")}
				</Button>

				<Divider
					type="vertical"
					className="border-theme-secondary-400 dark:border-theme-dark-600 dim:border-theme-dim-600 mx-3"
				/>

				<Button
					data-testid="ConfirmDelete"
					size="icon"
					variant="transparent"
					onClick={onConfirmDelete}
					className="text-theme-danger-400 dim:text-theme-danger-400 px-2 py-[3px] leading-5"
				>
					{t("COMMON.DELETE_ADDRESS")}
				</Button>
			</div>
		</div>
	);
};
