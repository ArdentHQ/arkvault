import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { Icon } from "@/app/components//Icon";
import { Button } from "@/app/components/Button";
import { EmptyBlock } from "@/app/components/EmptyBlock";

interface VotesEmptyProperties {
	onCreateWallet?: () => void;
	onImportWallet?: () => void;
}
export const VotesEmpty = ({ onCreateWallet, onImportWallet }: VotesEmptyProperties) => {
	const { t } = useTranslation();

	return (
		<EmptyBlock>
			<div className="flex flex-col items-center justify-between space-x-3 space-y-4 md:flex-row md:space-y-0">
				<span className="text-center md:text-left">
					<Trans
						i18nKey="VOTE.VOTES_PAGE.EMPTY_MESSAGE"
						values={{
							create: t("DASHBOARD.WALLET_CONTROLS.CREATE"),
							import: t("DASHBOARD.WALLET_CONTROLS.IMPORT"),
						}}
						components={{ bold: <strong /> }}
					/>
				</span>

				<div className="-m-3 flex w-full items-center space-x-3 sm:w-auto">
					<Button onClick={onImportWallet} variant="secondary" className="w-full sm:w-auto">
						<div className="flex items-center space-x-2">
							<Icon name="ArrowTurnDownBracket" />
							<span>{t("DASHBOARD.WALLET_CONTROLS.IMPORT")}</span>
						</div>
					</Button>

					<Button onClick={onCreateWallet} variant="primary" className="w-full sm:w-auto">
						<div className="flex items-center space-x-2">
							<Icon name="Plus" />
							<span>{t("DASHBOARD.WALLET_CONTROLS.CREATE")}</span>
						</div>
					</Button>
				</div>
			</div>
		</EmptyBlock>
	);
};
