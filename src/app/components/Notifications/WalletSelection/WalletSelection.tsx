import { Contracts } from "@/app/lib/profiles";
import { Dropdown, DropdownOption } from "@/app/components//Dropdown";
import { OptionLabel } from "@/domains/profile/components/SelectAddressDropdown";
import { Icon } from "@/app/components/Icon";
import { useState } from "react";
import { useTranslation } from "react-i18next";


export function WalletSelection({ profile, onChange }: { profile: Contracts.IProfile, onChange?: (wallets: Contracts.IReadWriteWallet[]) => void }) {
	const { t } = useTranslation()

	const multipleOption = {
		label: t("WALLETS.ADDRESSES_SIDE_PANEL.TOGGLE.MULTIPLE_VIEW"),
		value: t("WALLETS.ADDRESSES_SIDE_PANEL.TOGGLE.MULTIPLE_VIEW"),
	}
	const [selected, setSelected] = useState<DropdownOption>(multipleOption)

	const options = profile.wallets().values().map(wallet => {
		return {
			element:
				<div className="w-xs">
					<OptionLabel
						network={profile.activeNetwork()}
						profile={profile}
						option={{ value: wallet.address(), isSelected: selected.value === wallet.alias() }}
					/>
				</div>,
			label: "",
			value: wallet.alias()!
		}
	})

	return (
		<div className="inline-block w-auto relative">
			<Dropdown
				toggleContent={() =>
					<div className="inline-block cursor-pointer px-3 py-2 border border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 text-sm font-semibold rounded-sm text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200">
						<div className="flex items-center space-x-2">
							<span className="">{selected.value}</span>
							<Icon name="ChevronDownSmall" width={12} height={12} />
						</div>
					</div>
				}
				onSelect={(option) => {
					setSelected(option)

					if (option.value === multipleOption.value) {
						onChange?.(profile.wallets().values())
						return
					}

					const wallet = profile.wallets().findByAlias(option.value as string)
					if (wallet) {
						onChange?.([wallet])
					}

					setSelected(option)
				}}
				options={[...options, {
					element: <OptionLabel
						network={profile.activeNetwork()}
						profile={profile}
						option={{ value: multipleOption.value, isSelected: selected.value === multipleOption.value }}
					/>,
					label: "",
					value: multipleOption.value
				}]}
			/>
		</div>
	)
}
