import React from "react";
import { useTranslation } from "react-i18next";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { DeleteResource } from "@/app/components/DeleteResource";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Address } from "@/app/components/Address";
import { Divider } from "@/app/components/Divider";
import { Link } from "@/app/components/Link";
import { TokenNameInitials } from "@/domains/portfolio/components/Tokens/TokensSummary";
import { Amount } from "@/app/components/Amount";

interface Properties {
	walletToken: WalletToken;
	onClose: () => void;
	onDelete: (walletToken: WalletToken) => void;
}

export const DeleteTokenConfirmationModal = ({ walletToken, onClose, onDelete }: Properties) => {
	const { t } = useTranslation();

	return (
		<div className="no-my">
			<DeleteResource
				isOpen
				title={t("COMMON.CONFIRM_TOKEN_DELETE.TITLE")}
				description={t("COMMON.CONFIRM_TOKEN_DELETE.DESCRIPTION")}
				onClose={onClose}
				modalImageClass="mt-0 mb-6"
				onCancel={onClose}
				onDelete={onDelete}
			>
				<DetailWrapper className="mt-4 rounded-xl">
					<div className="space-y-3 leading-5">
						<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
							<DetailTitle className="w-auto sm:min-w-24 sm:pr-6">{t("COMMON.TOKEN")}</DetailTitle>

							<div className="flex items-center space-x-2">
								<TokenNameInitials tokenName={walletToken.token().name()} />
								<div className="font-semibold">{walletToken.token().name()}</div>
							</div>
						</div>

						<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
							<DetailTitle className="w-auto sm:min-w-24 sm:pr-6">{t("COMMON.SYMBOL")}</DetailTitle>

							<div className="font-semibold">{walletToken.token().symbol()}</div>
						</div>

						<div className="flex justify-between space-x-2 sm:justify-start sm:space-x-0 md:items-center">
							<DetailTitle className="w-auto pt-1 sm:min-w-24 sm:pr-6 md:pt-0">
								{t("COMMON.CONTRACT")}
							</DetailTitle>

							<div className="flex flex-1 flex-col justify-end gap-2 sm:w-full sm:justify-start md:flex-row md:items-center">
								<Address
									truncateOnTable
									address={walletToken.token().address()}
									showCopyButton
									walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
									wrapperClass="justify-end sm:justify-start"
									addressClass="text-sm leading-[17px] sm:leading-5 sm:text-base w-full w-3/4"
								/>

								<div className="hidden md:block">
									<Divider type="vertical" />
								</div>

								<Link
									isExternal
									to={walletToken.contractExplorerLink()}
									className="flex items-center justify-end whitespace-nowrap"
								>
									{t("COMMON.EXPLORER")}
								</Link>
							</div>
						</div>

						<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
							<DetailTitle className="w-auto sm:min-w-24 sm:pr-6">{t("COMMON.BALANCE")}</DetailTitle>

							<Amount
								ticker={walletToken.token().symbol()}
								value={walletToken.balance().toNumber()}
								className="font-semibold"
							/>
						</div>
					</div>
				</DetailWrapper>
			</DeleteResource>
		</div>
	);
};
