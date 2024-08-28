import { Networks } from "@ardenthq/sdk";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { AddressListItemProperties, AddressListProperties } from "./ContactForm.contracts";
import { Address } from "@/app/components/Address";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { useEnvironmentContext } from "@/app/contexts";
import { networkDisplayName } from "@/utils/network-utils";

const AddressListItem: React.VFC<AddressListItemProperties> = ({ address, onRemove }) => {
	const { t } = useTranslation();

	const { env } = useEnvironmentContext();

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
			className="mt-2 flex items-center justify-between overflow-hidden rounded border border-theme-secondary-300 bg-white first:mt-0 last:pb-0 dark:border-theme-secondary-800 dark:bg-black sm:mt-0 sm:rounded-none sm:border-x-0 sm:border-b-0 sm:border-t sm:border-dashed sm:bg-transparent sm:py-3 dark:sm:bg-transparent"
		>
			<div className="w-full min-w-0">
				<div className="flex items-center justify-between bg-theme-secondary-100 px-4 py-3 dark:bg-theme-secondary-900 sm:bg-transparent sm:p-0 dark:sm:bg-transparent">
					<div className="text-sm font-semibold leading-[17px] text-theme-secondary-700 dark:text-theme-secondary-500 sm:mb-2">
						{networkDisplayName(network)}
					</div>
					<Button
						data-testid="contact-form__remove-address-btn-xs"
						size="icon"
						sizeClassName="p-0"
						className="text-theme-secondary-700 dark:text-theme-secondary-500 sm:!hidden"
						variant="transparent"
						onClick={() => onRemove()}
					>
						<Icon name="Trash" size="lg" />
					</Button>
				</div>
				<div className="px-4 pb-4 pt-3 sm:p-0">
					<div className="mb-2 text-sm font-semibold leading-[17px] text-theme-secondary-700 dark:text-theme-secondary-500 sm:hidden">
						{t("COMMON.ADDRESS")}
					</div>
					<span className="flex-1 truncate font-semibold">
						<Address
							address={address.address}
							addressClass="text-sm leading-[17px] sm:text-base sm:leading-[20px]"
						/>
					</span>
				</div>
			</div>

			<Button
				data-testid="contact-form__remove-address-btn"
				size="icon"
				className="!hidden items-center !p-3.5 sm:!flex"
				variant="danger"
				onClick={() => onRemove()}
			>
				<Icon name="Trash" />
			</Button>
		</div>
	);
};

export const AddressList: React.VFC<AddressListProperties> = ({ addresses, onRemove }) => (
	<div className="group">
		<div data-testid="contact-form__address-list">
			{addresses.map((address, index) => (
				<AddressListItem key={index} address={address} onRemove={() => onRemove(address)} />
			))}
		</div>
	</div>
);
