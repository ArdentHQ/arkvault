import { Contracts } from "@/app/lib/profiles";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/Button";
import { Divider } from "@/app/components/Divider";
import { Form, FormButtons, FormField, FormLabel } from "@/app/components/Form";
import { InputPassword } from "@/app/components/Input";
import { Modal } from "@/app/components/Modal";
import { ProfileAvatar } from "@/domains/profile/components/ProfileAvatar";

interface SignInProperties {
	isOpen: boolean;
	profile: Contracts.IProfile;
	onCancel?: () => void;
	onClose?: () => void;
	onSuccess: (password: string) => void;
}

const MAX_ATTEMPTS = 3;
const TIMEOUT = 60;

export const SignIn = ({ isOpen, profile, onCancel, onClose, onSuccess }: SignInProperties) => {
	const { t } = useTranslation();

	const methods = useForm({ mode: "onChange" });
	const { errors, formState, register, setError } = methods;

	const [count, setCount] = useState(0);
	const [remainingTime, setRemainingTime] = useState(0);

	const hasReachedLimit = useCallback(() => count >= MAX_ATTEMPTS, [count]);

	useEffect(() => {
		if (hasReachedLimit()) {
			setRemainingTime(TIMEOUT);
		}

		if (count) {
			const timer = setInterval(() => {
				setCount(count - 1);
			}, TIMEOUT * 1000);

			return () => clearInterval(timer);
		}
	}, [count, hasReachedLimit]);

	useEffect(() => {
		if (remainingTime) {
			setError("password", {
				message: t("PROFILE.MODAL_SIGN_IN.MAX_ATTEMPTS_ERROR", { remainingTime }),
				type: "maxAttempts",
			});

			const timer = setInterval(() => {
				setRemainingTime(remainingTime - 1);
			}, 1000);

			return () => clearInterval(timer);
		} else if (errors.password) {
			setError("password", {
				message: t("COMMON.VALIDATION.FIELD_INVALID", {
					field: t("COMMON.PASSWORD"),
				}),
				type: "invalid",
			});
		}
	}, [errors, remainingTime, setError, t]);

	const handleSubmit = ({ password }) => {
		if (!profile.auth().verifyPassword(password)) {
			setCount(count + 1);

			setError("password", {
				message: t("COMMON.VALIDATION.FIELD_INVALID", {
					field: t("COMMON.PASSWORD"),
				}),
				type: "invalid",
			});
			return;
		}

		onSuccess(password);
	};

	if (!isOpen) {
		return <></>;
	}

	return (
		<Modal
			title={t("PROFILE.MODAL_SIGN_IN.TITLE")}
			description={t("PROFILE.MODAL_SIGN_IN.DESCRIPTION")}
			size="2xl"
			isOpen={isOpen}
			onClose={onClose}
		>
			<div className="mt-8">
				<div className="flex items-center space-x-3">
					<ProfileAvatar profile={profile} />

					<div className="flex flex-col">
						<p className="text-theme-secondary-500 dark:text-theme-secondary-700 text-sm font-semibold">
							{t("COMMON.NAME")}
						</p>
						<p className="text-theme-text font-semibold" data-testid="profile-card__user--name">
							<span>{profile.name()}</span>
						</p>
					</div>
				</div>
			</div>

			<Divider dashed={true} />

			<Form context={methods} onSubmit={handleSubmit} className={undefined}>
				<FormField name="password">
					<FormLabel label={t("SETTINGS.GENERAL.PERSONAL.PASSWORD")} />
					<InputPassword
						ref={register({
							required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
								field: t("COMMON.PASSWORD"),
							}).toString(),
						})}
						disabled={hasReachedLimit()}
						data-testid="SignIn__input--password"
					/>
				</FormField>

				<div className="modal-footer">
				<FormButtons>
					<Button data-testid="SignIn__cancel-button" variant="secondary" onClick={onCancel}>
						{t("COMMON.CANCEL")}
					</Button>

					<Button data-testid="SignIn__submit-button" type="submit" disabled={!formState.isValid}>
						{t("COMMON.SIGN_IN")}
					</Button>
				</FormButtons>
				</div>
			</Form>
		</Modal>
	);
};
