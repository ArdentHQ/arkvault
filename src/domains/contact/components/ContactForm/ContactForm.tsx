import { Coins } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AddressList } from "./ContactForm.blocks";
import { AddressItem, ContactFormProperties, ContactFormState } from "./ContactForm.contracts";
import { Button } from "@/app/components/Button";
import { Form, FormButtons, FormField, FormLabel, SubForm } from "@/app/components/Form";
import { Icon } from "@/app/components/Icon";
import { InputAddress, InputDefault } from "@/app/components/Input";
import { useBreakpoint, useNetworkOptions } from "@/app/hooks";
import { contactForm } from "@/domains/contact/validations/ContactForm";
import { assertNetwork } from "@/utils/assertions";
import { SelectNetworkDropdown } from "@/app/components/SelectNetworkDropdown/SelectNetworkDropdown";
import { enabledNetworksCount } from "@/utils/network-utils";

export const ContactForm: React.VFC<ContactFormProperties> = ({
	profile,
	contact,
	onChange,
	onCancel,
	onDelete,
	onSave,
	errors,
}) => {
	const [addresses, setAddresses] = useState<AddressItem[]>(() =>
		contact
			? contact
					.addresses()
					.values()
					.map((address: Contracts.IContactAddress) => ({
						address: address.address(),
						coin: address.coin(),
						name: contact.name(),
						network: address.network(),
					}))
			: [],
	);

	const { t } = useTranslation();
	const { isXs } = useBreakpoint();

	const { networks } = useNetworkOptions({ profile });
	const onlyHasOneNetwork = enabledNetworksCount(profile) === 1;

	const form = useForm<ContactFormState>({
		defaultValues: {
			address: "",
			name: contact?.name() ?? "",
			network: onlyHasOneNetwork ? networks[0] : undefined,
		},
		mode: "onChange",
	});

	const { formState, register, setError, setValue, watch, trigger } = form;
	const { isValid } = formState;

	const { name, network, address } = watch();

	const contactFormValidation = contactForm(t, profile);

	useEffect(() => {
		register("network");
	}, [register]);

	useEffect(() => {
		for (const [field, message] of Object.entries(errors) as [keyof ContactFormState, string][]) {
			setError(field, { message, type: "manual" });
		}
	}, [errors, setError]);

	const filteredNetworks = useMemo(() => {
		const usedNetworks = new Set(addresses.map((address) => address.network));
		return networks.filter((network) => !usedNetworks.has(network.id()));
	}, [addresses, networks]);

	const handleAddAddress = async () => {
		assertNetwork(network);
		const instance: Coins.Coin = profile.coins().set(network.coin(), network.id());
		await instance.__construct();
		const isValidAddress: boolean = await instance.address().validate(address);

		if (!isValidAddress) {
			return setError("address", { message: t("CONTACTS.VALIDATION.ADDRESS_IS_INVALID"), type: "manual" });
		}

		const duplicateAddress = profile.contacts().findByAddress(address);

		if (duplicateAddress.length > 0) {
			return setError("address", { message: t("CONTACTS.VALIDATION.CONTACT_ADDRESS_EXISTS"), type: "manual" });
		}

		setAddresses([
			...addresses,
			{
				address,
				coin: network.coin(),
				name: address,
				network: network.id(),
			},
		]);

		setValue("network", undefined);
		setValue("address", "");
	};

	const handleRemoveAddress = (item: AddressItem) => {
		setAddresses(
			addresses.filter((current) => !(current.address === item.address && current.network === item.network)),
		);
	};

	return (
		<Form
			data-testid="contact-form"
			context={form}
			className="space-y-0"
			onSubmit={() =>
				onSave({
					addresses,
					name,
				})
			}
		>
			<FormField name="name">
				<FormLabel>{t("CONTACTS.CONTACT_FORM.NAME")}</FormLabel>
				<InputDefault
					data-testid="contact-form__name-input"
					ref={register(contactFormValidation.name(contact?.id()))}
					onChange={() => onChange("name")}
					defaultValue={contact?.name()}
				/>
			</FormField>

			<SubForm className="!p-4 !-mx-4 !mt-4">
				<FormField name="network">
					<FormLabel>{t("CONTACTS.CONTACT_FORM.CRYPTOASSET")}</FormLabel>
					<SelectNetworkDropdown
						profile={profile}
						networks={filteredNetworks}
						placeholder={t("COMMON.INPUT_NETWORK.PLACEHOLDER")}
						selectedNetwork={network}
						onChange={(selectedNetwork) => {
							setValue("network", selectedNetwork, { shouldDirty: true, shouldValidate: true });
							trigger("address");
						}}
					/>
				</FormField>

				<FormField name="address" data-testid="ContactForm__address">
					<FormLabel>{t("CONTACTS.CONTACT_FORM.ADDRESS")}</FormLabel>

					<InputAddress
						profile={profile}
						useDefaultRules={false}
						registerRef={register}
						onChange={() => onChange("address")}
						data-testid="contact-form__address-input"
					/>
				</FormField>

				<div className="mt-4">
					<Button
						data-testid="contact-form__add-address-btn"
						variant="secondary"
						className="w-full"
						disabled={!network || !address}
						onClick={handleAddAddress}
					>
						{t("CONTACTS.CONTACT_FORM.ADD_ADDRESS")}
					</Button>
				</div>

				{addresses.length > 0 && <AddressList addresses={addresses} onRemove={handleRemoveAddress} />}
			</SubForm>


			<div
				className={`flex w-full border-0 border-theme-secondary-300 dark:border-theme-secondary-800 ${
					contact ? "justify-between" : "justify-end"
				}`}
			>
				{contact && !isXs && (
					<Button
						data-testid="contact-form__delete-btn"
						className="mt-0 h-min sm:mt-8"
						onClick={onDelete}
						variant="danger"
					>
						<Icon name="Trash" />
						<span>{t("CONTACTS.CONTACT_FORM.DELETE_CONTACT")}</span>
					</Button>
				)}

				<FormButtons>
					<Button data-testid="contact-form__cancel-btn" variant="secondary" onClick={onCancel}>
						{t("COMMON.CANCEL")}
					</Button>

					<Button
						data-testid="contact-form__save-btn"
						type="submit"
						variant="primary"
						disabled={addresses.length === 0 || !isValid}
					>
						{t("COMMON.SAVE")}
					</Button>
				</FormButtons>
			</div>
		</Form>
	);
};
