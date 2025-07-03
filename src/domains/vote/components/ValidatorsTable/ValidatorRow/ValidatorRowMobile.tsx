import React, { useMemo } from "react";
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
import {
	MobileTableElement,
	MobileTableElementRow,
	MobileTableElementVariant,
} from "@/app/components/MobileTableElement";

export const ValidatorRowMobile = (properties: ValidatorRowProperties) => {
	const { t } = useTranslation();

	const { isLoading, validator } = properties;

	const { renderButton, isActive, status } = useValidatorRow({ ...properties });

	const tableElementVariant = useMemo<MobileTableElementVariant | undefined>(() => {
		if (status === ValidatorStatusEnum.Unvoted) {
			return MobileTableElementVariant.danger;
		}

		if (status === ValidatorStatusEnum.Voted) {
			return MobileTableElementVariant.primary;
		}

		if (status === ValidatorStatusEnum.Selected) {
			return MobileTableElementVariant.success;
		}

		if (status === ValidatorStatusEnum.Changed) {
			return MobileTableElementVariant.warning;
		}
	}, [status]);

	if (isLoading) {
		return <ValidatorRowMobileSkeleton />;
	}

	return (
		<tr data-testid="ValidatorRowMobile">
			<td className="pt-3">
				<MobileTableElement
					variant={tableElementVariant}
					title={validator.rank()}
					titleExtra={
						<div className="flex items-center">
							<ValidatorStatus isActive={isActive} className="mr-3 sm:hidden" />

							<span className="bg-theme-secondary-300 dark:bg-theme-secondary-800 dim:bg-theme-dim-700 block h-5 w-px sm:hidden" />

							{renderButton()}
						</div>
					}
					bodyClassName="sm:grid-cols-3"
				>
					<MobileTableElementRow title={t("COMMON.VALIDATOR")}>
						<Address
							address={validator.username() ? undefined : validator.address()}
							walletName={validator.username()}
							size="sm"
						/>
					</MobileTableElementRow>

					<MobileTableElementRow title={t("COMMON.STATUS")} className="hidden sm:grid">
						<ValidatorStatus isActive={isActive} />
					</MobileTableElementRow>

					<MobileTableElementRow title={t("COMMON.EXPLORER")}>
						<Link to={validator.explorerLink()} tooltip={t("COMMON.OPEN_IN_EXPLORER")} isExternal>
							<span className="pr-2 text-sm sm:text-base">{t("COMMON.VIEW")}</span>
						</Link>
					</MobileTableElementRow>
				</MobileTableElement>
			</td>
		</tr>
	);
};
