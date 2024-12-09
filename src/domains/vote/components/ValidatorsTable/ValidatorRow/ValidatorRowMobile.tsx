import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@/app/components/Link";
import {
	ValidatorRowProperties,
	useValidatorRow,
} from "@/domains/vote/components/ValidatorsTable/ValidatorRow/ValidatorRow";
import { ValidatorRowMobileSkeleton } from "@/domains/vote/components/ValidatorsTable/ValidatorRow/ValidatorRowMobileSkeleton";
import { Address } from "@/app/components/Address";

export const ValidatorRowMobile = (properties: ValidatorRowProperties) => {
	const { t } = useTranslation();

	const { isLoading, validator } = properties;

	const { renderButton } = useValidatorRow({ ...properties });

	if (isLoading) {
		return <ValidatorRowMobileSkeleton />;
	}

	return (
		<tr data-testid="DelegateRowMobile">
			<td className="pt-3">
				<div className="overflow-hidden rounded-xl border border-theme-secondary-300 dark:border-theme-secondary-800">
					<div className="overflow-hidden border-b border-theme-secondary-300 p-4 dark:border-theme-secondary-800">
						<div className="flex items-center justify-start space-x-3 overflow-hidden">
							<div className="flex flex-1 space-x-3 overflow-hidden text-sm font-semibold leading-[17px]">
								<span>{validator.rank()}</span>
								<Address
									truncateOnTable
									address={validator.address()}
									wrapperClass="justify-start"
									addressClass="leading-[17px] text-sm w-full"
								/>
							</div>

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

					<div className="flex">{renderButton()}</div>
				</div>
			</td>
		</tr>
	);
};
