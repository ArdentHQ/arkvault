import React, { useEffect, useState, VFC } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { WalletActionsProperties } from "./WalletHeader.contracts";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { useEnvironmentContext } from "@/app/contexts";
import { useWalletSync } from "@/domains/wallet/hooks";
import { usePrevious } from "@/app/hooks";
import { twMerge } from "tailwind-merge";

const WalletHeaderButton = ({ ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
	<button
		{...props}
		className={twMerge(
			"inline-flex h-4 w-4 items-center justify-center rounded p-0 text-theme-secondary-700 outline-none transition-all duration-100 ease-linear hover:text-theme-secondary-200 focus:outline-none focus:ring-2 focus:ring-theme-primary-400 disabled:cursor-not-allowed disabled:text-theme-secondary-800 dark:text-theme-secondary-600",
			props.className,
		)}
	/>
);

export const WalletActions: VFC<WalletActionsProperties> = ({ profile, wallet, isUpdatingTransactions, onUpdate }) => {
	const { env } = useEnvironmentContext();
	const { syncAll } = useWalletSync({ env, profile });
	const [isSyncing, setIsSyncing] = useState(false);
	const previousIsUpdatingTransactions = usePrevious(isUpdatingTransactions);

	const { t } = useTranslation();

	const syncWallet = async () => {
		onUpdate?.(true);
		setIsSyncing(true);

		await syncAll(wallet);

		if (isUpdatingTransactions === undefined) {
			setIsSyncing(false);
			onUpdate?.(false);
		}
	};

	useEffect(() => {
		if (isSyncing && previousIsUpdatingTransactions && !isUpdatingTransactions) {
			setIsSyncing(false);
			onUpdate?.(false);
		}
	}, [isSyncing, previousIsUpdatingTransactions, isUpdatingTransactions, onUpdate]);

	return (
		<Tooltip
			content={isSyncing ? t("WALLETS.UPDATING_WALLET_DATA") : t("WALLETS.UPDATE_WALLET_DATA")}
			theme="dark"
			disabled={!wallet.hasSyncedWithNetwork()}
		>
			<WalletHeaderButton
				data-testid="WalletHeader__refresh"
				type="button"
				aria-busy={isSyncing}
				onClick={syncWallet}
				disabled={isSyncing}
			>
				<Icon
					dimensions={[15, 15]}
					name="ArrowRotateLeft"
					className={cn("text-theme-secondary-700 hover:text-theme-secondary-200 dark:text-theme-dark-200", {
						"animate-spin": isSyncing,
					})}
					style={{ animationDirection: "reverse" }}
				/>
			</WalletHeaderButton>
		</Tooltip>
	);
};
