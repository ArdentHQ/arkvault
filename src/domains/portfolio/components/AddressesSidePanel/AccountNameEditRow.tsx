import { Button } from "@/app/components/Button";
import { Divider } from "@/app/components/Divider";
import { Icon } from "@/app/components/Icon";
import { Contracts } from "@/app/lib/profiles";
import { useState } from "react";
import { UpdateAccountName } from "@/domains/portfolio/components/ImportWallet/HDWallet/UpdateAccountName";

export const AccountNameEditRow = ({
	accountName,
	profile,
	wallets,
}: {
	accountName?: string;
	profile: Contracts.IProfile;
	wallets: Contracts.IReadWriteWallet[];
}) => {
	const [isEditing, setIsEditing] = useState(false);

	if (accountName === "Regular Address") {
		return (
			<div className="text-theme-secondary-500 mt-4 mb-2 px-3 font-semibold">
				<div>{accountName}</div>
			</div>
		);
	}

	return (
		<div className="border-theme-primary-200 dark:border-theme-dark-700 dim:border-theme-dim-700 my-1 rounded-lg border">
			<div className="px-4 py-3">
				<div className="flex items-center justify-between">
					<div className="no-ligatures text-theme-primary-600 border-theme-primary-200 dark:text-theme-secondary-200 dim:text-theme-dim-100 dark:border-theme-dark-700 dim:border-theme-dim-700 inline-block truncate overflow-hidden rounded border bg-transparent px-1 py-0.5 text-xs leading-[15px] font-semibold uppercase">
						{accountName}
					</div>
					<div className="flex items-center">
						<Button
							variant="transparent"
							size="md"
							className="h-6 w-6 p-0"
							onClick={() => {
								setIsEditing(true);
							}}
						>
							<Icon name="Pencil" className="h-4 w-4" />
						</Button>
						<Divider type="vertical" />
						<Button variant="transparent" size="md" className="h-6 w-6 p-0">
							<Icon name="Trash" className="h-4 w-4" />
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
	);
};
