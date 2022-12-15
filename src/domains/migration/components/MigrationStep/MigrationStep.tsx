import React from "react";

import { useTranslation } from "react-i18next";
import { Header } from "@/app/components/Header";
import { FormButtons } from "@/app/components/Form";
import { Button } from "@/app/components/Button";

interface Properties {
	title: string;
	description: string;
	isValid: boolean;
	children: React.ReactNode;
	onCancel: () => void;
	onContinue: () => void;
}

export const MigrationStep = ({ title, description, children, isValid, onCancel, onContinue }: Properties) => {
	const { t } = useTranslation();

	return (
		<div>
			<div className="px-10">
				<Header title={title} subtitle={description} />
			</div>

			<div className="mt-8 rounded-2.5xl border border-theme-secondary-300 p-5 dark:border-theme-secondary-800">
				<div>{children}</div>

				<div className="px-5 pb-5 pt-8">
					<FormButtons>
						<Button data-testid="MigrationAdd__cancel-btn" variant="secondary" onClick={onCancel}>
							{t("COMMON.CANCEL")}
						</Button>

						<Button
							data-testid="MigrationAdd__cancel__continue-btn"
							type="submit"
							variant="primary"
							disabled={!isValid}
							onClick={onContinue}
						>
							{t("COMMON.CONTINUE")}
						</Button>
					</FormButtons>
				</div>
			</div>
		</div>
	);
};
