import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@/app/components/Link";
import {
	ValidatorRowProperties,
	ValidatorStatus,
	ValidatorStatusEnum,
	useValidatorRow,
} from "@/domains/vote/components/ValidatorsTable/ValidatorRow/ValidatorRow";
import { ValidatorRowMobileSkeleton } from "@/domains/vote/components/ValidatorsTable/ValidatorRow/ValidatorRowMobileSkeleton";
import { Address } from "@/app/components/Address";
import classNames from "classnames";

export const ValidatorRowMobile = (properties: ValidatorRowProperties) => {
	const { t } = useTranslation();

	const { isLoading, validator } = properties;

	const { renderButton, isActive, status } = useValidatorRow({ ...properties });

	if (isLoading) {
		return <ValidatorRowMobileSkeleton />;
	}

	return (
		<tr data-testid="DelegateRowMobile">
			<td className="pt-3">
				<div
					className={classNames("flex flex-col overflow-hidden rounded border", {
						"border-theme-danger-400": status === ValidatorStatusEnum.Unvoted,
						"border-theme-primary-300 dark:border-theme-dark-navy-400":
							status === ValidatorStatusEnum.Voted,
						"border-theme-secondary-300 dark:border-theme-secondary-800":
							status === (ValidatorStatusEnum.Active || ValidatorStatusEnum.Disabled),
						"border-theme-success-300 dark:border-theme-success-700":
							status === ValidatorStatusEnum.Selected,
						"border-theme-warning-400": status === ValidatorStatusEnum.Changed,
					})}
				>
					<div
						className={classNames("flex justify-between overflow-hidden px-4 py-3 dark:bg-theme-dark-950", {
							"bg-theme-danger-100 dark:bg-theme-dark-950": status === ValidatorStatusEnum.Unvoted,
							"bg-theme-primary-100 dark:bg-theme-dark-950": status === ValidatorStatusEnum.Voted,
							"bg-theme-secondary-100 dark:bg-black":
								status === (ValidatorStatusEnum.Active || ValidatorStatusEnum.Disabled),
							"bg-theme-success-100 dark:bg-theme-dark-950": status === ValidatorStatusEnum.Selected,
							"bg-theme-warning-100 dark:bg-theme-dark-950": status === ValidatorStatusEnum.Changed,
						})}
					>
						<span className="text-sm font-semibold text-theme-secondary-900 dark:text-theme-text">
							{validator.rank()}
						</span>

						<div className="flex items-center">
							<ValidatorStatus isActive={isActive} className="mr-3 sm:hidden" />

							<span className="block h-5 w-px bg-theme-secondary-300 dark:bg-theme-secondary-800 sm:hidden" />

							{renderButton()}
						</div>
					</div>

					<div className="grid gap-4 px-4 py-3 sm:grid-cols-3">
						<div className="grid grid-cols-1 gap-2">
							<div className="text-sm font-semibold text-theme-secondary-700 dark:text-theme-dark-200">
								{t("COMMON.VALIDATOR")}
							</div>

							<div>
								<Address address={validator.address()} size="sm" />
							</div>
						</div>

						<div className="hidden grid-cols-1 gap-2 sm:grid">
							<div className="text-sm font-semibold text-theme-secondary-700 dark:text-theme-dark-200">
								{t("COMMON.STATUS")}
							</div>

							<div>
								<ValidatorStatus isActive={isActive} />
							</div>
						</div>

						<div className="grid grid-cols-1 gap-2">
							<div className="text-sm font-semibold text-theme-secondary-700 dark:text-theme-dark-200">
								{t("COMMON.EXPLORER")}
							</div>

							<div>
								<Link
									to={validator.explorerLink()}
									tooltip={t("COMMON.OPEN_IN_EXPLORER")}
									isExternal
									className="text-sm leading-[17px] [&_svg]:text-theme-secondary-500 dark:[&_svg]:text-theme-secondary-700"
								>
									<span className="pr-2">{t("COMMON.VIEW")}</span>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</td>
		</tr>
	);
};
