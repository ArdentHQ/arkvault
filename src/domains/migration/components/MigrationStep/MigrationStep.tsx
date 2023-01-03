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
			<div data-testid="MigrationStep__header">
				<Header title={title} subtitle={description} className="sm:px-6 md:px-0" />
			</div>

			<div className="-mx-4 mt-6 dark:border-theme-secondary-800 sm:rounded-2.5xl sm:border sm:border-theme-secondary-300 sm:p-5 md:-mx-10">
				<div>{children}</div>

				<div className="px-5 pb-5">
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
