import { Services } from "@payvo/sdk";
import { Contracts as ProfileContracts } from "@payvo/sdk-profiles";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FormStep } from "./FormStep";
import { useMessageSigner } from "./hooks/use-message-signer";
import { LedgerConfirmationStep } from "./LedgerConfirmationStep";
import { SignedStep } from "./SignedStep";
import { Button } from "@/app/components/Button";
import { Clipboard } from "@/app/components/Clipboard";
import { Form, FormButtons } from "@/app/components/Form";
import { Icon } from "@/app/components/Icon";
import { Modal } from "@/app/components/Modal";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { useLedgerContext } from "@/app/contexts";
import { toasts } from "@/app/services";
import { isNoDeviceError, isRejectionError } from "@/domains/transaction/utils";
import { LedgerWaitingApp, LedgerWaitingDevice } from "@/domains/wallet/components/Ledger";

interface SignMessageProperties {
	profile: ProfileContracts.IProfile;
	walletId: string;
	isOpen: boolean;
	messageText?: string;
	onClose?: () => void;
	onCancel?: () => void;
	onSign?: (result: Services.SignedMessage) => void;
}

const initialState: Services.SignedMessage = {
	message: "",
	signatory: "",
	signature: "",
};

export const SignMessage = ({
	profile,
	walletId,
	messageText = "",
	isOpen,
	onClose,
	onCancel,
	onSign,
}: SignMessageProperties) => {
	const [activeTab, setActiveTab] = useState("form");

	const [message, setMessage] = useState<string>();
	const [ledgerState, setLedgerState] = useState("awaitingDevice");

	const [signedMessage, setSignedMessage] = useState<Services.SignedMessage>(initialState);

	const { t } = useTranslation();

	const form = useForm({
		defaultValues: {
			message: messageText,
		},
		mode: "onChange",
	});
	const { formState } = form;

	const wallet = useMemo(() => profile.wallets().findById(walletId), [profile, walletId]);

	const { abortConnectionRetry, connect, isConnected, hasDeviceAvailable, error } = useLedgerContext();

	const abortReference = useRef(new AbortController());
	const { sign } = useMessageSigner();

	const isLedger = wallet.isLedger();

	useEffect(
		() => () => {
			abortConnectionRetry();
		},
		[abortConnectionRetry],
	);

	useEffect(() => {
		if (isNoDeviceError(error)) {
			toasts.error(t("WALLETS.MODAL_LEDGER_WALLET.NO_DEVICE_FOUND"));
			onCancel?.();
		}
	}, [error]);

	const handleSubmit = async ({ message, mnemonic, secret, encryptionPassword }: Record<string, any>) => {
		setMessage(message);

		const abortSignal = abortReference.current?.signal;

		if (isLedger) {
			setActiveTab("ledger");
			await connect(profile, wallet.network().coin(), wallet.networkId());
			setLedgerState("awaitingConfirmation");
		}

		try {
			const signedMessageResult = await sign(
				wallet,
				message,
				mnemonic,
				wallet.signingKey().exists() ? await wallet.signingKey().get(encryptionPassword) : undefined,
				secret,
				{
					abortSignal,
				},
			);

			setSignedMessage(signedMessageResult);
			onSign?.(signedMessageResult);

			setActiveTab("signed");
		} catch (error) {
			/* istanbul ignore else */
			if (isRejectionError(error)) {
				toasts.error(t("TRANSACTION.LEDGER_CONFIRMATION.REJECTED"));
			}

			onCancel?.();
		}
	};

	useEffect(() => {
		if (ledgerState === "awaitingDevice" && hasDeviceAvailable && !isConnected) {
			setLedgerState("awaitingApp");
		}
	}, [isConnected, hasDeviceAvailable, ledgerState]);

	const handleClose = () => {
		abortReference.current.abort();
		onClose?.();
	};

	if (activeTab === "ledger") {
		if (ledgerState === "awaitingDevice") {
			return <LedgerWaitingDevice isOpen={true} onClose={handleClose} />;
		}

		if (ledgerState === "awaitingApp") {
			return <LedgerWaitingApp isOpen={true} coinName={wallet.network().coin()} onClose={handleClose} />;
		}
	}

	return (
		<Modal isOpen={isOpen} title="" onClose={handleClose}>
			{/* @ts-ignore */}
			<Form data-testid="SignMessage" context={form} onSubmit={handleSubmit}>
				<Tabs activeId={activeTab}>
					<TabPanel tabId="form">
						<FormStep disableMessageInput={!!messageText} wallet={wallet} />
					</TabPanel>

					<TabPanel tabId="ledger">
						{ledgerState === "awaitingConfirmation" && <LedgerConfirmationStep message={message!} />}
					</TabPanel>

					<TabPanel tabId="signed">
						<SignedStep signedMessage={signedMessage} wallet={wallet} />
					</TabPanel>

					{activeTab === "form" && (
						<FormButtons>
							<Button
								variant="secondary"
								onClick={() => onCancel?.()}
								data-testid="SignMessage__cancel-button"
							>
								{t("COMMON.CANCEL")}
							</Button>

							<Button
								disabled={!formState.isValid}
								type="submit"
								data-testid="SignMessage__submit-button"
							>
								{t("WALLETS.MODAL_SIGN_MESSAGE.SIGN")}
							</Button>
						</FormButtons>
					)}

					{activeTab === "signed" && (
						<FormButtons>
							<Clipboard
								variant="button"
								data={JSON.stringify(signedMessage)}
								data-testid="SignMessage__copy-button"
								wrapperClassName="flex-1 md:flex-none"
								className="w-full"
							>
								<Icon name="Copy" />
								<span className="whitespace-nowrap">
									{t("WALLETS.MODAL_SIGN_MESSAGE.COPY_SIGNATURE")}
								</span>
							</Clipboard>
						</FormButtons>
					)}
				</Tabs>
			</Form>
		</Modal>
	);
};
