import { Contracts } from "@/app/lib/profiles";
import React, { useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Modal } from "@/app/components/Modal";
import { ProfileData } from "@/app/lib/profiles/profile.enum.contract";
import { useConfiguration } from "@/app/contexts";

export const MigrationResultModal = ({ profile }: { profile: Contracts.IProfile }) => {
	const { t } = useTranslation();
	const [show, setShow] = useState<boolean>(false);

	const { profileIsSyncing } = useConfiguration().getProfileConfiguration(profile.id());

	const migrationResult = profile.data().get(ProfileData.MigrationResult) as Record<string, any[]>;

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

	return (
		<Modal title={t("COMMON.MIGRATION_RESULT.TITLE")} isOpen={show} onClose={() => setShow(false)} size="4xl">
			<div className="w-full space-y-4">
				{(coldAddresses.length > 0 || coldContacts.length > 0) && (
					<div className="flex flex-col sm:space-y-1">
						<h5 className="mb-1 font-semibold">Cold addresses & contacts</h5>
						<ul className="list-inside list-disc space-y-1">
							{coldAddresses.map((wallet, index) => {
								return (
									<li key={wallet.ADDRESS + index}>
										<Trans i18nKey="COMMON.MIGRATION_RESULT.COLD_ADDRESS" values={{ address: wallet.ADDRESS }} />,
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

				{(duplicateAddresses.length > 0 || duplicateContacts.length > 0) && (
					<div className="flex flex-col sm:space-y-1">
						<h5 className="mb-1 font-semibold">Duplicate addresses & contacts </h5>
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
			</div>
		</Modal>
	);
};
