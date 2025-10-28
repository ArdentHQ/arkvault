import { Contracts } from "@/app/lib/profiles";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Modal } from "@/app/components/Modal";
import { ProfileData } from "@/app/lib/profiles/profile.enum.contract";
import { useConfiguration } from "@/app/contexts";

export const MigrationResultModal = ({ profile }: { profile: Contracts.IProfile }) => {
	const { t } = useTranslation();
	const [show, setShow] = useState<boolean>(false);

	const profileWallets = profile.wallets().values();

	const { profileIsSyncing } = useConfiguration().getProfileConfiguration(profile.id());

	const migrationResult = profile.data().get(ProfileData.MigrationResult) as Record<string, any[]>;

	const hasMigrationResult = useMemo(
		() => Object.values(migrationResult).some((d) => d.length > 0),
		[migrationResult],
	);
	console.log(migrationResult);

	const { coldAddresses, coldContacts, duplicateAddresses, duplicateContacts } = migrationResult;

	useEffect(() => {
		if (profileIsSyncing) {
			return;
		}

		setShow(hasMigrationResult);
	}, [profile, profileIsSyncing, hasMigrationResult]);

	return (
		<Modal title={"Migration Result"} isOpen={show} onClose={() => setShow(false)}>
			<div className="w-full">
				{coldAddresses.length > 0 && (
					<div className="flex flex-col sm:space-y-3">
						<strong>Cold addresses</strong>
						{coldAddresses.map((wallet) => {
							return <p>{wallet.ADDRESS}</p>;
						})}
					</div>
				)}

				{coldContacts.length > 0 && (
					<div className="flex flex-col sm:space-y-3">
						<strong>Cold contacts</strong>
						{coldContacts.map((contact) => {
							return <p>{contact.address}</p>;
						})}
					</div>
				)}

				{duplicateAddresses.length > 0 && (
					<div className="flex flex-col sm:space-y-3">
						<strong>Duplicate addresses</strong>
						{duplicateAddresses.map((wallet) => {
							return <p>{wallet.ADDRESS} -- {profileWallets.find(pw => pw.publicKey() === wallet['PUBLIC_KEY'])?.address()}</p>;
						})}
					</div>
				)}
			</div>
		</Modal>
	);
};
