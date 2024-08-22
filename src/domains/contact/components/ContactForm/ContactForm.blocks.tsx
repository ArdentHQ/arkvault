import { Networks } from "@ardenthq/sdk";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { AddressListItemProperties, AddressListProperties } from "./ContactForm.contracts";
import { Address } from "@/app/components/Address";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { useEnvironmentContext } from "@/app/contexts";
import { useBreakpoint } from "@/app/hooks";

const AddressListItem: React.VFC<AddressListItemProperties> = ({ address, onRemove }) => {
	const { t } = useTranslation();

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
			className="flex items-center justify-between border bg-white sm:bg-transparent sm:border-x-0 sm:border-b-0 sm:border-t sm:border-dashed border-theme-secondary-300 last:pb-0 mt-2 first:mt-0 sm:mt-0 dark:border-theme-secondary-800 sm:py-3"
		>
			<div className="w-full min-w-0">
				<div className="flex items-center justify-between bg-theme-secondary-100 sm:bg-transparent px-4 py-3 sm:p-0">
					<div className="font-semibold text-theme-secondary-700 sm:mb-2 text-sm leading-[17px]">{network?.coin()}</div>
					<Button
						data-testid="contact-form__remove-address-btn-sm"
						size="icon"
						className="sm:!hidden !p-0 text-theme-secondary-700"
						variant="transparent"
						onClick={() => onRemove()}
					>
						<Icon name="Trash" size="lg" />
					</Button>
				</div>
				<div className="sm:p-0 px-4 pt-3 pb-4">
					<div className="sm:hidden font-semibold text-theme-secondary-700 mb-2 text-sm leading-[17px]">
						{t("COMMON.ADDRESS")}
					</div>
					<span className="flex-1 truncate font-semibold">
						<Address address={address.address} addressClass="text-sm leading-[17px] sm:text-base sm:leading-[20px]"/>
					</span>
				</div>

			</div>

			<Button
				data-testid="contact-form__remove-address-btn"
				size="icon"
				className="!p-3.5 bg-theme-danger-100 !hidden sm:!flex items-center"
				variant={isXs ? "transparent" : "danger"}
				onClick={() => onRemove()}
			>
				<Icon name="Trash" />
			</Button>
		</div>
	);
};

export const AddressList: React.VFC<AddressListProperties> = ({ addresses, onRemove }) => {
	return (
		<div className="group">
			<div data-testid="contact-form__address-list">
				{addresses.map((address, index) => (
					<AddressListItem key={index} address={address} onRemove={() => onRemove(address)} />
				))}
			</div>
		</div>
	);
};
