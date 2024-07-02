import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { Networks } from "@ardenthq/sdk";
import { DefaultTReturn, TOptions } from "i18next";
import { NodeConfigurationResponse } from "@/domains/setting/pages/Networks/Networks.contracts";
import { HttpClient } from "@/app/services/HttpClient";
import { Modal } from "@/app/components/Modal";
import { Form, FormButtons, FormField, FormLabel } from "@/app/components/Form";
import { InputDefault } from "@/app/components/Input";
import { UserCustomNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";
import { Button } from "@/app/components/Button";
import { Alert } from "@/app/components/Alert";
import { useValidation } from "@/app/hooks";
import { getBaseUrl } from "@/utils/peers";
import { buildNetwork, isValidKnownWalletUrlResponse } from "@/utils/network-utils";

const UpdateNetworkFormModal: React.VFC<{
	network: Networks.NetworkManifest;
	onClose: () => void;
	onUpdate: (network: Networks.NetworkManifest) => void;
	customNetworks: Networks.NetworkManifest[];
}> = ({ onClose, onUpdate, customNetworks, network }) => {
	const { network: networkValidation } = useValidation();
	const { t } = useTranslation();

	const getDefaultValues = (): UserCustomNetwork => {
		const explorerHost = network.hosts.find((host) => host.type === "explorer");
		const networkAddress = network.hosts.find((host) => host.type === "full")!;

		return {
			address: networkAddress.host,
			explorer: explorerHost ? explorerHost.host : "",
			knownWallets: network.knownWallets ?? "",
			name: network.name,
			slip44: String(network.constants.slip44),
			ticker: network.currency.ticker,
			type: network.type === "test" ? "test" : "live",
		};
	};

	const form = useForm<UserCustomNetwork>({
		defaultValues: getDefaultValues(),
		mode: "onChange",
	});

	const { formState, setValue, register, setError } = form;
	const { isDirty, isSubmitting, isValid } = formState;

	const [fetchingError, setFetchingError] = useState<string | undefined | DefaultTReturn<TOptions>>(undefined);
	const [fetchingDetails, setFetchingDetails] = useState(false);

	const isSaveButtonDisabled = fetchingDetails || isSubmitting || (isDirty ? !isValid : true);

	const handleSubmit = async (networkData: UserCustomNetwork) => {
		const client = new HttpClient(0);
		setFetchingError(undefined);
		setFetchingDetails(true);

		const baseUrl = getBaseUrl(networkData.address);
		let configurationResponse: NodeConfigurationResponse | undefined;
		let configurationCryptoResponse: any;

		const promises = [client.get(`${baseUrl}/api/node/configuration`)];

		if (networkData.knownWallets) {
			promises.push(client.get(networkData.knownWallets));
		}

		const [seedServerResponse, knownWalletsResponse] = await Promise.allSettled(promises);

		if (seedServerResponse.status === "rejected") {
			setFetchingError(t("SETTINGS.NETWORKS.FORM.FETCHING_ERROR"));
			setFetchingDetails(false);
			return;
		}

		if (knownWalletsResponse !== undefined && !isValidKnownWalletUrlResponse(knownWalletsResponse)) {
			setFetchingDetails(false);
			setError("knownWallets", {
				message: t("SETTINGS.NETWORKS.FORM.INVALID_KNOWN_WALLETS_URL"),
				type: "manual",
			});
			return;
		}

		try {
			configurationResponse = JSON.parse(seedServerResponse.value.body()).data as NodeConfigurationResponse;
			const cryptoResponse = await client.get(`${baseUrl}/api/node/configuration/crypto`);
			configurationCryptoResponse = JSON.parse(cryptoResponse.body()).data;
		} catch {
			//
		}

		if (configurationResponse === undefined || configurationCryptoResponse === undefined) {
			setFetchingError(t("SETTINGS.NETWORKS.FORM.FETCHING_ERROR"));
			setFetchingDetails(false);
			return;
		}

		networkData.address = `${baseUrl}/api`;

		networkData.type = configurationCryptoResponse.network.name === "mainnet" ? "live" : "test";
		networkData.slip44 = configurationCryptoResponse.network.slip44;

		const newNetwork = buildNetwork(networkData, configurationResponse);

		const nethash = network.meta!.nethash;
		const newNetHash = newNetwork.meta!.nethash;

		if (newNetHash !== nethash) {
			setFetchingError(t("SETTINGS.NETWORKS.FORM.NETWORK_HASH_MISMATCH"));
			setFetchingDetails(false);
			return;
		}

		onUpdate(newNetwork);
	};

	return (
		<Modal
			data-testid="UpdateNetworkFormModal"
			isOpen
			size="lg"
			title={t("SETTINGS.NETWORKS.UPDATE_NETWORK.TITLE")}
			description={t("SETTINGS.NETWORKS.UPDATE_NETWORK.DESCRIPTION")}
			onClose={onClose}
		>
			<Form context={form} onSubmit={handleSubmit} className="mt-6">
				<div className="space-y-4">
					<FormField name="name">
						<FormLabel label={t("SETTINGS.NETWORKS.FORM.NETWORK_NAME")} />
						<InputDefault
							data-testid="NetworkFormModal--name"
							ref={register(networkValidation.name(customNetworks, network))}
						/>
					</FormField>

					<FormField name="address">
						<FormLabel label={t("SETTINGS.NETWORKS.FORM.SEED_SERVER")} />
						<InputDefault
							data-testid="NetworkFormModal--address"
							placeholder={t("SETTINGS.NETWORKS.FORM.SEED_SERVER_PLACEHOLDER")}
							ref={register(networkValidation.address(customNetworks, network))}
							onChange={(event) => {
								setValue("address", event.target.value.trim(), {
									shouldDirty: true,
									shouldValidate: true,
								});
							}}
						/>
					</FormField>

					<FormField name="slip44">
						<FormLabel label={t("SETTINGS.NETWORKS.FORM.SLIP")} />
						<InputDefault
							disabled
							data-testid="NetworkFormModal--slip44"
							ref={register(networkValidation.slip44())}
						/>
					</FormField>

					<FormField name="explorer">
						<FormLabel label={t("SETTINGS.NETWORKS.FORM.EXPLORER")} optional />
						<InputDefault
							data-testid="NetworkFormModal--explorer"
							ref={register(networkValidation.explorer())}
						/>
					</FormField>

					<FormField name="ticker">
						<FormLabel label={t("SETTINGS.NETWORKS.FORM.MARKET_TICKER")} optional />
						<InputDefault
							data-testid="NetworkFormModal--ticker"
							ref={register(networkValidation.ticker())}
						/>
					</FormField>

					<FormField name="knownWallets">
						<FormLabel label={t("SETTINGS.NETWORKS.FORM.KNOWN_WALLETS")} optional />
						<InputDefault
							data-testid="NetworkFormModal--knownWallets"
							ref={register(networkValidation.knownWallets())}
						/>
					</FormField>

					{!!fetchingError && (
						<FormField name="type">
							<Alert data-testid="NetworkFormModal-alert" className="mt-3" variant="danger">
								{fetchingError}
							</Alert>
						</FormField>
					)}
				</div>

				<FormButtons>
					<Button
						data-testid="NetworkFormModal--cancel"
						disabled={fetchingDetails}
						onClick={onClose}
						variant="secondary"
					>
						{t("COMMON.CANCEL")}
					</Button>

					<Button
						isLoading={fetchingDetails}
						data-testid="NetworkFormModal--save"
						disabled={isSaveButtonDisabled}
						type="submit"
					>
						{t("COMMON.SAVE")}
					</Button>
				</FormButtons>
			</Form>
		</Modal>
	);
};

export default UpdateNetworkFormModal;
