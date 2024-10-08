import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useRef } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Amount } from "@/app/components/Amount";
import { Clipboard } from "@/app/components/Clipboard";
import {Icon, ThemeIcon} from "@/app/components/Icon";
import { Image } from "@/app/components/Image";
import { Label } from "@/app/components/Label";
import { Link } from "@/app/components/Link";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";

interface ConfirmationStepProperties {
	exchangeTransaction?: Contracts.IExchangeTransaction;
}

interface ExplorerLinkProperties {
	value: string;
	explorerMask?: string;
}

const explorerUrl = (value: string, explorerMask: string) => explorerMask.replace("{}", value);

const ExplorerLink = ({ value, explorerMask }: ExplorerLinkProperties) => {
	const reference = useRef(null);

	if (explorerMask) {
		return (
			<span data-testid="ExplorerLink" ref={reference} className="overflow-hidden">
				<Link to={explorerUrl(value, explorerMask)} isExternal>
					<TruncateMiddleDynamic value={value} offset={24} parentRef={reference} />
				</Link>
			</span>
		);
	}

	return <TruncateMiddleDynamic value={value} />;
};

export const ConfirmationStep = ({ exchangeTransaction }: ConfirmationStepProperties) => {
	const { t } = useTranslation();

	const { watch } = useFormContext();
	const { fromCurrency, toCurrency } = watch();

	if (!exchangeTransaction) {
		return <></>;
	}

	const renderAddress = (address: string, explorerMask?: string) => (
		<div className="flex items-center space-x-2 whitespace-nowrap text-lg font-semibold">
			<ExplorerLink value={address} explorerMask={explorerMask} />

			<span className="flex text-theme-primary-300 dark:text-theme-secondary-600">
				<Clipboard variant="icon" data={address}>
					<Icon name="Copy" />
				</Clipboard>
			</span>
		</div>
	);

	const renderHash = (hash?: string, explorerMask?: string) => {
		if (!hash) {
			return <span className="text-lg font-semibold">{t("COMMON.NOT_AVAILABLE")}</span>;
		}

		return (
			<div className="flex items-center space-x-2 whitespace-nowrap text-lg font-semibold">
				<ExplorerLink value={hash} explorerMask={explorerMask} />

				<span className="flex text-theme-primary-300 dark:text-theme-secondary-600">
					<Clipboard variant="icon" data={hash}>
						<Icon name="Copy" />
					</Clipboard>
				</span>
			</div>
		);
	};

	return (
		<div data-testid="ExchangeForm__confirmation-step" className="flex flex-col">
			<div className="hidden mx-auto sm:flex items-center space-x-3 mb-8">
				<ThemeIcon lightIcon="CircleCompletedLight" darkIcon="CircleCompletedDark" dimensions={[32, 32]} />

				<h2 className="m-0 font-bold leading-[29px] text-2xl">
					{t("EXCHANGE.EXCHANGE_FORM.EXCHANGE_COMPLETED")}
				</h2>
			</div>

			<div className="space-y-6 sm:space-y-8">
				<div className="flex flex-col space-y-4 sm:space-y-5">
					<div className="flex items-center space-x-3">
						<span className="flex h-6 w-6 items-center justify-center rounded bg-theme-navy-100 dark:text-theme-secondary-200 text-sm leading-[17px] font-semibold dark:bg-theme-secondary-800">
							1
						</span>
						<h3 className="m-0 text-lg font-bold">
							{t("EXCHANGE.EXCHANGE_FORM.CURRENCY_INPUT", {
								currency: fromCurrency?.coin.toUpperCase(),
							})}
						</h3>
					</div>

					<div className="flex sm:space-x-6">
						<div className="hidden h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-theme-secondary-200 dark:bg-black sm:flex">
							<Image name="Wallet" domain="exchange" className="w-12" />
						</div>

						<div className="flex flex-1 flex-col space-y-4 overflow-hidden">
							<div className="flex flex-col space-y-2">
								<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
									{t("EXCHANGE.EXCHANGE_FORM.INPUT_TRANSACTION_ID")}
								</span>

								 {renderHash(exchangeTransaction.input().hash, fromCurrency?.transactionExplorerMask)}
							</div>

						<div className="flex flex-col space-y-2">
							<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
								{t("EXCHANGE.EXCHANGE_FORM.EXCHANGE_ADDRESS", {
									currency: toCurrency?.coin.toUpperCase(),
								})}
							</span>

								{renderAddress(exchangeTransaction.input().address, fromCurrency?.addressExplorerMask)}
							</div>

							<div className="flex flex-col space-y-2">
								<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
									{t("EXCHANGE.EXCHANGE_FORM.AMOUNT_SENT")}
								</span>

								<Label color="danger" className="mr-auto whitespace-nowrap">
									<Amount
										className="leading-5 font-semibold"
										value={exchangeTransaction.input().amount}
										ticker={exchangeTransaction.input().ticker}
										isNegative
										showSign
									/>
								</Label>
							</div>
						</div>
					</div>
				</div>

				<div className="-mx-10 border-t border-dashed border-theme-secondary-300 px-10 dark:border-theme-secondary-800" />

				<div className="flex flex-col space-y-4 sm:space-y-5">
					<div className="flex items-center space-x-3">
					<span className="flex h-6 w-6 items-center justify-center rounded bg-theme-navy-100 dark:text-theme-secondary-200 text-sm leading-[17px] font-semibold dark:bg-theme-secondary-800">
							2
						</span>
						<h3 className="m-0 text-lg font-bold">
							{t("EXCHANGE.EXCHANGE_FORM.CURRENCY_OUTPUT", {
								currency: toCurrency?.coin.toUpperCase(),
							})}
						</h3>
					</div>

					<div className="flex sm:space-x-6">
						<div className="hidden h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-theme-secondary-200 dark:bg-black sm:flex">
							<Image name="Exchange" domain="exchange" className="w-12" />
						</div>

						<div className="flex flex-1 flex-col space-y-4 overflow-hidden">
							<div className="flex w-full flex-col space-y-2">
								<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
									{t("EXCHANGE.EXCHANGE_FORM.OUTPUT_TRANSACTION_ID")}
								</span>

								{renderHash(exchangeTransaction.output().hash, toCurrency?.transactionExplorerMask)}
							</div>

							<div className="flex flex-col space-y-2">
								<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
									{t("EXCHANGE.EXCHANGE_FORM.YOUR_ADDRESS", {
										currency: toCurrency?.coin.toUpperCase(),
									})}
								</span>

								{renderAddress(exchangeTransaction.output().address, toCurrency?.addressExplorerMask)}
							</div>

							<div className="flex flex-col space-y-2">
								<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
									{t("EXCHANGE.EXCHANGE_FORM.AMOUNT_RECEIVED")}
								</span>

								<Label color="success" className="mr-auto whitespace-nowrap">
									<Amount
										className="leading-5 font-semibold"
										value={exchangeTransaction.output().amount}
										ticker={exchangeTransaction.output().ticker}
										showSign
									/>
								</Label>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
