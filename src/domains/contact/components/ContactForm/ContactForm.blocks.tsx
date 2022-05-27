import cn from "classnames";
import { Networks } from "@payvo/sdk";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { AddressListItemProperties, AddressListProperties } from "./ContactForm.contracts";
import { Address } from "@/app/components/Address";
import { Avatar } from "@/app/components/Avatar";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { useEnvironmentContext } from "@/app/contexts";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";
import { useBreakpoint } from "@/app/hooks";

const AddressListItem: React.VFC<AddressListItemProperties> = ({ address, onRemove }) => {
	const { env } = useEnvironmentContext();
	const { isXs } = useBreakpoint();

	const network = useMemo(
		() =>
			env
				.availableNetworks()
				.find(
					(network: Networks.Network) => network.coin() === address.coin && network.id() === address.network,
				),
		[address, env],
	);

	return (
		<div
			data-testid="contact-form__address-list-item"
			className="flex items-center border-b border-dashed border-theme-secondary-300 py-1 last:border-b-0 last:pb-0 dark:border-theme-secondary-800 sm:py-4"
		>
			<div className="mr-2 sm:mr-4">
				{isXs ? (
					<div className="flex items-center space-x-2">
						<NetworkIcon network={network} size="xs" isCompact />
						<Avatar address={address.address} size="xs" />
					</div>
				) : (
					<div className="flex items-center -space-x-1">
						<NetworkIcon network={network} size="lg" />
						<Avatar address={address.address} size="lg" />
					</div>
				)}
			</div>

			<span className="flex-1 truncate font-semibold">
				<Address address={address.address} />
			</span>

			<Button
				data-testid="contact-form__remove-address-btn"
				size="icon"
				className={cn("flex items-center", isXs ? "text-theme-danger-400" : "flex items-center")}
				variant={isXs ? "transparent" : "danger"}
				onClick={() => onRemove()}
			>
				<Icon name="Trash" />
			</Button>
		</div>
	);
};

export const AddressList: React.VFC<AddressListProperties> = ({ addresses, onRemove }) => {
	const { t } = useTranslation();

	return (
		<div className="group">
			<span className="inline-block text-sm font-semibold text-theme-secondary-text transition-colors duration-100 group-hover:text-theme-primary-600">
				{t("CONTACTS.CONTACT_FORM.ADDRESSES")}
			</span>

			<div data-testid="contact-form__address-list">
				{addresses.map((address, index) => (
					<AddressListItem key={index} address={address} onRemove={() => onRemove(address)} />
				))}
			</div>
		</div>
	);
};
