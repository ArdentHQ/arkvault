import { Button } from "@/app/components/Button";
import { Divider } from "@/app/components/Divider";
import { Icon } from "@/app/components/Icon";
import { Contracts } from "@/app/lib/profiles";
import { useState } from "react";
import { UpdateAccountName } from "@/domains/portfolio/components/ImportWallet/HDWallet/UpdateAccountName";
import { DeleteAddressMessage } from "./DeleteAddressMessage";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

export const AccountNameEditRow = ({
	accountName,
	profile,
	wallets,
	isDeleting,
	onDelete,
	onCancelDelete,
	onConfirmDelete,
}: {
	accountName?: string;
	profile: Contracts.IProfile;
	wallets: Contracts.IReadWriteWallet[];
	onDelete?: () => void;
	onCancelDelete?: () => void;
	onConfirmDelete?: () => void;
	isDeleting?: boolean;
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const { t } = useTranslation();

	if (accountName === "undefined") {
		return (
			<div
				className="text-theme-secondary-500 mt-4 mb-2 px-3 font-semibold"
				data-testid="AccountNameEditRow__empty"
			>
				<div>{t("COMMON.REGULAR_ADDRESS")}</div>
			</div>
		);
	}

	return (
		<div
			className={classNames("my-1 rounded-lg border", {
				"border-theme-danger-400 dark:border-theme-danger-400 dim:border-theme-danger-400": isDeleting,
				"border-theme-primary-200 dark:border-theme-dark-700 dim:border-theme-dim-700": !isDeleting,
			})}
			data-testid="AccountNameEditRow__wrapper"
		>
			<div className="px-4 py-3">
				<div className="flex items-center justify-between">
					<div className="no-ligatures text-theme-secondary-700 border-theme-secondary-300 dark:text-theme-secondary-200 dim:text-theme-dim-100 dark:border-theme-dark-700 dim:border-theme-dim-700 inline-block truncate overflow-hidden rounded border bg-transparent px-1 py-0.5 text-xs leading-[15px] font-semibold uppercase">
						{accountName}
					</div>
					<div className="flex items-center">
						<div className="text-theme-secondary-700 dark:text-theme-secondary-200 dark:hover:bg-theme-primary-500 hover:bg-theme-primary-800 dim:text-theme-dim-200 dim:bg-transparent dim-hover:bg-theme-dim-navy-500 dim-hover:text-white h-6 w-6 rounded bg-transparent transition-all duration-100 ease-linear hover:text-white dark:bg-transparent dark:hover:text-white">
							<Button
								variant="transparent"
								size="md"
								className="h-6 w-6 p-0"
								data-testid="AccountNameEditRow__edit"
								onClick={() => {
									setIsEditing(true);
									onCancelDelete?.();
								}}
							>
								<Icon name="Pencil" dimensions={[16, 16]} />
							</Button>
						</div>
						<Divider type="vertical" />
						<div
							className={classNames(
								"text-theme-secondary-700 dark:text-theme-secondary-200 dim:text-theme-dim-200 dim:bg-transparent h-6 w-6 rounded bg-transparent transition-all duration-100 ease-linear dark:bg-transparent",
								{
									"dark:hover:bg-theme-primary-500 hover:bg-theme-primary-800 dim-hover:bg-theme-dim-navy-500 dim-hover:text-white hover:text-white dark:bg-transparent dark:hover:text-white":
										!isDeleting,
								},
							)}
						>
							<Button
								variant="transparent"
								size="md"
								className="h-6 w-6 p-0"
								onClick={() => {
									setIsEditing(false);
									onDelete?.();
								}}
							>
								{!isDeleting && <Icon name="Trash" dimensions={[16, 16]} />}

								{isDeleting && (
									<Icon
										data-testid="icon-MarkedTrash"
										name="MarkedTrash"
										dimensions={[16, 16]}
										className="text-theme-secondary-500 dark:text-theme-dark-500 dim:text-theme-dim-200 p-1"
									/>
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>

			{isDeleting && (
				<DeleteAddressMessage
					confirmText={t("COMMON.DELETE_WALLET")}
					children={t("COMMON.DELETE_HD_WALLET_DESCRIPTION")}
					onConfirmDelete={() => {
						onConfirmDelete?.();
					}}
					onCancelDelete={() => {
						setIsEditing(false);
						onCancelDelete?.();
					}}
				/>
			)}

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
