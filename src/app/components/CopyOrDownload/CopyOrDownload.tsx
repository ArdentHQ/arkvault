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

export const CopyOrDownload: React.VFC<Properties> = ({ title, description, copyData, onClickDownload, disabled }) => {
	const { t } = useTranslation();

	return (
		<div className="p-4 -mx-4 text-center rounded-b-lg sm:p-6 sm:-mx-6 sm:text-left bg-theme-secondary-100 dark:bg-theme-dark-950">
			<span className="text-base font-semibold sm:text-lg text-theme-secondary-900 leading-[21px] dark:text-theme-dark-50">
				{title}
			</span>

			<p className="mt-2 mb-3 text-sm text-theme-secondary-700 dark:text-theme-dark-200">{description}</p>

			<div className="flex justify-center items-center space-x-1 sm:justify-start">
				<Clipboard data={copyData} data-testid="CopyOrDownload__copy" variant="icon">
					<div
						className={cn("flex items-center space-x-2 rounded px-2 py-1 leading-5 font-semibold", {
							"text-theme-primary-600 hover:bg-theme-navy-200 dark:text-theme-navy-400 dark:hover:bg-theme-secondary-800 cursor-pointer dark:hover:text-white":
								!disabled,
							"text-theme-secondary-500 dark:text-theme-secondary-800 cursor-not-allowed": disabled,
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
						"text-theme-primary-600 hover:bg-theme-navy-200 dark:text-theme-navy-400 dark:hover:bg-theme-secondary-800 cursor-pointer dark:hover:text-white":
							!disabled,
						"text-theme-secondary-500 dark:text-theme-secondary-800 cursor-not-allowed": disabled,
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
