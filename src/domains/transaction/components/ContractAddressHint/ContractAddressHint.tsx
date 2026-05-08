import { Link } from "@/app/components/Link";
import { Icon } from "@/app/components/Icon";
import React from "react";
import { useTranslation } from "react-i18next";
import { WalletToken } from "@/app/lib/profiles/wallet-token";

export const ContractAddressHint = ({ token, link }: { token: WalletToken; link: string }) => {
	const { t } = useTranslation();

	return (
		<div className="bg-theme-secondary-200 dark:bg-theme-dark-950 dim:bg-theme-dim-950 -mt-2 flex h-[33px] items-center justify-between rounded px-3 py-2 text-xs leading-[15px] sm:px-4 sm:text-sm sm:leading-[17px]">
			<div className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 font-semibold">
				{t("TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.CONTRACT_ADDRESS_ENDING")}
			</div>

			<Link isExternal to={link} showExternalIcon={false}>
				<span className="flex flex-row items-center gap-2">
					<span className="text-theme-navy-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600">
						…{token.token().address().slice(-5)}
					</span>

					<Icon
						data-testid="Link__external"
						name="ArrowExternal"
						dimensions={[12, 12]}
						className="text-theme-secondary-500 dark:text-theme-dark-400 dim:text-theme-dim-400 shrink-0 align-middle duration-200"
					/>
				</span>
			</Link>
		</div>
	);
};
