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
	<div {...props} className="w-full h-full upload-button-wrapper" />
);

const ProfileImageStyled = ({ ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		{...props}
		className="inline-flex overflow-hidden relative justify-center items-center h-full rounded-md cursor-pointer focus-within:ring-2 profile-image focus-within:ring-theme-primary-400"
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
							className="object-cover min-h-full"
							alt="Avatar"
						/>

						<button
							type="button"
							className="overflow-hidden absolute z-10 p-1 w-full h-full opacity-0 transition-opacity duration-200 focus:outline-hidden"
							onClick={handleOpenFile}
							data-testid="SelectProfileImage__upload-button"
						>
							<div className="flex justify-center items-center h-full rounded-full dark:bg-black bg-theme-secondary-900 opacity-85">
								<Icon
									name="ArrowUpBracket"
									className="text-white dark:text-theme-secondary-200"
									size="lg"
								/>
							</div>
						</button>
					</ProfileImageStyled>

					<div className="absolute -top-2 -right-2 z-20">
						<Button
							size="icon"
							variant="danger"
							className="flex justify-center items-center p-0 w-5 h-5"
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
			<div className="p-1.5 rounded-lg border focus-within:border-solid border-theme-secondary-300 h-[92px] w-[92px] dark:border-theme-dark-700 focus-within:border-theme-primary-400">
				<div className="overflow-hidden h-full rounded">
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
