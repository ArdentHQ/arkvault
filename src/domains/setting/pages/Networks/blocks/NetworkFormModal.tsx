import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { Networks } from "@payvo/sdk";
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
import { buildNetwork } from "@/utils/network-utils";

const NetworkFormModal: React.VFC<{
	onClose: () => void;
	onCreate: (network: Networks.NetworkManifest) => void;
	customNetworks: Networks.NetworkManifest[];
}> = ({ onClose, onCreate, customNetworks }) => {
	const { network } = useValidation();
	const { t } = useTranslation();

	const form = useForm<UserCustomNetwork>({
		defaultValues: {
			address: "",
			name: "",
		},
		mode: "onChange",
	});

	const { formState, setValue, register } = form;
	const { isDirty, isSubmitting, isValid } = formState;

	const [fetchingError, setFetchingError] = useState(false);
	const [fetchingDetails, setFetchingDetails] = useState(false);

	const isSubmitButtonDisabled = fetchingDetails || isSubmitting || (isDirty ? !isValid : true);

	const handleSubmit = async ({ address, name }: { address: string; name: string }) => {
		const client = new HttpClient(0);
		setFetchingError(false);
		setFetchingDetails(true);

		const baseUrl = getBaseUrl(address);
		let configurationResponse: NodeConfigurationResponse;
		let configurationCryptoResponse: any;

		console.log("Sfdsgadshgkldasghkladsghdaskghjadslkghadsklghadsklghjlads");

		try {
			const response = await client.get(`${baseUrl}/api/node/configuration`);
			const cryptoResponse = await client.get(`${baseUrl}/api/node/configuration/crypto`);

			console.log({ cryptoResponse, response });
			configurationResponse = JSON.parse(response.body()).data as NodeConfigurationResponse;
			configurationCryptoResponse = JSON.parse(cryptoResponse.body()).data;
		} catch {
			console.log(":D");
			setFetchingError(true);
			setFetchingDetails(false);
			return;
		}

		const networkData: UserCustomNetwork = {
			address: `${baseUrl}/api`,
			explorer: configurationResponse.explorer,
			name: name,
			slip44: String(configurationResponse.slip44),
			ticker: configurationResponse.token,
			type: configurationCryptoResponse.network.name === "mainnet" ? "live" : "test",
		};

		const network = buildNetwork(networkData, configurationResponse);

		onCreate(network);
	};

	return (
		<Modal
			data-testid="NetworkFormModal"
			isOpen
			size="lg"
			title={t("SETTINGS.NETWORKS.ADD_NEW_NETWORK.TITLE")}
			description={t("SETTINGS.NETWORKS.ADD_NEW_NETWORK.DESCRIPTION")}
			onClose={onClose}
		>
			<Form context={form} onSubmit={handleSubmit} className="mt-6">
				<div className="space-y-4">
					<FormField name="name">
						<FormLabel label={t("SETTINGS.NETWORKS.FORM.NETWORK_NAME")} />
						<InputDefault
							data-testid="NetworkFormModal--name"
							ref={register(network.name(customNetworks))}
						/>
					</FormField>

					<FormField name="address">
						<FormLabel label={t("SETTINGS.NETWORKS.FORM.SEED_SERVER")} />
						<InputDefault
							data-testid="NetworkFormModal--address"
							placeholder={t("SETTINGS.NETWORKS.FORM.SEED_SERVER_PLACEHOLDER")}
							ref={register(network.address(customNetworks))}
							onChange={(event) => {
								setValue("address", event.target.value.trim(), {
									shouldDirty: true,
									shouldValidate: true,
								});
							}}
						/>
					</FormField>

					{fetchingError && (
						<FormField name="type">
							<Alert data-testid="NetworkFormModal-alert" className="mt-3" variant="danger">
								{t("SETTINGS.NETWORKS.FORM.FETCHING_ERROR")}
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
						disabled={isSubmitButtonDisabled}
						type="submit"
					>
						{t("COMMON.SAVE")}
					</Button>
				</FormButtons>
			</Form>
		</Modal>
	);
};

export default NetworkFormModal;
