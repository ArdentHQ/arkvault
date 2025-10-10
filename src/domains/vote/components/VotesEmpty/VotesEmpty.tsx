import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { Icon } from "@/app/components//Icon";
import { Button } from "@/app/components/Button";
import { EmptyBlock } from "@/app/components/EmptyBlock";
import { Panel, usePanels } from "@/app/contexts/Panels";

export const VotesEmpty = () => {
	const { t } = useTranslation();

	const { openPanel } = usePanels();

	return (
		<EmptyBlock>
			<div className="flex flex-col items-center justify-between space-y-4 space-x-3 md:flex-row md:space-y-0">
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
					<Button
						onClick={() => openPanel(Panel.ImportAddress)}
						variant="secondary"
						className="w-full sm:w-auto"
					>
						<div className="flex items-center space-x-2">
							<Icon
								name="ArrowTurnDownBracket"
								className="text-theme-secondary-700 dark:text-theme-dark-200 dark:hover:text-theme-dark-50 hover:text-theme-primary-700 dim:text-theme-dim-200 dim:hover:text-theme-dim-50"
							/>
							<span>{t("DASHBOARD.WALLET_CONTROLS.IMPORT")}</span>
						</div>
					</Button>

					<Button
						onClick={() => openPanel(Panel.CreateAddress)}
						variant="primary"
						className="w-full sm:w-auto"
					>
						<div className="flex items-center space-x-2">
							<Icon
								name="Plus"
								className="text-theme-secondary-700 dark:text-theme-dark-200 dark:hover:text-theme-dark-50 hover:text-theme-primary-700 dim:text-theme-dim-200 dim:hover:text-theme-dim-50"
							/>
							<span>{t("DASHBOARD.WALLET_CONTROLS.CREATE")}</span>
						</div>
					</Button>
				</div>
			</div>
		</EmptyBlock>
	);
};
