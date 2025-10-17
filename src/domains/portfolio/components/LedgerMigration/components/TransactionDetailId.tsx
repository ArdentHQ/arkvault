
import React, { ReactElement, useRef } from "react";
import { useTranslation } from "react-i18next";
import { DTO } from "@/app/lib/profiles";
import { Clipboard } from "@/app/components/Clipboard";
import { useTheme } from "@/app/hooks/use-theme";
import { Icon } from "@/app/components/Icon";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";
import { Divider } from "@/app/components/Divider";
import { Link } from "@/app/components/Link";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";

export const TransactionDetailId = ({ transaction }: { transaction: DTO.ExtendedSignedTransactionData | DTO.ExtendedConfirmedTransactionData }): ReactElement => {
	const { t } = useTranslation();
	const { isDarkMode } = useTheme();
	const reference = useRef(null);

	return (
		<div data-testid="TransactionDetailId">
			<div className="flex items-center justify-start">
				<div ref={reference} className="flex-1 overflow-hidden font-semibold mr-2">
					<TruncateMiddle text={transaction.hash()} maxChars={20} />
				</div>

				<Clipboard
					variant="icon"
					data={transaction.hash()}
					tooltip={t("COMMON.COPY_ID")}
					tooltipDarkTheme={isDarkMode}
				>
					<Icon
						name="Copy"
						className="text-theme-secondary-700 dark:text-theme-dark-200 dark:hover:text-theme-dark-50 hover:text-theme-primary-700 dim:text-theme-dim-200 dim:hover:text-theme-dim-50"
					/>
				</Clipboard>

				<Divider type="vertical" />

				<Link isExternal to={transaction.explorerLink()}>
					{t("COMMON.EXPLORER")}
				</Link>
			</div>
		</div>
	);
};
