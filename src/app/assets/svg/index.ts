import { FC, SVGProps } from "react";

import { ArrowIcons } from "./arrows";
import { ReactComponent as Bell } from "./bell.svg";
import { ReactComponent as Categories } from "./categories.svg";
import { ReactComponent as Calendar } from "./calendar.svg";
import { ReactComponent as ChartActiveDot } from "./chart-active-dot.svg";
import { ReactComponent as Checkmark } from "./check-mark.svg";
import { ReactComponent as CheckmarkSmall } from "./check-mark-small.svg";
import { ReactComponent as CircleCheckMark } from "./circle-check-mark.svg";
import { ReactComponent as CircleCheckMarkPencil } from "./circle-check-mark-pencil.svg";
import { ReactComponent as CircleCross } from "./circle-cross.svg";
import { ReactComponent as CircleExclamationMark } from "./circle-exclamation-mark.svg";
import { ReactComponent as CircleInfo } from "./circle-info.svg";
import { ReactComponent as CircleQuestionMark } from "./circle-question-mark.svg";
import { ReactComponent as Clock } from "./clock.svg";
import { ReactComponent as ClockError } from "./clock-error.svg";
import { ReactComponent as ClockPencil } from "./clock-pencil.svg";
import { ReactComponent as ClockSmall } from "./clock-small.svg";
import { ReactComponent as Code } from "./code.svg";
import { ReactComponent as Copy } from "./copy.svg";
import { ReactComponent as CopyKey } from "./copy-key.svg";
import { ReactComponent as Cross } from "./cross.svg";
import { ReactComponent as Download } from "./download.svg";
import { ReactComponent as CrossSmall } from "./cross-small.svg";
import { Currencies } from "./currencies";
import { ReactComponent as Dash } from "./dash.svg";
import { ReactComponent as EllipsisVertical } from "./ellipsis-vertical.svg";
import { ReactComponent as ExtensionWwe } from "./extension-wwe.svg";
import { ReactComponent as ExtensionJson } from "./extension-json.svg";
import { ReactComponent as ExtensionCsv } from "./extension-csv.svg";
import { ReactComponent as Eye } from "./eye.svg";
import { ReactComponent as EyeSlash } from "./eye-slash.svg";
import { ReactComponent as File } from "./file.svg";
import { ReactComponent as FileLines } from "./file-lines.svg";
import { ReactComponent as FrameKey } from "./frame-key.svg";
import { ReactComponent as FTX } from "./ftx.svg";
import { ReactComponent as Globe } from "./globe.svg";
import { ReactComponent as GlobePointer } from "./globe-pointer.svg";
import { ReactComponent as Grid } from "./grid.svg";
import { ReactComponent as HintSmall } from "./hint-small.svg";
import { ReactComponent as Ledger } from "./ledger.svg";
import { ReactComponent as List } from "./list.svg";
import { ReactComponent as LoaderLogo } from "./loader-logo.svg";
import { ReactComponent as Lock } from "./lock.svg";
import { ReactComponent as MagnifyingGlass } from "./magnifying-glass.svg";
import { ReactComponent as MagnifyingGlassId } from "./magnifying-glass-id.svg";
import { ReactComponent as Menu } from "./menu.svg";
import { ReactComponent as MenuOpen } from "./menu-open.svg";
import { ReactComponent as MoneyCoinSwap } from "./money-coin-swap.svg";
import { ReactComponent as Pencil } from "./pencil.svg";
import { ReactComponent as PencilRuler } from "./pencil-ruler.svg";
import { ReactComponent as Server } from "./server.svg";
import { ReactComponent as ServerMultisign } from "./server-multisign.svg";
import { ReactComponent as ServerPeer } from "./server-peer.svg";
import { ReactComponent as Forbidden } from "./forbidden.svg";
import { ReactComponent as Plus } from "./plus.svg";
import { ReactComponent as QRCode } from "./qr-code.svg";
import { ReactComponent as QuestionMarkSmall } from "./question-mark-small.svg";
import { ReactComponent as ShieldCheckMark } from "./shield-check-mark.svg";
import { ReactComponent as Sliders } from "./sliders.svg";
import { ReactComponent as SlidersVertical } from "./sliders-vertical.svg";
import { ReactComponent as Star } from "./star.svg";
import { ReactComponent as StarFilled } from "./star-filled.svg";
import { ReactComponent as StatusOk } from "./status-ok.svg";
import { ReactComponent as StatusError } from "./status-error.svg";
import { ReactComponent as StatusStandby } from "./status-standby.svg";
import { TransactionIcons } from "./transactions";
import { ReactComponent as Trash } from "./trash.svg";
import { ReactComponent as UnderlineMoon } from "./underline-moon.svg";
import { ReactComponent as UnderlineSun } from "./underline-sun.svg";
import { ReactComponent as User } from "./user.svg";
import { ReactComponent as UserCheckMark } from "./user-check-mark.svg";
import { ReactComponent as Dashboard } from "./dashboard.svg";

export const SvgCollection: Record<string, FC<SVGProps<SVGSVGElement>>> = {
	...ArrowIcons,
	...Currencies,
	...TransactionIcons,
	Bell,
	Calendar,
	Categories,
	ChartActiveDot,
	Checkmark,
	CheckmarkSmall,
	CircleCheckMark,
	CircleCheckMarkPencil,
	CircleCross,
	CircleExclamationMark,
	CircleInfo,
	CircleQuestionMark,
	Clock,
	ClockError,
	ClockPencil,
	ClockSmall,
	Code,
	Copy,
	CopyKey,
	Cross,
	CrossSmall,
	Dash,
	Dashboard,
	Delegate: TransactionIcons.DelegateRegistration,
	Download,
	EllipsisVertical,
	ExtensionCsv,
	ExtensionJson,
	ExtensionWwe,
	Eye,
	EyeSlash,
	FTX,
	File,
	FileLines,
	Forbidden,
	FrameKey,
	Globe,
	GlobePointer,
	Grid,
	HintSmall,
	Ledger,
	List,
	LoaderLogo,
	Lock,
	LockOpen: TransactionIcons.UnlockToken,
	MagnifyingGlass,
	MagnifyingGlassId,
	Menu,
	MenuOpen,
	MoneyCoinSwap,
	Pencil,
	PencilRuler,
	Plus,
	QRCode,
	QuestionMarkSmall,
	Server,
	ServerMultisign,
	ServerPeer,
	ShieldCheckMark,
	Sliders,
	SlidersVertical,
	Star,
	StarFilled,
	StatusError,
	StatusOk,
	StatusStandby,
	Trash,
	UnderlineMoon,
	UnderlineSun,
	User,
	UserCheckMark,
};
