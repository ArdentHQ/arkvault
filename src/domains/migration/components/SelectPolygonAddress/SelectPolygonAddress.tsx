import React, { useMemo } from "react";
import { Input } from "@/app/components/Input";
import { Avatar } from "@/app/components/Avatar";
import { Circle } from "@/app/components/Circle";
import { Address } from "@/app/components/Address";

const AddressAvatar = ({ address }: any) => {
	if (!address) {
		return (
			<Circle
				className="border-theme-secondary-200 bg-theme-secondary-200 dark:border-theme-secondary-700 dark:bg-theme-secondary-700"
				size="sm"
				noShadow
			/>
		);
	}

	return <Avatar address={address} size="sm" noShadow />;
};

interface SelectPolygonAddressroperties {
	placeholder?: string;
	value?: string;
	disabled?: boolean;
	onChange?: (event: React.FormEvent<HTMLInputElement>) => void;
}

export const SelectPolygonAddress = ({ placeholder, disabled, value, onChange }: SelectPolygonAddressroperties) => {
	const hideInputValue = useMemo(() => !!value, [value]);

	return (
		<button
			data-testid="SelectPolygonAddress"
			className="relative w-full rounded focus:outline-none focus:ring-2 focus:ring-theme-primary-400 disabled:cursor-default"
			type="button"
			disabled={disabled}
		>
			<span className="absolute inset-y-0 right-4 left-14 flex items-center border border-transparent">
				<Address address={value} />
			</span>

			<Input
				data-testid="SelectPolygonAddress__input"
				onChange={onChange}
				value={value}
				hideInputValue={hideInputValue}
				readOnly
				placeholder={placeholder}
				disabled={disabled}
				addons={{
					start: {
						content: <AddressAvatar address={value} />,
					},
				}}
			/>
		</button>
	);
};
