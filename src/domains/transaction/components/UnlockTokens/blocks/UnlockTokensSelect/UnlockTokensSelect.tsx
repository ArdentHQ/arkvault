import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { UnlockTokensRow } from "./UnlockTokensRow";
import { UnlockTokensSelectProperties } from "./UnlockTokensSelect.contracts";
import { UnlockTokensTotal } from "./UnlockTokensTotal";
import { Button } from "@/app/components/Button";
import { EmptyBlock } from "@/app/components/EmptyBlock";
import { Header } from "@/app/components/Header";
import { Table } from "@/app/components/Table";
import { useFees } from "@/app/hooks";
import {
	UnlockableBalance,
	UnlockTokensFormState,
} from "@/domains/transaction/components/UnlockTokens/UnlockTokens.contracts";
import { useUnlockTokensSelectTableColumns } from "@/domains/transaction/components/UnlockTokens/UnlockTokens.helpers";

const SKELETON_ROWS = Array.from<UnlockableBalance>({ length: 3 }).fill({} as UnlockableBalance);

export const UnlockTokensSelect: FC<UnlockTokensSelectProperties> = ({
	wallet,
	profile,
	onClose,
	onUnlock,
	items,
	loading,
	isFirstLoad,
}) => {
	const { t } = useTranslation();

	const { setValue, watch } = useFormContext<UnlockTokensFormState>();
	const { amount, fee, selectedObjects } = watch();

	const [isLoadingFee, setIsLoadingFee] = useState<boolean>(false);
	const [selectedIds, setSelectedIds] = useState<string[]>(selectedObjects.map((value) => value.id));

	const { calculate } = useFees(profile);

	const { data, isEmpty, isLoading } = useMemo(
		() => ({
			data: loading && items.length === 0 ? SKELETON_ROWS : items,
			isEmpty: !loading && items.length === 0,
			isLoading: loading && items.length === 0, // show skeleton only on initial loading
		}),
		[items, loading],
	);

	const selectableObjects = useMemo(() => items.filter((item) => item.isReady), [items]);

	const isAllSelected = useMemo(
		() => selectableObjects.every((item) => selectedIds.includes(item.id)),
		[selectedIds, selectableObjects],
	);

	useEffect(() => {
		// pre-select unlockable items on first load
		if (isFirstLoad && selectableObjects.length > 0 && selectedIds.length === 0) {
			setSelectedIds(selectableObjects.map((item) => item.id));
		}
	}, [selectableObjects, isFirstLoad]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		setValue(
			"selectedObjects",
			items.filter((item) => selectedIds.includes(item.id)),
		);
	}, [items, selectedIds, setValue]);

	useEffect(() => {
		const recalculateAmount = () => {
			let amount = 0;

			for (const object of selectedObjects) {
				amount = amount + object.amount.toHuman();
			}

			setValue("amount", amount);
		};

		const recalculateFee = async () => {
			if (selectedObjects.length === 0) {
				setValue("fee", 0);
				return;
			}

			setIsLoadingFee(true);

			const fees = await calculate({
				coin: wallet.coinId(),
				data: { objects: selectedObjects },
				network: wallet.networkId(),
				type: "unlockToken",
			});

			setValue("fee", fees.min);
			setIsLoadingFee(false);
		};

		recalculateAmount();
		void recalculateFee();
	}, [calculate, selectedObjects, setValue, wallet]);

	const toggle = (itemId: string): void => {
		setSelectedIds((value) => (value.includes(itemId) ? value.filter((id) => id !== itemId) : [...value, itemId]));
	};

	const onToggleAll = useCallback(() => {
		if (selectableObjects.some((item) => selectedIds.includes(item.id))) {
			setSelectedIds([]);
			return;
		}
		setSelectedIds(selectableObjects.map((item) => item.id));
	}, [selectableObjects, selectedIds, setSelectedIds]);

	const columns = useUnlockTokensSelectTableColumns(selectableObjects.length === 0, isAllSelected, onToggleAll);

	const renderTokens = useCallback(() => {
		if (isEmpty) {
			return <EmptyBlock>{t("TRANSACTION.UNLOCK_TOKENS.EMPTY_MESSAGE")}</EmptyBlock>;
		}

		return (
			<>
				<div className="relative border-b border-theme-secondary-300 dark:border-theme-secondary-800">
					<Table columns={columns} data={data}>
						{(item: UnlockableBalance) => (
							<UnlockTokensRow
								item={item}
								loading={isLoading}
								ticker={wallet.currency()}
								onToggle={() => toggle(item.id)}
								checked={selectedIds.includes(item.id)}
							/>
						)}
					</Table>
				</div>
				<UnlockTokensTotal
					fee={fee}
					isLoadingFee={isLoadingFee}
					isLoading={isLoading}
					amount={amount}
					wallet={wallet}
				/>
			</>
		);
	}, [amount, columns, data, fee, isEmpty, isLoading, isLoadingFee, selectedIds, t, wallet]);

	return (
		<>
			<Header
				title={t("TRANSACTION.UNLOCK_TOKENS.SELECT.TITLE")}
				subtitle={t("TRANSACTION.UNLOCK_TOKENS.SELECT.DESCRIPTION")}
			/>

			<div className="py-3">{renderTokens()}</div>
			<div className="flex justify-end space-x-3">
				<Button variant="secondary" onClick={onClose}>
					{t("COMMON.CLOSE")}
				</Button>
				<Button variant="primary" disabled={selectedIds.length === 0 || isLoadingFee} onClick={onUnlock}>
					{t("TRANSACTION.UNLOCK_TOKENS.UNLOCK")}
				</Button>
			</div>
		</>
	);
};
