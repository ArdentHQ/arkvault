import { Contracts } from "@/app/lib/profiles";
import { OptionLabel } from "@/domains/profile/components/SelectAddressDropdown";
import { Icon } from "@/app/components/Icon";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DropdownContent, DropdownRoot, DropdownToggle, DropdownListItem } from "@/app/components/SimpleDropdown";

export function WalletSelection({
	profile,
	onChange,
}: {
	profile: Contracts.IProfile;
	onChange?: (wallets: Contracts.IReadWriteWallet[]) => void;
}) {
	const { t } = useTranslation();
	const [selectedAlias, setSelectedAlias] = useState<string>(t("WALLETS.ADDRESSES_SIDE_PANEL.TOGGLE.MULTIPLE_VIEW"));

	return (
		<div className="relative inline-block">
			<DropdownRoot>
				<DropdownToggle>
					<div className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200 inline-block cursor-pointer rounded-sm border px-3 py-2 text-sm font-semibold">
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
									key={wallet.address()}
									onClick={() => {
										setSelectedAlias(wallet.alias()!);
										onChange?.([wallet]);
									}}
								>
									<div className="w-3xs truncate sm:w-xs">
										<OptionLabel
											network={profile.activeNetwork()}
											profile={profile}
											option={{
												isSelected: selectedAlias === wallet.alias(),
												value: wallet.address(),
											}}
										/>
									</div>
								</DropdownListItem>
							))}

						<DropdownListItem
							className="w-full"
							key="multiple"
							onClick={() => {
								setSelectedAlias(t("WALLETS.ADDRESSES_SIDE_PANEL.TOGGLE.MULTIPLE_VIEW"));
								onChange?.(profile.wallets().values());
							}}
						>
							<div className="flex w-full items-center justify-between">
								<span className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 w-full leading-[17px] font-semibold sm:leading-5">
									{t("WALLETS.ADDRESSES_SIDE_PANEL.TOGGLE.MULTIPLE_VIEW")}
								</span>

								{selectedAlias === t("WALLETS.ADDRESSES_SIDE_PANEL.TOGGLE.MULTIPLE_VIEW") && (
									<Icon
										name="CheckmarkDouble"
										size="md"
										className="text-theme-primary-600 dark:text-theme-secondary-50 dim:text-theme-dim-50"
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
