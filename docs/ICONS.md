# Iconos

## Por qué existe este documento

`@piensa-it/ui-library` declara `lucide-react@^1.35.0` como dependencia directa
(`package.json`) y re-exporta un catálogo curado de 208 iconos desde
`src/icons.ts`, disponible en el barrel público (`src/index.ts`). Las apps
consumidoras (MiDivisa, Corelink) declaran además su propia dependencia de
`lucide-react@^0.462.0`. Como los rangos no son compatibles, npm instala **dos
copias de lucide** en el `node_modules` del consumidor: la de la app y la
anidada bajo la librería. Eso duplica peso en el bundle y abre la puerta a que
el mismo icono se vea distinto según de qué copia venga.

La decisión es: **el set de la librería es el oficial**. Las apps quitan su
dependencia directa de `lucide-react` e importan los iconos desde
`@piensa-it/ui-library`. No hay que instalar `lucide-react` como peer: la
librería la trae consigo y expone los iconos ya nombrados.

La migración son tres pasos:

```bash
npm uninstall lucide-react
```

Luego cambiar los imports: en vez del nombre de lucide, se usa el nombre del
catálogo (todos llevan sufijo `Icon`).

```diff
- import { Building2, Trash2, TriangleAlert } from "lucide-react";
+ import { CompanyIcon, TrashIcon, WarningIcon } from "@piensa-it/ui-library";
```

Las props no cambian: siguen siendo componentes de lucide, aceptan `size`,
`className`, `strokeWidth`, `absoluteStrokeWidth` y cualquier atributo SVG
válido. Solo cambia el nombre y el origen del import.

## Tabla de equivalencias

Los 208 iconos del catálogo, ordenados alfabéticamente por su nombre en
lucide-react. Generada leyendo `src/icons.ts`.

Los marcados con † usan un nombre que en lucide 1.35.0 es un **alias** de otro
icono canónico; ver la sección "Cambios de nombre" más abajo. Funcionan igual,
pero conviene saberlo si se comparan glifos.

| Nombre en lucide-react | Export de la librería | Import nuevo |
| --- | --- | --- |
| `Activity` | `ActivityIcon` | `import { ActivityIcon } from "@piensa-it/ui-library";` |
| `AlertCircle` † | `AlertCircleIcon` | `import { AlertCircleIcon } from "@piensa-it/ui-library";` |
| `Archive` | `ArchiveIcon` | `import { ArchiveIcon } from "@piensa-it/ui-library";` |
| `ArrowDown` | `ArrowDownIcon` | `import { ArrowDownIcon } from "@piensa-it/ui-library";` |
| `ArrowDownToLine` | `ImportIcon` | `import { ImportIcon } from "@piensa-it/ui-library";` |
| `ArrowLeft` | `ArrowLeftIcon` | `import { ArrowLeftIcon } from "@piensa-it/ui-library";` |
| `ArrowRight` | `ArrowRightIcon` | `import { ArrowRightIcon } from "@piensa-it/ui-library";` |
| `ArrowUp` | `ArrowUpIcon` | `import { ArrowUpIcon } from "@piensa-it/ui-library";` |
| `ArrowUpFromLine` | `ExportIcon` | `import { ExportIcon } from "@piensa-it/ui-library";` |
| `AtSign` | `AtSignIcon` | `import { AtSignIcon } from "@piensa-it/ui-library";` |
| `Award` | `AwardIcon` | `import { AwardIcon } from "@piensa-it/ui-library";` |
| `BadgeCheck` | `VerifiedIcon` | `import { VerifiedIcon } from "@piensa-it/ui-library";` |
| `Banknote` | `BanknoteIcon` | `import { BanknoteIcon } from "@piensa-it/ui-library";` |
| `BarChart3` † | `BarChartIcon` | `import { BarChartIcon } from "@piensa-it/ui-library";` |
| `Bell` | `BellIcon` | `import { BellIcon } from "@piensa-it/ui-library";` |
| `Bookmark` | `BookmarkIcon` | `import { BookmarkIcon } from "@piensa-it/ui-library";` |
| `BookOpen` | `BookIcon` | `import { BookIcon } from "@piensa-it/ui-library";` |
| `Bot` | `BotIcon` | `import { BotIcon } from "@piensa-it/ui-library";` |
| `Box` | `BoxIcon` | `import { BoxIcon } from "@piensa-it/ui-library";` |
| `Briefcase` | `BriefcaseIcon` | `import { BriefcaseIcon } from "@piensa-it/ui-library";` |
| `Building2` | `CompanyIcon` | `import { CompanyIcon } from "@piensa-it/ui-library";` |
| `Calculator` | `CalculatorIcon` | `import { CalculatorIcon } from "@piensa-it/ui-library";` |
| `Calendar` | `CalendarIcon` | `import { CalendarIcon } from "@piensa-it/ui-library";` |
| `Camera` | `CameraIcon` | `import { CameraIcon } from "@piensa-it/ui-library";` |
| `ChartNoAxesCombined` | `AnalyticsIcon` | `import { AnalyticsIcon } from "@piensa-it/ui-library";` |
| `Check` | `CheckIcon` | `import { CheckIcon } from "@piensa-it/ui-library";` |
| `CheckCheck` | `CheckAllIcon` | `import { CheckAllIcon } from "@piensa-it/ui-library";` |
| `ChevronDown` | `ChevronDownIcon` | `import { ChevronDownIcon } from "@piensa-it/ui-library";` |
| `ChevronLeft` | `ChevronLeftIcon` | `import { ChevronLeftIcon } from "@piensa-it/ui-library";` |
| `ChevronRight` | `ChevronRightIcon` | `import { ChevronRightIcon } from "@piensa-it/ui-library";` |
| `ChevronUp` | `ChevronUpIcon` | `import { ChevronUpIcon } from "@piensa-it/ui-library";` |
| `CircleCheck` | `SuccessIcon` | `import { SuccessIcon } from "@piensa-it/ui-library";` |
| `CircleDollarSign` | `CurrencyIcon` | `import { CurrencyIcon } from "@piensa-it/ui-library";` |
| `CircleEllipsis` | `PendingIcon` | `import { PendingIcon } from "@piensa-it/ui-library";` |
| `CircleHelp` † | `HelpIcon` | `import { HelpIcon } from "@piensa-it/ui-library";` |
| `CircleMinus` | `RemoveCircleIcon` | `import { RemoveCircleIcon } from "@piensa-it/ui-library";` |
| `CirclePlus` | `AddCircleIcon` | `import { AddCircleIcon } from "@piensa-it/ui-library";` |
| `CircleUserRound` | `UserIcon` | `import { UserIcon } from "@piensa-it/ui-library";` |
| `CircleX` | `ErrorIcon` | `import { ErrorIcon } from "@piensa-it/ui-library";` |
| `Clipboard` | `ClipboardIcon` | `import { ClipboardIcon } from "@piensa-it/ui-library";` |
| `Clock` | `ClockIcon` | `import { ClockIcon } from "@piensa-it/ui-library";` |
| `Cloud` | `CloudIcon` | `import { CloudIcon } from "@piensa-it/ui-library";` |
| `CloudDownload` | `CloudDownloadIcon` | `import { CloudDownloadIcon } from "@piensa-it/ui-library";` |
| `CloudUpload` | `CloudUploadIcon` | `import { CloudUploadIcon } from "@piensa-it/ui-library";` |
| `Code2` † | `CodeIcon` | `import { CodeIcon } from "@piensa-it/ui-library";` |
| `Columns3` | `ColumnsIcon` | `import { ColumnsIcon } from "@piensa-it/ui-library";` |
| `Contact` | `ContactIcon` | `import { ContactIcon } from "@piensa-it/ui-library";` |
| `Copy` | `CopyIcon` | `import { CopyIcon } from "@piensa-it/ui-library";` |
| `CreditCard` | `CreditCardIcon` | `import { CreditCardIcon } from "@piensa-it/ui-library";` |
| `Database` | `DatabaseIcon` | `import { DatabaseIcon } from "@piensa-it/ui-library";` |
| `Download` | `DownloadIcon` | `import { DownloadIcon } from "@piensa-it/ui-library";` |
| `Edit3` † | `EditIcon` | `import { EditIcon } from "@piensa-it/ui-library";` |
| `Ellipsis` | `MoreIcon` | `import { MoreIcon } from "@piensa-it/ui-library";` |
| `ExternalLink` | `ExternalLinkIcon` | `import { ExternalLinkIcon } from "@piensa-it/ui-library";` |
| `Eye` | `ViewIcon` | `import { ViewIcon } from "@piensa-it/ui-library";` |
| `EyeOff` | `HideIcon` | `import { HideIcon } from "@piensa-it/ui-library";` |
| `File` | `FileIcon` | `import { FileIcon } from "@piensa-it/ui-library";` |
| `FileArchive` | `ArchiveFileIcon` | `import { ArchiveFileIcon } from "@piensa-it/ui-library";` |
| `FileCheck` | `ApprovedFileIcon` | `import { ApprovedFileIcon } from "@piensa-it/ui-library";` |
| `FileDown` | `DownloadFileIcon` | `import { DownloadFileIcon } from "@piensa-it/ui-library";` |
| `FileImage` | `ImageFileIcon` | `import { ImageFileIcon } from "@piensa-it/ui-library";` |
| `FilePlus` | `AddFileIcon` | `import { AddFileIcon } from "@piensa-it/ui-library";` |
| `FileSpreadsheet` | `SpreadsheetIcon` | `import { SpreadsheetIcon } from "@piensa-it/ui-library";` |
| `FileText` | `DocumentIcon` | `import { DocumentIcon } from "@piensa-it/ui-library";` |
| `FileUp` | `UploadFileIcon` | `import { UploadFileIcon } from "@piensa-it/ui-library";` |
| `Filter` † | `FilterIcon` | `import { FilterIcon } from "@piensa-it/ui-library";` |
| `Folder` | `FolderIcon` | `import { FolderIcon } from "@piensa-it/ui-library";` |
| `Gauge` | `GaugeIcon` | `import { GaugeIcon } from "@piensa-it/ui-library";` |
| `GitBranch` | `BranchIcon` | `import { BranchIcon } from "@piensa-it/ui-library";` |
| `Globe2` † | `GlobeIcon` | `import { GlobeIcon } from "@piensa-it/ui-library";` |
| `GripVertical` | `DragIcon` | `import { DragIcon } from "@piensa-it/ui-library";` |
| `Hash` | `HashIcon` | `import { HashIcon } from "@piensa-it/ui-library";` |
| `Headphones` | `HeadphonesIcon` | `import { HeadphonesIcon } from "@piensa-it/ui-library";` |
| `Heart` | `HeartIcon` | `import { HeartIcon } from "@piensa-it/ui-library";` |
| `History` † | `HistoryIcon` | `import { HistoryIcon } from "@piensa-it/ui-library";` |
| `Home` † | `HomeIcon` | `import { HomeIcon } from "@piensa-it/ui-library";` |
| `Image` | `ImageIcon` | `import { ImageIcon } from "@piensa-it/ui-library";` |
| `Inbox` | `InboxIcon` | `import { InboxIcon } from "@piensa-it/ui-library";` |
| `Info` | `InfoIcon` | `import { InfoIcon } from "@piensa-it/ui-library";` |
| `Key` | `KeyIcon` | `import { KeyIcon } from "@piensa-it/ui-library";` |
| `Landmark` | `BankIcon` | `import { BankIcon } from "@piensa-it/ui-library";` |
| `Languages` | `LanguageIcon` | `import { LanguageIcon } from "@piensa-it/ui-library";` |
| `LayoutDashboard` | `DashboardIcon` | `import { DashboardIcon } from "@piensa-it/ui-library";` |
| `LifeBuoy` | `SupportIcon` | `import { SupportIcon } from "@piensa-it/ui-library";` |
| `Link` | `LinkIcon` | `import { LinkIcon } from "@piensa-it/ui-library";` |
| `List` | `ListIcon` | `import { ListIcon } from "@piensa-it/ui-library";` |
| `ListChecks` | `TasksIcon` | `import { TasksIcon } from "@piensa-it/ui-library";` |
| `Lock` | `LockIcon` | `import { LockIcon } from "@piensa-it/ui-library";` |
| `LogIn` | `LoginIcon` | `import { LoginIcon } from "@piensa-it/ui-library";` |
| `LogOut` | `LogoutIcon` | `import { LogoutIcon } from "@piensa-it/ui-library";` |
| `Mail` | `MailIcon` | `import { MailIcon } from "@piensa-it/ui-library";` |
| `Map` | `MapIcon` | `import { MapIcon } from "@piensa-it/ui-library";` |
| `MapPin` | `LocationIcon` | `import { LocationIcon } from "@piensa-it/ui-library";` |
| `Maximize2` | `ExpandIcon` | `import { ExpandIcon } from "@piensa-it/ui-library";` |
| `Menu` | `MenuIcon` | `import { MenuIcon } from "@piensa-it/ui-library";` |
| `MessageSquare` | `MessageIcon` | `import { MessageIcon } from "@piensa-it/ui-library";` |
| `Mic` | `MicrophoneIcon` | `import { MicrophoneIcon } from "@piensa-it/ui-library";` |
| `Minus` | `MinusIcon` | `import { MinusIcon } from "@piensa-it/ui-library";` |
| `Monitor` | `DesktopIcon` | `import { DesktopIcon } from "@piensa-it/ui-library";` |
| `Moon` | `MoonIcon` | `import { MoonIcon } from "@piensa-it/ui-library";` |
| `MousePointer2` | `PointerIcon` | `import { PointerIcon } from "@piensa-it/ui-library";` |
| `MoveDown` | `MoveDownIcon` | `import { MoveDownIcon } from "@piensa-it/ui-library";` |
| `MoveUp` | `MoveUpIcon` | `import { MoveUpIcon } from "@piensa-it/ui-library";` |
| `Navigation` | `NavigationIcon` | `import { NavigationIcon } from "@piensa-it/ui-library";` |
| `Package` | `PackageIcon` | `import { PackageIcon } from "@piensa-it/ui-library";` |
| `PanelLeft` | `SidebarIcon` | `import { SidebarIcon } from "@piensa-it/ui-library";` |
| `Paperclip` | `AttachmentIcon` | `import { AttachmentIcon } from "@piensa-it/ui-library";` |
| `Pause` | `PauseIcon` | `import { PauseIcon } from "@piensa-it/ui-library";` |
| `Percent` | `PercentIcon` | `import { PercentIcon } from "@piensa-it/ui-library";` |
| `Phone` | `PhoneIcon` | `import { PhoneIcon } from "@piensa-it/ui-library";` |
| `PieChart` † | `PieChartIcon` | `import { PieChartIcon } from "@piensa-it/ui-library";` |
| `Pin` | `PinIcon` | `import { PinIcon } from "@piensa-it/ui-library";` |
| `Play` | `PlayIcon` | `import { PlayIcon } from "@piensa-it/ui-library";` |
| `Plus` | `PlusIcon` | `import { PlusIcon } from "@piensa-it/ui-library";` |
| `Power` | `PowerIcon` | `import { PowerIcon } from "@piensa-it/ui-library";` |
| `Printer` | `PrintIcon` | `import { PrintIcon } from "@piensa-it/ui-library";` |
| `Receipt` | `ReceiptIcon` | `import { ReceiptIcon } from "@piensa-it/ui-library";` |
| `Redo2` | `RedoIcon` | `import { RedoIcon } from "@piensa-it/ui-library";` |
| `RefreshCw` | `RefreshIcon` | `import { RefreshIcon } from "@piensa-it/ui-library";` |
| `Repeat2` | `RepeatIcon` | `import { RepeatIcon } from "@piensa-it/ui-library";` |
| `Rocket` | `RocketIcon` | `import { RocketIcon } from "@piensa-it/ui-library";` |
| `RotateCcw` | `RestoreIcon` | `import { RestoreIcon } from "@piensa-it/ui-library";` |
| `Route` | `RouteIcon` | `import { RouteIcon } from "@piensa-it/ui-library";` |
| `Rows3` | `RowsIcon` | `import { RowsIcon } from "@piensa-it/ui-library";` |
| `Save` | `SaveIcon` | `import { SaveIcon } from "@piensa-it/ui-library";` |
| `ScanLine` | `ScanIcon` | `import { ScanIcon } from "@piensa-it/ui-library";` |
| `Search` | `SearchIcon` | `import { SearchIcon } from "@piensa-it/ui-library";` |
| `Send` | `SendIcon` | `import { SendIcon } from "@piensa-it/ui-library";` |
| `Server` | `ServerIcon` | `import { ServerIcon } from "@piensa-it/ui-library";` |
| `Settings` | `SettingsIcon` | `import { SettingsIcon } from "@piensa-it/ui-library";` |
| `Share2` | `ShareIcon` | `import { ShareIcon } from "@piensa-it/ui-library";` |
| `ShieldCheck` | `SecurityIcon` | `import { SecurityIcon } from "@piensa-it/ui-library";` |
| `ShoppingBag` | `ShoppingBagIcon` | `import { ShoppingBagIcon } from "@piensa-it/ui-library";` |
| `ShoppingCart` | `ShoppingCartIcon` | `import { ShoppingCartIcon } from "@piensa-it/ui-library";` |
| `SlidersHorizontal` | `ControlsIcon` | `import { ControlsIcon } from "@piensa-it/ui-library";` |
| `SlidersVertical` | `AdjustmentsIcon` | `import { AdjustmentsIcon } from "@piensa-it/ui-library";` |
| `Smartphone` | `MobileIcon` | `import { MobileIcon } from "@piensa-it/ui-library";` |
| `SortAsc` † | `SortAscendingIcon` | `import { SortAscendingIcon } from "@piensa-it/ui-library";` |
| `SortDesc` † | `SortDescendingIcon` | `import { SortDescendingIcon } from "@piensa-it/ui-library";` |
| `Sparkles` | `SparklesIcon` | `import { SparklesIcon } from "@piensa-it/ui-library";` |
| `Star` | `StarIcon` | `import { StarIcon } from "@piensa-it/ui-library";` |
| `Sun` | `SunIcon` | `import { SunIcon } from "@piensa-it/ui-library";` |
| `Table2` | `TableIcon` | `import { TableIcon } from "@piensa-it/ui-library";` |
| `Tags` | `TagsIcon` | `import { TagsIcon } from "@piensa-it/ui-library";` |
| `Target` | `TargetIcon` | `import { TargetIcon } from "@piensa-it/ui-library";` |
| `Terminal` | `TerminalIcon` | `import { TerminalIcon } from "@piensa-it/ui-library";` |
| `Timer` | `TimerIcon` | `import { TimerIcon } from "@piensa-it/ui-library";` |
| `Trash2` | `TrashIcon` | `import { TrashIcon } from "@piensa-it/ui-library";` |
| `TrendingDown` | `TrendingDownIcon` | `import { TrendingDownIcon } from "@piensa-it/ui-library";` |
| `TrendingUp` | `TrendingUpIcon` | `import { TrendingUpIcon } from "@piensa-it/ui-library";` |
| `TriangleAlert` | `WarningIcon` | `import { WarningIcon } from "@piensa-it/ui-library";` |
| `Truck` | `DeliveryIcon` | `import { DeliveryIcon } from "@piensa-it/ui-library";` |
| `Undo2` | `UndoIcon` | `import { UndoIcon } from "@piensa-it/ui-library";` |
| `Unlock` † | `UnlockIcon` | `import { UnlockIcon } from "@piensa-it/ui-library";` |
| `Upload` | `UploadIcon` | `import { UploadIcon } from "@piensa-it/ui-library";` |
| `UserCheck` | `ApprovedUserIcon` | `import { ApprovedUserIcon } from "@piensa-it/ui-library";` |
| `UserMinus` | `RemoveUserIcon` | `import { RemoveUserIcon } from "@piensa-it/ui-library";` |
| `UserPlus` | `AddUserIcon` | `import { AddUserIcon } from "@piensa-it/ui-library";` |
| `Users` | `UsersIcon` | `import { UsersIcon } from "@piensa-it/ui-library";` |
| `Video` | `VideoIcon` | `import { VideoIcon } from "@piensa-it/ui-library";` |
| `Volume2` | `VolumeIcon` | `import { VolumeIcon } from "@piensa-it/ui-library";` |
| `VolumeX` | `MutedIcon` | `import { MutedIcon } from "@piensa-it/ui-library";` |
| `Wallet` | `WalletIcon` | `import { WalletIcon } from "@piensa-it/ui-library";` |
| `Wifi` | `WifiIcon` | `import { WifiIcon } from "@piensa-it/ui-library";` |
| `Wrench` | `ToolsIcon` | `import { ToolsIcon } from "@piensa-it/ui-library";` |
| `X` | `CloseIcon` | `import { CloseIcon } from "@piensa-it/ui-library";` |
| `Zap` | `LightningIcon` | `import { LightningIcon } from "@piensa-it/ui-library";` |

### Añadidos en 0.7.0 (adopción en Lynx)

Iconos de dominio inmobiliario y de portafolio que Lynx usaba desde su copia
de lucide y no estaban en la tabla: activos, capas, obra, acuerdos,
sostenibilidad, flujos, además del spinner de carga y el archivo rechazado.
`FileSignature` no existe en lucide 1.x; su equivalente es `Signature`.

| Nombre en lucide-react | Export de la librería | Import nuevo |
| --- | --- | --- |
| `ArrowDownRight` | `ArrowDownRightIcon` | `import { ArrowDownRightIcon } from "@piensa-it/ui-library";` |
| `ArrowUpRight` | `ArrowUpRightIcon` | `import { ArrowUpRightIcon } from "@piensa-it/ui-library";` |
| `Boxes` | `BoxesIcon` | `import { BoxesIcon } from "@piensa-it/ui-library";` |
| `Building` | `BuildingIcon` | `import { BuildingIcon } from "@piensa-it/ui-library";` |
| `CalendarDays` | `CalendarDaysIcon` | `import { CalendarDaysIcon } from "@piensa-it/ui-library";` |
| `ChevronsUpDown` | `ChevronsUpDownIcon` | `import { ChevronsUpDownIcon } from "@piensa-it/ui-library";` |
| `Circle` | `CircleIcon` | `import { CircleIcon } from "@piensa-it/ui-library";` |
| `CircleDashed` | `CircleDashedIcon` | `import { CircleDashedIcon } from "@piensa-it/ui-library";` |
| `CircleSlash` | `CircleSlashIcon` | `import { CircleSlashIcon } from "@piensa-it/ui-library";` |
| `ClipboardList` | `ClipboardListIcon` | `import { ClipboardListIcon } from "@piensa-it/ui-library";` |
| `Coins` | `CoinsIcon` | `import { CoinsIcon } from "@piensa-it/ui-library";` |
| `DollarSign` | `DollarSignIcon` | `import { DollarSignIcon } from "@piensa-it/ui-library";` |
| `Droplets` | `DropletsIcon` | `import { DropletsIcon } from "@piensa-it/ui-library";` |
| `FileX` | `RejectedFileIcon` | `import { RejectedFileIcon } from "@piensa-it/ui-library";` |
| `Flame` | `FlameIcon` | `import { FlameIcon } from "@piensa-it/ui-library";` |
| `Hammer` | `HammerIcon` | `import { HammerIcon } from "@piensa-it/ui-library";` |
| `Handshake` | `HandshakeIcon` | `import { HandshakeIcon } from "@piensa-it/ui-library";` |
| `Layers` | `LayersIcon` | `import { LayersIcon } from "@piensa-it/ui-library";` |
| `Leaf` | `LeafIcon` | `import { LeafIcon } from "@piensa-it/ui-library";` |
| `LoaderCircle` | `SpinnerIcon` | `import { SpinnerIcon } from "@piensa-it/ui-library";` |
| `Palette` | `PaletteIcon` | `import { PaletteIcon } from "@piensa-it/ui-library";` |
| `PiggyBank` | `SavingsIcon` | `import { SavingsIcon } from "@piensa-it/ui-library";` |
| `Ruler` | `RulerIcon` | `import { RulerIcon } from "@piensa-it/ui-library";` |
| `Scale` | `ScaleIcon` | `import { ScaleIcon } from "@piensa-it/ui-library";` |
| `Shield` | `ShieldIcon` | `import { ShieldIcon } from "@piensa-it/ui-library";` |
| `Signature` | `SignatureIcon` | `import { SignatureIcon } from "@piensa-it/ui-library";` |
| `ShieldAlert` | `ShieldAlertIcon` | `import { ShieldAlertIcon } from "@piensa-it/ui-library";` |
| `Square` | `SquareIcon` | `import { SquareIcon } from "@piensa-it/ui-library";` |
| `Unlink` | `UnlinkIcon` | `import { UnlinkIcon } from "@piensa-it/ui-library";` |
| `Workflow` | `WorkflowIcon` | `import { WorkflowIcon } from "@piensa-it/ui-library";` |
| `ChartArea` | `AreaChartIcon` | `import { AreaChartIcon } from "@piensa-it/ui-library";` |
| `BadgePercent` | `PercentBadgeIcon` | `import { PercentBadgeIcon } from "@piensa-it/ui-library";` |
| `ChartColumn` | `ColumnChartIcon` | `import { ColumnChartIcon } from "@piensa-it/ui-library";` |
| `CalendarClock` | `CalendarClockIcon` | `import { CalendarClockIcon } from "@piensa-it/ui-library";` |
| `ChartCandlestick` | `CandlestickChartIcon` | `import { CandlestickChartIcon } from "@piensa-it/ui-library";` |
| `Construction` | `ConstructionIcon` | `import { ConstructionIcon } from "@piensa-it/ui-library";` |
| `FileSearch` | `FileSearchIcon` | `import { FileSearchIcon } from "@piensa-it/ui-library";` |
| `FolderKanban` | `KanbanIcon` | `import { KanbanIcon } from "@piensa-it/ui-library";` |
| `Headset` | `HeadsetIcon` | `import { HeadsetIcon } from "@piensa-it/ui-library";` |
| `ChartLine` | `LineChartIcon` | `import { LineChartIcon } from "@piensa-it/ui-library";` |
| `Tag` | `TagIcon` | `import { TagIcon } from "@piensa-it/ui-library";` |

## Iconos que no están en el catálogo

Si una app necesita un icono que no está en la tabla, **no vuelvas a instalar
`lucide-react`**. Eso reintroduce la copia duplicada y rompe el acuerdo de un
solo set. Abre un issue en este repo pidiendo que se añada al catálogo,
indicando el nombre del icono en lucide y para qué se usa; se agrega a
`src/icons.ts` con su alias `*Icon` y se publica en el siguiente release.

Para saber qué iconos usa hoy una app, desde la raíz del repo de la app. Este
comando cubre también los imports repartidos en varias líneas, que es como los
deja Prettier:

```bash
node -e '
const {execSync}=require("child_process");const fs=require("fs");
const files=execSync("grep -rl lucide-react src || true",{encoding:"utf8"}).split("\n").filter(Boolean);
const set=new Set();
for(const f of files){const s=fs.readFileSync(f,"utf8");
for(const m of s.matchAll(/import\s*\{([^}]*)\}\s*from\s*["\x27]lucide-react["\x27]/g)){
m[1].split(",").map(x=>x.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean).forEach(n=>set.add(n));}}
console.log([...set].sort().join("\n"));'
```

Devuelve un nombre de icono por línea, deduplicado y ordenado, ya sin el `as`
de los renombrados locales.

Si solo se quiere una ojeada rápida y todos los imports de lucide del repo caben
en una sola línea, esto basta (pero se salta los imports multilínea, no lo uses
como inventario definitivo):

```bash
grep -rh 'from "lucide-react"' src \
  | sed -E 's/.*\{//; s/\}.*//' \
  | tr ',' '\n' \
  | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//' \
  | grep -v '^$' \
  | sort -u
```

Cruza esa lista contra la tabla de arriba: lo que aparezca ahí se migra
cambiando el import; lo que no, va a un issue.

## Cambios de nombre entre lucide 0.462 y 1.x

Lucide renombró muchos iconos en la serie 0.4xx y siguió haciéndolo hasta 1.x,
pero **mantiene los nombres viejos como alias exportados**. Esto se verificó
leyendo el bloque `export { ... }` de
`node_modules/lucide-react/dist/lucide-react.d.ts` de la versión **1.35.0**
instalada en este repo, que exporta 6110 identificadores entre nombres
canónicos y alias.

### Lo que sí se verificó

Los siete renombrados que se sospechaban **siguen existiendo** en 1.35.0 como
alias. Ninguno está marcado `@deprecated` (el `.d.ts` no contiene ni una sola
anotación de ese tipo):

| Nombre viejo (0.x) | Resuelve en 1.35.0 a |
| --- | --- |
| `AlertTriangle` | `TriangleAlert` |
| `AlertCircle` | `CircleAlert` |
| `CheckCircle` | `CircleCheckBig` |
| `XCircle` | `CircleX` |
| `HelpCircle` | `CircleQuestionMark` |
| `MoreHorizontal` | `Ellipsis` |
| `Loader2` | `LoaderCircle` |

Dos matices que importan para no confundir glifos:

- `CheckCircle` (0.x) resuelve a `CircleCheckBig`, **no** a `CircleCheck`. El
  que resuelve a `CircleCheck` es `CheckCircle2`. El catálogo usa `CircleCheck`
  (`SuccessIcon`), es decir el glifo del antiguo `CheckCircle2`.
- `HelpCircle` y `CircleHelp` resuelven ambos a `CircleQuestionMark`: hubo un
  segundo renombrado después del primero.

### Nombres del catálogo que hoy son alias

Los 167 nombres de `src/icons.ts` existen en 1.35.0 — se comprobó uno por uno
contra el bloque de exports, cero faltantes. De esos, **13 son alias** de un
nombre canónico distinto:

| Nombre usado en `src/icons.ts` | Nombre canónico en lucide 1.35.0 | Export de la librería |
| --- | --- | --- |
| `AlertCircle` | `CircleAlert` | `AlertCircleIcon` |
| `BarChart3` | `ChartColumn` | `BarChartIcon` |
| `CircleHelp` | `CircleQuestionMark` | `HelpIcon` |
| `Code2` | `CodeXml` | `CodeIcon` |
| `Edit3` | `PenLine` | `EditIcon` |
| `Filter` | `Funnel` | `FilterIcon` |
| `Globe2` | `Earth` | `GlobeIcon` |
| `History` | `RotateCcwClock` | `HistoryIcon` |
| `Home` | `House` | `HomeIcon` |
| `PieChart` | `ChartPie` | `PieChartIcon` |
| `SortAsc` | `ArrowUpNarrowWide` | `SortAscendingIcon` |
| `SortDesc` | `ArrowDownWideNarrow` | `SortDescendingIcon` |
| `Unlock` | `LockOpen` | `UnlockIcon` |

Funcionan y renderizan el glifo canónico. No hay que tocarlos para que la
librería compile; queda como deuda cosmética de `src/icons.ts` si algún día se
quiere apuntar a los nombres canónicos.

Los otros 154 nombres del catálogo ya son canónicos en 1.35.0, incluidos los
que a primera vista parecen legacy: `Building2`, `Trash2`, `Volume2`, `Share2`,
`Maximize2`, `Redo2`, `Undo2`, `Repeat2`, `MousePointer2`, `Table2`,
`Columns3`, `Rows3`. Esos sufijos numéricos son parte del nombre oficial, no
restos de una migración.

### Lo que no se pudo verificar

- **No se comprobó contra lucide-react 0.462.0 directamente**: esa versión no
  está instalada en este repo. Todo lo de arriba sale de leer los exports de
  1.35.0 y de confirmar que los nombres viejos siguen ahí — no de comparar los
  dos índices de exports lado a lado.
- **No hay CHANGELOG en el paquete publicado**: `node_modules/lucide-react/`
  contiene solo `LICENSE`, `README.md`, `dist/`, los entrypoints `dynamic*` y
  `package.json`. La historia de renombrados está en el repo de lucide, no en
  el tarball de npm.
- **No se compararon los `IconNode` (los `path` del SVG)** entre 0.462 y
  1.35.0. Un icono puede conservar el nombre y haber cambiado de dibujo; eso
  requiere diffear ambas versiones y no se hizo. Si tras migrar algún icono se
  ve distinto, esa es la causa probable.
