import { Networks } from "@payvo/sdk";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { LedgerCancelling } from "./LedgerCancelling";
import { Alert } from "@/app/components/Alert";
import { FormField, FormLabel } from "@/app/components/Form";
import { Header } from "@/app/components/Header";
import { Image } from "@/app/components/Image";
import { Spinner } from "@/app/components/Spinner";
import { useLedgerContext } from "@/app/contexts/Ledger";
import { useActiveProfile } from "@/app/hooks";
import { SelectNetwork } from "@/domains/network/components/SelectNetwork";

const ConnectionContent = ({
	error,
	isConnected,
	coinName,
}: {
	isConnected: boolean;
	error: string;
	coinName: string;
}) => {
	const { t } = useTranslation();

	if (isConnected) {
		return <Alert variant="success">{t("WALLETS.MODAL_LEDGER_WALLET.CONNECT_SUCCESS")}</Alert>;
	}

	if (error) {
		return <Alert variant="danger">{error}</Alert>;
	}

	return (
		<div className="space-y-8">
			<Image name="WaitingLedgerDevice" domain="wallet" className="mx-auto max-w-full" />

			<div className="inline-flex w-full items-center justify-center space-x-3">
				<Spinner />
				<span className="animate-pulse font-semibold text-theme-secondary-text">
					{t("WALLETS.MODAL_LEDGER_WALLET.OPEN_APP", { coin: coinName })}
				</span>
			</div>
		</div>
	);
};

export const LedgerConnectionStep = ({
	onConnect,
	onFailed,
	cancelling,
}: {
	cancelling: boolean;
	onConnect?: () => void;
	onFailed?: (error: Error) => void;
}) => {
	const { t } = useTranslation();
	const activeProfile = useActiveProfile();

	const { watch, register, setValue, unregister } = useFormContext();
	const { connect, abortConnectionRetry, error, isConnected } = useLedgerContext();

	const [network] = useState<Networks.Network>(() => watch("network"));

	useEffect(() => {
		register("connected", { required: true });

		return () => {
			unregister("connected");
		};
	}, [register, unregister]);

	useEffect(() => {
		connect(activeProfile, network.coin(), network.id());
	}, [activeProfile, network]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (error) {
			onFailed?.(new Error(error));
		}
	}, [isConnected, error]);

	useEffect(() => {
		if (isConnected) {
			setValue("connected", true, { shouldDirty: true, shouldValidate: true });
			onConnect?.();
		}
	}, [isConnected, onConnect, setValue]);

	useEffect(
		() => () => {
			abortConnectionRetry();
		},
		[abortConnectionRetry],
	);

	if (cancelling) {
		return <LedgerCancelling />;
	}

	return (
		<section data-testid="LedgerConnectionStep" className="space-y-8">
			<Header
				title={t("WALLETS.PAGE_IMPORT_WALLET.LEDGER_CONNECTION_STEP.TITLE")}
				subtitle={t("WALLETS.PAGE_IMPORT_WALLET.LEDGER_CONNECTION_STEP.SUBTITLE")}
			/>

			<FormField name="network">
				<FormLabel label={t("COMMON.CRYPTOASSET")} />
				<SelectNetwork
					id="ImportWallet__network"
					networks={[network, network, network]}
					selectedNetwork={network}
					isDisabled
					profile={activeProfile}
				/>
			</FormField>

			<ConnectionContent error={error} isConnected={isConnected} coinName={network.coin()} />
		</section>
	);
};
