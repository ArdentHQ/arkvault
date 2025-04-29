import { Coins, Networks } from "@/app/lib/sdk";
import { FormField, FormLabel } from "@/app/components/Form";
import { ImportOption, OptionsValue } from "@/domains/wallet/hooks/use-import-options";
import { Input, InputAddress, InputPassword } from "@/app/components/Input";
import React, { useEffect, useState } from "react";

import { Alert } from "@/app/components/Alert";
import { Contracts } from "@/app/lib/profiles";
import { TFunction } from "i18next";
import { WalletEncryptionBanner } from "@/domains/wallet/components/WalletEncryptionBanner.tsx/WalletEncryptionBanner";
import { truncate } from "@/app/lib/helpers";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

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
	network,
}: {
	type: OptionsValue;
	coin: Coins.Coin;
	profile: Contracts.IProfile;
	network: Networks.Network;
}) => {
	const { t } = useTranslation();
	const { register } = useFormContext();

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
					title={t("WALLETS.PAGE_IMPORT_WALLET.IMPORT_DETAIL_STEP.MNEMONIC_TIP.TITLE")}
					variant="info"
					collapsible
				>
					<p>{t("WALLETS.PAGE_IMPORT_WALLET.IMPORT_DETAIL_STEP.MNEMONIC_TIP.GUIDELINES_TITLE")}</p>
					<ol className="list-disc pl-5">
						<li>{t("WALLETS.PAGE_IMPORT_WALLET.IMPORT_DETAIL_STEP.MNEMONIC_TIP.GUIDELINES_1")}</li>
						<li>{t("WALLETS.PAGE_IMPORT_WALLET.IMPORT_DETAIL_STEP.MNEMONIC_TIP.GUIDELINES_2")}</li>
						<li>{t("WALLETS.PAGE_IMPORT_WALLET.IMPORT_DETAIL_STEP.MNEMONIC_TIP.GUIDELINES_3")}</li>
						<li>{t("WALLETS.PAGE_IMPORT_WALLET.IMPORT_DETAIL_STEP.MNEMONIC_TIP.GUIDELINES_4")}</li>
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

export const ImportDetailStep = ({
	profile,
	network,
	importOption,
}: {
	profile: Contracts.IProfile;
	network: Networks.Network;
	importOption: ImportOption;
}) => {
	const { watch, setValue, clearErrors } = useFormContext();

	const [coin] = useState(() => profile.coins().get(network.coin(), network.id()));

	const useEncryption = Boolean(watch("useEncryption"));
	const acceptResponsibility = Boolean(watch("acceptResponsibility"));

	useEffect(() => {
		clearErrors(["validation", "confirmEncryptionPassword"]);
	}, []);

	const handleToggleEncryption = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValue("useEncryption", event.target.checked);

		if (!event.target.checked) {
			setValue("acceptResponsibility", false);
			clearErrors("acceptResponsibility");
		}
	};

	const handleToggleResponsibility = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValue("acceptResponsibility", event.target.checked);
	};

	return (
		<section data-testid="ImportWallet__detail-step">
			<div className="mt-4 space-y-4">
				<ImportInputField
					type={importOption.value as OptionsValue}
					coin={coin}
					profile={profile}
					network={network}
				/>

				<WalletEncryptionBanner
					importOption={importOption}
					toggleChecked={useEncryption}
					toggleOnChange={handleToggleEncryption}
					checkboxChecked={acceptResponsibility}
					checkboxOnChange={handleToggleResponsibility}
				/>
			</div>
		</section>
	);
};
