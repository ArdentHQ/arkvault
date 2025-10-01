import React, { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Contracts } from "@/app/lib/profiles";
import cn from "classnames";
import { RadioButton } from "@/app/components/RadioButton";
import { Divider } from "@/app/components/Divider";

interface HDWalletOption {
	accountName: string;
	mnemonic: string;
	addressCount: number;
	isEncrypted: boolean;
}

interface SelectAccountStepProperties {
	profile: Contracts.IProfile;
}

interface AccountCardProperties {
	isSelected: boolean;
	onClick: () => void;
	testId: string;
	radioTestId: string;
	dividerSize?: "md" | "xl";
	children: React.ReactNode;
}

const AccountCard = ({
	isSelected,
	onClick,
	testId,
	radioTestId,
	dividerSize = "xl",
	children,
}: AccountCardProperties) => (
	<button
		type="button"
		data-testid={testId}
		onClick={onClick}
		className={cn(
			"border-theme-primary-200 dark:border-theme-dark-700 dim:border-theme-dim-700",
			"hover:bg-theme-primary-200 dark:hover:bg-theme-dark-700 dim-hover:bg-theme-dim-700",
			"w-full cursor-pointer rounded-lg border px-4 py-3 text-left transition-all duration-300",
			{
				"bg-theme-secondary-200 dark:bg-theme-dark-950 dim:bg-theme-dim-950": isSelected,
				"bg-transparent": !isSelected,
			},
		)}
	>
		<div className="flex flex-row items-center gap-4">
			<RadioButton
				checked={isSelected}
				color="info"
				className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 m-0 h-5 w-5 border-2 checked:border-transparent"
				data-testid={radioTestId}
			/>

			<Divider
				size={dividerSize}
				type="vertical"
				className="text-theme-primary-200 dark:text-theme-dark-700 dim:text-theme-dim-700 m-0"
			/>

			{children}
		</div>
	</button>
);

export const SelectAccountStep = ({ profile }: SelectAccountStepProperties) => {
	const { t } = useTranslation();
	const { setValue, watch, register, unregister } = useFormContext();

	const selectedAccountName = watch("selectedAccountName");

	const hdWallets = useMemo(() => {
		const walletsByAccountName = new Map<string, Contracts.IReadWriteWallet[]>();

		for (const wallet of profile
			.wallets()
			.values()
			.filter((wallet) => wallet.isHDWallet())) {
			const accountName = wallet.accountName() || "";
			const existing = walletsByAccountName.get(accountName) || [];
			walletsByAccountName.set(accountName, [...existing, wallet]);
		}

		const options: HDWalletOption[] = [];

		for (const [accountName, wallets] of walletsByAccountName.entries()) {
			const firstWallet = wallets[0];
			const isEncrypted = firstWallet.signingKey().exists();

			options.push({
				accountName,
				addressCount: wallets.length,
				isEncrypted,
				mnemonic: "",
			});
		}

		return options;
	}, [profile]);

	useEffect(() => {
		register("selectedAccountName", { required: true });
		register("isExistingHDWallet");

		return () => {
			unregister(["selectedAccountName", "isExistingHDWallet"]);
		};
	}, [register, unregister]);

	const handleSelectAccount = (option: HDWalletOption) => {
		setValue("selectedAccountName", option.accountName, {
			shouldDirty: true,
			shouldValidate: true,
		});
		setValue("isExistingHDWallet", true);

		// TODO: Handle mnemonic for encrypted wallets
		setValue("mnemonic", "");
	};

	const handleImportNew = () => {
		setValue("selectedAccountName", "new", {
			shouldDirty: true,
			shouldValidate: true,
		});
		setValue("mnemonic", "");
		setValue("isExistingHDWallet", false);
	};

	return (
		<section data-testid="SelectAccountStep">
			<div className="flex flex-col">
				<div className="flex flex-col gap-3">
					{hdWallets.map((option) => {
						const isSelected = selectedAccountName === option.accountName;

						return (
							<AccountCard
								key={option.accountName}
								isSelected={isSelected}
								onClick={() => void handleSelectAccount(option)}
								testId={`SelectAccountStep__option-${option.accountName}`}
								radioTestId="SelectAccountStep__option-radio"
							>
								<div className="flex min-w-0 flex-1 flex-col gap-2">
									<div className="text-theme-secondary-900 dark:text-theme-dark-50 text-base leading-5 font-semibold">
										{option.accountName}
									</div>
									<div className="text-theme-secondary-700 dark:text-theme-dark-200 text-sm leading-[17px] font-semibold">
										{option.isEncrypted
											? t(
													"WALLETS.PAGE_IMPORT_WALLET.HD_WALLET_SELECT_ACCOUNT_STEP.ENCRYPTED_PASSWORD",
												)
											: t("COMMON.MNEMONIC")}
									</div>
								</div>

								<div className="text-theme-secondary-900 dark:text-theme-dark-50 text-right text-base leading-5 font-semibold">
									{t("WALLETS.PAGE_IMPORT_WALLET.HD_WALLET_SELECT_ACCOUNT_STEP.ADDRESS_COUNT", {
										count: option.addressCount,
									})}
								</div>
							</AccountCard>
						);
					})}
				</div>

				{hdWallets.length > 0 && (
					<div
						className={cn(
							"my-2 flex items-center",
							"before:border-theme-secondary-300 dark:before:border-theme-dark-700 dim:before:border-theme-dim-700 before:flex-1 before:border-t before:border-dashed",
							"after:border-theme-secondary-300 dark:after:border-theme-dark-700 dim:after:border-theme-dim-700 after:flex-1 after:border-t after:border-dashed",
						)}
					>
						<span className="text-theme-secondary-500 dim:text-theme-dim-500 px-3 text-sm leading-[17px] font-semibold lowercase">
							{t("COMMON.OR")}
						</span>
					</div>
				)}

				<AccountCard
					isSelected={selectedAccountName === "new"}
					onClick={handleImportNew}
					testId="SelectAccountStep__import-new"
					radioTestId="SelectAccountStep__import-new-radio"
					dividerSize="md"
				>
					<div className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 text-base font-semibold">
						{t("WALLETS.PAGE_IMPORT_WALLET.HD_WALLET_SELECT_ACCOUNT_STEP.IMPORT_NEW")}
					</div>
				</AccountCard>
			</div>
		</section>
	);
};
