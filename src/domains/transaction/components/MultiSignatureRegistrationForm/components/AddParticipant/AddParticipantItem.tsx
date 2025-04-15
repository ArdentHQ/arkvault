import { Contracts } from "@ardenthq/sdk-profiles";
import React, { VFC, useMemo } from "react";

import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/Button";
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
			className="border-theme-secondary-300 dark:border-theme-secondary-800 mb-3 overflow-hidden rounded-xs border bg-white last:mb-0 sm:rounded-none sm:border-x-0 sm:border-b-0 sm:border-dashed sm:bg-transparent sm:pt-3 dark:bg-black sm:dark:bg-transparent"
		>
			<div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
				<div className="flex w-full flex-1 flex-col sm:w-auto sm:items-start sm:space-y-1 sm:space-x-0">
					<div className="bg-theme-secondary-100 dark:bg-theme-secondary-900 flex w-full flex-1 flex-row items-center justify-between px-4 py-3 sm:bg-transparent sm:p-0 dark:sm:bg-transparent">
						<div className="text-theme-secondary-700 dark:text-theme-secondary-500 sm:text-theme-secondary-500 text-sm font-semibold whitespace-nowrap">
							{t("TRANSACTION.MULTISIGNATURE.PARTICIPANT_#", { count: index + 1 })}
						</div>
						<div className="sm:hidden">
							<Tooltip
								content={t("TRANSACTION.MULTISIGNATURE.REMOVE_NOT_ALLOWED")}
								disabled={!deleteButtonIsDisabled}
							>
								<Button
									disabled={deleteButtonIsDisabled}
									onClick={() => onDelete(index)}
									data-testid="AddParticipantItem--mobile-deleteButton"
									size="icon"
									className="text-theme-secondary-700 dark:text-theme-secondary-500 space-x-0 p-0"
									variant="transparent"
								>
									<Icon name="Trash" size="lg" />
								</Button>
							</Tooltip>
						</div>
					</div>
					<div className="max-w-full overflow-auto px-4 pt-3 pb-4 sm:w-full sm:p-0">
						<div className="text-theme-secondary-700 dark:text-theme-secondary-500 mb-2 text-sm leading-[17px] font-semibold sm:hidden">
							{t("COMMON.ADDRESS")}
						</div>
						<Address
							address={address}
							addressClass="text-sm leading-[17px] sm:text-base leading-5 text-theme-secondary-500 dark:text-theme-secondary-500"
							walletName={alias}
							walletNameClass="text-sm leading-[17px] sm:text-base leading-5 text-theme-text"
						/>
					</div>
				</div>
				<div className="hidden sm:block">
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
							className="p-3.5"
						>
							<Icon name="Trash" />
						</Button>
					</Tooltip>
				</div>
			</div>
		</div>
	);
};
