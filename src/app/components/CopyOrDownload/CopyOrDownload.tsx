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
		<div className="-mx-4 sm:-mx-6 bg-theme-secondary-100 p-4 sm:p-6 text-center dark:bg-theme-dark-950 rounded-b-lg sm:text-left">
			<span className="text-base sm:text-lg leading-[21px] font-semibold text-theme-secondary-900 dark:text-theme-dark-50">{title}</span>

			<p className="text-sm text-theme-secondary-700 dark:text-theme-dark-200 mt-2 mb-3">{description}</p>

			<div className="flex items-center justify-center space-x-3 sm:justify-start">
				<Clipboard data={copyData} data-testid="CopyOrDownload__copy" variant="icon">
					<div
						className={cn("flex items-center space-x-2 font-semibold leading-5 px-2 py-1 rounded", {
							"cursor-not-allowed text-theme-secondary-500 dark:text-theme-secondary-800": disabled,
							"cursor-pointer text-theme-primary-600 dark:text-theme-navy-400 hover:bg-theme-navy-200 dark:hover:bg-theme-secondary-800 dark:hover:text-white": !disabled,
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
					className={cn("flex items-center space-x-2 font-semibold leading-5 px-2 py-1 rounded", {
						"cursor-not-allowed text-theme-secondary-500 dark:text-theme-secondary-800": disabled,
						"cursor-pointer text-theme-primary-600 dark:text-theme-navy-400 hover:bg-theme-navy-200 dark:hover:bg-theme-secondary-800 dark:hover:text-white": !disabled,
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
