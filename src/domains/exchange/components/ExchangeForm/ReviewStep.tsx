import React from "react";
import { useFormContext } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";

import { Amount } from "@/app/components/Amount";
import { Checkbox } from "@/app/components/Checkbox";
import { FormField } from "@/app/components/Form";
import { Icon } from "@/app/components/Icon";
import { Link } from "@/app/components/Link";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";
import { useExchangeContext } from "@/domains/exchange/contexts/Exchange";

export const ReviewStep = () => {
	const { t } = useTranslation();

	const { provider: exchangeProvider } = useExchangeContext();

	const { register, watch } = useFormContext();
	const { exchangeRate, estimatedTime, payinAmount, payoutAmount, fromCurrency, toCurrency, recipientWallet } =
		watch();

	return (
		<div data-testid="ExchangeForm__review-step" className="space-y-4">
			<div className="flex flex-col rounded-xl border border-theme-secondary-300 dark:border-theme-secondary-800">
				<div className="flex flex-col px-6 py-5 gap-2">
					<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
						{t("EXCHANGE.EXCHANGE_FORM.YOU_SEND")}
					</span>
					<Amount value={payinAmount} ticker={fromCurrency?.coin} className="text-lg font-semibold" />
					<span className="text-xs font-semibold pt-1">
						1 {fromCurrency?.coin.toUpperCase()} ≈ <Amount value={exchangeRate} ticker={toCurrency?.coin} />
					</span>
				</div>

				<div className="relative border-t border-theme-secondary-300 dark:border-theme-secondary-800">
					<div className="absolute right-6 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-theme-secondary-300 bg-theme-background dark:border-theme-secondary-800">
						<Icon name="DoubleArrowDashed" className="text-theme-secondary-900" size="lg" />
					</div>
				</div>

				<div className="flex flex-col px-6 py-5 gap-2">
					<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
						{t("EXCHANGE.EXCHANGE_FORM.YOU_GET")}
					</span>
					<span className="text-lg font-semibold pb-1">
						≈  <Amount value={payoutAmount} ticker={toCurrency?.coin} className="text-lg font-semibold" />
					</span>
					<TruncateMiddleDynamic value={recipientWallet} className="no-ligatures text-xs font-semibold" />
				</div>
			</div>

			{estimatedTime && (
				<div className="flex flex-col">
					<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
						{t("EXCHANGE.EXCHANGE_FORM.ESTIMATED_ARRIVAL")}
					</span>
					<span className="text-lg font-semibold">
						{t("EXCHANGE.EXCHANGE_FORM.ESTIMATED_TIME", { estimatedTime })}
					</span>
				</div>
			)}

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
								linkPrivacyPolicy: <Link to={exchangeProvider?.privacyPolicy as string} isExternal />,
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
