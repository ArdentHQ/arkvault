import { Contracts, Environment } from "@ardenthq/sdk-profiles";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ReadableFile } from "@/app/hooks/use-files";
import { FilePreview } from "@/domains/profile/components/FilePreview";
import { PasswordModal } from "@/domains/profile/components/PasswordModal";
import { useProfileImport } from "@/domains/profile/hooks/use-profile-import";
import { Alert } from "@/app/components/Alert";
import { Button } from "@/app/components/Button";
import { FormButtons } from "@/app/components/Form";
import { StepHeader } from "@/app/components/StepHeader";
import { useNavigationContext } from "@/app/contexts";
import { Icon } from "@/app/components/Icon";

interface ImportErrorProperties {
	file: ReadableFile;
	onCancel: () => void;
	onRetry: () => void;
}

const ImportError = ({ file, onCancel, onRetry }: ImportErrorProperties) => {
	const { t } = useTranslation();
	const { setShowMobileNavigation } = useNavigationContext();

	useEffect(() => {
		// Stick form buttons to bottom.
		setShowMobileNavigation(false);
	}, []);

	return (
		<div className="mx-auto max-w-xl" data-testid="ImportError">
			<Alert className="mt-4" variant="danger">
				{t("PROFILE.IMPORT.PROCESSING_IMPORT_STEP.ERROR")}
			</Alert>

			<div className="mt-4">
				<FilePreview file={file} variant="danger" />
			</div>

			<FormButtons>
				<Button data-testid="ImportError__cancel" variant="secondary" onClick={onCancel}>
					{t("COMMON.CANCEL")}
				</Button>

				<Button data-testid="ImportError__retry" onClick={onRetry}>
					{t("COMMON.RETRY")}
				</Button>
			</FormButtons>
		</div>
	);
};

interface ProcessingImportProperties {
	env: Environment;
	file: ReadableFile;
	password?: string;
	shouldRequestPassword?: boolean;
	onBack: () => void;
	onCancel: () => void;
	onPasswordChange: (password?: string) => void;
	onRetry: () => void;
	onSuccess: (profile: any) => void;
}

export const ProcessingImport = ({
	env,
	file,
	password,
	shouldRequestPassword = false,
	onBack,
	onCancel,
	onPasswordChange,
	onRetry,
	onSuccess,
}: ProcessingImportProperties) => {
	const { t } = useTranslation();
	const { importProfile } = useProfileImport({ env });

	const [hasError, setHasError] = useState(false);
	const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(shouldRequestPassword);

	useEffect(() => {
		const runImport = async () => {
			let profile: Contracts.IProfile | undefined;

			try {
				profile = await importProfile({ file, password });
				onSuccess(profile);
			} catch (error) {
				if (error.message === "PasswordRequired") {
					setIsPasswordModalOpen(true);
					return;
				}

				setHasError(true);
			}
		};

		if (file) {
			runImport();
		}
	}, [file, env, password]); // eslint-disable-line react-hooks/exhaustive-deps

	const renderStep = () => {
		if (hasError) {
			return <ImportError file={file} onCancel={onCancel} onRetry={onRetry} />;
		}

		return <FilePreview file={file} variant="loading" />;
	};

	return (
		<div className="mx-auto max-w-xl" data-testid="ProcessingImport">
			<StepHeader
				titleIcon={<Icon name="ImportProfile" dimensions={[24, 24]} />}
				title={t("PROFILE.IMPORT.TITLE")}
				subtitle={t("PROFILE.IMPORT.PROCESSING_IMPORT_STEP.DESCRIPTION", { name: file?.name || "" })}
			/>

			<div className="mt-4">{renderStep()}</div>

			<div className="items-left text-left">
				<PasswordModal
					isOpen={isPasswordModalOpen}
					title={t("PROFILE.IMPORT.PASSWORD_TITLE")}
					description={t("PROFILE.IMPORT.PASSWORD_DESCRIPTION")}
					onSubmit={(password: string) => {
						setIsPasswordModalOpen(false);
						onPasswordChange(password);
					}}
					onClose={() => {
						setIsPasswordModalOpen(false);
						onPasswordChange(undefined);
						onBack();
					}}
				/>
			</div>
		</div>
	);
};
