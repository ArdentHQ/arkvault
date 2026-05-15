import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Form, FormField, FormLabel } from "@/app/components/Form";
import { useActiveProfile, useValidation } from "@/app/hooks";
import { SidePanel, SidePanelButtons } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { InputDefault } from "@/app/components/Input";
import { Alert } from "@/app/components/Alert";
import { TokenDTO } from "@/app/lib/profiles/token.dto";
import { Image } from "@/app/components/Image";
import { Spinner } from "@/app/components/Spinner";
import { Divider } from "@/app/components/Divider";
import cn from "classnames";
import { DetailTitle } from "@/app/components/DetailWrapper";
import { Address } from "@/app/components/Address";
import { Link } from "@/app/components/Link";
import { Amount } from "@/app/components/Amount";
import { toasts } from "@/app/services";

export const AddTokenSidePanel = ({
	open,
	onOpenChange,
	onAddToken,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onAddToken: () => void;
}) => {
	const { t } = useTranslation();

	const profile = useActiveProfile();

	const [token, setToken] = useState<TokenDTO | undefined>(undefined);
	const [isLoadingToken, setIsLoadingToken] = useState<boolean>(false);
	const [isInvalidContractAddress, setIsInvalidContractAddress] = useState<boolean>(false);

	const form = useForm({ mode: "onChange" });

	const { formState, register, reset: resetForm, setValue, watch } = form;
	const { isValid, isSubmitting, isValidating } = formState;

	const contractAddress = watch("contractAddress");

	const { addToken } = useValidation();

	useEffect(() => {
		register("contractAddress", addToken.contractAddress());
	}, [addToken, register]);

	const contractController = useRef<AbortController | undefined>(undefined);

	useEffect(() => {
		setToken(undefined);
		setIsLoadingToken(false);
		setIsInvalidContractAddress(false);

		if (!isValid || !contractAddress || isValidating) {
			return;
		}

		const getToken = async () => {
			const publicApiEndpoint = profile.activeNetwork().config().host("full", profile);

			setIsLoadingToken(true);

			try {
				const response = await fetch(`${publicApiEndpoint}/tokens/${contractAddress}`, {
					signal: contractController.current?.signal,
				});

				if (!response.ok) {
					setIsInvalidContractAddress(true);
					return;
				}

				const data = await response.json();
				setToken(new TokenDTO(data.data));
			} catch {
				setIsInvalidContractAddress(true);
			} finally {
				setIsLoadingToken(false);
			}
		};

		void getToken();
	}, [isValid, contractAddress, isValidating]);

	const handleSubmit = async () => {
		profile.whitelistContractAddress(contractAddress as string);
		toasts.success(
			t("TOKENS.ADD_TOKEN.SUCCESS_TOKEN_ADDED", {
				name: token?.name(),
				symbol: token?.displaySymbol(),
			}),
		);

		onOpenChange(false);
		onAddToken();
	};

	const onMountChange = useCallback(
		(mounted: boolean) => {
			/* istanbul ignore next -- @preserve */
			if (!mounted) {
				resetForm();
			}
		},
		[resetForm],
	);

	return (
		<SidePanel
			open={open}
			minimizeable
			onOpenChange={onOpenChange}
			title={t("TOKENS.ADD_TOKEN.TITLE")}
			titleIcon={
				<Icon
					name="AddToken"
					dimensions={[24, 24]}
					className="text-theme-navy-600 dim:text-theme-dim-navy-600 dark:text-theme-dark-navy-400"
				/>
			}
			dataTestId="AddTokenSidePanel"
			disableEscapeKey={isSubmitting}
			onMountChange={onMountChange}
			footer={
				<SidePanelButtons>
					<Button
						data-testid="AddToken__save-button"
						onClick={() => void handleSubmit()}
						disabled={!isValid || isSubmitting || !token}
					>
						{t("COMMON.SAVE_FINISH")}
					</Button>
				</SidePanelButtons>
			}
		>
			<Form context={form} onSubmit={handleSubmit}>
				<section>
					<div className="space-y-4">
						<FormField name="contractAddress">
							<FormLabel label={t("COMMON.CONTRACT_ADDRESS")} />
							<InputDefault
								data-testid="Input__ContractAddress"
								defaultValue={contractAddress}
								onChange={(event: ChangeEvent<HTMLInputElement>) => {
									contractController.current?.abort();
									contractController.current = new AbortController();
									setValue("contractAddress", event.target.value, {
										shouldDirty: true,
										shouldValidate: true,
									});
								}}
							/>
						</FormField>

						<Alert title={t("TOKENS.ADD_TOKEN.HELP_TITLE")} variant="info" collapsible={true}>
							<p>{t("TOKENS.ADD_TOKEN.GUIDELINE_TITLE")}</p>
							<ol className="list-disc pl-5">
								<li>{t("TOKENS.ADD_TOKEN.GUIDELINE_ADDRESS_PREFIX")}</li>
								<li>{t("TOKENS.ADD_TOKEN.GUIDELINE_CONTRACT_ADDRESS")}</li>
							</ol>
						</Alert>

						{!token && !isInvalidContractAddress && (
							<div className="overflow-hidden rounded-xl border border-theme-secondary-300 dim:border-theme-dim-700 dark:border-theme-dark-700">
								{!isLoadingToken && (
									<div className="flex items-center gap-4 px-6 pb-3 pt-5">
										<Image name="ContractAddress" />
										<p className="font-semibold leading-5 text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200">
											{t("TOKENS.ADD_TOKEN.STATE_EMPTY_TEXT")}
										</p>
									</div>
								)}

								{isLoadingToken && (
									<div className="flex items-center gap-2 px-6 pb-3 pt-5">
										<Spinner color="warning-alt" size="sm" width={3} />
										<Divider type="vertical" />
										<p className="font-semibold leading-5 text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200">
											{t("TOKENS.ADD_TOKEN.STATE_LOADING_TEXT")}
										</p>
									</div>
								)}
								<div className="bg-theme-secondary-100 px-6 py-3 dim:bg-theme-dim-950 dark:bg-theme-dark-950">
									<p className="text-sm leading-5 text-theme-secondary-700 dim:text-theme-dim-100 dark:text-theme-dark-100">
										{t("TOKENS.ADD_TOKEN.WARNING_CUSTOM_TOKEN")}
									</p>
								</div>
							</div>
						)}

						{(token || isInvalidContractAddress) && (
							<div
								className={cn("overflow-hidden rounded-xl border", {
									"border-theme-danger-300 dim:border-theme-danger-400 dark:border-theme-danger-400":
										!token,
									"border-theme-warning-300 dim:border-theme-warning-700 dark:border-theme-warning-700":
										token,
								})}
							>
								{token && (
									<div className="px-6 pb-3 pt-5">
										<div className="space-y-3">
											<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
												<DetailTitle className="w-auto min-w-14 sm:min-w-28 sm:pr-6">
													{t("COMMON.TOKEN")}
												</DetailTitle>

												<div className="whitespace-normal break-all font-semibold">
													{token.name()}
												</div>
											</div>

											<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
												<DetailTitle className="w-auto min-w-14 sm:min-w-28 sm:pr-6">
													{t("COMMON.SYMBOL")}
												</DetailTitle>

												<div className="whitespace-normal break-all font-semibold">
													{token.symbol()}
												</div>
											</div>

											<div className="flex justify-between space-x-2 sm:justify-start sm:space-x-0 md:items-center">
												<DetailTitle className="w-auto min-w-14 pt-1 sm:min-w-28 sm:pr-6 md:pt-0">
													{t("COMMON.CONTRACT")}
												</DetailTitle>

												<div className="flex flex-1 flex-col justify-end gap-2 sm:w-full sm:flex-row sm:items-center sm:justify-start">
													<Address
														truncateOnTable
														address={token.address()}
														showCopyButton
														walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
														wrapperClass="self-end sm:self-start  justify-end sm:justify-start w-40 sm:w-80 md:w-full md:max-w-96"
														addressClass={cn(
															"text-sm leading-[17px] sm:leading-5 sm:text-base w-full w-3/4",
														)}
													/>

													<div className="hidden sm:block">
														<Divider type="vertical" />
													</div>

													<Link
														isExternal
														to={profile.wallets().first().link().wallet(token.address())}
														className="flex items-center justify-end whitespace-nowrap"
													>
														{t("COMMON.EXPLORER")}
													</Link>
												</div>
											</div>

											<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
												<DetailTitle className="w-auto min-w-14 sm:min-w-28 sm:pr-6">
													{t("COMMON.DECIMALS")}
												</DetailTitle>

												<div className="font-semibold">{token.decimals()}</div>
											</div>

											<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
												<DetailTitle className="w-auto min-w-14 sm:min-w-28 sm:pr-6">
													{t("COMMON.SUPPLY")}
												</DetailTitle>

												<div className="font-semibold">
													<Amount
														ticker={token.displaySymbol()}
														value={token.totalSupply()}
														className="whitespace-normal break-all text-sm font-semibold md:text-base"
														showTicker={false}
														showCompactFormat
													/>
												</div>
											</div>
										</div>
									</div>
								)}

								{!token && (
									<div className="flex items-center gap-2 px-6 pb-3 pt-5">
										<div className="flex items-center gap-2">
											<Icon
												name="CircleCross"
												className="text-theme-danger-700 dim:text-theme-danger-400 dark:text-theme-danger-400"
												size="md"
											/>
											<div className="font-semibold leading-5 text-theme-danger-700 dim:text-theme-danger-400 dark:text-theme-danger-400">
												{t("COMMON.ERROR")}
											</div>
										</div>

										<Divider type="vertical" />
										<div className="font-semibold leading-5 text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200">
											{t("TOKENS.ADD_TOKEN.STATE_INVALID_TOKEN_TEXT")}
										</div>
									</div>
								)}

								<div
									className={cn("px-6 py-3", {
										"bg-theme-danger-50 text-theme-secondary-700 dim:bg-theme-dim-950 dim:text-theme-dim-100 dark:bg-theme-dark-950 dark:text-theme-dark-100":
											!token,
										"bg-theme-warning-50 text-theme-secondary-900 dim:bg-theme-dim-950 dim:text-theme-dim-100 dark:bg-theme-dark-950 dark:text-theme-dark-100":
											token,
									})}
								>
									<p className="text-sm leading-5">{t("TOKENS.ADD_TOKEN.WARNING_CUSTOM_TOKEN")}</p>
								</div>
							</div>
						)}
					</div>
				</section>
			</Form>
		</SidePanel>
	);
};
