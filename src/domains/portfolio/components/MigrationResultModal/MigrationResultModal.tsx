import { Contracts } from "@/app/lib/profiles";
import React, { useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Modal } from "@/app/components/Modal";
import { ProfileData } from "@/app/lib/profiles/profile.enum.contract";
import { useConfiguration, } from "@/app/contexts";
import { Button } from "@/app/components/Button";

export const MigrationResultModal = ({ profile }: { profile: Contracts.IProfile }) => {
	const { t } = useTranslation();
	const [show, setShow] = useState<boolean>(false);

	const { profileIsSyncing } = useConfiguration().getProfileConfiguration(profile.id());

	const migrationResult = profile.data().get(ProfileData.MigrationResult, {}) as Record<string, any[]>;

	const hasMigrationResult = useMemo(
		() => Object.values(migrationResult).some((d) => d.length > 0),
		[migrationResult],
	);

	const { coldAddresses, coldContacts, duplicateAddresses, duplicateContacts } = migrationResult;

	useEffect(() => {
		if (profileIsSyncing) {
			return;
		}

		setShow(hasMigrationResult);
	}, [profile, profileIsSyncing, hasMigrationResult]);

	const handleClose = async () => {
		profile.data().set(ProfileData.MigrationResult, {});
		setShow(false);
	};

	return (
		<Modal title={t("COMMON.MIGRATION_RESULT.TITLE")} isOpen={show} onClose={handleClose} size="4xl">
			<div className="w-full space-y-4 break-words">
				{(coldAddresses?.length > 0 || coldContacts?.length > 0) && (
					<div className="flex flex-col sm:space-y-1">
						<h5 className="mb-1 font-semibold">{t("COMMON.MIGRATION_RESULT.COLD_ADDRESSES_AND_CONTACTS")}</h5>
						<ul className="list-inside list-disc space-y-1">
							{coldAddresses.map((wallet, index) => {
								return (
									<li key={wallet.ADDRESS + index}>
										<Trans i18nKey="COMMON.MIGRATION_RESULT.COLD_ADDRESS" values={{ address: wallet.ADDRESS }} />
									</li>
								);
							})}

							{coldContacts.map((contact, index) => {
								return (
									<li key={index}>
										<Trans
											i18nKey="COMMON.MIGRATION_RESULT.COLD_CONTACT"
											values={{ name: contact.name, address: contact.address }}
										/>
									</li>
								);
							})}
						</ul>
					</div>
				)}

				{(duplicateAddresses?.length > 0 || duplicateContacts?.length > 0) && (
					<div className="flex flex-col sm:space-y-1">
						<h5 className="mb-1 font-semibold">{t("COMMON.MIGRATION_RESULT.DUPLICATE_ADDRESSES_AND_CONTACTS")}</h5>
						<ul className="list-inside list-disc space-y-1">
							{duplicateAddresses.map((wallet, index) => {
								return (
									<li key={wallet.ADDRESS + index}>
										<Trans
											i18nKey="COMMON.MIGRATION_RESULT.DUPLICATE_ADDRESS"
											values={{
												address: wallet.ADDRESS,
												duplicateAddress: wallet.duplicateAddress,
												newAddress: wallet.newAddress,
											}}
										/>
									</li>
								);
							})}

							{duplicateContacts.map((contact, index) => {
								return (
									<li key={index}>
										<Trans
											i18nKey="COMMON.MIGRATION_RESULT.DUPLICATE_CONTACT"
											values={{
												oldName: contact.oldName,
												oldAddress: contact.addresses[0].oldAddress,
												duplicateOldName: contact.duplicateContact.oldName,
												duplicateOldAddress: contact.duplicateContact.oldAddress,
												newAddress: contact.addresses[0].address,
												name: contact.name,
											}}
										/>
									</li>
								);
							})}
						</ul>
					</div>
				)}

				<div className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 border-t -mx-6 px-6 pt-3.5 pb-3.5 sm:pb-0 flex justify-end">
					<Button onClick={handleClose} data-testid="WelcomeModal-next">
						{t("COMMON.CONTINUE")}
					</Button>
				</div>
			</div>
		</Modal>
	);
};
