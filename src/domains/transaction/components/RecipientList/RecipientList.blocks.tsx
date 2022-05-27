import React from "react";
import { useTranslation } from "react-i18next";

import { RecipientListItemProperties } from "./RecipientList.contracts";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { Avatar } from "@/app/components/Avatar";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";

export const RecipientListItem: React.VFC<RecipientListItemProperties> = ({
	disableButton,
	exchangeTicker,
	isEditable,
	label,
	listIndex,
	onRemove,
	recipient: { address, alias, amount },
	showAmount,
	showExchangeAmount,
	ticker,
	tooltipDisabled,
	variant,
}) => {
	const { t } = useTranslation();

	const { convert } = useExchangeRate({ exchangeTicker, ticker });

	const renderAmount = () => {
		if (!showAmount || amount === undefined) {
			return;
		}

		if (variant === "condensed") {
			return (
				<td className="flex-1 shrink-0 pl-3 text-right">
					<Amount ticker={ticker} value={amount} />
				</td>
			);
		}

		return (
			<td className="flex-1 shrink-0 py-6 pl-3 text-right">
				<div className="mb-1 text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
					{showExchangeAmount ? (
						<Amount ticker={exchangeTicker} value={convert(amount)} />
					) : (
						<span>{t("COMMON.AMOUNT")}</span>
					)}
				</div>
				<div className="font-semibold">
					<Amount ticker={ticker} value={amount} />
				</div>
			</td>
		);
	};

	if (variant === "condensed") {
		return (
			<tr
				className="flex items-center border-b border-dashed border-theme-secondary-300 py-4 last:border-b-0 dark:border-theme-secondary-800"
				data-testid="recipient-list__recipient-list-item"
			>
				<td className="mr-3 table-cell md:hidden">{renderAmount()}</td>

				<td className="hidden md:table-cell">
					<Avatar size="sm" address={address} />
				</td>

				<td className="w-28 flex-1 justify-end md:ml-4">
					<Address address={address} walletName={alias} />
				</td>

				<td className="ml-2 table-cell md:hidden">
					<Avatar size="xs" address={address} />
				</td>

				<td className="hidden md:table-cell">{renderAmount()}</td>
			</tr>
		);
	}

	const isButtonDisabled = disableButton?.(address) || false;

	return (
		<tr
			className="flex border-b border-dashed border-theme-secondary-300 last:border-b-0 dark:border-theme-secondary-800"
			data-testid="recipient-list__recipient-list-item"
		>
			<td className="flex-none py-6">
				<Avatar address={address} size="lg" />
			</td>

			<td className="ml-5 w-28 flex-1 py-6">
				<div className="mb-1 text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
					<span>{t(label ?? "COMMON.RECIPIENT_#", { count: listIndex + 1 })}</span>
				</div>
				<Address address={address} walletName={alias} />
			</td>

			{renderAmount()}

			{isEditable && (
				<td className="ml-3 flex-none py-6">
					<Tooltip content={tooltipDisabled} disabled={!isButtonDisabled}>
						<span className="inline-block">
							<Button
								disabled={isButtonDisabled}
								variant="danger"
								onClick={() => !isButtonDisabled && onRemove?.(listIndex)}
								data-testid="recipient-list__remove-recipient"
							>
								<div className="py-1">
									<Icon name="Trash" />
								</div>
							</Button>
						</span>
					</Tooltip>
				</td>
			)}
		</tr>
	);
};
