import React, { JSX, ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/Button";
import { Divider } from "@/app/components/Divider";

export const DeleteAddressMessage = ({
	onCancelDelete,
	onConfirmDelete,
	children,
	confirmText,
}: {
	onConfirmDelete: () => void;
	onCancelDelete: () => void;
	children?: string | ReactElement;
	confirmText?: string | ReactElement;
}): JSX.Element => {
	const { t } = useTranslation();
	return (
		<div
			data-testid="DeleteAddressMessage"
			className="flex flex-col items-center rounded-b-sm bg-theme-danger-50 px-4 py-3 dim:bg-theme-dim-800 dark:bg-theme-dark-800 sm:rounded-b-lg md:rounded-b-lg"
		>
			<p className="text-sm text-theme-secondary-900 dim:text-theme-dim-50 dark:text-theme-dark-50">
				{children ?? t("COMMON.DELETE_DESCRIPTION")}
			</p>

			<div className="mt-4 flex w-full items-center justify-end leading-[18px] sm:leading-5">
				<Button
					data-testid="CancelDelete"
					size="icon"
					variant="transparent"
					onClick={onCancelDelete}
					className="px-2 py-[3px] leading-5 text-theme-primary-600 dim:text-theme-dim-navy-400 dark:text-theme-primary-400"
				>
					{t("COMMON.CANCEL")}
				</Button>

				<Divider
					type="vertical"
					className="mx-3 border-theme-secondary-400 dim:border-theme-dim-600 dark:border-theme-dark-600"
				/>

				<Button
					data-testid="ConfirmDelete"
					size="icon"
					variant="transparent"
					onClick={onConfirmDelete}
					className="px-2 py-[3px] leading-5 text-theme-danger-400 dim:text-theme-danger-400"
				>
					{confirmText ?? t("COMMON.DELETE_ADDRESS")}
				</Button>
			</div>
		</div>
	);
};
