import React from "react";
import cn from "classnames";
import { Avatar, EthereumAvatar } from "@/app/components/Avatar";
import { Address } from "@/app/components/Address";

export const MigrationAddress = ({
	address,
	label,
	className,
	isEthereum,
}: {
	isEthereum?: boolean;
	label?: string;
	address: string;
	className?: string;
}) => (
	<div className={cn("p-4", className, "flex flex-col space-y-1")}>
		<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">{label}</span>

		<div className="flex items-center space-x-2">
			{isEthereum ? <EthereumAvatar size="xs" address={address} /> : <Avatar address={address} size="xs" />}
			<Address address={address} />
		</div>
	</div>
);


export const MigrationAddress2 = ({
	address,
	isEthereum,
}: {
	address: string;
	isEthereum?: boolean;
}) => (
	<div className="flex items-center space-x-2">
		{isEthereum ? <EthereumAvatar size="xs" address={address} /> : <Avatar address={address} size="xs" />}
		<Address address={address} />
	</div>
);
