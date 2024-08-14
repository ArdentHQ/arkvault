import cn from "classnames";
import React, { useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { ReadableFile, useFiles } from "@/app/hooks/use-files";

interface SelectFileProperties {
	fileFormat: string;
	onSelect: (file: ReadableFile) => void;
}

export const SelectFile = ({ onSelect, fileFormat }: SelectFileProperties) => {
	const { t } = useTranslation();

	const [dropError, setDropError] = useState<React.ReactNode>();
	const [isDragging, setIsDragging] = useState(false);

	const { getExtension, readFileAsText, showOpenDialog } = useFiles();

	const reference = useRef<HTMLDivElement>(null);

	const handleOpenFile = async () => {
		try {
			const raw = await showOpenDialog({ extensions: [fileFormat] });
			const file = await readFileAsText(raw!);

			if (!file) {
				return;
			}

			onSelect(file);
		} catch {
			//
		}
	};

	const handleDragLeave = (event: React.DragEvent) => {
		event.preventDefault();

		/* istanbul ignore else -- @preserve */
		if (reference && reference.current) {
			const bounds = reference.current.getBoundingClientRect();

			/* istanbul ignore next -- @preserve */
			if (
				event.clientX >= Math.trunc(Number(bounds.left) + Number(bounds.width)) ||
				event.clientX <= bounds.left ||
				event.clientY >= Number(bounds.top) + Number(bounds.height) ||
				event.clientY <= bounds.top
			) {
				setIsDragging(false);
			}
		}
	};

	const handleDrop = async (event: React.DragEvent) => {
		event.preventDefault();
		event.stopPropagation();

		setIsDragging(false);

		const files = event.dataTransfer.files;

		if (files.length > 1) {
			return setDropError(
				<Trans
					i18nKey="PROFILE.IMPORT.SELECT_FILE_STEP.ERRORS.TOO_MANY"
					values={{ fileCount: files.length }}
				/>,
			);
		}

		const file: File = files[0];

		if (!fileFormat.includes(getExtension(file.name))) {
			return setDropError(
				<Trans i18nKey="PROFILE.IMPORT.SELECT_FILE_STEP.ERRORS.NOT_SUPPORTED" values={{ fileFormat }} />,
			);
		}

		const raw = await readFileAsText(file);

		// TODO: revisit handling for undefined
		if (!raw) {
			return;
		}

		onSelect(raw);
	};

	const fileFormatIcon: Record<string, string> = {
		".json": "ExtensionJson",
		".wwe": "ExtensionWwe",
	};

	const renderError = () => (
		<>
			<div className="absolute right-4 top-4 z-10 rounded bg-theme-primary-100 transition-all duration-100 ease-linear hover:bg-theme-primary-300 dark:bg-theme-secondary-800 dark:text-theme-secondary-600 dark:hover:bg-theme-secondary-700 dark:hover:text-theme-secondary-400">
				<Button variant="transparent" size="icon" onClick={() => setDropError(undefined)} className="h-8 w-8">
					<Icon name="Cross" size="sm" />
				</Button>
			</div>

			<p className="whitespace-pre-line text-center">{dropError}</p>
		</>
	);

	const renderContent = () => (
		<>
			{fileFormatIcon[fileFormat] && <Icon name={fileFormatIcon[fileFormat]} size="xl" />}

			<div className="mt-4">
				<span className="mr-px hidden font-semibold sm:inline text-lg leading-[21px]">
					{t("PROFILE.IMPORT.SELECT_FILE_STEP.DRAG_AND_DROP")}{" "}
				</span>
				<button
					type="button"
					onClick={handleOpenFile}
					title={t("PROFILE.IMPORT.SELECT_FILE_STEP.UPLOAD_TITLE")}
					data-testid="SelectFile__browse-files"
					className="link ring-focus relative cursor-pointer font-semibold focus:outline-none text-lg leading-[21px]"
					data-ring-focus-margin="-m-1"
				>
					{t("PROFILE.IMPORT.SELECT_FILE_STEP.BROWSE_FILES")}
				</button>
			</div>

			<div className="mt-2 text-sm font-semibold text-theme-secondary-500">
				{t("PROFILE.IMPORT.SELECT_FILE_STEP.SUPPORTED_FORMAT", { fileFormat })}
			</div>
		</>
	);

	return (
		<div
			data-testid="SelectFile"
			className="relative mt-4 h-52 rounded-xl border-2 border-dashed border-theme-secondary-300 p-1.5 dark:border-theme-secondary-800"
		>
			<div
				data-testid="SelectFile__drop-zone"
				ref={reference}
				onDragOver={(event: React.DragEvent) => event.preventDefault()}
				onDragEnter={(event: React.DragEvent) => {
					event.preventDefault();
					setIsDragging(true);
					setDropError(undefined);
				}}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				className={cn(
					"flex h-full flex-col items-center justify-center rounded-lg transition-colors duration-200",
					{
						"bg-theme-primary-100 dark:bg-theme-secondary-800": isDragging || dropError,
						"bg-theme-primary-50 dark:bg-black": !isDragging && !dropError,
					},
				)}
			>
				{dropError ? renderError() : renderContent()}
			</div>
		</div>
	);
};
