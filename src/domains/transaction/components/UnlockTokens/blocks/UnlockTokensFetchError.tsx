import React, { MouseEvent } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Link } from "@/app/components/Link";

interface Properties {
	onRetry: () => void;
}

export const UnlockTokensFetchError: React.FC<Properties> = ({ onRetry }: Properties) => {
	const { t } = useTranslation();

	return (
		<Trans
			i18nKey="TRANSACTION.UNLOCK_TOKENS.ERROR_MESSAGE"
			components={{
				RetryLink: (
					<>
						{[
							<Link
								key="1"
								role="button"
								onClick={(event: MouseEvent) => {
									event.preventDefault();
									event.stopPropagation();

									onRetry();
								}}
								to="/"
							>
								{t("COMMON.HERE")}
							</Link>,
						]}
					</>
				),
			}}
		/>
	);
};
