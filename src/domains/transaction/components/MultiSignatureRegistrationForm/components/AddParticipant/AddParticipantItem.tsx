import { Contracts } from "@ardenthq/sdk-profiles";
import React, { VFC, useMemo } from "react";

import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/Button";
import { Avatar } from "@/app/components/Avatar";
import { Address } from "@/app/components/Address";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";

export const AddParticipantItem: VFC<{
	index: number;
	wallet: Contracts.IReadWriteWallet;
	participant: {
		address: string;
		alias?: string;
	};
	onDelete: (index: number) => void;
}> = ({ wallet, participant: { address, alias }, index, onDelete }) => {
	const { t } = useTranslation();
	const deleteButtonIsDisabled = useMemo(() => address === wallet.address(), [address, wallet.address()]);

	return (
		<div
			data-testid="AddParticipantItem"
			className="pt-3 border-t border-dashed border-theme-secondary-300 last:pb-0 pb-3 dark:border-theme-secondary-800"
		>
			<div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
				<div className="flex max-w-full flex-1 flex-row items-center space-x-4 overflow-auto sm:flex-col sm:items-start sm:space-x-0 sm:space-y-1">
					<div className="whitespace-nowrap text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
						{t("TRANSACTION.MULTISIGNATURE.PARTICIPANT_#", { count: index + 1 })}
					</div>
					<div className="max-w-full overflow-auto sm:w-full">
						<Address address={address} walletName={alias} />
					</div>
				</div>
				<div className="w-full sm:w-auto">
					<Tooltip
						content={t("TRANSACTION.MULTISIGNATURE.REMOVE_NOT_ALLOWED")}
						disabled={!deleteButtonIsDisabled}
					>
						<Button
							disabled={deleteButtonIsDisabled}
							variant="danger"
							size="icon"
							onClick={() => onDelete(index)}
							data-testid="AddParticipantItem--deleteButton"
							className="w-full sm:w-auto p-3.5"
						>
							<Icon name="Trash" />
						</Button>
					</Tooltip>
				</div>
			</div>
		</div>
	);
};
