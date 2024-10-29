import React from "react";
import { useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "@/app/components/Button";
import { Form, FormButtons } from "@/app/components/Form";
import { Header } from "@/app/components/Header";
import { ListDivided } from "@/app/components/ListDivided";
import { Toggle } from "@/app/components/Toggle";
import { useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import { SettingsWrapper } from "@/domains/setting/components/SettingsPageWrapper";
import { useProfileExport } from "@/domains/setting/hooks/use-profile-export";
import { useFiles } from "@/app/hooks/use-files";
import { toasts } from "@/app/services";

const EXTENSION = "wwe";

export const ExportSettings = () => {
	const { t } = useTranslation();

	const { isXs } = useBreakpoint();

	const form = useForm({ mode: "onChange" });
	const { register } = form;

	const profile = useActiveProfile();
	const { env } = useEnvironmentContext();
	const { formatExportData } = useProfileExport({ env, profile });
	const { isLegacy, showSaveDialog } = useFiles();

	const walletExportOptions = [
		{
			isFloatingLabel: true,
			label: t("SETTINGS.EXPORT.OPTIONS.EXCLUDE_EMPTY_WALLETS.TITLE"),
			labelAddon: (
				<Toggle
					ref={register}
					name="excludeEmptyWallets"
					defaultChecked={false}
					data-testid="Plugin-settings__toggle--exclude-empty-wallets"
				/>
			),
			labelDescription: t("SETTINGS.EXPORT.OPTIONS.EXCLUDE_EMPTY_WALLETS.DESCRIPTION"),
			wrapperClass: "pt-4 pb-6",
		},
		{
			isFloatingLabel: true,
			label: t("SETTINGS.EXPORT.OPTIONS.EXCLUDE_LEDGER_WALLETS.TITLE"),
			labelAddon: (
				<Toggle
					ref={register}
					name="excludeLedgerWallets"
					defaultChecked={false}
					data-testid="Plugin-settings__toggle--exclude-ledger-wallets"
				/>
			),
			labelDescription: t("SETTINGS.EXPORT.OPTIONS.EXCLUDE_LEDGER_WALLETS.DESCRIPTION"),
			wrapperClass: "pt-6 sm:pb-6",
		},
	];

	const exportDataToFile = async () => {
		const exportData = await formatExportData({
			...form.getValues(["excludeEmptyWallets", "excludeLedgerWallets"]),
		});

		const options = {
			description: "Web Wallet Export",
			fileName: `profile-${profile.id()}.${EXTENSION}`,
		};

		try {
			const filePath = await showSaveDialog(exportData, options);

			if (!isLegacy()) {
				toasts.success(<Trans i18nKey="COMMON.SAVE_FILE.SUCCESS" values={{ filePath }} />);
			}
		} catch (error) {
			if (!error.message.includes("The user aborted a request")) {
				toasts.error(t("COMMON.SAVE_FILE.ERROR", { error: error.message }));
			}
		}
	};

	const handleSubmit = () => {
		exportDataToFile();
	};

	return (
		<SettingsWrapper profile={profile} activeSettings="export">
			<Header
				title={t("SETTINGS.EXPORT.TITLE")}
				subtitle={t("SETTINGS.EXPORT.SUBTITLE")}
				titleClassName="mb-2 text-2xl"
			/>

			<Form id="export-settings__form" context={form} onSubmit={handleSubmit} className="mt-8">
				<h2 className="mb-0 text-lg">{t("COMMON.WALLETS")}</h2>

				<ListDivided items={walletExportOptions} noBorder={isXs} />

				<FormButtons>
					<Button data-testid="Export-settings__submit-button" type="submit">
						{t("COMMON.EXPORT")}
					</Button>
				</FormButtons>
			</Form>
		</SettingsWrapper>
	);
};
