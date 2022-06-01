import { sortByDesc } from "@payvo/sdk-helpers";
import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "react-table";

import { UnlockTokensFetchError } from "./blocks/UnlockTokensFetchError";
import { POLLING_INTERVAL, UnlockableBalance, UseUnlockableBalancesHook } from "./UnlockTokens.contracts";
import { Checkbox } from "@/app/components/Checkbox";
import { Tooltip } from "@/app/components/Tooltip";
import { useScheduler } from "@/app/hooks/use-scheduler";
import { toasts } from "@/app/services";

const useUnlockableBalances: UseUnlockableBalancesHook = (wallet) => {
	const loadCount = useRef(0);

	const { start, stop } = useScheduler({
		autostart: true,
		handler: () => fetch(),
		timeout: POLLING_INTERVAL,
	});

	const [items, setItems] = useState<UnlockableBalance[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	const fetch = async () => {
		setLoading(true);

		try {
			const response = await wallet.coin().client().unlockableBalances(wallet.address());

			setItems(
				sortByDesc(response.objects, (value) => value.timestamp.toUNIX()).map((value, index) => ({
					...value,
					id: `${index}`,
				})),
			);

			loadCount.current++;
		} catch {
			stop();

			setItems([]);

			toasts.warning(
				<UnlockTokensFetchError
					onRetry={
						/* istanbul ignore next */ () => {
							void toasts.dismiss();

							start();
						}
					}
				/>,
			);
		} finally {
			setLoading(false);
		}
	};

	return {
		isFirstLoad: loadCount.current === 1,
		items,
		loading,
	};
};

const useUnlockTokensSelectTableColumns = (
	isSelectDisabled: boolean,
	isAllSelected: boolean,
	onToggleAll: () => void,
) => {
	const { t } = useTranslation();

	return useMemo<Column<UnlockableBalance>[]>(
		() => [
			{
				Header: t("COMMON.AMOUNT"),
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				accessor: (unlockableBalance) => unlockableBalance.amount?.toNumber(),
				id: "amount",
			},
			{
				Header: t("COMMON.TIME"),
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				accessor: (unlockableBalance) => unlockableBalance.timestamp?.toUNIX(),
				id: "time",
			},
			{
				Header: (
					<>
						<span className="mr-3">{t("COMMON.STATUS")}</span>
						<Tooltip content={isAllSelected ? t("COMMON.UNSELECT_ALL") : t("COMMON.SELECT_ALL")}>
							<Checkbox disabled={isSelectDisabled} checked={isAllSelected} onChange={onToggleAll} />
						</Tooltip>
					</>
				),
				className: "justify-end float-right",
				id: "status",
			},
		],
		[t, isSelectDisabled, isAllSelected, onToggleAll],
	);
};

export { useUnlockableBalances, useUnlockTokensSelectTableColumns };
