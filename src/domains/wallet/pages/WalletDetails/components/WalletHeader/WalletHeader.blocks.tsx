import React, { useEffect, useState, VFC } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { WalletActionsProperties } from "./WalletHeader.contracts";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { useEnvironmentContext } from "@/app/contexts";
import { useWalletSync } from "@/domains/wallet/hooks";
import { usePrevious } from "@/app/hooks";
import { Button } from "@/app/components/Button";

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
		>
			<Button
				data-testid="WalletHeader__refresh"
				onClick={syncWallet}
				disabled={isSyncing}
				variant="primary-transparent"
				className="p-1"
			>
				<Icon
					name="ArrowRotateLeft"
					style={{ animationDirection: "reverse" }}
					className={cn({
						"animate-spin": isSyncing,
					})}
				/>
			</Button>
		</Tooltip>
	);
};
