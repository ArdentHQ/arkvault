import { Contracts } from "@payvo/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { WalletDetail } from "@/domains/wallet/components/WalletDetail";
import { Address } from "@/app/components/Address";
import { Avatar } from "@/app/components/Avatar";

export const WalletDetailAddress = ({ wallet }: { wallet: Contracts.IReadWriteWallet }) => {
	const { t } = useTranslation();

	return (
		<WalletDetail
			label={t("COMMON.ADDRESS")}
			extra={
				<>
					<div className="flex items-center sm:hidden">
						<Avatar size="xs" address={wallet.address()} />
					</div>
					<div className="hidden sm:flex sm:items-center">
						<Avatar size="lg" address={wallet.address()} />
					</div>
				</>
			}
		>
			<Address address={wallet.address()} />
		</WalletDetail>
	);
};
