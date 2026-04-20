import { Dot } from "@/app/components/Dot";
import { useTranslation } from "react-i18next";

export const useLedgerMigrationMenuOptions = () => {
	const { t } = useTranslation();

	return [
		{
			element: (
				<div className="relative">
					{t("COMMON.LEDGER_MIGRATION.ADDRESS_MIGRATION")}
					<Dot className="top-2 -right-4" />
				</div>
			),
			label: "",
			value: "ledger-migration",
		},
	];
};
