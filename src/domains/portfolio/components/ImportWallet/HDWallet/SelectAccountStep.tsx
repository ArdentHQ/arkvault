import { Contracts, Contracts as ProfilesContracts } from "@/app/lib/profiles";
import React, { JSX, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { RadioButton } from "@/app/components/RadioButton";
import { WalletImportMethod } from "@/app/lib/profiles/wallet.enum";
import { useBreakpoint } from "@/app/hooks";
import { InfoDetail, MultiEntryItem } from "@/app/components/MultiEntryItem/MultiEntryItem";

interface AccountRowProperties {
	isSelected: boolean;
	onClick: () => void;
	addressesCount: number;
	accountName: string;
	importMethod: "mnemonic" | "encryptedPassword";
}

export const MobileAccountRow = ({
	addressesCount,
	accountName,
	isSelected,
	onClick,
	importMethod,
}: AccountRowProperties): JSX.Element => {
	const { t } = useTranslation();

	return (
		<div className="space-y-0">
			<MultiEntryItem
				dataTestId="MobileAccountRow"
				titleSlot={
					<div
						data-testid="MobileAccountRowHeader"
						onClick={onClick}
						tabIndex={0}
						className="flex h-5 w-full items-center gap-3"
					>
						<RadioButton
							name="single"
							data-testid="AccountRow--radio"
							color="info"
							className="m-0.5 h-5 w-5"
							checked={isSelected}
							onChange={onClick}
						/>

						<div
							className={cn("truncate text-sm leading-[17px] font-semibold uppercase", {
								"group-hover:text-theme-primary-900 dark:group-hover:text-theme-dark-200 dim:text-theme-dim-200 dim:group-hover:text-theme-dim-50":
									!isSelected,
								"text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50": isSelected,
							})}
						>
							{accountName}
						</div>
					</div>
				}
			>
				<div className={cn("sm:w-full sm:p-0")}>
					<div className="space-y-4 px-4 pt-3 pb-4 sm:hidden">
						<InfoDetail
							label={t("COMMON.TYPE")}
							body={
								<div className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 text-sm leading-[17px] font-semibold">
									{importMethod === "mnemonic"
										? t("COMMON.MNEMONIC")
										: t("COMMON.ENCRYPTED_PASSWORD")}
								</div>
							}
						/>
						<InfoDetail
							label={t("WALLETS.PAGE_IMPORT_WALLET.HD_WALLET_SELECT_ACCOUNT_STEP.IMPORTED")}
							body={
								<div className="text-theme-secondary-900 dark:text-theme-secondary-200 dim:text-theme-dim-50 text-sm leading-[17px] font-semibold">
									{t("COMMON.ADDRESS_WITH_COUNT", { count: addressesCount })}
								</div>
							}
						/>
					</div>
				</div>
			</MultiEntryItem>
		</div>
	);
};

export const AccountRow = ({
	addressesCount,
	accountName,
	isSelected,
	onClick,
	importMethod,
}: AccountRowProperties): JSX.Element => {
	const { t } = useTranslation();
	const { isXs } = useBreakpoint();

	if (isXs) {
		return (
			<MobileAccountRow
				isSelected={isSelected}
				onClick={onClick}
				addressesCount={addressesCount}
				accountName={accountName}
				importMethod={importMethod}
			/>
		);
	}

	return (
		<div
			data-testid="AccountRow"
			onClick={onClick}
			onKeyPress={onClick}
			tabIndex={0}
			className={cn(
				"group border-theme-primary-200 dark:border-theme-dark-700 dim:border-theme-dim-700 hover:bg-theme-navy-100 dark:hover:bg-theme-dark-700 dim-hover:bg-theme-dim-700 cursor-pointer items-center rounded-lg border transition-all",
				{
					"bg-theme-secondary-200 dark:bg-theme-dark-950 dim:bg-theme-dim-950": isSelected,
				},
			)}
		>
			<div className="flex items-center px-4 py-3 duration-150">
				<RadioButton
					name="single"
					data-testid="AccountRow--radio"
					color="info"
					className="m-0.5 h-5 w-5"
					checked={isSelected}
					onChange={onClick}
				/>

				<div
					className={cn(
						"text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 ml-4 flex w-full min-w-0 items-center justify-between border-l pl-4 font-semibold",
						{
							"border-theme-primary-200 dark:border-theme-dark-700 dim:border-theme-dim-700 group-hover:dark:border-theme-dark-500 group-hover:dim:border-theme-dim-500":
								!isSelected,
							"border-theme-success-200 dark:border-theme-dark-600 dim:border-theme-dim-600": isSelected,
						},
					)}
				>
					<div className="flex w-1/2 min-w-0 flex-col space-y-2 truncate">
						<div
							className={cn("flex gap-2 leading-5 uppercase", {
								"group-hover:text-theme-primary-900 dark:group-hover:text-theme-dark-200 dim:group-hover:text-theme-dim-50":
									!isSelected,
								"text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50": isSelected,
							})}
						>
							{accountName}
						</div>
						<div className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 text-sm leading-[17px]">
							{importMethod === "mnemonic" ? t("COMMON.MNEMONIC") : t("COMMON.ENCRYPTED_PASSWORD")}
						</div>
					</div>
					<div className="flex w-1/2 min-w-0 flex-col items-end space-y-2">
						<div
							className={cn("leading-5", {
								"group-hover:text-theme-primary-900 dark:group-hover:text-theme-dark-200 dim:group-hover:text-theme-dim-50":
									!isSelected,
								"text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-200": isSelected,
							})}
						>
							{t("COMMON.ADDRESS_WITH_COUNT", { count: addressesCount })}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const getAccounts = (profile: Contracts.IProfile) => {
	const accounts: Record<string, Array<Contracts.IReadWriteWallet>> = {};

	for (const wallet of profile.wallets().values()) {
		if (!wallet.isHDWallet()) {
			continue;
		}

		const accountName = wallet.accountName() as string;

		if (accounts[accountName] === undefined) {
			accounts[accountName] = [];
		}

		accounts[accountName].push(wallet);
	}

	return accounts;
};

export const SelectAccountStep = ({ profile }: { profile: ProfilesContracts.IProfile }): JSX.Element => {
	const { t } = useTranslation();

	const { getValues, setValue, register } = useFormContext();

	const groupedWallets = Object.values(getAccounts(profile));

	const setAccountName = (accountName?: string | undefined) => {
		setValue("selectedAccount", accountName);
	};

	useEffect(() => {
		register("selectedAccount");

		if (groupedWallets.length > 0) {
			setAccountName(groupedWallets[0][0].accountName());
		}
	}, [register]);

	const selectedAccountName = getValues("selectedAccount") as string | undefined;
	const isImportNewSelected = selectedAccountName === undefined;

	return (
		<section data-testid="SelectAccountStep" className="space-y-2 sm:space-y-1">
			{groupedWallets.map((walletsGroup) => {
				const firstWallet = walletsGroup[0];

				return (
					<AccountRow
						key={firstWallet.accountName()}
						isSelected={firstWallet.accountName() === selectedAccountName}
						onClick={() => {
							setValue("selectedAccount", firstWallet.accountName());
						}}
						addressesCount={walletsGroup.length}
						accountName={firstWallet.accountName() as string}
						importMethod={
							firstWallet.importMethod() === WalletImportMethod.BIP44.MNEMONIC
								? "mnemonic"
								: "encryptedPassword"
						}
					/>
				);
			})}
			<div
				className={cn(
					"my-2 flex items-center",
					"before:border-theme-secondary-300 dark:before:border-theme-dark-700 dim:before:border-theme-dim-700 before:flex-1 before:border-t before:border-dashed",
					"after:border-theme-secondary-300 dark:after:border-theme-dark-700 dim:after:border-theme-dim-700 after:flex-1 after:border-t after:border-dashed",
				)}
			>
				<span className="text-theme-secondary-500 px-3 text-sm leading-[17px] font-semibold">
					{t("COMMON.OR")}
				</span>
			</div>

			<div
				data-testid="AccountRow"
				onClick={() => setAccountName()}
				onKeyPress={() => setAccountName()}
				tabIndex={0}
				className={cn(
					"group cursor-pointer items-center rounded border transition-all sm:rounded-lg",
					"bg-theme-secondary-100 dark:bg-theme-dark-950 dim:bg-theme-dim-950 border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700",
					"sm:border-theme-primary-200 sm:dark:border-theme-dark-700 sm:dim:border-theme-dim-700 hover:bg-theme-navy-100 dark:hover:bg-theme-dark-700 dim-hover:bg-theme-dim-700",
					{
						"sm:bg-theme-secondary-200 sm:dark:bg-theme-dark-950 sm:dim:bg-theme-dim-950":
							isImportNewSelected,
						"sm:dim:bg-transparent sm:bg-transparent sm:dark:bg-transparent": !isImportNewSelected,
					},
				)}
			>
				<div className="px-4 py-3 duration-150">
					<div className="flex h-5 items-center sm:h-auto">
						<RadioButton
							name="single"
							data-testid="AccountRow--radio"
							color="info"
							className="m-0.5 h-5 w-5"
							checked={isImportNewSelected}
							onChange={() => setAccountName()}
						/>

						<div
							className={cn(
								"text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 ml-3 flex w-full min-w-0 items-center justify-between font-semibold sm:ml-4 sm:border-l sm:pl-4",
								{
									"border-theme-primary-200 dark:border-theme-dark-700 dim:border-theme-dim-700 group-hover:dark:border-theme-dark-500 group-hover:dim:border-theme-dim-500":
										!isImportNewSelected,
									"border-theme-success-200 dark:border-theme-dark-600 dim:border-theme-dim-600":
										isImportNewSelected,
								},
							)}
						>
							<div
								className={cn("flex gap-2 text-sm leading-[17px] sm:text-base sm:leading-5", {
									"group-hover:text-theme-primary-900 dark:group-hover:text-theme-dark-200 dim:group-hover:text-theme-dim-50":
										!isImportNewSelected,
									"text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50":
										isImportNewSelected,
								})}
							>
								{t("WALLETS.PAGE_IMPORT_WALLET.HD_WALLET_SELECT_ACCOUNT_STEP.IMPORT_NEW_HD_WALLET")}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
