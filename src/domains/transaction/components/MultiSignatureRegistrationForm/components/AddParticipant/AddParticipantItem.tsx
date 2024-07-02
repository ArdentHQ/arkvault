import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useMemo, VFC } from "react";
import { useTranslation } from "react-i18next";

import { Address } from "@/app/components/Address";
import { Avatar } from "@/app/components/Avatar";
import { Button } from "@/app/components/Button";
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
			className="mt-3 border-b border-dashed border-theme-secondary-300 pb-4 dark:border-theme-secondary-800"
		>
			<div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
				<div className="hidden sm:block">
					<Avatar size="lg" address={address} />
				</div>
				<div className="flex max-w-full flex-1 flex-row items-center space-x-4 overflow-auto sm:flex-col sm:items-start sm:space-x-0 sm:space-y-1">
					<div className="whitespace-nowrap text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
						{t("TRANSACTION.MULTISIGNATURE.PARTICIPANT_#", { count: index + 1 })}
					</div>
					<div className="max-w-full overflow-auto sm:w-full">
						<Address address={address} walletName={alias} />
					</div>
					<div className="sm:hidden">
						<Avatar size="xs" address={address} />
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
							onClick={() => onDelete(index)}
							data-testid="AddParticipantItem--deleteButton"
							className="w-full sm:w-auto"
						>
							<div className="flex items-center space-x-2 py-1">
								<Icon name="Trash" />
								<div className="block sm:hidden">{t("COMMON.REMOVE")}</div>
							</div>
						</Button>
					</Tooltip>
				</div>
			</div>
		</div>
	);
};
