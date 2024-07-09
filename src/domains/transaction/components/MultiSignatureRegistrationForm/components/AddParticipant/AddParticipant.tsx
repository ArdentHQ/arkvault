import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AddParticipantItem } from "@/domains/transaction/components/MultiSignatureRegistrationForm/components/AddParticipant/AddParticipantItem";
import { Button } from "@/app/components/Button";
import { FormField, FormLabel, SubForm } from "@/app/components/Form";
import { useWalletAlias } from "@/app/hooks";
import { SelectRecipient } from "@/domains/profile/components/SelectRecipient";

export interface Participant {
	address: string;
	alias?: string;
	publicKey: string;
}

interface Properties {
	profile: Contracts.IProfile;
	wallet: Contracts.IReadWriteWallet;
	onChange?: (wallets: Participant[]) => void;
	defaultParticipants?: Participant[];
}

const defaultProps = {
	defaultParticipants: [],
};

export const AddParticipant = ({
	profile,
	wallet,
	onChange,
	defaultParticipants = defaultProps.defaultParticipants,
}: Properties) => {
	const { t } = useTranslation();

	const [isValidating, setIsValidating] = useState(false);
	const [participants, setParticipants] = useState<Participant[]>(defaultParticipants);
	const lastValidationReference = useRef<unknown>();

	const { getWalletAlias } = useWalletAlias();

	const form = useForm({ mode: "onSubmit", reValidateMode: "onSubmit" });
	const { register, handleSubmit, setValue, watch } = form;
	const { address, participantAlias } = watch();

	useEffect(() => {
		register("participantAlias");
		register("address", {
			required: true,
			validate: {
				findByAddress,
				findDuplicate,
			},
		});
	}, [register, participants]);

	useEffect(() => {
		if (defaultParticipants.length === 0) {
			const { alias } = getWalletAlias({
				address: wallet.address(),
				network: wallet.network(),
				profile,
			});

			setParticipants([
				{
					address: wallet.address(),
					alias,
					publicKey: wallet.publicKey()!,
				},
			]);
		}
	}, [wallet, defaultParticipants, getWalletAlias, profile]);

	const addParticipant = () => {
		const reference = lastValidationReference.current as Contracts.IReadWriteWallet;
		const participant = {
			address: reference.address(),
			alias: participantAlias,
			publicKey: reference.publicKey()!,
		};

		const newParticipants = [...participants, participant];
		setParticipants(newParticipants);
		onChange?.(newParticipants);

		setTimeout(() => setValue("address", ""));
	};

	const removeParticipant = (index: number) => {
		const remainingParticipants = [...participants];
		remainingParticipants.splice(index, 1);

		setParticipants(remainingParticipants);
		onChange?.(remainingParticipants);
	};

	const findDuplicate = useCallback(
		(address: string) => {
			if (participants.some((item) => item.address === address)) {
				return t("TRANSACTION.MULTISIGNATURE.ERROR.ADDRESS_ALREADY_ADDED");
			}
			return true;
		},
		[participants, t],
	);

	const findByAddress = useCallback(
		async (address: string) => {
			setIsValidating(true);
			lastValidationReference.current = undefined;

			try {
				let participantWallet: unknown = profile
					.wallets()
					.findByAddressWithNetwork(address, wallet.networkId());

				if (!participantWallet) {
					const response = await wallet.client().wallets({
						identifiers: [
							{
								type: "address",
								value: address,
							},
						],
					});

					const remote = response.findByAddress(address);

					if (!remote) {
						return t("TRANSACTION.MULTISIGNATURE.ERROR.ADDRESS_NOT_FOUND");
					}

					participantWallet = remote;
				}

				if (!(participantWallet as Contracts.IReadOnlyWallet).publicKey()) {
					return t("TRANSACTION.MULTISIGNATURE.ERROR.PUBLIC_KEY_NOT_FOUND");
				}

				lastValidationReference.current = participantWallet;
				return true;
			} catch {
				return t("TRANSACTION.MULTISIGNATURE.ERROR.ADDRESS_NOT_FOUND");
			} finally {
				setIsValidating(false);
			}
		},
		[profile, t, wallet],
	);

	return (
		<div>
			<FormProvider {...form}>
				<SubForm>
					<FormField name="address">
						<FormLabel label={t("TRANSACTION.MULTISIGNATURE.PARTICIPANT")} />
						<SelectRecipient
							contactSearchTitle={t("TRANSACTION.MULTISIGNATURE.SELECT_PARTICIPANT_TITLE")}
							contactSearchDescription={t("TRANSACTION.MULTISIGNATURE.SELECT_PARTICIPANT_DESCRIPTION")}
							exceptMultiSignature
							network={wallet.network()}
							address={address}
							profile={profile}
							onChange={(address, alias) => {
								setValue("address", address, { shouldDirty: true });
								setValue("participantAlias", alias.alias);
							}}
						/>
					</FormField>

					<Button
						className="my-4 w-full"
						variant="secondary"
						type="button"
						disabled={isValidating || !address}
						isLoading={isValidating}
						onClick={handleSubmit(() => addParticipant())}
					>
						{t("TRANSACTION.MULTISIGNATURE.ADD_PARTICIPANT")}
					</Button>
				</SubForm>
			</FormProvider>

			{participants.map((participant, index) => (
				<AddParticipantItem
					key={participant.address}
					participant={participant}
					wallet={wallet}
					index={index}
					onDelete={removeParticipant}
				/>
			))}
		</div>
	);
};
