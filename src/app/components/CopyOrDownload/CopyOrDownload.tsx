import React from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { Clipboard } from "@/app/components/Clipboard";
import { Icon } from "@/app/components/Icon";
import { Divider } from "@/app/components/Divider";

interface Properties {
	title: string;
	description: string;
	copyData: string;
	disabled?: boolean;
	onClickDownload: () => void;
}

export const CopyOrDownload = ({ title, description, copyData, onClickDownload, disabled }: Properties) => {
	const { t } = useTranslation();

	return (
		<div className="bg-theme-secondary-100 dark:bg-theme-dark-950 dim:bg-theme-dim-950 -mx-4 rounded-b-lg p-4 text-center sm:-mx-6 sm:p-6 sm:text-left">
			<span className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 text-base leading-[21px] font-semibold sm:text-lg">
				{title}
			</span>

			<p className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 mt-2 mb-3 text-sm">
				{description}
			</p>

			<div className="flex items-center justify-center space-x-1 sm:justify-start">
				<Clipboard data={copyData} data-testid="CopyOrDownload__copy" variant="icon">
					<div
						className={cn("flex items-center space-x-2 rounded px-2 py-1 leading-5 font-semibold", {
							"text-theme-primary-600 hover:bg-theme-navy-200 dark:text-theme-navy-400 dark:hover:bg-theme-secondary-800 dim:text-theme-dim-navy-600 dim-hover:text-theme-dim-50 dim-hover:bg-theme-dim-700 cursor-pointer dark:hover:text-white":
								!disabled,
							"text-theme-secondary-500 dark:text-theme-secondary-800 dim:text-theme-dim-800 cursor-not-allowed":
								disabled,
						})}
					>
						<Icon name="Copy" />
						<span>{t("COMMON.COPY")}</span>
					</div>
				</Clipboard>

				<Divider type="vertical" />

				<button
					type="button"
					data-testid="CopyOrDownload__download"
					className={cn("flex items-center space-x-2 rounded px-2 py-1 leading-5 font-semibold", {
						"text-theme-primary-600 hover:bg-theme-navy-200 dark:text-theme-navy-400 dark:hover:bg-theme-secondary-800 dim:text-theme-dim-navy-600 dim-hover:text-theme-dim-50 dim-hover:bg-theme-dim-700 cursor-pointer dark:hover:text-white":
							!disabled,
						"text-theme-secondary-500 dark:text-theme-secondary-800 dim:text-theme-dim-800 cursor-not-allowed":
							disabled,
					})}
					onClick={() => onClickDownload()}
					disabled={disabled}
				>
					<Icon name="ArrowDownBracket" />
					<span>{t("COMMON.DOWNLOAD")}</span>
				</button>
			</div>
		</div>
	);
};
