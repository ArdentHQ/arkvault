import cn from "classnames";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import tw, { styled } from "twin.macro";

import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { useFiles } from "@/app/hooks/use-files";
import { toasts } from "@/app/services";

interface SelectProfileImageProperties {
	className?: string;
	value?: string;
	name?: string;
	showLabel?: boolean;
	onSelect: (raw: string) => void;
}

const UploadButtonWrapper = styled.div`
	${tw`h-full w-full`}

	button {
		${tw`h-full w-full`}
		${tw`focus:ring-0!`}

		&:not(:focus):hover:enabled {
			${tw`bg-theme-secondary-900 dark:bg-theme-secondary-600 opacity-85`};
		}
	}
`;

const ProfileImageStyled = styled.div`
	& {
		${tw`relative inline-flex items-center justify-center rounded-md overflow-hidden cursor-pointer h-full`};
		${tw`focus-within:(ring-2 ring-theme-primary-400)`};
	}

	&:after {
		content: "";
		box-shadow: 0 0 0 25px rgba(0, 0, 0, 0.4);
		${tw`absolute inset-1 rounded-full`};
	}

	&:hover .upload-button-overlay {
		${tw`opacity-100`};
	}
`;

const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "bmp"];

export const SelectProfileImage = ({
	className,
	value,
	name,
	showLabel = true,
	onSelect,
}: SelectProfileImageProperties) => {
	const { t } = useTranslation();
	const { openImage } = useFiles();

	const handleOpenFile = async () => {
		try {
			const image = await openImage({ extensions: ALLOWED_EXTENSIONS });

			onSelect(image?.content);
		} catch (error) {
			if (!error.message.includes("The user aborted a request")) {
				toasts.error(t("COMMON.ERRORS.INVALID_IMAGE"));
			}
		}
	};

	const isSvg = useMemo(() => value?.endsWith("</svg>"), [value]);

	const renderButton = () => {
		if (value) {
			return (
				<div className="relative z-0 h-20 w-20">
					<ProfileImageStyled>
						<img
							data-testid={`SelectProfileImage__avatar-${isSvg ? "identicon" : "image"}`}
							src={isSvg ? `data:image/svg+xml;utf8,${value}` : value}
							className="min-h-full object-cover"
							alt="Avatar"
						/>

						{isSvg && (
							<span className="absolute text-2xl font-semibold text-white">
								{name?.slice(0, 2).toUpperCase()}
							</span>
						)}

						<button
							type="button"
							className="upload-button-overlay absolute z-10 h-full w-full overflow-hidden p-1 opacity-0 transition-opacity duration-200 focus:outline-none"
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

					{!isSvg && (
						<div className="absolute -top-2 -right-2 z-20">
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
					)}
				</div>
			);
		}

		return (
			<div className="h-20 w-20 rounded-md border-2 border-dashed border-theme-secondary-400 p-1 focus-within:border-solid focus-within:border-theme-primary-400 dark:border-theme-secondary-700">
				<div className="h-full overflow-hidden rounded-full">
					<UploadButtonWrapper>
						<Button
							variant="secondary"
							onClick={handleOpenFile}
							data-testid="SelectProfileImage__upload-button"
						>
							<Icon
								name="ArrowUpBracket"
								className="text-theme-primary-600 dark:text-theme-secondary-200"
								size="lg"
							/>
						</Button>
					</UploadButtonWrapper>
				</div>
			</div>
		);
	};

	return (
		<div className={cn("group space-y-2", className)}>
			{showLabel && (
				<span className="cursor-default text-sm font-semibold text-theme-secondary-text transition-colors duration-100 group-hover:text-theme-primary-600">
					{t("SETTINGS.GENERAL.PERSONAL.PROFILE_IMAGE")}
				</span>
			)}

			<div className="flex flex-row">{renderButton()}</div>
		</div>
	);
};
