import { Networks } from "@payvo/sdk";
import { Contracts } from "@payvo/sdk-profiles";
import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FormField, FormLabel } from "@/app/components/Form";
import { SelectNetwork } from "@/domains/network/components/SelectNetwork";
import { StepHeader } from "@/app/components/StepHeader";
import { useAvailableNetworks } from "@/domains/wallet/hooks";

export const NetworkStep = ({ profile, networks }: { profile: Contracts.IProfile; networks: Networks.Network[] }) => {
	const { setValue, setError, clearErrors, watch } = useFormContext();

	const profileAvailableNetworks = useAvailableNetworks({ profile });

	const availableNetworks = useMemo(
		() =>
			networks.filter((network) =>
				profileAvailableNetworks.some((networkItem) => networkItem.id() === network.id()),
			),
		[profile, networks, profileAvailableNetworks],
	);

	const selectedNetwork: Networks.Network = watch("network");

	const { t } = useTranslation();

	const handleSelect = (network?: Networks.Network | null) => {
		setValue("network", network, { shouldDirty: true, shouldValidate: true });
	};

	const handleInputChange = (value?: string, suggestion?: string) => {
		if (suggestion) {
			clearErrors("network");
		}

		if (!value) {
			return setError("network", {
				message: t("COMMON.VALIDATION.FIELD_REQUIRED", {
					field: t("COMMON.CRYPTOASSET"),
				}),
				type: "manual",
			});
		}

		if (!suggestion) {
			return setError("network", {
				message: t("COMMON.INPUT_NETWORK.VALIDATION.NETWORK_NOT_FOUND"),
				type: "manual",
			});
		}
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
					id="SendTransfer__network-step__select"
					networks={availableNetworks}
					selected={selectedNetwork}
					onInputChange={handleInputChange}
					onSelect={handleSelect}
				/>
			</FormField>
		</section>
	);
};
