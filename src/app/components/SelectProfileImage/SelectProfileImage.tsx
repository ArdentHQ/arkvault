import cn from "classnames";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

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

const UploadButtonWrapper = ({ ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div {...props} className="upload-button-wrapper h-full w-full" />
);

const ProfileImageStyled = ({ ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		{...props}
		className="profile-image relative inline-flex h-full cursor-pointer items-center justify-center overflow-hidden rounded-md after:absolute after:inset-1 after:rounded-full after:shadow-[0_0_0_25px_rgba(0,0,0,0.4)] after:content-[''] focus-within:ring-2 focus-within:ring-theme-primary-400"
	/>
);

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
