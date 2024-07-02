import { fileOpen, fileSave } from "browser-fs-access";

interface BaseDialogOptions {
	extensions?: string[];
	description?: string;
}

type OpenFileDialogOptions = {
	mimeTypes?: string[];
} & BaseDialogOptions;

type SaveFileDialogOptions = {
	fileName?: string;
} & BaseDialogOptions;

interface ReadableFile {
	content: string;
	extension: string;
	name: string;
}

interface ValidateOptions {
	extensions?: string[];
}

const isLegacy = () => !("showSaveFilePicker" in window);

const getExtension = (fileName?: string) => fileName?.split(".").pop() || "";

const waitFileRead = (file: File, resolve: (file?: ReadableFile) => void) => {
	const reader = new FileReader();

	reader.addEventListener("load", (event) => {
		if (!event?.target?.result) {
			return resolve(undefined);
		}

		resolve({
			content: event.target.result as string,
			extension: getExtension(file.name),
			name: file?.name,
		});
	});

	return reader;
};

const readFileAsDataUri = async (file: File): Promise<ReadableFile | undefined> =>
	new Promise((resolve) => waitFileRead(file, resolve).readAsDataURL(file));

const readFileAsText = async (file: File): Promise<ReadableFile | undefined> =>
	new Promise((resolve) => waitFileRead(file, resolve).readAsText(file));

const sanitizeExtensions = (extensions?: string[]) => {
	if (extensions) {
		const sanitized: string[] = [];

		for (const extension of extensions) {
			sanitized.push(extension.startsWith(".") ? extension : `.${extension}`);
		}

		return sanitized;
	}
};

const showOpenDialog = async (options: OpenFileDialogOptions): Promise<File | undefined> => {
	if (options.extensions) {
		options.extensions = sanitizeExtensions(options.extensions);
	}

	return fileOpen(options);
};

const showSaveDialog = async (contents: string, options: SaveFileDialogOptions): Promise<string | undefined> => {
	if (options.fileName && !options.extensions) {
		options.extensions = [getExtension(options.fileName)];
	}

	options.extensions = sanitizeExtensions(options.extensions);

	const result = await fileSave(new Blob([contents], { type: "data/text" }), options);

	return result?.name;
};

const showImageSaveDialog = async (contents: string, options: SaveFileDialogOptions): Promise<string | undefined> => {
	if (options.fileName && !options.extensions) {
		options.extensions = [getExtension(options.fileName)];
	}

	options.extensions = sanitizeExtensions(options.extensions);

	const file = await fetch(contents);

	const result = await fileSave(await file.blob(), options);

	return result?.name;
};

const isValidImage = async (file: ReadableFile, options?: ValidateOptions): Promise<boolean> => {
	if (!file.extension || (options?.extensions && !options?.extensions?.includes(file.extension))) {
		return false;
	}

	if (!file.content.startsWith("data:image")) {
		return false;
	}

	const image = new Image();
	image.src = file.content;

	try {
		await image.decode();
	} catch {
		return false;
	}

	return true;
};

const openImage = async (options?: ValidateOptions): Promise<ReadableFile> => {
	const raw = await showOpenDialog({ extensions: options?.extensions });
	const file = await readFileAsDataUri(raw!);

	if (!file) {
		throw new Error("Empty");
	}

	const isValid = await isValidImage(file, options);

	if (!isValid) {
		throw new Error("Invalid image");
	}

	return file;
};

interface UseFilesOutput {
	getExtension: (fileName?: string) => string;
	isLegacy: () => boolean;
	readFileAsDataUri: (file: File) => Promise<ReadableFile | undefined>;
	readFileAsText: (file: File) => Promise<ReadableFile | undefined>;
	showOpenDialog: (options: OpenFileDialogOptions) => Promise<File | undefined>;
	showSaveDialog: (contents: string, options: SaveFileDialogOptions) => Promise<string | undefined>;
	showImageSaveDialog: (contents: string, options: SaveFileDialogOptions) => Promise<string | undefined>;
	openImage: (options?: ValidateOptions) => Promise<ReadableFile>;
}

const useFiles = (): UseFilesOutput => ({
	getExtension,
	isLegacy,
	openImage,
	readFileAsDataUri,
	readFileAsText,
	showImageSaveDialog,
	showOpenDialog,
	showSaveDialog,
});

export { isValidImage, useFiles };

export type { ReadableFile };
