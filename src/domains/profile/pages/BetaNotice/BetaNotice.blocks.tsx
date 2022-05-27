import React, { useState, VFC } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/Button";
import { Checkbox } from "@/app/components/Checkbox";
import { Image } from "@/app/components/Image";
import { Modal } from "@/app/components/Modal";
import { FormButtons } from "@/app/components/Form";
import { Alert } from "@/app/components/Alert";
import { SmAndAbove, Xs } from "@/app/components/Breakpoint";

const AgreeCheckbox: VFC<{
	className: string;
	isChecked: boolean;
	onChange: () => void;
}> = ({ className, isChecked, onChange }) => {
	const { t } = useTranslation();

	return (
		<label
			data-testid="BetaNoticeModal__agree"
			className={`${className} cursor-pointer items-center space-x-3 text-sm text-theme-secondary-700 dark:text-theme-secondary-500`}
		>
			<Checkbox checked={isChecked} onChange={onChange} />
			<span>{t("COMMON.AGREE_DO_NOT_SHOW_AGAIN")}</span>
		</label>
	);
};

interface BetaNoticeModalProperties {
	onContinue: () => void;
}

export const BetaNoticeModal: React.FC<BetaNoticeModalProperties> = ({ onContinue }) => {
	const [isChecked, setIsChecked] = useState(false);

	const { t } = useTranslation();

	const handleChange = () => setIsChecked((value) => !value);

	return (
		<Modal
			isOpen
			title={t("PROFILE.MODAL_BETA_NOTICE.TITLE")}
			image={<Image name="Info" useAccentColor={false} className="my-8 mx-auto max-w-52" />}
			size="lg"
			hideCloseButton
		>
			<Alert variant="info" className="whitespace-pre-line">
				{t("PROFILE.MODAL_BETA_NOTICE.DESCRIPTION")}
			</Alert>

			<Xs>
				<AgreeCheckbox className="mt-4 flex" isChecked={isChecked} onChange={handleChange} />
			</Xs>

			<div className="flex items-center justify-between sm:space-x-3">
				<SmAndAbove>
					<AgreeCheckbox className="mt-8 flex" isChecked={isChecked} onChange={handleChange} />
				</SmAndAbove>

				<FormButtons>
					<Button
						disabled={!isChecked}
						type="submit"
						onClick={onContinue}
						variant="primary"
						data-testid="BetaNoticeModal__submit-button"
					>
						{t("COMMON.CONTINUE")}
					</Button>
				</FormButtons>
			</div>
		</Modal>
	);
};
