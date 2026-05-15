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
				className="mb-2 mt-4 px-3 font-semibold text-theme-secondary-500"
				data-testid="AccountNameEditRow__empty"
			>
				<div>{t("COMMON.REGULAR_ADDRESS")}</div>
			</div>
		);
	}

	return (
		<div
			className={classNames("my-1 rounded-lg border", {
				"border-theme-danger-400 dim:border-theme-danger-400 dark:border-theme-danger-400": isDeleting,
				"border-theme-primary-200 dim:border-theme-dim-700 dark:border-theme-dark-700": !isDeleting,
			})}
			data-testid="AccountNameEditRow__wrapper"
		>
			<div className="px-4 py-3">
				<div className="flex items-center justify-between">
					<div className="no-ligatures inline-block overflow-hidden truncate rounded border border-theme-secondary-300 bg-transparent px-1 py-0.5 text-xs font-semibold uppercase leading-[15px] text-theme-secondary-700 dim:border-theme-dim-700 dim:text-theme-dim-100 dark:border-theme-dark-700 dark:text-theme-secondary-200">
						{accountName}
					</div>
					<div className="flex items-center">
						<div className="h-6 w-6 rounded bg-transparent text-theme-secondary-700 transition-all duration-100 ease-linear hover:bg-theme-primary-800 hover:text-white dim:bg-transparent dim:text-theme-dim-200 dim-hover:bg-theme-dim-navy-500 dim-hover:text-white dark:bg-transparent dark:text-theme-secondary-200 dark:hover:bg-theme-primary-500 dark:hover:text-white">
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
								"h-6 w-6 rounded bg-transparent text-theme-secondary-700 transition-all duration-100 ease-linear dim:bg-transparent dim:text-theme-dim-200 dark:bg-transparent dark:text-theme-secondary-200",
								{
									"hover:bg-theme-primary-800 hover:text-white dim-hover:bg-theme-dim-navy-500 dim-hover:text-white dark:bg-transparent dark:hover:bg-theme-primary-500 dark:hover:text-white":
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
										className="p-1 text-theme-secondary-500 dim:text-theme-dim-200 dark:text-theme-dark-500"
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
