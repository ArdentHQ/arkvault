import React from "react";

import { useTranslation } from "react-i18next";
import MigrationStep from "domains/migration/components/MigrationStep";

export const MigrationConnectStep = () => {
	const { t } = useTranslation();

	return (
		<MigrationStep
			title={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.TITLE")}
			description={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.DESCRIPTION")}
			onCancel={() => {}}
			onContinue={() => {}}
			isValid={false}
		>
			<p>
				Lorem ipsum dolor sit, amet consectetur adipisicing elit. Reiciendis quidem velit dolorum hic ipsa eos
				magni dicta expedita facilis odio possimus, sed, consequatur exercitationem, dolore at commodi maiores
				vitae excepturi.
			</p>
		</MigrationStep>
	);
};
