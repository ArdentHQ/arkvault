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
		<div className="-mx-4 space-y-2 bg-theme-secondary-100 p-6 text-center dark:bg-black sm:mx-0 sm:rounded-xl sm:text-left">
			<span className="text-lg font-semibold text-theme-secondary-text">{title}</span>

			<p className="text-sm text-theme-secondary-500">{description}</p>

			<div className="flex items-center justify-center space-x-3 sm:justify-start">
				<Clipboard data={copyData} data-testid="CopyOrDownload__copy" variant="icon">
					<div
						className={cn("flex items-center space-x-2 font-semibold", {
							"cursor-not-allowed text-theme-secondary-500 dark:text-theme-secondary-800": disabled,
							link: !disabled,
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
					className={cn("flex items-center space-x-2 font-semibold", {
						"cursor-not-allowed text-theme-secondary-500 dark:text-theme-secondary-800": disabled,
						link: !disabled,
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
