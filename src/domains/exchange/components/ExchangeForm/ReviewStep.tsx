import React from "react";
import { useFormContext } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";

import { Amount } from "@/app/components/Amount";
import { Checkbox } from "@/app/components/Checkbox";
import { FormField } from "@/app/components/Form";
import { Link } from "@/app/components/Link";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";
import { useExchangeContext } from "@/domains/exchange/contexts/Exchange";
import { FormItem, FormItemRow, FormItemFooter, FormDivider } from "./ExchangeForm.blocks";

export const ReviewStep = ({
	withSignStep,
	onManualTransfer,
}: {
	withSignStep: boolean;
	onManualTransfer: () => void;
}) => {
	const { t } = useTranslation();

	const { provider: exchangeProvider } = useExchangeContext();

	const {
		register,
		watch,
		formState: { isSubmitting, isValid },
	} = useFormContext();
	const { exchangeRate, estimatedTime, payinAmount, payoutAmount, fromCurrency, toCurrency, recipientWallet } =
		watch();

	return (
		<div data-testid="ExchangeForm__review-step" className="space-y-4 sm:space-y-6">
			<div className="flex flex-col space-y-2">
				<FormItem>
					<FormItemRow label={t("EXCHANGE.EXCHANGE_FORM.YOU_SEND")}>
						<Amount value={payinAmount} ticker={fromCurrency?.coin} className="font-semibold" />
					</FormItemRow>

					<FormItemFooter>
						1 {fromCurrency?.coin.toUpperCase()} ≈ <Amount value={exchangeRate} ticker={toCurrency?.coin} />
					</FormItemFooter>
				</FormItem>

				<FormItem>
					<FormItemRow label={t("EXCHANGE.EXCHANGE_FORM.YOU_GET")}>
						<span className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 font-semibold">
							≈ <Amount value={payoutAmount} ticker={toCurrency?.coin} className="font-semibold" />
						</span>
					</FormItemRow>

					<FormItemRow label={t("COMMON.ADDRESS")}>
						<TruncateMiddleDynamic
							value={recipientWallet}
							className="no-ligatures text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 font-semibold"
						/>
					</FormItemRow>

					{estimatedTime && (
						<FormItemFooter>
							{t("EXCHANGE.EXCHANGE_FORM.ESTIMATED_ARRIVAL")}{" "}
							{t("EXCHANGE.EXCHANGE_FORM.ESTIMATED_TIME", { estimatedTime })}
						</FormItemFooter>
					)}
				</FormItem>
			</div>

			<FormDivider />

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

			{withSignStep && (
				<>
					<FormDivider />

					<div className="text-right">
						<button
							data-testid="ExchangeForm__manual_transfer"
							type="button"
							className="link text-theme-navy-600! dim:text-theme-dim-navy-600 dim-hover:text-theme-dim-navy-500 text-sm font-semibold"
							onClick={onManualTransfer}
							disabled={isSubmitting || !isValid}
						>
							{t("EXCHANGE.MANUAL_TRANSFER")}
						</button>
					</div>
				</>
			)}
		</div>
	);
};
