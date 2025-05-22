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
				"border-theme-secondary-300 dark:border-theme-dark-700": !toggleChecked,
				"border-theme-warning-300 dark:border-theme-warning-700 overflow-hidden": toggleChecked,
			})}
		>
			<div className="flex flex-row justify-between py-4 px-6">
				<div className="flex flex-col gap-1 max-w-96">
					<span className="text-base font-semibold leading-5 text-theme-secondary-900 dark:text-theme-dark-50">
						{t("WALLETS.PAGE_IMPORT_WALLET.IMPORT_DETAIL_STEP.ENCRYPTION.TITLE")}
					</span>
					<p className="text-sm text-theme-secondary-700 leading-[21px] dark:text-theme-dark-200">
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
					"bg-theme-warning-50 dark:bg-theme-dark-950 transition-[max-height,opacity] duration-300",
					{
						"max-h-0 opacity-0": !toggleChecked,
						"max-h-[300px] opacity-100": toggleChecked,
					},
				)}
			>
				<div className="flex flex-col gap-3 px-6 pt-3 pb-5">
					<p className="text-sm font-normal text-theme-secondary-900 leading-[21px] dark:text-theme-dark-50">
						{t("WALLETS.PAGE_IMPORT_WALLET.IMPORT_DETAIL_STEP.ENCRYPTION.WARNING")}
					</p>

					<hr className="border border-dashed border-theme-warning-300 dark:border-theme-dark-700" />

					<label className="inline-flex items-center space-x-3 cursor-pointer">
						<Checkbox
							data-testid="WalletEncryptionBanner__checkbox"
							checked={checkboxChecked}
							onChange={checkboxOnChange}
							color="warning"
						/>
						<span className="text-sm font-normal text-theme-secondary-900 leading-[21px] dark:text-theme-dark-50">
							{t("WALLETS.PAGE_IMPORT_WALLET.IMPORT_DETAIL_STEP.ENCRYPTION.CHECKBOX")}
						</span>
					</label>
				</div>
			</div>
		</div>
	);
};
