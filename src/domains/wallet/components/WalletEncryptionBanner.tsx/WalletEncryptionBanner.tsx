import React, { ChangeEventHandler } from "react";
import cn from "classnames";
import { Tooltip } from "@/app/components/Tooltip";
import { useTranslation } from "react-i18next";
import { ImportOption } from "@/domains/wallet/hooks/use-import-options";
import { Toggle } from "@/app/components/Toggle";
import { Checkbox } from "@/app/components/Checkbox";

export const WalletEncryptionBanner = ({
	importOption,
	toggleOnChange,
	toggleChecked,
	checkboxChecked,
	checkboxOnChange,
}: {
	importOption?: ImportOption;
	toggleOnChange: ChangeEventHandler<HTMLInputElement>;
	toggleChecked: boolean;
	checkboxChecked: boolean;
	checkboxOnChange: ChangeEventHandler<HTMLInputElement>;
}) => {
	const { t } = useTranslation();

	return (
		<div
			className={cn("flex w-full flex-col rounded-xl border", {
				"border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700": !toggleChecked,
				"border-theme-warning-300 dark:border-theme-warning-700 overflow-hidden": toggleChecked,
			})}
		>
			<div className="flex flex-row justify-between px-6 py-4">
				<div className="flex max-w-96 flex-col gap-1">
					<span className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 text-base leading-5 font-semibold">
						{t("WALLETS.PAGE_IMPORT_WALLET.IMPORT_DETAIL_STEP.ENCRYPTION.TITLE")}
					</span>
					<p className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 text-sm leading-[21px]">
						{t("WALLETS.PAGE_IMPORT_WALLET.IMPORT_DETAIL_STEP.ENCRYPTION.DESCRIPTION")}
					</p>
				</div>

				<Tooltip
					className="mb-1 -ml-3"
					content={t("WALLETS.PAGE_IMPORT_WALLET.IMPORT_DETAIL_STEP.ENCRYPTION.NOT_AVAILABLE")}
					disabled={importOption && importOption.canBeEncrypted}
				>
					<span data-testid="WalletEncryptionBanner__encryption">
						<Toggle
							data-testid="WalletEncryptionBanner__encryption-toggle"
							disabled={importOption && !importOption.canBeEncrypted}
							checked={toggleChecked}
							onChange={toggleOnChange}
						/>
					</span>
				</Tooltip>
			</div>

			<div
				className={cn(
					"bg-theme-warning-50 dark:bg-theme-dark-950 dim:bg-theme-dim-950 transition-[max-height,opacity] duration-300",
					{
						"max-h-0 opacity-0": !toggleChecked,
						"max-h-[300px] opacity-100": toggleChecked,
					},
				)}
			>
				<div className="flex flex-col gap-3 px-6 pt-3 pb-5">
					<p className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 text-sm leading-[21px] font-normal">
						{t("WALLETS.PAGE_IMPORT_WALLET.IMPORT_DETAIL_STEP.ENCRYPTION.WARNING")}
					</p>

					<hr className="border-theme-warning-300 dark:border-theme-dark-700 dim:border-theme-dim-700 border border-dashed" />

					<label className="inline-flex cursor-pointer items-center space-x-3">
						<Checkbox
							data-testid="WalletEncryptionBanner__checkbox"
							checked={checkboxChecked}
							onChange={checkboxOnChange}
							color="warning"
						/>
						<span className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 text-sm leading-[21px] font-normal">
							{t("WALLETS.PAGE_IMPORT_WALLET.IMPORT_DETAIL_STEP.ENCRYPTION.CHECKBOX")}
						</span>
					</label>
				</div>
			</div>
		</div>
	);
};
