import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@/app/components/Link";
import { DelegateRowProperties, useDelegateRow } from "@/domains/vote/components/DelegateTable/DelegateRow/DelegateRow";
import { DelegateRowMobileSkeleton } from "@/domains/vote/components/DelegateTable/DelegateRow/DelegateRowMobileSkeleton";

export const DelegateRowMobile = (properties: DelegateRowProperties) => {
	const { t } = useTranslation();

	const { isLoading, delegate } = properties;

	const { renderButton } = useDelegateRow({ ...properties });

	if (isLoading) {
		return <DelegateRowMobileSkeleton />;
	}

	return (
		<tr data-testid="DelegateRowMobile">
			<td className="pt-3">
				<div className="overflow-hidden rounded-xl border border-theme-secondary-300 dark:border-theme-secondary-800">
					<div className="overflow-hidden border-b border-theme-secondary-300 p-4 dark:border-theme-secondary-800">
						<div className="flex items-center justify-start space-x-3 overflow-hidden">
							<div className="flex flex-1 space-x-3 overflow-hidden text-sm font-semibold leading-[17px]">
								<span>{delegate.rank()}</span>
								<div className="relative w-full">
									<div className="absolute flex w-full items-center">{delegate.username()}</div>
								</div>
							</div>

							<Link
								to={delegate.explorerLink()}
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
