// Define base types for our tool system
export interface Tool<T> {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required: readonly string[];
  };
  handler: (args: T) => Promise<InternalToolResponse>;
}

// Our internal tool response format
export interface InternalToolResponse {
  content: {
    type: string;
    text: string;
  }[];
  isError: boolean;
}

// Input types for each tool
export interface GDriveSearchInput {
  query: string;
  pageToken?: string;
  pageSize?: number;
}

export interface GDriveReadFileInput {
  fileId: string;
}

export interface GSheetsUpdateCellInput {
  fileId: string;
  range: string;
  value: string;
}

export interface GSheetsReadInput {
  spreadsheetId: string;
  ranges?: string[]; // Optional A1 notation ranges like "Sheet1!A1:B10"
  sheetId?: number; // Optional specific sheet ID
}

export interface GSheetsListSheetsInput {
  spreadsheetId: string;
}

export interface GSheetsAddSheetInput {
  spreadsheetId: string;
  title: string;
  index?: number;
}

export interface GSheetsDeleteSheetInput {
  spreadsheetId: string;
  sheetId: number;
}

export interface GSheetsInsertRowsInput {
  spreadsheetId: string;
  sheetId: number;
  startIndex: number;
  count: number;
}

export interface GSheetsInsertColumnsInput {
  spreadsheetId: string;
  sheetId: number;
  startIndex: number;
  count: number;
}

export interface GSheetsDeleteRowsInput {
  spreadsheetId: string;
  sheetId: number;
  startIndex: number;
  count: number;
}

export interface GSheetsDeleteColumnsInput {
  spreadsheetId: string;
  sheetId: number;
  startIndex: number;
  count: number;
}

export interface GSheetsAppendDataInput {
  spreadsheetId: string;
  range: string;
  values: string[][];
  valueInputOption?: "RAW" | "USER_ENTERED";
}

export interface GSheetsBatchUpdateInput {
  spreadsheetId: string;
  updates: Array<{
    range: string;
    values: string[][];
  }>;
  valueInputOption?: "RAW" | "USER_ENTERED";
}

export interface GSheetsClearDataInput {
  spreadsheetId: string;
  ranges: string[];
}

export interface GSheetsCopySheetInput {
  sourceSpreadsheetId: string;
  sourceSheetId: number;
  destinationSpreadsheetId: string;
}

export interface GSheetsCopyToInput {
  spreadsheetId: string;
  sourceSheetId: number;
  sourceStartRow: number;
  sourceStartColumn: number;
  sourceEndRow: number;
  sourceEndColumn: number;
  destinationSheetId: number;
  destinationStartRow: number;
  destinationStartColumn: number;
  pasteType?: "NORMAL" | "VALUES" | "FORMAT" | "FORMULA";
}

export interface GSheetsMergeCellsInput {
  spreadsheetId: string;
  sheetId: number;
  startRow: number;
  endRow: number;
  startColumn: number;
  endColumn: number;
  mergeType?: "MERGE_ALL" | "MERGE_COLUMNS" | "MERGE_ROWS";
}

export interface GSheetsUnmergeCellsInput {
  spreadsheetId: string;
  sheetId: number;
  startRow: number;
  endRow: number;
  startColumn: number;
  endColumn: number;
}

export interface BorderStyle {
  style?: "SOLID" | "DOTTED" | "DASHED" | "DOUBLE" | "SOLID_MEDIUM" | "SOLID_THICK";
  width?: number;
  color?: { red: number; green: number; blue: number };
}

export interface GSheetsUpdateBordersInput {
  spreadsheetId: string;
  sheetId: number;
  startRow: number;
  endRow: number;
  startColumn: number;
  endColumn: number;
  top?: BorderStyle;
  bottom?: BorderStyle;
  left?: BorderStyle;
  right?: BorderStyle;
  innerHorizontal?: BorderStyle;
  innerVertical?: BorderStyle;
}

export interface GSheetsFormatCellsInput {
  spreadsheetId: string;
  sheetId: number;
  startRow: number;
  endRow: number;
  startColumn: number;
  endColumn: number;
  format: {
    bold?: boolean;
    italic?: boolean;
    fontSize?: number;
    fontFamily?: string;
    textColor?: { red: number; green: number; blue: number };
    backgroundColor?: { red: number; green: number; blue: number };
    horizontalAlignment?: "LEFT" | "CENTER" | "RIGHT";
    verticalAlignment?: "TOP" | "MIDDLE" | "BOTTOM";
  };
}

export interface GSheetsSortRangeInput {
  spreadsheetId: string;
  sheetId: number;
  startRow: number;
  endRow: number;
  startColumn: number;
  endColumn: number;
  sortSpecs: Array<{
    dimensionIndex: number;
    sortOrder: "ASCENDING" | "DESCENDING";
  }>;
}

export interface GSheetsCreateSpreadsheetInput {
  title: string;
  sheets?: Array<{
    title: string;
    rowCount?: number;
    columnCount?: number;
  }>;
}

export interface GSheetsDuplicateSheetInput {
  spreadsheetId: string;
  sourceSheetId: number;
  newSheetName?: string;
  insertSheetIndex?: number;
}

export interface GSheetsRenameSheetInput {
  spreadsheetId: string;
  sheetId: number;
  newTitle: string;
}

export interface GSheetsBatchClearInput {
  spreadsheetId: string;
  ranges: string[];
}

export interface GSheetsAutoResizeInput {
  spreadsheetId: string;
  sheetId: number;
  dimension: "ROWS" | "COLUMNS";
  startIndex: number;
  endIndex: number;
}

export interface GSheetsSetNumberFormatInput {
  spreadsheetId: string;
  sheetId: number;
  startRow: number;
  endRow: number;
  startColumn: number;
  endColumn: number;
  numberFormat: {
    type: "NUMBER" | "CURRENCY" | "PERCENT" | "DATE" | "TIME" | "DATE_TIME" | "SCIENTIFIC" | "TEXT";
    pattern?: string;
  };
}

export interface GSheetsSetDataValidationInput {
  spreadsheetId: string;
  sheetId: number;
  startRow: number;
  endRow: number;
  startColumn: number;
  endColumn: number;
  validation: {
    type: "ONE_OF_LIST" | "ONE_OF_RANGE" | "NUMBER_GREATER" | "NUMBER_LESS" | "NUMBER_BETWEEN" | "DATE_AFTER" | "DATE_BEFORE" | "CUSTOM_FORMULA";
    values?: string[];
    minValue?: string;
    maxValue?: string;
    formula?: string;
    strict?: boolean;
    showCustomUi?: boolean;
  };
}

export interface GSheetsAddConditionalFormatInput {
  spreadsheetId: string;
  sheetId: number;
  startRow: number;
  endRow: number;
  startColumn: number;
  endColumn: number;
  rule: {
    type: "NUMBER_GREATER" | "NUMBER_LESS" | "NUMBER_BETWEEN" | "TEXT_CONTAINS" | "TEXT_NOT_CONTAINS" | "CUSTOM_FORMULA";
    value?: string;
    minValue?: string;
    maxValue?: string;
    formula?: string;
    backgroundColor?: { red: number; green: number; blue: number };
    textColor?: { red: number; green: number; blue: number };
    bold?: boolean;
    italic?: boolean;
  };
}

export interface GSheetsCreateFilterInput {
  spreadsheetId: string;
  sheetId: number;
  startRow: number;
  endRow: number;
  startColumn: number;
  endColumn: number;
}

export interface GSheetsAddProtectedRangeInput {
  spreadsheetId: string;
  sheetId: number;
  startRow: number;
  endRow: number;
  startColumn: number;
  endColumn: number;
  description?: string;
  warningOnly?: boolean;
  editors?: {
    users?: string[];
    groups?: string[];
    domainUsersCanEdit?: boolean;
  };
}

export interface GSheetsDeleteProtectedRangeInput {
  spreadsheetId: string;
  protectedRangeId: number;
}

export interface GSheetsUpdateProtectedRangeInput {
  spreadsheetId: string;
  protectedRangeId: number;
  description?: string;
  warningOnly?: boolean;
  editors?: {
    users?: string[];
    groups?: string[];
    domainUsersCanEdit?: boolean;
  };
}

export interface GSheetsFindReplaceInput {
  spreadsheetId: string;
  sheetId?: number;
  find: string;
  replacement: string;
  matchCase?: boolean;
  matchEntireCell?: boolean;
  searchByRegex?: boolean;
  startRow?: number;
  endRow?: number;
  startColumn?: number;
  endColumn?: number;
}

export interface GSheetsAddNamedRangeInput {
  spreadsheetId: string;
  name: string;
  sheetId: number;
  startRow: number;
  endRow: number;
  startColumn: number;
  endColumn: number;
}

export interface GSheetsUpdateNamedRangeInput {
  spreadsheetId: string;
  namedRangeId: string;
  name?: string;
  sheetId?: number;
  startRow?: number;
  endRow?: number;
  startColumn?: number;
  endColumn?: number;
}

export interface GSheetsDeleteNamedRangeInput {
  spreadsheetId: string;
  namedRangeId: string;
}

export interface GSheetsFreezeRowsInput {
  spreadsheetId: string;
  sheetId: number;
  count: number;
}

export interface GSheetsFreezeColumnsInput {
  spreadsheetId: string;
  sheetId: number;
  count: number;
}

export interface GSheetsAddChartInput {
  spreadsheetId: string;
  sheetId: number;
  chartType: "COLUMN" | "BAR" | "LINE" | "AREA" | "PIE" | "SCATTER";
  title?: string;
  dataSheetId: number;
  dataStartRow: number;
  dataEndRow: number;
  dataStartColumn: number;
  dataEndColumn: number;
  position?: {
    overlayRow?: number;
    overlayColumn?: number;
  };
}

export interface GSheetsUpdateChartInput {
  spreadsheetId: string;
  chartId: number;
  title?: string;
  position?: {
    sheetId?: number;
    overlayRow?: number;
    overlayColumn?: number;
  };
}

export interface GSheetsDeleteChartInput {
  spreadsheetId: string;
  chartId: number;
}

export interface GSheetsAddHistogramInput {
  spreadsheetId: string;
  sheetId: number;
  title?: string;
  dataSheetId: number;
  dataStartRow: number;
  dataEndRow: number;
  dataStartColumn: number;
  dataEndColumn: number;
  bucketSize?: number;
  outlierPercentile?: number;
  position?: {
    overlayRow?: number;
    overlayColumn?: number;
  };
}

export interface GSheetsAddWaterfallInput {
  spreadsheetId: string;
  sheetId: number;
  title?: string;
  dataSheetId: number;
  dataStartRow: number;
  dataEndRow: number;
  dataStartColumn: number;
  dataEndColumn: number;
  firstValueIsTotal?: boolean;
  hideConnectorLines?: boolean;
  position?: {
    overlayRow?: number;
    overlayColumn?: number;
  };
}

export interface GSheetsAddCandlestickInput {
  spreadsheetId: string;
  sheetId: number;
  title?: string;
  dataSheetId: number;
  dataStartRow: number;
  dataEndRow: number;
  domainColumn: number;
  lowColumn: number;
  openColumn: number;
  closeColumn: number;
  highColumn: number;
  position?: {
    overlayRow?: number;
    overlayColumn?: number;
  };
}

export interface GSheetsAddComboInput {
  spreadsheetId: string;
  sheetId: number;
  title?: string;
  dataSheetId: number;
  dataStartRow: number;
  dataEndRow: number;
  dataStartColumn: number;
  dataEndColumn: number;
  seriesTypes?: ("COLUMN" | "BAR" | "LINE" | "AREA")[];
  position?: {
    overlayRow?: number;
    overlayColumn?: number;
  };
}

export interface GSheetsAddBubbleInput {
  spreadsheetId: string;
  sheetId: number;
  title?: string;
  dataSheetId: number;
  dataStartRow: number;
  dataEndRow: number;
  labelsColumn?: number;
  xValuesColumn: number;
  yValuesColumn: number;
  sizeColumn: number;
  position?: {
    overlayRow?: number;
    overlayColumn?: number;
  };
}

export interface GSheetsAddTreemapInput {
  spreadsheetId: string;
  sheetId: number;
  title?: string;
  dataSheetId: number;
  dataStartRow: number;
  dataEndRow: number;
  labelsColumn: number;
  parentLabelsColumn?: number;
  sizeColumn: number;
  colorColumn?: number;
  position?: {
    overlayRow?: number;
    overlayColumn?: number;
  };
}

export interface GSheetsAddOrgChartInput {
  spreadsheetId: string;
  sheetId: number;
  title?: string;
  dataSheetId: number;
  dataStartRow: number;
  dataEndRow: number;
  labelsColumn: number;
  parentLabelsColumn?: number;
  tooltipsColumn?: number;
  position?: {
    overlayRow?: number;
    overlayColumn?: number;
  };
}

export interface GSheetsAddFilterViewInput {
  spreadsheetId: string;
  sheetId: number;
  title?: string;
  startRow: number;
  endRow: number;
  startColumn: number;
  endColumn: number;
}

export interface GSheetsAddPivotTableInput {
  spreadsheetId: string;
  sourceSheetId: number;
  sourceStartRow: number;
  sourceEndRow: number;
  sourceStartColumn: number;
  sourceEndColumn: number;
  targetSheetId: number;
  targetRow: number;
  targetColumn: number;
  rows: Array<{
    sourceColumnOffset: number;
    sortOrder?: "ASCENDING" | "DESCENDING";
    showTotals?: boolean;
  }>;
  columns?: Array<{
    sourceColumnOffset: number;
    sortOrder?: "ASCENDING" | "DESCENDING";
    showTotals?: boolean;
  }>;
  values: Array<{
    sourceColumnOffset: number;
    summarizeFunction: "SUM" | "COUNTA" | "COUNT" | "COUNTUNIQUE" | "AVERAGE" | "MAX" | "MIN" | "MEDIAN" | "PRODUCT" | "STDEV" | "STDEVP" | "VAR" | "VARP";
  }>;
}

export interface GSheetsAddDimensionGroupInput {
  spreadsheetId: string;
  sheetId: number;
  dimension: "ROWS" | "COLUMNS";
  startIndex: number;
  endIndex: number;
}

export interface GSheetsDeleteDimensionGroupInput {
  spreadsheetId: string;
  sheetId: number;
  dimension: "ROWS" | "COLUMNS";
  startIndex: number;
  endIndex: number;
}

export interface GSheetsUpdateDimensionGroupInput {
  spreadsheetId: string;
  sheetId: number;
  dimension: "ROWS" | "COLUMNS";
  startIndex: number;
  endIndex: number;
  collapsed: boolean;
}

export interface GSheetsCreateDeveloperMetadataInput {
  spreadsheetId: string;
  location: {
    type: "SPREADSHEET" | "SHEET" | "ROW" | "COLUMN";
    sheetId?: number;
    dimensionRange?: {
      dimension: "ROWS" | "COLUMNS";
      startIndex: number;
      endIndex: number;
    };
  };
  metadataKey: string;
  metadataValue: string;
  visibility: "DOCUMENT" | "PROJECT";
}

export interface GSheetsUpdateDeveloperMetadataInput {
  spreadsheetId: string;
  metadataId: number;
  metadataKey?: string;
  metadataValue?: string;
  visibility?: "DOCUMENT" | "PROJECT";
}

export interface GSheetsDeleteDeveloperMetadataInput {
  spreadsheetId: string;
  metadataId: number;
}

// ============================================================
// Google Docs Tool Input Types
// ============================================================

// Basic operations (4 tools)
export interface GDocsCreateInput {
  title: string;
}

export interface GDocsReadInput {
  documentId: string;
  includeFormatting?: boolean;
}

export interface GDocsGetMetadataInput {
  documentId: string;
}

export interface GDocsListDocumentsInput {
  query?: string;
  pageToken?: string;
  pageSize?: number;
}

// Content/Formatting operations (10 tools)
export interface GDocsInsertTextInput {
  documentId: string;
  text: string;
  index: number;
}

export interface GDocsUpdateTextInput {
  documentId: string;
  startIndex: number;
  endIndex: number;
  text: string;
}

export interface GDocsDeleteTextInput {
  documentId: string;
  startIndex: number;
  endIndex: number;
}

export interface GDocsReplaceTextInput {
  documentId: string;
  findText: string;
  replaceText: string;
  matchCase?: boolean;
}

export interface GDocsAppendTextInput {
  documentId: string;
  text: string;
}

export interface GDocsFormatTextInput {
  documentId: string;
  startIndex: number;
  endIndex: number;
  format: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    fontSize?: number;
    fontFamily?: string;
    foregroundColor?: { red: number; green: number; blue: number };
    backgroundColor?: { red: number; green: number; blue: number };
  };
}

export interface GDocsCreateHeadingInput {
  documentId: string;
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  index?: number;
}

export interface GDocsCreateListInput {
  documentId: string;
  startIndex: number;
  endIndex: number;
  listType: "ORDERED" | "UNORDERED";
  nestingLevel?: number;
}

export interface GDocsSetAlignmentInput {
  documentId: string;
  startIndex: number;
  endIndex: number;
  alignment: "START" | "CENTER" | "END" | "JUSTIFIED";
}

export interface GDocsApplyStyleInput {
  documentId: string;
  startIndex: number;
  endIndex: number;
  namedStyleType: "NORMAL_TEXT" | "HEADING_1" | "HEADING_2" | "HEADING_3" | "HEADING_4" | "HEADING_5" | "HEADING_6" | "TITLE" | "SUBTITLE";
}

// Elements/Advanced operations (9 tools)
export interface GDocsInsertImageInput {
  documentId: string;
  imageUrl: string;
  index: number;
  width?: number;
  height?: number;
}

export interface GDocsCreateTableInput {
  documentId: string;
  rows: number;
  columns: number;
  index: number;
}

export interface GDocsInsertPageBreakInput {
  documentId: string;
  index: number;
}

export interface GDocsInsertLinkInput {
  documentId: string;
  startIndex: number;
  endIndex: number;
  url: string;
}

export interface GDocsInsertTocInput {
  documentId: string;
  index: number;
}

export interface GDocsBatchUpdateInput {
  documentId: string;
  requests: Array<{
    type: "insertText" | "deleteContentRange" | "updateTextStyle" | "updateParagraphStyle" | "createParagraphBullets" | "insertTable" | "insertInlineImage" | "insertPageBreak" | "createHeader" | "createFooter";
    params: Record<string, any>;
  }>;
}

export interface GDocsMergeDocumentsInput {
  sourceDocumentIds: string[];
  targetDocumentId?: string;
  title?: string;
}

export interface GDocsExportInput {
  documentId: string;
  mimeType: "application/pdf" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document" | "text/plain" | "text/html" | "application/epub+zip";
}

export interface GDocsSuggestModeInput {
  documentId: string;
  enabled: boolean;
}

// ============================================================
// Gmail Tool Input Types
// ============================================================

// Basic operations
export interface GmailSearchMessagesInput {
  query: string;
  pageSize?: number;
  pageToken?: string;
}

export interface GmailGetMessageInput {
  messageId: string;
}

export interface GmailGetThreadInput {
  threadId: string;
}

export interface GmailListLabelsInput {
  // No parameters needed - uses authenticated user
}

// Batch operations
export interface GmailGetMessagesBatchInput {
  messageIds: string[];
  format?: "full" | "metadata";
}

export interface GmailGetThreadsBatchInput {
  threadIds: string[];
}

// Send & Draft operations
export interface GmailSendMessageInput {
  to: string;
  subject: string;
  body: string;
  bodyFormat?: "plain" | "html";
  cc?: string;
  bcc?: string;
  threadId?: string;
  inReplyTo?: string;
  references?: string;
}

export interface GmailDraftMessageInput {
  subject: string;
  body: string;
  bodyFormat?: "plain" | "html";
  to?: string;
  cc?: string;
  bcc?: string;
  threadId?: string;
  inReplyTo?: string;
  references?: string;
}

// Label operations
export interface GmailModifyLabelsInput {
  messageId: string;
  addLabelIds?: string[];
  removeLabelIds?: string[];
}

export interface GmailBatchModifyLabelsInput {
  messageIds: string[];
  addLabelIds?: string[];
  removeLabelIds?: string[];
}

export interface GmailManageLabelInput {
  action: "create" | "update" | "delete";
  name?: string;
  labelId?: string;
  labelListVisibility?: "labelShow" | "labelHide";
  messageListVisibility?: "show" | "hide";
}

// ============================================================
// Google Drive Tool Input Types (Extended)
// ============================================================

// Basic operations (4 tools - including existing 2)
export interface GDriveListFilesInput {
  query?: string;
  pageSize?: number;
  pageToken?: string;
  orderBy?: string;
  folderId?: string;
}

export interface GDriveGetMetadataInput {
  fileId: string;
  fields?: string;
}

// File operations (7 tools)
export interface GDriveUploadFileInput {
  name: string;
  mimeType: string;
  content: string;
  parents?: string[];
  description?: string;
}

export interface GDriveCreateFileInput {
  name: string;
  mimeType: string;
  parents?: string[];
  description?: string;
}

export interface GDriveDeleteFileInput {
  fileId: string;
}

export interface GDriveCopyFileInput {
  fileId: string;
  name?: string;
  parents?: string[];
}

export interface GDriveMoveFileInput {
  fileId: string;
  newParents: string[];
  removeParents?: string[];
}

export interface GDriveRenameFileInput {
  fileId: string;
  newName: string;
}

export interface GDriveUpdateFileInput {
  fileId: string;
  name?: string;
  description?: string;
  mimeType?: string;
  content?: string;
}

// Folder operations (3 tools)
export interface GDriveCreateFolderInput {
  name: string;
  parents?: string[];
  description?: string;
}

export interface GDriveListFolderContentsInput {
  folderId: string;
  pageSize?: number;
  pageToken?: string;
  orderBy?: string;
}

export interface GDriveMoveToFolderInput {
  fileId: string;
  folderId: string;
}

// Permission operations (4 tools)
export interface GDriveShareFileInput {
  fileId: string;
  role: "owner" | "organizer" | "fileOrganizer" | "writer" | "commenter" | "reader";
  type: "user" | "group" | "domain" | "anyone";
  emailAddress?: string;
  domain?: string;
  sendNotificationEmail?: boolean;
  emailMessage?: string;
}

export interface GDriveListPermissionsInput {
  fileId: string;
}

export interface GDriveUpdatePermissionInput {
  fileId: string;
  permissionId: string;
  role: "owner" | "organizer" | "fileOrganizer" | "writer" | "commenter" | "reader";
}

export interface GDriveRemovePermissionInput {
  fileId: string;
  permissionId: string;
}

// Advanced operations (3 tools)
export interface GDriveExportFileInput {
  fileId: string;
  mimeType?: string;
  format?: string;
}

export interface GDriveListRevisionsInput {
  fileId: string;
  pageSize?: number;
  pageToken?: string;
}

export interface GDriveEmptyTrashInput {
  // No parameters needed - empties entire trash for authenticated user
}

