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
			className="sm:pt-3 mb-3 last:mb-0 bg-white rounded overflow-hidden sm:rounded-none sm:bg-transparent border sm:border-x-0 sm:border-b-0 sm:border-dashed border-theme-secondary-300  dark:border-theme-secondary-800"
		>
			<div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
				<div className="flex w-full flex-1 sm:w-auto flex-col sm:items-start sm:space-x-0 sm:space-y-1">
					<div className="flex flex-row items-center justify-between flex-1 w-full px-4 py-3 sm:p-0 bg-theme-secondary-100 sm:bg-transparent">
						<div
							className="whitespace-nowrap text-sm font-semibold text-theme-secondary-700 sm:text-theme-secondary-500 dark:text-theme-secondary-700">
							{t("TRANSACTION.MULTISIGNATURE.PARTICIPANT_#", {count: index + 1})}
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
									sizeClassName="p-0"
									className="text-theme-secondary-700 dark:text-theme-secondary-500"
									variant="transparent"
								>
									<Icon name="Trash" size="lg" />
								</Button>
							</Tooltip>
						</div>
					</div>
					<div className="max-w-full overflow-auto sm:w-full pt-3 pb-4 px-4 sm:p-0">
						<div className="text-sm leading-[17px] sm:hidden mb-2 font-semibold text-theme-secondary-700">{t("COMMON.ADDRESS")}</div>
						<Address
							address={address}
							addressClass="text-sm leading-[17px] sm:text-base leading-5  text-theme-secondary-500 dark:text-theme-secondary-700"
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
