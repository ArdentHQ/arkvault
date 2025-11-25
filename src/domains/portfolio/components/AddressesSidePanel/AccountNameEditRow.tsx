import { Button } from "@/app/components/Button";
import { Divider } from "@/app/components/Divider";
import { Icon } from "@/app/components/Icon";
import { Contracts } from "@/app/lib/profiles";
import { useState } from "react";
import { UpdateAccountName } from "../ImportWallet/HDWallet/UpdateAccountName";

export const AccountNameEditRow = ({ accountName, profile, wallets }: { accountName?: string, profile: Contracts.IProfile, wallets: Contracts.IReadWriteWallet[] }) => {
	const [isEditing, setIsEditing] = useState(false)


	if (accountName === "Regular Address") {
		return (
			<div className="mt-4 mb-2 text-theme-secondary-500 px-3 font-semibold">
				<div>{accountName}</div>
			</div>
		)
	}

	return (
		<div className="my-1 rounded-lg border border-theme-primary-200 dark:border-theme-dark-700 dim:border-theme-dim-700">
			<div className="py-3 px-4">
				<div className="flex items-center justify-between">
					<div className="inline-block font-semibold overflow-hidden no-ligatures px-1 rounded text-theme-primary-600 border-theme-primary-200 bg-transparent dark:text-theme-secondary-200 dim:text-theme-dim-100 dark:border-theme-dark-700 dim:border-theme-dim-700 text-xs leading-[15px] truncate border py-0.5 uppercase">{accountName}</div>
					<div className="flex items-center">
						<Button
							variant="transparent"
							size="md"
							className="p-0 h-6 w-6"
							onClick={() => {
								setIsEditing(true)
							}}
						>
							<Icon name="Pencil" className="w-4 h-4" />
						</Button>
						<Divider type="vertical" />
						<Button
							variant="transparent"
							size="md"
							className="p-0 h-6 w-6"
						>
							<Icon name="Trash" className="w-4 h-4" />
						</Button>
					</div>
				</div>
			</div>

			{isEditing && (
				<UpdateAccountName
					onAfterSave={() => setIsEditing(false)}
					onCancel={() => setIsEditing(false)}
					profile={profile}
					wallets={wallets}
				/>
			)}
		</div>
	)
}
