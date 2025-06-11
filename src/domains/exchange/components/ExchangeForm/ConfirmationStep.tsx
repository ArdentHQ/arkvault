import { Contracts } from "@/app/lib/profiles";
import React, { useRef } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Amount } from "@/app/components/Amount";
import { Clipboard } from "@/app/components/Clipboard";
import { Icon, ThemeIcon } from "@/app/components/Icon";
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
			<span data-testid="ExplorerLink" ref={reference} className="w-full overflow-hidden">
				<Link to={explorerUrl(value, explorerMask)} isExternal>
					<TruncateMiddleDynamic
						value={value}
						offset={24}
						parentRef={reference}
						className="text-sm sm:text-base"
					/>
				</Link>
			</span>
		);
	}

	return <TruncateMiddleDynamic value={value} className="text-sm sm:text-base" />;
};

export const ConfirmationStep = ({ exchangeTransaction }: ConfirmationStepProperties) => {
	const { t } = useTranslation();

	const { watch } = useFormContext();
	const { fromCurrency, toCurrency } = watch();

	if (!exchangeTransaction) {
		return <></>;
	}

	const renderAddress = (address: string, explorerMask?: string) => (
		<div className="flex items-center space-x-2 text-lg font-semibold whitespace-nowrap">
			<ExplorerLink value={address} explorerMask={explorerMask} />

			<span className="text-theme-primary-300 dark:text-theme-secondary-600 flex">
				<Clipboard variant="icon" data={address}>
					<Icon name="Copy" />
				</Clipboard>
			</span>
		</div>
	);

	const renderHash = (hash?: string, explorerMask?: string) => {
		if (!hash) {
			return <span className="text-sm font-semibold sm:text-base">{t("COMMON.NOT_AVAILABLE")}</span>;
		}

		return (
			<div className="flex items-center space-x-2 text-lg font-semibold whitespace-nowrap">
				<ExplorerLink value={hash} explorerMask={explorerMask} />

				<span className="text-theme-primary-300 dark:text-theme-secondary-600 flex">
					<Clipboard variant="icon" data={hash}>
						<Icon name="Copy" />
					</Clipboard>
				</span>
			</div>
		);
	};

	return (
		<div data-testid="ExchangeForm__confirmation-step" className="flex flex-col">
			<div className="mx-auto mb-8 hidden items-center space-x-3 sm:flex">
				<ThemeIcon
					lightIcon="CircleCompletedLight"
					darkIcon="CircleCompletedDark"
					dimIcon="CircleCompletedDim"
					dimensions={[32, 32]}
				/>

				<h2 className="m-0 text-2xl leading-[29px] font-bold">
					{t("EXCHANGE.EXCHANGE_FORM.EXCHANGE_COMPLETED")}
				</h2>
			</div>

			<div className="space-y-6 sm:space-y-8">
				<div className="flex flex-col space-y-4 sm:space-y-5">
					<div className="flex items-center space-x-3">
						<span className="bg-theme-navy-100 dark:bg-theme-secondary-800 dark:text-theme-secondary-200 flex h-6 w-6 items-center justify-center rounded text-sm leading-[17px] font-semibold">
							1
						</span>
						<h3 className="m-0 text-lg font-bold">
							{t("EXCHANGE.EXCHANGE_FORM.CURRENCY_INPUT", {
								currency: fromCurrency?.coin.toUpperCase(),
							})}
						</h3>
					</div>

					<div className="flex sm:space-x-6">
						<div className="bg-theme-secondary-200 hidden h-24 w-24 shrink-0 items-center justify-center rounded-xl sm:flex dark:bg-black">
							<Image name="Wallet" domain="exchange" className="w-12" />
						</div>

						<div className="flex flex-1 flex-col space-y-4 overflow-hidden">
							<div className="flex flex-col space-y-2">
								<span className="text-theme-secondary-500 dark:text-theme-secondary-700 text-sm font-semibold">
									{t("EXCHANGE.EXCHANGE_FORM.INPUT_TRANSACTION_ID")}
								</span>

								{renderHash(exchangeTransaction.input().hash, fromCurrency?.transactionExplorerMask)}
							</div>

							<div className="flex flex-col space-y-2">
								<span className="text-theme-secondary-500 dark:text-theme-secondary-700 text-sm font-semibold">
									{t("EXCHANGE.EXCHANGE_FORM.EXCHANGE_ADDRESS", {
										currency: toCurrency?.coin.toUpperCase(),
									})}
								</span>

								{renderAddress(exchangeTransaction.input().address, fromCurrency?.addressExplorerMask)}
							</div>

							<div className="flex flex-col space-y-2">
								<span className="text-theme-secondary-500 dark:text-theme-secondary-700 text-sm font-semibold">
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

				<div className="border-theme-secondary-300 dark:border-theme-secondary-800 -mx-10 border-t border-dashed px-10" />

				<div className="flex flex-col space-y-4 sm:space-y-5">
					<div className="flex items-center space-x-3">
						<span className="bg-theme-navy-100 dark:bg-theme-secondary-800 dark:text-theme-secondary-200 flex h-6 w-6 items-center justify-center rounded text-sm leading-[17px] font-semibold">
							2
						</span>
						<h3 className="m-0 text-lg font-bold">
							{t("EXCHANGE.EXCHANGE_FORM.CURRENCY_OUTPUT", {
								currency: toCurrency?.coin.toUpperCase(),
							})}
						</h3>
					</div>

					<div className="flex sm:space-x-6">
						<div className="bg-theme-secondary-200 hidden h-24 w-24 shrink-0 items-center justify-center rounded-xl sm:flex dark:bg-black">
							<Image name="Exchange" domain="exchange" className="w-12" />
						</div>

						<div className="flex flex-1 flex-col space-y-4 overflow-hidden">
							<div className="flex w-full flex-col space-y-2">
								<span className="text-theme-secondary-500 dark:text-theme-secondary-700 text-sm font-semibold">
									{t("EXCHANGE.EXCHANGE_FORM.OUTPUT_TRANSACTION_ID")}
								</span>

								{renderHash(exchangeTransaction.output().hash, toCurrency?.transactionExplorerMask)}
							</div>

							<div className="flex flex-col space-y-2">
								<span className="text-theme-secondary-500 dark:text-theme-secondary-700 text-sm font-semibold">
									{t("EXCHANGE.EXCHANGE_FORM.YOUR_ADDRESS", {
										currency: toCurrency?.coin.toUpperCase(),
									})}
								</span>

								{renderAddress(exchangeTransaction.output().address, toCurrency?.addressExplorerMask)}
							</div>

							<div className="flex flex-col space-y-2">
								<span className="text-theme-secondary-500 dark:text-theme-secondary-700 text-sm font-semibold">
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
