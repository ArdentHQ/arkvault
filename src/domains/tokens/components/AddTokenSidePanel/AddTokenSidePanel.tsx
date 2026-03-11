import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Form, FormField, FormLabel } from "@/app/components/Form";
import { useActiveProfile, useValidation } from "@/app/hooks";
import { useKeydown } from "@/app/hooks/use-keydown";
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

export const AddTokenSidePanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
	const { t } = useTranslation();

	const profile = useActiveProfile();

	const [token, setToken] = useState<TokenDTO | undefined>(undefined);
	const [isLoadingToken, setIsLoadingToken] = useState<boolean>(false);
	const [isInvalidContractAddress, setIsInvalidContractAddress] = useState<boolean>(false);

	const form = useForm({ mode: "onChange" });

	const { formState, register, reset: resetForm, setValue, watch } = form;
	const { isValid, isSubmitting, isValidating } = formState;

	const { addToken } = useValidation();
	const contractAddress = watch("contractAddress");

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
			} catch (e) {
				console.error(e);
				setIsInvalidContractAddress(true);
			} finally {
				setIsLoadingToken(false);
			}
		};

		void getToken();
	}, [isValid, contractAddress, isValidating]);

	useKeydown("Enter", () => {
		const isButton = (document.activeElement as any)?.type === "button";

		if (isButton || !isValid) {
			return;
		}

		return handleSubmit();
	});

	const handleSubmit = async () => {
		profile.whitelistContractAddress(contractAddress as string);
		toasts.success(
			t("TOKENS.ADD_TOKEN.SUCCESS_TOKEN_ADDED", {
				name: token?.name(),
				symbol: token?.displaySymbol(),
			}),
		);

		onOpenChange(false);
	};

	const onMountChange = useCallback(
		(mounted: boolean) => {
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
					className="text-theme-navy-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600"
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
							<div className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 overflow-hidden rounded-xl border">
								{!isLoadingToken && (
									<div className="flex items-center gap-4 px-6 pt-5 pb-3">
										<Image name="ContractAddress" />
										<p className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 leading-5 font-semibold">
											{t("TOKENS.ADD_TOKEN.STATE_EMPTY_TEXT")}
										</p>
									</div>
								)}

								{isLoadingToken && (
									<div className="flex items-center gap-2 px-6 pt-5 pb-3">
										<Spinner color="warning-alt" size="sm" width={3} />
										<Divider type="vertical" />
										<p className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 leading-5 font-semibold">
											{t("TOKENS.ADD_TOKEN.STATE_LOADING_TEXT")}
										</p>
									</div>
								)}
								<div className="bg-theme-secondary-100 dark:bg-theme-dark-950 dim:bg-theme-dim-950 px-6 py-3">
									<p className="text-theme-secondary-700 dark:text-theme-dark-100 dim:text-theme-dim-100 text-sm leading-5">
										{t("TOKENS.ADD_TOKEN.WARNING_CUSTOM_TOKEN")}
									</p>
								</div>
							</div>
						)}

						{(token || isInvalidContractAddress) && (
							<div
								className={cn("overflow-hidden rounded-xl border", {
									"border-theme-danger-300 dark:border-theme-danger-400 dim:border-theme-danger-400":
										!token,
									"border-theme-warning-300 dark:border-theme-warning-700 dim:border-theme-warning-700":
										token,
								})}
							>
								{token && (
									<div className="px-6 pt-5 pb-3">
										<div className="space-y-3">
											<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
												<DetailTitle className="w-auto sm:min-w-28 sm:pr-6">
													{t("COMMON.TOKEN")}
												</DetailTitle>

												<div className="font-semibold break-all whitespace-normal">
													{token.name()}
												</div>
											</div>

											<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
												<DetailTitle className="w-auto sm:min-w-28 sm:pr-6">
													{t("COMMON.SYMBOL")}
												</DetailTitle>

												<div className="font-semibold break-all whitespace-normal">
													{token.symbol()}
												</div>
											</div>

											<div className="flex justify-between space-x-2 sm:justify-start sm:space-x-0 md:items-center">
												<DetailTitle className="w-auto pt-1 sm:min-w-28 sm:pr-6 md:pt-0">
													{t("COMMON.CONTRACT")}
												</DetailTitle>

												<div className="flex flex-1 flex-col justify-end gap-2 sm:w-full sm:justify-start md:flex-row md:items-center">
													<Address
														truncateOnTable
														address={token.address()}
														showCopyButton
														walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
														wrapperClass="justify-end sm:justify-start"
														addressClass={cn(
															"text-sm leading-[17px] sm:leading-5 sm:text-base w-full w-3/4",
														)}
													/>

													<div className="hidden md:block">
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
												<DetailTitle className="w-auto sm:min-w-28 sm:pr-6">
													{t("COMMON.DECIMALS")}
												</DetailTitle>

												<div className="font-semibold">{token.decimals()}</div>
											</div>

											<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
												<DetailTitle className="w-auto sm:min-w-28 sm:pr-6">
													{t("COMMON.SUPPLY")}
												</DetailTitle>

												<div className="font-semibold">
													<Amount
														ticker={token.displaySymbol()}
														value={token.totalSupply()}
														className="text-sm font-semibold break-all whitespace-normal md:text-base"
														showTicker={false}
														showCompactFormat
													/>
												</div>
											</div>
										</div>
									</div>
								)}

								{!token && (
									<div className="flex items-center gap-2 px-6 pt-5 pb-3">
										<div className="flex items-center gap-2">
											<Icon
												name="CircleCross"
												className="text-theme-danger-700 dark:text-theme-danger-400 dim:text-theme-danger-400"
												size="md"
											/>
											<div className="text-theme-danger-700 dark:text-theme-danger-400 dim:text-theme-danger-400 leading-5 font-semibold">
												{t("COMMON.ERROR")}
											</div>
										</div>

										<Divider type="vertical" />
										<div className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 leading-5 font-semibold">
											{t("TOKENS.ADD_TOKEN.STATE_INVALID_TOKEN_TEXT")}
										</div>
									</div>
								)}

								<div
									className={cn("px-6 py-3", {
										"bg-theme-danger-50 dark:bg-theme-dark-950 dim:bg-theme-dim-950 text-theme-secondary-700 dark:text-theme-dark-100 dim:text-theme-dim-100":
											!token,
										"bg-theme-warning-50 dark:bg-theme-dark-950 dim:bg-theme-dim-950 text-theme-secondary-900 dark:text-theme-dark-100 dim:text-theme-dim-100":
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
