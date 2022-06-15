import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { Image } from "@/app/components/Image";
import { Modal } from "@/app/components/Modal";
import { useEnvironmentContext } from "@/app/contexts";
import { toasts } from "@/app/services";
import { FormButtons } from "@/app/components/Form";
import { useLocaleCurrency } from "@/app/hooks";

interface ResetProfileProperties {
	isOpen: boolean;
	profile: Contracts.IProfile;
	onClose?: () => void;
	onCancel?: () => void;
	onReset?: () => void;
}

export const ResetProfile = ({ isOpen, profile, onClose, onCancel, onReset }: ResetProfileProperties) => {
	const { t } = useTranslation();

	const localeCurrency = useLocaleCurrency();
	const { persist } = useEnvironmentContext();

	const handleReset = async () => {
		profile.flushSettings();

		profile.settings().set(Contracts.ProfileSetting.ExchangeCurrency, localeCurrency);

		await persist();

		toasts.success(t("PROFILE.MODAL_RESET_PROFILE.SUCCESS"));

		onReset?.();
	};

	return (
		<Modal
			title={t("PROFILE.MODAL_RESET_PROFILE.TITLE")}
			image={<Image name="Warning" useAccentColor={false} className="m-auto my-8 max-w-52" />}
			size="lg"
			isOpen={isOpen}
			onClose={onClose}
		>
			<Alert>{t("PROFILE.MODAL_RESET_PROFILE.DESCRIPTION")}</Alert>

			<FormButtons>
				<Button variant="secondary" onClick={onCancel} data-testid="ResetProfile__cancel-button">
					{t("COMMON.CANCEL")}
				</Button>

				<Button type="submit" onClick={handleReset} data-testid="ResetProfile__submit-button" variant="danger">
					<Icon name="ArrowRotateRight" />
					<span>{t("COMMON.RESET")}</span>
				</Button>
			</FormButtons>
		</Modal>
	);
};
