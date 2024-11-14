import { Coins, Networks } from "@ardenthq/sdk";
import { truncate } from "@ardenthq/sdk-helpers";
import { Contracts } from "@ardenthq/sdk-profiles";
import { TFunction } from "i18next";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Divider } from "@/app/components/Divider";
import { FormField, FormLabel } from "@/app/components/Form";
import { Header } from "@/app/components/Header";
import { Input, InputAddress, InputPassword } from "@/app/components/Input";
import { Select } from "@/app/components/SelectDropdown";
import { Toggle } from "@/app/components/Toggle";
import { Tooltip } from "@/app/components/Tooltip";
import { OptionsValue, useImportOptions } from "@/domains/wallet/hooks/use-import-options";
import { assertNetwork, assertString } from "@/utils/assertions";
import { Alert } from "@/app/components/Alert";
import { ThemeIcon } from "@/app/components/Icon";

const validateAddress = async ({
	findAddress,
	profile,
	t,
	value,
	network,
}: {
	findAddress: (value: string) => Promise<string>;
	profile: Contracts.IProfile;
	t: TFunction;
	value: string;
	network: Networks.Network;
}) => {
	try {
		const address = await findAddress(value);

		return (
			!profile.wallets().findByAddressWithNetwork(address, network.id()) ||
			t("COMMON.INPUT_PASSPHRASE.VALIDATION.ADDRESS_ALREADY_EXISTS", {
				address,
			}).toString()
		);
	} catch (error) {
		/* istanbul ignore next -- @preserve */
		return error.message;
	}
};

const MnemonicField = ({
	profile,
	label,
	findAddress,
	network,
	...properties
}: {
	profile: Contracts.IProfile;
	label: string;
	network: Networks.Network;
	findAddress: (value: string) => Promise<string>;
} & Omit<React.HTMLProps<any>, "ref">) => {
	const { t } = useTranslation();
	const { register } = useFormContext();

	return (
		<FormField name="value">
			<FormLabel label={label} />
			<InputPassword
				ref={register({
					required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
						field: label,
					}).toString(),
					validate: (value) =>
						validateAddress({
							findAddress,
							network,
							profile,
							t,
							value,
						}),
				})}
				{...properties}
			/>
		</FormField>
	);
};

const AddressField = ({ coin, profile }: { coin: Coins.Coin; profile: Contracts.IProfile }) => {
	const { t } = useTranslation();
	const { register } = useFormContext();

	return (
		<FormField name="value">
			<FormLabel label={t("COMMON.ADDRESS")} />
			<InputAddress
				profile={profile}
				coin={coin.network().coin()}
				network={coin.network().id()}
				registerRef={register}
				additionalRules={{
					required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
						field: t("COMMON.ADDRESS"),
					}).toString(),
					validate: {
						duplicateAddress: (address) =>
							!profile.wallets().findByAddressWithNetwork(address, coin.network().id()) ||
							t("COMMON.INPUT_ADDRESS.VALIDATION.ADDRESS_ALREADY_EXISTS", { address }).toString(),
					},
				}}
				data-testid="ImportWallet__address-input"
			/>
		</FormField>
	);
};

const PublicKeyField = ({ coin, profile }: { coin: Coins.Coin; profile: Contracts.IProfile }) => {
	const { t } = useTranslation();
	const { register } = useFormContext();

	return (
		<FormField name="value">
			<FormLabel label={t("COMMON.PUBLIC_KEY")} />
			<Input
				ref={register({
					required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
						field: t("COMMON.PUBLIC_KEY"),
					}).toString(),
					validate: {
						duplicateAddress: async (value) => {
							try {
								const { address } = await coin.address().fromPublicKey(value);

								if (profile.wallets().findByAddressWithNetwork(address, coin.network().id())) {
									return t("COMMON.INPUT_PUBLIC_KEY.VALIDATION.PUBLIC_KEY_ALREADY_EXISTS", {
										publicKey: truncate(value, { length: 15, omissionPosition: "middle" }),
									}).toString();
								}

								return true;
							} catch {
								return t("WALLETS.PAGE_IMPORT_WALLET.VALIDATION.INVALID_PUBLIC_KEY").toString();
							}
						},
					},
				})}
				data-testid="ImportWallet__publicKey-input"
			/>
		</FormField>
	);
};

const ImportInputField = ({
	type,
	coin,
	profile,
}: {
	type: OptionsValue;
	coin: Coins.Coin;
	profile: Contracts.IProfile;
}) => {
	const { t } = useTranslation();
	const { register, getValues } = useFormContext();

	const network = getValues("network");
	assertNetwork(network);

	if (type.startsWith("bip")) {
		const findAddress = async (value: string) => {
			try {
				const { address } = await coin.address().fromMnemonic(value);
				return address;
			} catch {
				/* istanbul ignore next -- @preserve */
				throw new Error(t("WALLETS.PAGE_IMPORT_WALLET.VALIDATION.INVALID_MNEMONIC"));
			}
		};

		return (
			<>
				<MnemonicField
					profile={profile}
					label={t(`COMMON.MNEMONIC_TYPE.${(type as "bip39" | "bip44" | "bip49" | "bip84").toUpperCase()}`)}
					data-testid="ImportWallet__mnemonic-input"
					findAddress={findAddress}
					network={network}
				/>
				<Alert
					title={t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.MNEMONIC_TIP.TITLE")}
					variant="info"
					collapsible
				>
					<p>{t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.MNEMONIC_TIP.GUIDELINES_TITLE")}</p>
					<ol className="list-disc pl-5">
						<li>{t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.MNEMONIC_TIP.GUIDELINES_1")}</li>
						<li>{t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.MNEMONIC_TIP.GUIDELINES_2")}</li>
						<li>{t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.MNEMONIC_TIP.GUIDELINES_3")}</li>
						<li>{t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.MNEMONIC_TIP.GUIDELINES_4")}</li>
					</ol>
				</Alert>
			</>
		);
	}

	if (type === OptionsValue.ADDRESS) {
		return <AddressField coin={coin} profile={profile} />;
	}

	if (type === OptionsValue.PUBLIC_KEY) {
		return <PublicKeyField coin={coin} profile={profile} />;
	}

	if (type === OptionsValue.PRIVATE_KEY) {
		return (
			<MnemonicField
				profile={profile}
				label={t("COMMON.PRIVATE_KEY")}
				data-testid="ImportWallet__privatekey-input"
				findAddress={async (value) => {
					try {
						const { address } = await coin.address().fromPrivateKey(value);
						return address;
					} catch {
						/* istanbul ignore next -- @preserve */
						throw new Error(t("WALLETS.PAGE_IMPORT_WALLET.VALIDATION.INVALID_PRIVATE_KEY"));
					}
				}}
				network={network}
			/>
		);
	}

	if (type === OptionsValue.WIF) {
		return (
			<MnemonicField
				profile={profile}
				label={t("COMMON.WIF")}
				data-testid="ImportWallet__wif-input"
				findAddress={async (value) => {
					try {
						const { address } = await coin.address().fromWIF(value);
						return address;
					} catch {
						/* istanbul ignore next -- @preserve */
						throw new Error(t("WALLETS.PAGE_IMPORT_WALLET.VALIDATION.INVALID_WIF"));
					}
				}}
				network={network}
			/>
		);
	}

	if (type === OptionsValue.ENCRYPTED_WIF) {
		return (
			<>
				<FormField name="encryptedWif">
					<FormLabel label={t("COMMON.ENCRYPTED_WIF")} />
					<div className="relative">
						<Input
							ref={register({
								required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
									field: t("COMMON.ENCRYPTED_WIF"),
								}).toString(),
							})}
							data-testid="ImportWallet__encryptedWif-input"
						/>
					</div>
				</FormField>

				<MnemonicField
					profile={profile}
					label={t("COMMON.PASSWORD")}
					data-testid="ImportWallet__encryptedWif__password-input"
					findAddress={(value) => Promise.resolve(value)}
					network={network}
				/>
			</>
		);
	}

	// Default: type === OptionsValue.SECRET
	return (
		<MnemonicField
			profile={profile}
			label={t("COMMON.SECRET")}
			data-testid="ImportWallet__secret-input"
			findAddress={async (value) => {
				try {
					const { address } = await coin.address().fromSecret(value);
					return address;
				} catch (error) {
					if (error.message.includes("value is BIP39")) {
						throw new Error(t("WALLETS.PAGE_IMPORT_WALLET.VALIDATION.INVALID_SECRET"));
					}

					/* istanbul ignore next -- @preserve */
					throw error;
				}
			}}
			network={network}
		/>
	);
};

export const MethodStep = ({ profile }: { profile: Contracts.IProfile }) => {
	const { t } = useTranslation();
	const { getValues, watch, setValue, clearErrors } = useFormContext();

	const network = getValues("network");
	assertNetwork(network);

	const [coin] = useState(() => profile.coins().get(network.coin(), network.id()));

	const { options, defaultOption } = useImportOptions(network.importMethods());

	const useEncryption = watch("useEncryption");
	const importOption = watch("importOption") || defaultOption;

	assertString(importOption.value);

	const handleToggleEncryption = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValue("useEncryption", event.target.checked);
	};

	const isUseEncryptionChecked = useEncryption ?? false;

	useEffect(() => {
		if (useEncryption && !importOption.canBeEncrypted) {
			setValue("useEncryption", false);
		}
	}, [importOption.canBeEncrypted, useEncryption, setValue]);

	return (
		<section data-testid="ImportWallet__method-step">
			<Header
				title={t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.TITLE")}
				titleIcon={
					<ThemeIcon
						dimensions={[24, 24]}
						lightIcon="ImportWalletLight"
						darkIcon="ImportWalletDark"
						greenLightIcon="ImportWalletLightGreen"
						greenDarkIcon="ImportWalletDarkGreen"
					/>
				}
				subtitle={t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.SUBTITLE")}
				className="hidden sm:block"
			/>

			<div className="mt-4 space-y-4">
				<FormField name="">
					<FormLabel>{t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.TYPE")}</FormLabel>
					<Select
						id="ImportWallet__select"
						data-testid="ImportWallet__type"
						defaultValue={importOption.value}
						options={options}
						onChange={(option: any) => {
							setValue("importOption", option, { shouldDirty: true, shouldValidate: true });
							setValue("value", undefined);
							clearErrors("value");
						}}
					/>
				</FormField>

				<ImportInputField type={importOption.value} coin={coin} profile={profile} />

				<Divider dashed />

				<div className="flex w-full flex-col space-y-2">
					<div className="flex items-center justify-between space-x-5">
						<span className="font-bold text-theme-secondary-text">
							{t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.ENCRYPTION.TITLE")}
						</span>

						<Tooltip
							className="-ml-3 mb-1"
							content={t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.ENCRYPTION.NOT_AVAILABLE")}
							disabled={importOption.canBeEncrypted}
						>
							<span data-testid="ImportWallet__encryption">
								<Toggle
									data-testid="ImportWallet__encryption-toggle"
									disabled={!importOption.canBeEncrypted}
									checked={isUseEncryptionChecked}
									onChange={handleToggleEncryption}
								/>
							</span>
						</Tooltip>
					</div>

					<span className="mr-12 text-sm text-theme-secondary-500">
						{t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.ENCRYPTION.DESCRIPTION")}
					</span>
				</div>
			</div>
		</section>
	);
};
