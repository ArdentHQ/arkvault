import cn from "classnames";
import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FormField, FormLabel } from "@/app/components/Form";
import { SelectNetwork } from "@/domains/network/components/SelectNetwork";
import { StepHeader } from "@/app/components/StepHeader";
import { useAvailableNetworks } from "@/domains/wallet/hooks";
import { Divider } from "@/app/components/Divider";

export const NetworkStep = ({ profile, networks }: { profile: Contracts.IProfile; networks: Networks.Network[] }) => {
	const { t } = useTranslation();

	const { setValue, watch } = useFormContext();

	const profileAvailableNetworks = useAvailableNetworks({ profile });

	const availableNetworks = useMemo(
		() =>
			networks.filter((network) =>
				profileAvailableNetworks.some((networkItem) => networkItem.id() === network.id()),
			),
		[profile, networks, profileAvailableNetworks],
	);

	const selectedNetwork: Networks.Network = watch("network");

	const handleSelect = (network?: Networks.Network | null) => {
		setValue("network", network, { shouldDirty: true, shouldValidate: true });
	};

	return (
		<section data-testid="SendTransfer__network-step">
			<StepHeader
				title={t("TRANSACTION.PAGE_TRANSACTION_SEND.NETWORK_STEP.TITLE")}
				subtitle={t("TRANSACTION.PAGE_TRANSACTION_SEND.NETWORK_STEP.SUBTITLE")}
			/>

			<FormField name="network" className={cn("mt-8", { "my-8": networks.length === 2 })}>
				{networks.length > 2 && <FormLabel label={t("COMMON.CRYPTOASSET")} />}

				<SelectNetwork
					profile={profile}
					id="SendTransfer__network-step__select"
					networks={availableNetworks}
					selectedNetwork={selectedNetwork}
					onSelect={handleSelect}
				/>
			</FormField>

			{networks.length === 2 && <Divider />}
		</section>
	);
};
