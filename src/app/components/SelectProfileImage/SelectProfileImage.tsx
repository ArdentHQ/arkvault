import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { useFiles } from "@/app/hooks/use-files";
import { toasts } from "@/app/services";

interface SelectProfileImageProperties {
	value?: string;
	onSelect: (raw: string) => void;
}

const UploadButtonWrapper = ({ ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div {...props} className="upload-button-wrapper h-full w-full" />
);

const ProfileImageStyled = ({ ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		{...props}
		className="profile-image relative inline-flex h-full cursor-pointer items-center justify-center overflow-hidden rounded-md focus-within:ring-2 focus-within:ring-theme-primary-400"
	/>
);

const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "bmp"];

export const SelectProfileImage = ({ value, onSelect }: SelectProfileImageProperties) => {
	const { t } = useTranslation();
	const { openImage } = useFiles();

	const handleOpenFile = async () => {
		try {
			const image = await openImage({ extensions: ALLOWED_EXTENSIONS });

			onSelect(image.content);
		} catch (error) {
			if (!error.message.includes("The user aborted a request")) {
				toasts.error(t("COMMON.ERRORS.INVALID_IMAGE"));
			}
		}
	};

	const isSvg = useMemo(() => value?.endsWith("</svg>"), [value]);

	const renderButton = () => {
		if (!isSvg) {
			return (
				<div className="relative z-0 h-[92px] w-[92px]">
					<ProfileImageStyled>
						<img
							data-testid={`SelectProfileImage__avatar-${isSvg ? "identicon" : "image"}`}
							src={value}
							className="min-h-full object-cover"
							alt="Avatar"
						/>

						<button
							type="button"
							className="absolute z-10 h-full w-full overflow-hidden p-1 opacity-0 transition-opacity duration-200 focus:outline-none"
							onClick={handleOpenFile}
							data-testid="SelectProfileImage__upload-button"
						>
							<div className="flex h-full items-center justify-center rounded-full bg-theme-secondary-900 opacity-85 dark:bg-black">
								<Icon
									name="ArrowUpBracket"
									className="text-white dark:text-theme-secondary-200"
									size="lg"
								/>
							</div>
						</button>
					</ProfileImageStyled>

					<div className="absolute -right-2 -top-2 z-20">
						<Button
							size="icon"
							variant="danger"
							className="flex h-5 w-5 items-center justify-center p-0"
							onClick={() => onSelect("")}
							data-testid="SelectProfileImage__remove-button"
						>
							<Icon name="Cross" size="sm" />
						</Button>
					</div>
				</div>
			);
		}

		return (
			<div className="h-[92px] w-[92px] rounded-lg border border-theme-secondary-300 p-1.5 focus-within:border-solid focus-within:border-theme-primary-400 dark:border-theme-dark-700">
				<div className="h-full overflow-hidden rounded-full">
					<UploadButtonWrapper>
						<Button
							variant="secondary"
							onClick={handleOpenFile}
							data-testid="SelectProfileImage__upload-button"
						>
							<Icon name="ArrowUpBracket" size="lg" />
						</Button>
					</UploadButtonWrapper>
				</div>
			</div>
		);
	};

	return <div className="flex flex-row">{renderButton()}</div>;
};
