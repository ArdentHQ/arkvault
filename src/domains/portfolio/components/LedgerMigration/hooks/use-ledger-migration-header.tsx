import React, { useMemo } from "react";
import { Icon } from "@/app/components/Icon";
import { MigrateLedgerStep } from "@/domains/portfolio/components/LedgerMigration";

export const useLedgerMigrationHeader = (activeTab: MigrateLedgerStep) =>
	useMemo(() => {
		if ([MigrateLedgerStep.ListenLedgerStep, MigrateLedgerStep.ConnectionStep].includes(activeTab)) {
			return {
				subtitle: undefined,
				title: "Address Migration",
				titleIcon: <Icon name="CheckedDocument" dimensions={[24, 24]} />,
			};
		}

		return {
			subtitle: "Select the address(es) you wish to migrate.",
			title: "Address Migration",
			titleIcon: <Icon name="CheckedDocument" dimensions={[24, 24]} />,
		};
	}, [activeTab]);
