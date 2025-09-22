import React from "react";
import { useFormContext } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";

import { Amount } from "@/app/components/Amount";
import { Checkbox } from "@/app/components/Checkbox";
import { FormField } from "@/app/components/Form";
import { Link } from "@/app/components/Link";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";
import { useExchangeContext } from "@/domains/exchange/contexts/Exchange";

const ReviewStepItemFooter = ({ children }: { children: React.ReactNode }) => (
	<div className="bg-theme-secondary-200 dark:bg-theme-dark-950 dim:bg-theme-dim-950 text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 -mx-6 -mb-6 px-6 py-3 text-xs font-semibold">
		{children}
	</div>
);

const ReviewStepItemRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
	<div className="flex gap-1">
		<span className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 min-w-[112px] font-semibold">
			{label}
		</span>
		{children}
	</div>
);

const ReviewStepItem = ({ children }: { children: React.ReactNode }) => (
	<div className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 flex flex-col space-y-3 overflow-hidden rounded-xl border px-6 py-5 font-semibold">
		{children}
	</div>
);

const ReviewDivider = () => (
	<div className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 h-px w-full border-t border-dashed" />
);

export const ReviewStep = () => {
	const { t } = useTranslation();

	const { provider: exchangeProvider } = useExchangeContext();

	const { register, watch } = useFormContext();
	const { exchangeRate, estimatedTime, payinAmount, payoutAmount, fromCurrency, toCurrency, recipientWallet } =
		watch();

	return (
		<div data-testid="ExchangeForm__review-step" className="space-y-6">
			<div className="flex flex-col space-y-2">
				<ReviewStepItem>
					<ReviewStepItemRow label={t("EXCHANGE.EXCHANGE_FORM.YOU_SEND")}>
						<Amount value={payinAmount} ticker={fromCurrency?.coin} className="font-semibold" />
					</ReviewStepItemRow>

					<ReviewStepItemFooter>
						1 {fromCurrency?.coin.toUpperCase()} ≈ <Amount value={exchangeRate} ticker={toCurrency?.coin} />
					</ReviewStepItemFooter>
				</ReviewStepItem>

				<ReviewStepItem>
					<ReviewStepItemRow label={t("EXCHANGE.EXCHANGE_FORM.YOU_GET")}>
						<span className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 font-semibold">
							≈ <Amount value={payoutAmount} ticker={toCurrency?.coin} className="font-semibold" />
						</span>
					</ReviewStepItemRow>

					<ReviewStepItemRow label={t("COMMON.ADDRESS")}>
						<TruncateMiddleDynamic
							value={recipientWallet}
							className="no-ligatures text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 font-semibold"
						/>
					</ReviewStepItemRow>

					{estimatedTime && (
						<ReviewStepItemFooter>
							{t("EXCHANGE.EXCHANGE_FORM.ESTIMATED_ARRIVAL")}{" "}
							{t("EXCHANGE.EXCHANGE_FORM.ESTIMATED_TIME", { estimatedTime })}
						</ReviewStepItemFooter>
					)}
				</ReviewStepItem>
			</div>

			<ReviewDivider />

			<div>
				<FormField name="hasAgreedToTerms" className="sm:pt-2">
					<label className="flex cursor-pointer items-center space-x-3">
						<Checkbox name="hasAgreedToTerms" ref={register({ required: true })} />
						<span className="text-sm leading-5">
							<Trans
								i18nKey="EXCHANGE.EXCHANGE_FORM.TERMS"
								values={{
									exchange: "ChangeNOW",
									privacy: "Privacy Policy",
									terms: "Terms of Use",
								}}
								components={{
									linkPrivacyPolicy: (
										<Link to={exchangeProvider?.privacyPolicy as string} isExternal />
									),
									linkTerms: <Link to={exchangeProvider?.termsOfService as string} isExternal />,
								}}
							/>
						</span>
					</label>
				</FormField>
			</div>
		</div>
	);
};
