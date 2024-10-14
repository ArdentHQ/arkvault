import React from "react";
import { useTranslation } from "react-i18next";
import { useActiveProfile } from "@/app/hooks";
import { useWalletFilters } from "@/domains/dashboard/components/FilterWallets/hooks";
import { WalletsControls } from "@/domains/wallet/components/WalletsControls";
import { useWalletActions } from "@/domains/wallet/hooks/use-wallet-actions";

export const PortfolioHeader: React.VFC = () => {
	const { t } = useTranslation();
	const profile = useActiveProfile();
	const filterProperties = useWalletFilters({ profile });
	const { handleImport, handleCreate, handleImportLedger } = useWalletActions();
	const { update } = filterProperties;

	return (
		<>
			<div
				className="-mx-8 -mt-8 flex items-center justify-between border-b border-theme-secondary-300 bg-theme-secondary-100 px-6 py-1.5 dark:border-theme-secondary-800 dark:bg-black sm:mx-0 sm:mb-6 sm:mt-0 sm:border-b-0 sm:bg-transparent sm:px-0 sm:py-0 sm:dark:bg-transparent"
				data-testid="Portfolio__Header"
			>
				<div className="text-lg font-bold leading-5 sm:text-2xl">{t("COMMON.PORTFOLIO")}</div>

				<div className="-mr-4 text-right sm:mr-0">
					<WalletsControls
						filterProperties={filterProperties}
						onCreateWallet={handleCreate}
						onImportWallet={handleImport}
						onImportLedgerWallet={handleImportLedger}
						onFilterChange={update}
					/>
				</div>
			</div>
		</>
	);
};
