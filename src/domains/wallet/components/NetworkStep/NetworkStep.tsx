import cn from "classnames";
import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { FormField, FormLabel } from "@/app/components/Form";
import { Header } from "@/app/components/Header";
import { SelectNetwork } from "@/domains/network/components/SelectNetwork";
import { Divider } from "@/app/components/Divider";
import { useNetworks } from "@/app/hooks";
import { ThemeIcon } from "@/app/components/Icon";

interface NetworkStepProperties {
	profile: Contracts.IProfile;
	title: string;
	subtitle: string;
	disabled?: boolean;
	error?: string;
	filter?: (network: Networks.Network) => boolean;
}

export const NetworkStep = ({ title, subtitle, disabled, error, filter, profile }: NetworkStepProperties) => {
	const { t } = useTranslation();

	const { getValues, setValue } = useFormContext();

	const networks = useNetworks({ filter, profile });

	const selectedNetwork: Networks.Network = getValues("network");

	const handleSelect = (network?: Networks.Network | null) => {
		setValue("network", network, { shouldDirty: true, shouldValidate: true });
	};

	return (
		<section data-testid="NetworkStep">
			<Header
				title={title}
				subtitle={subtitle}
				titleIcon={
					<ThemeIcon
						dimensions={[24, 24]}
						lightIcon="SelectNetworkLight"
						darkIcon="SelectNetworkDark"
						greenLightIcon="SelectNetworkLightGreen"
						greenDarkIcon="SelectNetworkDarkGreen"
					/>
				}
				className="hidden sm:block"
			/>

			{!!error && (
				<div className="-mb-2 mt-6">
					<Alert variant="danger">{error}</Alert>
				</div>
			)}

			<FormField name="network" className={cn("mt-4", { "my-4": networks.length === 2 })}>
				{networks.length > 2 && <FormLabel label={t("COMMON.CRYPTOASSET")} />}

				<SelectNetwork
					networks={networks}
					selectedNetwork={selectedNetwork}
					profile={profile}
					isDisabled={disabled}
					onSelect={handleSelect}
				/>
			</FormField>

			{networks.length === 2 && <Divider />}
		</section>
	);
};
