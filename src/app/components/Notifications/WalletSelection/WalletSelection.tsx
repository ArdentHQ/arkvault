import { Contracts } from "@/app/lib/profiles";
import { OptionLabel } from "@/domains/profile/components/SelectAddressDropdown";
import { Icon } from "@/app/components/Icon";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DropdownContent, DropdownRoot, DropdownToggle, DropdownListItem } from "@/app/components/SimpleDropdown";
import cn from "classnames";

export function WalletSelection({
	profile,
	onChange,
}: {
	profile: Contracts.IProfile;
	onChange?: (wallets: Contracts.IReadWriteWallet[]) => void;
}) {
	const { t } = useTranslation();
	const multipleViewText = t("WALLETS.ADDRESSES_SIDE_PANEL.TOGGLE.MULTIPLE_VIEW");
	const [selectedAlias, setSelectedAlias] = useState<string>(multipleViewText);

	return (
		<div className="relative inline-block">
			<DropdownRoot>
				<DropdownToggle>
					<div className="inline-block cursor-pointer rounded-sm border border-theme-secondary-300 px-3 py-2 text-sm font-semibold text-theme-secondary-700 dim:border-theme-dim-700 dim:text-theme-dim-200 dark:border-theme-dark-700 dark:text-theme-dark-200">
						<div className="flex items-center space-x-2">
							<span className="max-w-[14rem] truncate">{selectedAlias}</span>
							<Icon name="ChevronDownSmall" width={12} height={12} />
						</div>
					</div>
				</DropdownToggle>
				<DropdownContent className="border-none p-1">
					<ul>
						{profile
							.wallets()
							.values()
							.map((wallet) => (
								<DropdownListItem
									className={cn({
										"dim-bg-theme-dim-700 dim-text-theme-dim-50 bg-theme-secondary-200 text-theme-secondary-900 dark:bg-theme-dark-700 dark:text-theme-dark-50":
											selectedAlias === wallet.alias(),
									})}
									key={wallet.address()}
									onClick={() => {
										setSelectedAlias(wallet.alias()!);
										onChange?.([wallet]);
									}}
								>
									<div className="w-3xs sm:w-xs truncate">
										<OptionLabel
											network={profile.activeNetwork()}
											profile={profile}
											showBalance
											option={{
												isSelected: selectedAlias === wallet.alias(),
												value: wallet.address(),
											}}
										/>
									</div>
								</DropdownListItem>
							))}

						<DropdownListItem
							className={cn("w-full", {
								"dim-bg-theme-dim-700 dim-text-theme-dim-50 bg-theme-secondary-200 text-theme-secondary-900 dark:bg-theme-dark-700 dark:text-theme-dark-50":
									selectedAlias === multipleViewText,
							})}
							key="multiple"
							onClick={() => {
								setSelectedAlias(multipleViewText);
								onChange?.(profile.wallets().values());
							}}
						>
							<div className="flex w-full items-center justify-between">
								<span
									className={cn("w-full font-semibold leading-[17px] sm:leading-5", {
										"text-theme-primary-600 dim:text-theme-dim-50 dark:text-theme-secondary-50":
											selectedAlias === multipleViewText,
										"text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200":
											selectedAlias !== multipleViewText,
									})}
								>
									{multipleViewText}
								</span>

								{selectedAlias === multipleViewText && (
									<Icon
										name="CheckmarkDouble"
										size="md"
										className="text-theme-primary-600 dim:text-theme-dim-50 dark:text-theme-secondary-50"
									/>
								)}
							</div>
						</DropdownListItem>
					</ul>
				</DropdownContent>
			</DropdownRoot>
		</div>
	);
}
