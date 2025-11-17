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
							<span className="">{selectedAlias}</span>
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
									<div className="w-xs">
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
							<OptionLabel
								network={profile.activeNetwork()}
								profile={profile}
								option={{
									isSelected:
										selectedAlias === t("WALLETS.ADDRESSES_SIDE_PANEL.TOGGLE.MULTIPLE_VIEW"),
									value: t("WALLETS.ADDRESSES_SIDE_PANEL.TOGGLE.MULTIPLE_VIEW"),
								}}
							/>
						</DropdownListItem>
					</ul>
				</DropdownContent>
			</DropdownRoot>
		</div>
	);
}
