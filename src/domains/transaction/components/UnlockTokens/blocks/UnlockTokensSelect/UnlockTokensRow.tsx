import React, { FC } from "react";
import { useTranslation } from "react-i18next";

import { UnlockTokensRowSkeleton } from "./UnlockTokensRowSkeleton";
import { UnlockTokensRowProperties } from "./UnlockTokensSelect.contracts";
import { Amount } from "@/app/components/Amount";
import { Checkbox } from "@/app/components/Checkbox";
import { Icon } from "@/app/components/Icon";
import { TableCell, TableRow } from "@/app/components/Table";

export const UnlockTokensRow: FC<UnlockTokensRowProperties> = ({ loading, item, ticker, onToggle, checked }) => {
	const { t } = useTranslation();

	if (loading) {
		return <UnlockTokensRowSkeleton />;
	}

	const date = item.timestamp.format("DD MMM YYYY");
	const time = item.timestamp.format("HH:mm:ss");
	const relativeTime = item.timestamp.fromNow();

	return (
		<TableRow>
			<TableCell variant="start">
				<Amount
					className="font-bold text-theme-secondary-900 dark:text-theme-secondary-200"
					value={item.amount.toHuman()}
					ticker={ticker}
				/>
			</TableCell>

			<TableCell>
				<time className="text-theme-secondary-700" dateTime={item.timestamp.toDate().toUTCString()}>
					{date} {t("COMMON.AT")} {time} ({relativeTime})
				</time>
			</TableCell>

			<TableCell variant="end" innerClassName="justify-end">
				{item.isReady ? (
					<div className="flex items-center">
						<div className="flex items-center">
							<span className="text-theme-secondary-700" data-testid="UnlockableBalanceRow__status">
								{t("TRANSACTION.UNLOCK_TOKENS.UNLOCKABLE")}
							</span>
							<Icon name="LockOpen" size="lg" className="ml-2 mr-3 text-theme-primary-600" />
						</div>
						<Checkbox checked={checked} onChange={onToggle} />
					</div>
				) : (
					<div className="flex items-center">
						<div className="flex items-center">
							<span className="text-theme-secondary-700" data-testid="UnlockableBalanceRow__status">
								{t("TRANSACTION.UNLOCK_TOKENS.LOCKED")}
							</span>
							<Icon name="Lock" size="lg" className="ml-2 mr-3 text-theme-secondary-700" />
						</div>
						<Checkbox checked={false} disabled />
					</div>
				)}
			</TableCell>
		</TableRow>
	);
};
