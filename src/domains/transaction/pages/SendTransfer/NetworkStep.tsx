import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FormField, FormLabel } from "@/app/components/Form";
import { SelectNetwork } from "@/domains/network/components/SelectNetwork";
import { StepHeader } from "@/app/components/StepHeader";
import { useAvailableNetworks } from "@/domains/wallet/hooks";

export const NetworkStep = ({ profile, networks }: { profile: Contracts.IProfile; networks: Networks.Network[] }) => {
	const { setValue, watch } = useFormContext();

	const availableNetworks = useAvailableNetworks({
		filter: (network) => networks.some((networkItem) => networkItem.id() === network.id()),
		profile,
	});

	const selectedNetwork: Networks.Network = watch("network");

	const { t } = useTranslation();

	const handleSelect = (network?: Networks.Network | null) => {
		setValue("network", network, { shouldDirty: true, shouldValidate: true });
	};

	return (
		<section data-testid="SendTransfer__network-step" className="space-y-6">
			<StepHeader
				title={t("TRANSACTION.PAGE_TRANSACTION_SEND.NETWORK_STEP.TITLE")}
				subtitle={t("TRANSACTION.PAGE_TRANSACTION_SEND.NETWORK_STEP.SUBTITLE")}
			/>

			<FormField name="network">
				<FormLabel label={t("COMMON.CRYPTOASSET")} />
				<SelectNetwork
					profile={profile}
					id="SendTransfer__network-step__select"
					networks={availableNetworks}
					selectedNetwork={selectedNetwork}
					onSelect={handleSelect}
				/>
			</FormField>
		</section>
	);
};
