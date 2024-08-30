import React from "react";
import { useTranslation } from "react-i18next";
import {DelegateRowSkeleton} from "@/domains/vote/components/DelegateTable/DelegateRow/DelegateRowSkeleton";
import {Link} from "@/app/components/Link";
import { DelegateRowProperties, useDelegateRow } from "@/domains/vote/components/DelegateTable/DelegateRow/DelegateRow";

export const DelegateRowMobile = (properties: DelegateRowProperties) => {
	const { t } = useTranslation();

	const { isLoading, delegate } = properties;

	const { renderButton } = useDelegateRow({...properties, isCompact: true});

	if (isLoading) {
		return <DelegateRowSkeleton  />;
	}

	return (
		<tr data-testid="DelegateRowMobile">
			<td className="pt-3">
				<div className="overflow-hidden rounded-xl border border-theme-secondary-300 dark:border-theme-secondary-800">
					<div className="overflow-hidden border-b border-theme-secondary-300 p-4 dark:border-theme-secondary-800">
						<div className="flex items-center justify-start space-x-3 overflow-hidden">
							<div className="flex space-x-3 flex-1 font-semibold overflow-hidden">
								<span>{delegate.rank()}</span>
								<div className="relative w-full">
									<div className="absolute flex w-full items-center">
										{delegate.username()}
									</div>
								</div>
							</div>

							<Link
								to={delegate.explorerLink()}
								tooltip={t("COMMON.OPEN_IN_EXPLORER")}
								isExternal
								className="[&_svg]:text-theme-secondary-500 dark:[&_svg]:text-theme-secondary-700"
							>
								<span className="pr-2">{ t("COMMON.VIEW") }</span>
							</Link>
						</div>
					</div>

					<div className="flex">
						{renderButton()}
					</div>
				</div>
			</td>
		</tr>
	);
};
