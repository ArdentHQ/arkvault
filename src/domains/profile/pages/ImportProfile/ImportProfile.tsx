import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Page, Section } from "@/app/components/Layout";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { StepsProvider, useConfiguration, useEnvironmentContext } from "@/app/contexts";
import { ReadableFile } from "@/app/hooks/use-files";
import { ProcessingImport } from "@/domains/profile/pages/ImportProfile/ProcessingImportStep";
import { ImportProfileForm } from "@/domains/profile/pages/ImportProfile/ProfileFormStep";
import { SelectFileStep } from "@/domains/profile/pages/ImportProfile/SelectFileStep";

enum Step {
	SelectFileStep = 1,
	ProcessingStep,
	FormStep,
}

export const ImportProfile = () => {
	const { env, persist } = useEnvironmentContext();
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [activeTab, setActiveTab] = useState<Step>(Step.SelectFileStep);
	const [fileFormat, setFileFormat] = useState(".wwe");
	const [selectedFile, setSelectedFile] = useState<ReadableFile>();
	const [password, setPassword] = useState<string>();
	const [profile, setProfile] = useState<Contracts.IProfile>();
	const { setConfiguration } = useConfiguration();

	const handleSelectedFile = (file: ReadableFile) => {
		setSelectedFile(file);
		setActiveTab(Step.ProcessingStep);
	};

	const handleProfileSave = () => {
		setConfiguration({ dashboard: undefined });
		persist();
		navigate("/");
	};

	return (
		<Page
			navbarVariant="logo-only"
			pageTitle={t("PROFILE.PAGE_WELCOME.IMPORT_PROFILE_TITLE")}
			title={<Trans i18nKey="COMMON.APP_NAME" />}
		>
			<Section className="-mt-8">
				<StepsProvider activeStep={activeTab} steps={3}>
					<Tabs activeId={activeTab} className="mt-6 sm:mt-8">
						<TabPanel tabId={Step.SelectFileStep}>
							<SelectFileStep
								fileFormat={fileFormat}
								onFileFormatChange={setFileFormat}
								onSelect={handleSelectedFile}
								onBack={() => navigate("/")}
							/>
						</TabPanel>

						<TabPanel tabId={Step.ProcessingStep}>
							{selectedFile && (
								<ProcessingImport
									env={env}
									password={password}
									file={selectedFile}
									onBack={() => setActiveTab(Step.SelectFileStep)}
									onCancel={() => navigate("/")}
									onPasswordChange={setPassword}
									onRetry={() => {
										setSelectedFile({ ...selectedFile });
										setPassword(undefined);
									}}
									onSuccess={(profile) => {
										setProfile(profile);
										setActiveTab(Step.FormStep);
									}}
								/>
							)}
						</TabPanel>

						<TabPanel tabId={Step.FormStep}>
							{profile && (
								<ImportProfileForm
									file={selectedFile}
									env={env}
									profile={profile}
									password={password}
									shouldValidate
									onSubmit={handleProfileSave}
									onBack={() => {
										setPassword(undefined);
										setActiveTab(Step.SelectFileStep);
									}}
								/>
							)}
						</TabPanel>
					</Tabs>
				</StepsProvider>
			</Section>
		</Page>
	);
};
