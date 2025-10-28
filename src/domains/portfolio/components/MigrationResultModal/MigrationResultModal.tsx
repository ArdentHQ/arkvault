import { Contracts } from "@/app/lib/profiles";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

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
		<Modal title={"Migration Result"} isOpen={show} onClose={() => setShow(false)} size="4xl">
			<div className="w-full space-y-4">
				{(coldAddresses.length > 0 || coldContacts.length > 0) && (
					<div className="flex flex-col sm:space-y-1">
						<h5 className="mb-1 font-semibold">Cold addresses & contacts</h5>
						<ul className="list-inside list-disc space-y-1">
							{coldAddresses.map((wallet) => {
								return (
									<li>
										We could not derive the new address of <b>{wallet.ADDRESS}</b> as no outgoing
										transactions were made from this address.
									</li>
								);
							})}

							{coldContacts.map((contact) => {
								return (
									<li>
										We could not derive the new address of contact{" "}
										<b>
											{contact.name} ({contact.address}){" "}
										</b>{" "}
										as no outgoing transactions were made from this address
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
							{duplicateAddresses.map((wallet) => {
								return (
									<li>
										Address <b>{wallet.ADDRESS}</b> and <b>{wallet.duplicateAddress}</b> both
										correspond to the new address <b>{wallet.newAddress}</b> and are therefore
										combined into one
									</li>
								);
							})}

							{duplicateContacts.map((contact) => {
								return (
									<li>
										Contact{" "}
										<b>
											{contact.oldName} ({contact.addresses[0].oldAddress}){" "}
										</b>{" "}
										and{" "}
										<b>
											{contact.duplicateContact.oldName} ({contact.duplicateContact.oldAddress}
											){" "}
										</b>{" "}
										both correspond to the new address <b>{contact.addresses[0].address}</b> and are
										therefore combined into one, using the name <b>{contact.name}</b>{" "}
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
