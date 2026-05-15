import { Contracts } from "@/app/lib/profiles";
import React, { JSX, useState } from "react";
import { Networks } from "@/app/lib/mainsail";
import {
	MultipleImport,
	SingleImport,
} from "@/domains/portfolio/components/ImportWallet/Ledger/LedgerImportStep.blocks";
import { DetailLabel, DetailTitle } from "@/app/components/DetailWrapper";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { AddressData } from "@/domains/portfolio/components/ImportWallet/HDWallet/HDWalletsTabs.contracts";
import { Button } from "@/app/components/Button";
import { UpdateAccountName } from "@/domains/portfolio/components/ImportWallet/HDWallet/UpdateAccountName";
import { Divider } from "@/app/components/Divider";

export const SummaryStep = ({
	network,
	wallets,
	profile,
	onClickEditWalletName,
}: {
	network: Networks.Network;
	wallets: AddressData[];
	profile: Contracts.IProfile;
	onClickEditWalletName: (wallet: Contracts.IReadWriteWallet) => void;
}): JSX.Element => {
	const [showAccountNameEdit, setShowAccountNameEdit] = useState(false);

	const importedAddresses = wallets.map((wallet) => wallet.address);

	const importedWallets = profile
		.wallets()
		.values()
		.filter((wallet) => importedAddresses.includes(wallet.address()));

	const accountName = importedWallets.at(0)!.accountName() as string;

	const { t } = useTranslation();
	return (
		<section data-testid="SummaryStep" className="space-y-4">
			{wallets.length > 1 ? (
				<MultipleImport
					wallets={wallets}
					profile={profile}
					network={network}
					onClickEditWalletName={onClickEditWalletName}
				/>
			) : (
				<SingleImport
					wallets={wallets}
					profile={profile}
					network={network}
					onClickEditWalletName={onClickEditWalletName}
				/>
			)}

			<div data-testid="DetailWrapper">
				<DetailLabel>{t("WALLETS.PAGE_IMPORT_WALLET.HD_WALLET_SUMMARY_STEP.DETAILS_LABEL")}</DetailLabel>
				<div
					className={cn(
						"mt-0 overflow-hidden rounded border-theme-secondary-300 dim:border-theme-dim-700 dark:border-theme-dark-700 sm:mt-2 sm:rounded-xl sm:border",
					)}
				>
					<div className="sm:in-[.condensed]:py-4 flex w-full items-center justify-between gap-4 space-x-2 break-words p-3 sm:justify-start sm:gap-3 sm:space-x-0 sm:px-6 sm:py-5">
						<DetailTitle className="w-auto text-theme-secondary-700 sm:w-[78px]">
							{t("COMMON.NAME")}
						</DetailTitle>

						<div className="flex w-full min-w-0 items-center justify-end sm:justify-between">
							<div className="truncate font-semibold uppercase text-theme-secondary-900 dim:text-theme-dim-200 dark:text-theme-secondary-200">
								{accountName}
							</div>

							<Divider
								type="vertical"
								className="mx-2 border-theme-secondary-400 dim:border-theme-dim-600 dark:border-theme-dark-600 sm:hidden"
							/>

							<Button
								data-testid="UpdateAccountName"
								onClick={() => setShowAccountNameEdit(true)}
								disabled={showAccountNameEdit}
								variant="transparent"
								icon="Pencil"
								className="p-px text-theme-navy-600"
							>
								{t("COMMON.EDIT")}
							</Button>
						</div>
					</div>
					<div
						className={cn(
							"overflow-hidden px-3 transition-all duration-300 sm:px-0",
							showAccountNameEdit ? "max-h-52 opacity-100" : "max-h-0 opacity-0",
						)}
					>
						{showAccountNameEdit && (
							<UpdateAccountName
								onAfterSave={() => setShowAccountNameEdit(false)}
								onCancel={() => setShowAccountNameEdit(false)}
								profile={profile}
								wallets={importedWallets}
							/>
						)}
					</div>
				</div>
			</div>
		</section>
	);
};
