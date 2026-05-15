import { DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import { Divider } from "@/app/components/Divider";
import { Label } from "@/app/components/Label";
import { MobileCard } from "@/app/components/Table/Mobile/MobileCard";
import { MobileSection } from "@/app/components/Table/Mobile/MobileSection";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { formatNumber } from "@/app/lib/helpers/format-number";

export const TransactionGas = ({ gasUsed, gasLimit }: { gasUsed: number | null; gasLimit: number }) => {
	const { t } = useTranslation();

	return (
		<DetailWrapper>
			<MobileCard className="sm:hidden">
				<div className="flex h-10 w-full items-center justify-between bg-theme-secondary-100 px-4 dim:bg-theme-dim-950 dark:bg-black">
					<div className="text-sm font-semibold leading-[17px] text-theme-secondary-700 dark:text-theme-dark-200 dark:hover:text-theme-dark-50">
						{t("TRANSACTION.GAS_INFORMATION")}
					</div>
				</div>

				<div className="flex w-full flex-col gap-4 px-4 pb-4 pt-3">
					<MobileSection title={t("TRANSACTION.GAS_LIMIT")} className="w-full">
						{formatNumber(gasLimit)}
					</MobileSection>

					<Divider
						className="my-0 border-theme-secondary-300 dim:border-theme-dim-700 dark:border-theme-secondary-800"
						dashed
					/>

					<MobileSection
						title={t("TRANSACTION.GAS_USAGE")}
						className={cn("w-full", {
							"text-theme-secondary-500 dim:text-theme-dim-200": !gasUsed,
						})}
					>
						{gasUsed ? formatNumber(gasUsed) : t("COMMON.NOT_AVAILABLE")}
					</MobileSection>
				</div>
			</MobileCard>

			<div className="hidden sm:block" data-testid="TransactionGas">
				<Label color="neutral" size="xs">
					{t("TRANSACTION.GAS_INFORMATION")}
				</Label>

				<div className="mt-2 flex w-full justify-between gap-2 space-y-3 sm:justify-start">
					<DetailLabelText className="min-w-36">{t("TRANSACTION.GAS_LIMIT")}</DetailLabelText>
					<div className="text-sm font-semibold leading-[17px] sm:text-base sm:leading-5">
						{formatNumber(gasLimit)}
					</div>
				</div>

				<div className="flex w-full justify-between gap-2 sm:justify-start">
					<DetailLabelText className="min-w-36">{t("TRANSACTION.GAS_USAGE")}</DetailLabelText>
					<div
						className={cn("text-sm font-semibold leading-[17px] sm:text-base sm:leading-5", {
							"text-theme-secondary-500 dim:text-theme-dim-200": !gasUsed,
						})}
					>
						{gasUsed ? formatNumber(gasUsed) : t("COMMON.NOT_AVAILABLE")}
					</div>
				</div>
			</div>
		</DetailWrapper>
	);
};
