import { Contracts } from "@payvo/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { Amount } from "@/app/components/Amount";
import { Button } from "@/app/components/Button";
import { Header } from "@/app/components/Header";
import { Icon } from "@/app/components/Icon";
import { WalletDetail } from "@/domains/wallet/components/WalletDetail";
import { WalletDetailAddress } from "@/domains/wallet/components/WalletDetailAddress";
import { WalletDetailNetwork } from "@/domains/wallet/components/WalletDetailNetwork";
import { assertWallet } from "@/utils/assertions";
import { useBreakpoint } from "@/app/hooks";

export const SuccessStep = ({
	importedWallet,
	onClickEditAlias,
}: {
	importedWallet: Contracts.IReadWriteWallet | undefined;
	onClickEditAlias: () => void;
}) => {
	assertWallet(importedWallet);

	const { t } = useTranslation();
	const { isXs } = useBreakpoint();

	const network = importedWallet.network();

	return (
		<section data-testid="ImportWallet__success-step">
			<Header
				title={t("WALLETS.PAGE_IMPORT_WALLET.SUCCESS_STEP.TITLE")}
				subtitle={t("WALLETS.PAGE_IMPORT_WALLET.SUCCESS_STEP.SUBTITLE")}
				className="hidden sm:block"
			/>

			<WalletDetailNetwork network={network} className="mt-2" border={false} />

			<WalletDetailAddress address={importedWallet.address()} />

			<WalletDetail label={t("COMMON.BALANCE")}>
				<Amount value={importedWallet.balance()} ticker={network.ticker()} />
			</WalletDetail>

			<WalletDetail
				label={t("WALLETS.WALLET_NAME")}
				borderPosition={isXs ? "top" : "both"}
				extra={
					<Button
						size="xs"
						data-testid="ImportWallet__edit-alias"
						type="button"
						variant="secondary"
						onClick={onClickEditAlias}
					>
						<Icon name="Pencil" />
					</Button>
				}
			>
				{importedWallet.alias()}
			</WalletDetail>
		</section>
	);
};
