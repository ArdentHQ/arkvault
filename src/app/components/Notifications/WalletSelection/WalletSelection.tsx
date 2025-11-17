import { Contracts } from "@/app/lib/profiles";
import { Dropdown } from "@/app/components//Dropdown";
import { OptionLabel } from "@/domains/profile/components/SelectAddressDropdown";

export function WalletSelection({ profile }: { profile: Contracts.IProfile }) {

	const options = profile.wallets().values().map(wallet => {
		return {
			element: <OptionLabel
				network={profile.activeNetwork()}
				profile={profile}
				option={{ value: profile.wallets().first().address() }}
			/>,
			label: "",
			value: wallet.address()
		}
	})

	return (
		<div>
			<Dropdown
				wrapperClass="w-full border-none"
				variant="options"
				toggleContent={(isOpen) => <div className="w-32">toggle content {isOpen}</div>}
				onSelect={async (option) => {
					console.log("onSelect", option)
				}}
				options={options}
			/>
		</div>
	)
}
