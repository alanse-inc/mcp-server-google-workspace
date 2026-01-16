// Drive - Basic operations
import { schema as driveSearchSchema, search } from './drive/basic/drive_search.js';
import { schema as driveReadFileSchema, readFile } from './drive/basic/drive_read_file.js';
import { schema as driveListFilesSchema, listFiles } from './drive/basic/drive_list_files.js';
import { schema as driveGetMetadataSchema, getMetadata as driveGetMetadata } from './drive/basic/drive_get_metadata.js';

// Drive - File operations
import { schema as driveUploadFileSchema, uploadFile } from './drive/file/drive_upload_file.js';
import { schema as driveCreateFileSchema, createFile } from './drive/file/drive_create_file.js';
import { schema as driveDeleteFileSchema, deleteFile } from './drive/file/drive_delete_file.js';
import { schema as driveCopyFileSchema, copyFile } from './drive/file/drive_copy_file.js';
import { schema as driveMoveFileSchema, moveFile } from './drive/file/drive_move_file.js';
import { schema as driveRenameFileSchema, renameFile } from './drive/file/drive_rename_file.js';
import { schema as driveUpdateFileSchema, updateFile } from './drive/file/drive_update_file.js';

// Drive - Folder operations
import { schema as driveCreateFolderSchema, createFolder } from './drive/folder/drive_create_folder.js';
import { schema as driveListFolderContentsSchema, listFolderContents } from './drive/folder/drive_list_folder_contents.js';
import { schema as driveMoveToFolderSchema, moveToFolder } from './drive/folder/drive_move_to_folder.js';

// Drive - Permissions operations
import { schema as driveShareFileSchema, shareFile } from './drive/permissions/drive_share_file.js';
import { schema as driveListPermissionsSchema, listPermissions } from './drive/permissions/drive_list_permissions.js';
import { schema as driveUpdatePermissionSchema, updatePermission } from './drive/permissions/drive_update_permission.js';
import { schema as driveRemovePermissionSchema, removePermission } from './drive/permissions/drive_remove_permission.js';

// Drive - Advanced operations
import { schema as driveExportFileSchema, exportFile } from './drive/advanced/drive_export_file.js';
import { schema as driveListRevisionsSchema, listRevisions } from './drive/advanced/drive_list_revisions.js';
import { schema as driveEmptyTrashSchema, emptyTrash } from './drive/advanced/drive_empty_trash.js';

// Basic operations
import { schema as gsheetsReadSchema, readSheet } from './sheets/basic/gsheets_read.js';
import { schema as gsheetsListSheetsSchema, listSheets } from './sheets/basic/gsheets_list_sheets.js';
import { schema as gsheetsAddSheetSchema, addSheet } from './sheets/basic/gsheets_add_sheet.js';
import { schema as gsheetsDeleteSheetSchema, deleteSheet } from './sheets/basic/gsheets_delete_sheet.js';
import { schema as gsheetsInsertRowsSchema, insertRows } from './sheets/basic/gsheets_insert_rows.js';
import { schema as gsheetsInsertColumnsSchema, insertColumns } from './sheets/basic/gsheets_insert_columns.js';
import { schema as gsheetsDeleteRowsSchema, deleteRows } from './sheets/basic/gsheets_delete_rows.js';
import { schema as gsheetsDeleteColumnsSchema, deleteColumns } from './sheets/basic/gsheets_delete_columns.js';
import { schema as gsheetsCopySheetSchema, copySheet } from './sheets/basic/gsheets_copy_sheet.js';
import { schema as gsheetsCopyToSchema, copyTo } from './sheets/basic/gsheets_copy_to.js';
import { schema as gsheetsDuplicateSheetSchema, duplicateSheet } from './sheets/basic/gsheets_duplicate_sheet.js';
import { schema as gsheetsRenameSheetSchema, renameSheet } from './sheets/basic/gsheets_rename_sheet.js';
import { schema as gsheetsCreateSpreadsheetSchema, createSpreadsheet } from './sheets/basic/gsheets_create_spreadsheet.js';

// Data operations
import { schema as gsheetsUpdateCellSchema, updateCell } from './sheets/data/gsheets_update_cell.js';
import { schema as gsheetsAppendDataSchema, appendData } from './sheets/data/gsheets_append_data.js';
import { schema as gsheetsBatchUpdateSchema, batchUpdate } from './sheets/data/gsheets_batch_update.js';
import { schema as gsheetsClearDataSchema, clearData } from './sheets/data/gsheets_clear_data.js';
import { schema as gsheetsBatchClearSchema, batchClear } from './sheets/data/gsheets_batch_clear.js';
import { schema as gsheetsSortRangeSchema, sortRange } from './sheets/data/gsheets_sort_range.js';
import { schema as gsheetsFindReplaceSchema, findReplace } from './sheets/data/gsheets_find_replace.js';
import { schema as gsheetsSetDataValidationSchema, setDataValidation } from './sheets/data/gsheets_set_data_validation.js';
import { schema as gsheetsCreateFilterSchema, createFilter } from './sheets/data/gsheets_create_filter.js';

// Formatting operations
import { schema as gsheetsFormatCellsSchema, formatCells } from './sheets/formatting/gsheets_format_cells.js';
import { schema as gsheetsMergeCellsSchema, mergeCells } from './sheets/formatting/gsheets_merge_cells.js';
import { schema as gsheetsUnmergeCellsSchema, unmergeCells } from './sheets/formatting/gsheets_unmerge_cells.js';
import { schema as gsheetsUpdateBordersSchema, updateBorders } from './sheets/formatting/gsheets_update_borders.js';
import { schema as gsheetsAutoResizeSchema, autoResize } from './sheets/formatting/gsheets_auto_resize.js';
import { schema as gsheetsSetNumberFormatSchema, setNumberFormat } from './sheets/formatting/gsheets_set_number_format.js';
import { schema as gsheetsFreezeRowsSchema, freezeRows } from './sheets/formatting/gsheets_freeze_rows.js';
import { schema as gsheetsFreezeColumnsSchema, freezeColumns } from './sheets/formatting/gsheets_freeze_columns.js';

// Chart operations
import { schema as gsheetsAddChartSchema, addChart } from './sheets/charts/gsheets_add_chart.js';
import { schema as gsheetsUpdateChartSchema, updateChart } from './sheets/charts/gsheets_update_chart.js';
import { schema as gsheetsDeleteChartSchema, deleteChart } from './sheets/charts/gsheets_delete_chart.js';
import { schema as gsheetsAddHistogramSchema, addHistogram } from './sheets/charts/gsheets_add_histogram.js';
import { schema as gsheetsAddWaterfallSchema, addWaterfall } from './sheets/charts/gsheets_add_waterfall.js';
import { schema as gsheetsAddCandlestickSchema, addCandlestick } from './sheets/charts/gsheets_add_candlestick.js';
import { schema as gsheetsAddComboSchema, addCombo } from './sheets/charts/gsheets_add_combo.js';
import { schema as gsheetsAddBubbleSchema, addBubble } from './sheets/charts/gsheets_add_bubble.js';
import { schema as gsheetsAddTreemapSchema, addTreemap } from './sheets/charts/gsheets_add_treemap.js';
import { schema as gsheetsAddOrgChartSchema, addOrgChart } from './sheets/charts/gsheets_add_org_chart.js';

// Protection operations
import { schema as gsheetsAddProtectedRangeSchema, addProtectedRange } from './sheets/protection/gsheets_add_protected_range.js';
import { schema as gsheetsDeleteProtectedRangeSchema, deleteProtectedRange } from './sheets/protection/gsheets_delete_protected_range.js';
import { schema as gsheetsUpdateProtectedRangeSchema, updateProtectedRange } from './sheets/protection/gsheets_update_protected_range.js';
import { schema as gsheetsAddNamedRangeSchema, addNamedRange } from './sheets/protection/gsheets_add_named_range.js';
import { schema as gsheetsUpdateNamedRangeSchema, updateNamedRange } from './sheets/protection/gsheets_update_named_range.js';
import { schema as gsheetsDeleteNamedRangeSchema, deleteNamedRange } from './sheets/protection/gsheets_delete_named_range.js';
import { schema as gsheetsAddConditionalFormatSchema, addConditionalFormat } from './sheets/protection/gsheets_add_conditional_format.js';

// Advanced operations
import { schema as gsheetsAddFilterViewSchema, addFilterView } from './sheets/advanced/gsheets_add_filter_view.js';
import { schema as gsheetsAddPivotTableSchema, addPivotTable } from './sheets/advanced/gsheets_add_pivot_table.js';
import { schema as gsheetsAddDimensionGroupSchema, addDimensionGroup } from './sheets/advanced/gsheets_add_dimension_group.js';
import { schema as gsheetsDeleteDimensionGroupSchema, deleteDimensionGroup } from './sheets/advanced/gsheets_delete_dimension_group.js';
import { schema as gsheetsUpdateDimensionGroupSchema, updateDimensionGroup } from './sheets/advanced/gsheets_update_dimension_group.js';
import { schema as gsheetsCreateDeveloperMetadataSchema, createDeveloperMetadata } from './sheets/advanced/gsheets_create_developer_metadata.js';
import { schema as gsheetsUpdateDeveloperMetadataSchema, updateDeveloperMetadata } from './sheets/advanced/gsheets_update_developer_metadata.js';
import { schema as gsheetsDeleteDeveloperMetadataSchema, deleteDeveloperMetadata } from './sheets/advanced/gsheets_delete_developer_metadata.js';

// Google Docs - Basic operations
import { schema as gdocsCreateSchema, createDocument } from './docs/basic/gdocs_create.js';
import { schema as gdocsReadSchema, readDocument } from './docs/basic/gdocs_read.js';
import { schema as gdocsGetMetadataSchema, getMetadata } from './docs/basic/gdocs_get_metadata.js';
import { schema as gdocsListDocumentsSchema, listDocuments } from './docs/basic/gdocs_list_documents.js';

// Google Docs - Content/Formatting operations
import { schema as gdocsInsertTextSchema, insertText } from './docs/content/gdocs_insert_text.js';
import { schema as gdocsUpdateTextSchema, updateText } from './docs/content/gdocs_update_text.js';
import { schema as gdocsDeleteTextSchema, deleteText } from './docs/content/gdocs_delete_text.js';
import { schema as gdocsReplaceTextSchema, replaceText } from './docs/content/gdocs_replace_text.js';
import { schema as gdocsAppendTextSchema, appendText } from './docs/content/gdocs_append_text.js';
import { schema as gdocsFormatTextSchema, formatText } from './docs/content/gdocs_format_text.js';
import { schema as gdocsCreateHeadingSchema, createHeading } from './docs/content/gdocs_create_heading.js';
import { schema as gdocsCreateListSchema, createList } from './docs/content/gdocs_create_list.js';
import { schema as gdocsSetAlignmentSchema, setAlignment } from './docs/content/gdocs_set_alignment.js';
import { schema as gdocsApplyStyleSchema, applyStyle } from './docs/content/gdocs_apply_style.js';

// Google Docs - Elements/Advanced operations
import { schema as gdocsInsertImageSchema, insertImage } from './docs/elements/gdocs_insert_image.js';
import { schema as gdocsCreateTableSchema, createTable } from './docs/elements/gdocs_create_table.js';
import { schema as gdocsInsertPageBreakSchema, insertPageBreak } from './docs/elements/gdocs_insert_page_break.js';
import { schema as gdocsInsertLinkSchema, insertLink } from './docs/elements/gdocs_insert_link.js';
import { schema as gdocsInsertTocSchema, insertToc } from './docs/elements/gdocs_insert_toc.js';
import { schema as gdocsBatchUpdateSchema, batchUpdate as gdocsBatchUpdate } from './docs/elements/gdocs_batch_update.js';
import { schema as gdocsMergeDocumentsSchema, mergeDocuments } from './docs/elements/gdocs_merge_documents.js';
import { schema as gdocsExportSchema, exportDocument } from './docs/elements/gdocs_export.js';
import { schema as gdocsSuggestModeSchema, suggestMode } from './docs/elements/gdocs_suggest_mode.js';

// Gmail - Basic operations
import { schema as gmailListLabelsSchema, listLabels } from './gmail/basic/gmail_list_labels.js';
import { schema as gmailSearchMessagesSchema, searchMessages } from './gmail/basic/gmail_search_messages.js';
import { schema as gmailGetMessageSchema, getMessage } from './gmail/basic/gmail_get_message.js';
import { schema as gmailGetThreadSchema, getThread } from './gmail/basic/gmail_get_thread.js';

// Gmail - Labels operations
import { schema as gmailModifyLabelsSchema, modifyLabels } from './gmail/labels/gmail_modify_labels.js';
import { schema as gmailManageLabelSchema, manageLabel } from './gmail/labels/gmail_manage_label.js';

// Gmail - Send operations
import { schema as gmailSendMessageSchema, sendMessage } from './gmail/send/gmail_send_message.js';
import { schema as gmailDraftMessageSchema, draftMessage } from './gmail/send/gmail_draft_message.js';

// Gmail - Batch operations
import { schema as gmailGetMessagesBatchSchema, getMessagesBatch } from './gmail/batch/gmail_get_messages_batch.js';
import { schema as gmailGetThreadsBatchSchema, getThreadsBatch } from './gmail/batch/gmail_get_threads_batch.js';
import { schema as gmailBatchModifyLabelsSchema, batchModifyLabels } from './gmail/batch/gmail_batch_modify_labels.js';

// Calendar - Basic operations
import { schema as calendarListEventsSchema, listEvents } from './calendar/basic/calendar_list_events.js';
import { schema as calendarGetEventSchema, getEvent } from './calendar/basic/calendar_get_event.js';
import { schema as calendarCreateEventSchema, createEvent } from './calendar/basic/calendar_create_event.js';
import { schema as calendarUpdateEventSchema, updateEvent } from './calendar/basic/calendar_update_event.js';
import { schema as calendarDeleteEventSchema, deleteEvent } from './calendar/basic/calendar_delete_event.js';

// Calendar - Free/busy operations
import { schema as calendarFreeBusyQuerySchema, queryFreeBusy } from './calendar/freebusy/calendar_freebusy_query.js';

// Calendar - CalendarList operations
import { schema as calendarListListSchema, listCalendarList } from './calendar/calendarlist/calendar_calendarlist_list.js';
import { schema as calendarListGetSchema, getCalendarListEntry } from './calendar/calendarlist/calendar_calendarlist_get.js';

// Calendar - Events advanced operations
import { schema as calendarEventsQuickAddSchema, quickAddEvent } from './calendar/events_advanced/calendar_events_quickadd.js';
import { schema as calendarEventsInstancesSchema, listEventInstances } from './calendar/events_advanced/calendar_events_instances.js';
import { schema as calendarEventsMoveSchema, moveEvent } from './calendar/events_advanced/calendar_events_move.js';

// Calendar - Colors operations
import { schema as calendarColorsGetSchema, getColors } from './calendar/colors/calendar_colors_get.js';

// Calendar - Calendars operations
import { schema as calendarCalendarsInsertSchema, insertCalendar } from './calendar/calendars/calendar_calendars_insert.js';
import { schema as calendarCalendarsGetSchema, getCalendar } from './calendar/calendars/calendar_calendars_get.js';
import { schema as calendarCalendarsUpdateSchema, updateCalendar } from './calendar/calendars/calendar_calendars_update.js';

// Calendar - ACL operations
import { schema as calendarAclListSchema, listAcl } from './calendar/acl/calendar_acl_list.js';
import { schema as calendarAclInsertSchema, insertAcl } from './calendar/acl/calendar_acl_insert.js';

// Calendar - Settings operations
import { schema as calendarSettingsListSchema, listSettings } from './calendar/settings/calendar_settings_list.js';

// Slides - Basic operations
import { schema as slidesCreatePresentationSchema, createPresentation } from './slides/basic/slides_create_presentation.js';
import { schema as slidesGetPresentationSchema, getPresentation } from './slides/basic/slides_get_presentation.js';
import { schema as slidesAddSlideSchema, addSlide } from './slides/basic/slides_add_slide.js';

// Slides - Content operations
import { schema as slidesInsertTextSchema, insertText as slidesInsertText } from './slides/content/slides_insert_text.js';
import { schema as slidesInsertImageSchema, insertImage as slidesInsertImage } from './slides/content/slides_insert_image.js';

// Slides - Batch operations
import { schema as slidesBatchUpdateSchema, batchUpdate as slidesBatchUpdate } from './slides/batch/slides_batch_update.js';

// Slides - Reading operations (additional)
import { schema as slidesGetPageSchema, getPage } from './slides/basic/slides_get_page.js';

// Slides - Editing operations
import { schema as slidesDuplicateSlideSchema, duplicateSlide } from './slides/editing/slides_duplicate_slide.js';
import { schema as slidesUpdateSlidesPositionSchema, updateSlidesPosition } from './slides/editing/slides_update_slides_position.js';
import { schema as slidesReplaceAllTextSchema, replaceAllText } from './slides/editing/slides_replace_all_text.js';
import { schema as slidesDeleteObjectSchema, deleteObject } from './slides/editing/slides_delete_object.js';

import {
  Tool,
  GDriveSearchInput,
  GDriveReadFileInput,
  GDriveListFilesInput,
  GDriveGetMetadataInput,
  GDriveUploadFileInput,
  GDriveCreateFileInput,
  GDriveDeleteFileInput,
  GDriveCopyFileInput,
  GDriveMoveFileInput,
  GDriveRenameFileInput,
  GDriveUpdateFileInput,
  GDriveCreateFolderInput,
  GDriveListFolderContentsInput,
  GDriveMoveToFolderInput,
  GDriveShareFileInput,
  GDriveListPermissionsInput,
  GDriveUpdatePermissionInput,
  GDriveRemovePermissionInput,
  GDriveExportFileInput,
  GDriveListRevisionsInput,
  GDriveEmptyTrashInput,
  GSheetsUpdateCellInput,
  GSheetsReadInput,
  GSheetsListSheetsInput,
  GSheetsAddSheetInput,
  GSheetsDeleteSheetInput,
  GSheetsInsertRowsInput,
  GSheetsInsertColumnsInput,
  GSheetsDeleteRowsInput,
  GSheetsDeleteColumnsInput,
  GSheetsAppendDataInput,
  GSheetsBatchUpdateInput,
  GSheetsClearDataInput,
  GSheetsCopySheetInput,
  GSheetsCopyToInput,
  GSheetsMergeCellsInput,
  GSheetsUnmergeCellsInput,
  GSheetsUpdateBordersInput,
  GSheetsFormatCellsInput,
  GSheetsSortRangeInput,
  GSheetsCreateSpreadsheetInput,
  GSheetsDuplicateSheetInput,
  GSheetsRenameSheetInput,
  GSheetsBatchClearInput,
  GSheetsAutoResizeInput,
  GSheetsSetNumberFormatInput,
  GSheetsSetDataValidationInput,
  GSheetsAddConditionalFormatInput,
  GSheetsCreateFilterInput,
  GSheetsAddProtectedRangeInput,
  GSheetsDeleteProtectedRangeInput,
  GSheetsUpdateProtectedRangeInput,
  GSheetsFindReplaceInput,
  GSheetsAddNamedRangeInput,
  GSheetsUpdateNamedRangeInput,
  GSheetsDeleteNamedRangeInput,
  GSheetsFreezeRowsInput,
  GSheetsFreezeColumnsInput,
  GSheetsAddChartInput,
  GSheetsUpdateChartInput,
  GSheetsDeleteChartInput,
  GSheetsAddHistogramInput,
  GSheetsAddWaterfallInput,
  GSheetsAddCandlestickInput,
  GSheetsAddComboInput,
  GSheetsAddBubbleInput,
  GSheetsAddTreemapInput,
  GSheetsAddOrgChartInput,
  GSheetsAddFilterViewInput,
  GSheetsAddPivotTableInput,
  GSheetsAddDimensionGroupInput,
  GSheetsDeleteDimensionGroupInput,
  GSheetsUpdateDimensionGroupInput,
  GSheetsCreateDeveloperMetadataInput,
  GSheetsUpdateDeveloperMetadataInput,
  GSheetsDeleteDeveloperMetadataInput,
  GDocsCreateInput,
  GDocsReadInput,
  GDocsGetMetadataInput,
  GDocsListDocumentsInput,
  GDocsInsertTextInput,
  GDocsUpdateTextInput,
  GDocsDeleteTextInput,
  GDocsReplaceTextInput,
  GDocsAppendTextInput,
  GDocsFormatTextInput,
  GDocsCreateHeadingInput,
  GDocsCreateListInput,
  GDocsSetAlignmentInput,
  GDocsApplyStyleInput,
  GDocsInsertImageInput,
  GDocsCreateTableInput,
  GDocsInsertPageBreakInput,
  GDocsInsertLinkInput,
  GDocsInsertTocInput,
  GDocsBatchUpdateInput,
  GDocsMergeDocumentsInput,
  GDocsExportInput,
  GDocsSuggestModeInput,
  GmailListLabelsInput,
  GmailSearchMessagesInput,
  GmailGetMessageInput,
  GmailGetThreadInput,
  GmailModifyLabelsInput,
  GmailManageLabelInput,
  GmailSendMessageInput,
  GmailDraftMessageInput,
  GmailGetMessagesBatchInput,
  GmailGetThreadsBatchInput,
  GmailBatchModifyLabelsInput,
  CalendarListEventsInput,
  CalendarGetEventInput,
  CalendarCreateEventInput,
  CalendarUpdateEventInput,
  CalendarDeleteEventInput,
  CalendarFreeBusyQueryInput,
  CalendarListListInput,
  CalendarListGetInput,
  CalendarEventsQuickAddInput,
  CalendarEventsInstancesInput,
  CalendarEventsMoveInput,
  CalendarCalendarsInsertInput,
  CalendarCalendarsGetInput,
  CalendarCalendarsUpdateInput,
  CalendarAclListInput,
  CalendarAclInsertInput,
  CalendarSettingsListInput,
  SlidesCreatePresentationInput,
  SlidesGetPresentationInput,
  SlidesAddSlideInput,
  SlidesInsertTextInput,
  SlidesInsertImageInput,
  SlidesBatchUpdateInput,
  SlidesGetPageInput,
  SlidesDuplicateSlideInput,
  SlidesUpdateSlidesPositionInput,
  SlidesReplaceAllTextInput,
  SlidesDeleteObjectInput
} from './types.js';

export const tools: [
  Tool<GDriveSearchInput>,
  Tool<GDriveReadFileInput>,
  Tool<GDriveListFilesInput>,
  Tool<GDriveGetMetadataInput>,
  Tool<GDriveUploadFileInput>,
  Tool<GDriveCreateFileInput>,
  Tool<GDriveDeleteFileInput>,
  Tool<GDriveCopyFileInput>,
  Tool<GDriveMoveFileInput>,
  Tool<GDriveRenameFileInput>,
  Tool<GDriveUpdateFileInput>,
  Tool<GDriveCreateFolderInput>,
  Tool<GDriveListFolderContentsInput>,
  Tool<GDriveMoveToFolderInput>,
  Tool<GDriveShareFileInput>,
  Tool<GDriveListPermissionsInput>,
  Tool<GDriveUpdatePermissionInput>,
  Tool<GDriveRemovePermissionInput>,
  Tool<GDriveExportFileInput>,
  Tool<GDriveListRevisionsInput>,
  Tool<GDriveEmptyTrashInput>,
  Tool<GSheetsUpdateCellInput>,
  Tool<GSheetsReadInput>,
  Tool<GSheetsListSheetsInput>,
  Tool<GSheetsAddSheetInput>,
  Tool<GSheetsDeleteSheetInput>,
  Tool<GSheetsInsertRowsInput>,
  Tool<GSheetsInsertColumnsInput>,
  Tool<GSheetsDeleteRowsInput>,
  Tool<GSheetsDeleteColumnsInput>,
  Tool<GSheetsAppendDataInput>,
  Tool<GSheetsBatchUpdateInput>,
  Tool<GSheetsClearDataInput>,
  Tool<GSheetsCopySheetInput>,
  Tool<GSheetsCopyToInput>,
  Tool<GSheetsMergeCellsInput>,
  Tool<GSheetsUnmergeCellsInput>,
  Tool<GSheetsUpdateBordersInput>,
  Tool<GSheetsFormatCellsInput>,
  Tool<GSheetsSortRangeInput>,
  Tool<GSheetsCreateSpreadsheetInput>,
  Tool<GSheetsDuplicateSheetInput>,
  Tool<GSheetsRenameSheetInput>,
  Tool<GSheetsBatchClearInput>,
  Tool<GSheetsAutoResizeInput>,
  Tool<GSheetsSetNumberFormatInput>,
  Tool<GSheetsSetDataValidationInput>,
  Tool<GSheetsAddConditionalFormatInput>,
  Tool<GSheetsCreateFilterInput>,
  Tool<GSheetsAddProtectedRangeInput>,
  Tool<GSheetsDeleteProtectedRangeInput>,
  Tool<GSheetsUpdateProtectedRangeInput>,
  Tool<GSheetsFindReplaceInput>,
  Tool<GSheetsAddNamedRangeInput>,
  Tool<GSheetsUpdateNamedRangeInput>,
  Tool<GSheetsDeleteNamedRangeInput>,
  Tool<GSheetsFreezeRowsInput>,
  Tool<GSheetsFreezeColumnsInput>,
  Tool<GSheetsAddChartInput>,
  Tool<GSheetsUpdateChartInput>,
  Tool<GSheetsDeleteChartInput>,
  Tool<GSheetsAddHistogramInput>,
  Tool<GSheetsAddWaterfallInput>,
  Tool<GSheetsAddCandlestickInput>,
  Tool<GSheetsAddComboInput>,
  Tool<GSheetsAddBubbleInput>,
  Tool<GSheetsAddTreemapInput>,
  Tool<GSheetsAddOrgChartInput>,
  Tool<GSheetsAddFilterViewInput>,
  Tool<GSheetsAddPivotTableInput>,
  Tool<GSheetsAddDimensionGroupInput>,
  Tool<GSheetsDeleteDimensionGroupInput>,
  Tool<GSheetsUpdateDimensionGroupInput>,
  Tool<GSheetsCreateDeveloperMetadataInput>,
  Tool<GSheetsUpdateDeveloperMetadataInput>,
  Tool<GSheetsDeleteDeveloperMetadataInput>,
  Tool<GDocsCreateInput>,
  Tool<GDocsReadInput>,
  Tool<GDocsGetMetadataInput>,
  Tool<GDocsListDocumentsInput>,
  Tool<GDocsInsertTextInput>,
  Tool<GDocsUpdateTextInput>,
  Tool<GDocsDeleteTextInput>,
  Tool<GDocsReplaceTextInput>,
  Tool<GDocsAppendTextInput>,
  Tool<GDocsFormatTextInput>,
  Tool<GDocsCreateHeadingInput>,
  Tool<GDocsCreateListInput>,
  Tool<GDocsSetAlignmentInput>,
  Tool<GDocsApplyStyleInput>,
  Tool<GDocsInsertImageInput>,
  Tool<GDocsCreateTableInput>,
  Tool<GDocsInsertPageBreakInput>,
  Tool<GDocsInsertLinkInput>,
  Tool<GDocsInsertTocInput>,
  Tool<GDocsBatchUpdateInput>,
  Tool<GDocsMergeDocumentsInput>,
  Tool<GDocsExportInput>,
  Tool<GDocsSuggestModeInput>,
  Tool<GmailListLabelsInput>,
  Tool<GmailSearchMessagesInput>,
  Tool<GmailGetMessageInput>,
  Tool<GmailGetThreadInput>,
  Tool<GmailModifyLabelsInput>,
  Tool<GmailManageLabelInput>,
  Tool<GmailSendMessageInput>,
  Tool<GmailDraftMessageInput>,
  Tool<GmailGetMessagesBatchInput>,
  Tool<GmailGetThreadsBatchInput>,
  Tool<GmailBatchModifyLabelsInput>,
  Tool<CalendarListEventsInput>,
  Tool<CalendarGetEventInput>,
  Tool<CalendarCreateEventInput>,
  Tool<CalendarUpdateEventInput>,
  Tool<CalendarDeleteEventInput>,
  Tool<CalendarFreeBusyQueryInput>,
  Tool<CalendarListListInput>,
  Tool<CalendarListGetInput>,
  Tool<CalendarEventsQuickAddInput>,
  Tool<CalendarEventsInstancesInput>,
  Tool<CalendarEventsMoveInput>,
  Tool<{}>,  // CalendarColorsGetInput (no parameters)
  Tool<CalendarCalendarsInsertInput>,
  Tool<CalendarCalendarsGetInput>,
  Tool<CalendarCalendarsUpdateInput>,
  Tool<CalendarAclListInput>,
  Tool<CalendarAclInsertInput>,
  Tool<CalendarSettingsListInput>,
  Tool<SlidesCreatePresentationInput>,
  Tool<SlidesGetPresentationInput>,
  Tool<SlidesAddSlideInput>,
  Tool<SlidesInsertTextInput>,
  Tool<SlidesInsertImageInput>,
  Tool<SlidesBatchUpdateInput>,
  Tool<SlidesGetPageInput>,
  Tool<SlidesDuplicateSlideInput>,
  Tool<SlidesUpdateSlidesPositionInput>,
  Tool<SlidesReplaceAllTextInput>,
  Tool<SlidesDeleteObjectInput>
] = [
  // Drive - Basic operations
  {
    ...driveSearchSchema,
    handler: search,
  },
  {
    ...driveReadFileSchema,
    handler: readFile,
  },
  {
    ...driveListFilesSchema,
    handler: listFiles,
  },
  {
    ...driveGetMetadataSchema,
    handler: driveGetMetadata,
  },
  // Drive - File operations
  {
    ...driveUploadFileSchema,
    handler: uploadFile,
  },
  {
    ...driveCreateFileSchema,
    handler: createFile,
  },
  {
    ...driveDeleteFileSchema,
    handler: deleteFile,
  },
  {
    ...driveCopyFileSchema,
    handler: copyFile,
  },
  {
    ...driveMoveFileSchema,
    handler: moveFile,
  },
  {
    ...driveRenameFileSchema,
    handler: renameFile,
  },
  {
    ...driveUpdateFileSchema,
    handler: updateFile,
  },
  // Drive - Folder operations
  {
    ...driveCreateFolderSchema,
    handler: createFolder,
  },
  {
    ...driveListFolderContentsSchema,
    handler: listFolderContents,
  },
  {
    ...driveMoveToFolderSchema,
    handler: moveToFolder,
  },
  // Drive - Permissions operations
  {
    ...driveShareFileSchema,
    handler: shareFile,
  },
  {
    ...driveListPermissionsSchema,
    handler: listPermissions,
  },
  {
    ...driveUpdatePermissionSchema,
    handler: updatePermission,
  },
  {
    ...driveRemovePermissionSchema,
    handler: removePermission,
  },
  // Drive - Advanced operations
  {
    ...driveExportFileSchema,
    handler: exportFile,
  },
  {
    ...driveListRevisionsSchema,
    handler: listRevisions,
  },
  {
    ...driveEmptyTrashSchema,
    handler: emptyTrash,
  },
  // Google Sheets - Basic operations
  {
    ...gsheetsUpdateCellSchema,
    handler: updateCell,
  },
  {
    ...gsheetsReadSchema,
    handler: readSheet,
  },
  {
    ...gsheetsListSheetsSchema,
    handler: listSheets,
  },
  {
    ...gsheetsAddSheetSchema,
    handler: addSheet,
  },
  {
    ...gsheetsDeleteSheetSchema,
    handler: deleteSheet,
  },
  {
    ...gsheetsInsertRowsSchema,
    handler: insertRows,
  },
  {
    ...gsheetsInsertColumnsSchema,
    handler: insertColumns,
  },
  {
    ...gsheetsDeleteRowsSchema,
    handler: deleteRows,
  },
  {
    ...gsheetsDeleteColumnsSchema,
    handler: deleteColumns,
  },
  {
    ...gsheetsAppendDataSchema,
    handler: appendData,
  },
  {
    ...gsheetsBatchUpdateSchema,
    handler: batchUpdate,
  },
  {
    ...gsheetsClearDataSchema,
    handler: clearData,
  },
  {
    ...gsheetsCopySheetSchema,
    handler: copySheet,
  },
  {
    ...gsheetsCopyToSchema,
    handler: copyTo,
  },
  {
    ...gsheetsMergeCellsSchema,
    handler: mergeCells,
  },
  {
    ...gsheetsUnmergeCellsSchema,
    handler: unmergeCells,
  },
  {
    ...gsheetsUpdateBordersSchema,
    handler: updateBorders,
  },
  {
    ...gsheetsFormatCellsSchema,
    handler: formatCells,
  },
  {
    ...gsheetsSortRangeSchema,
    handler: sortRange,
  },
  {
    ...gsheetsCreateSpreadsheetSchema,
    handler: createSpreadsheet,
  },
  {
    ...gsheetsDuplicateSheetSchema,
    handler: duplicateSheet,
  },
  {
    ...gsheetsRenameSheetSchema,
    handler: renameSheet,
  },
  {
    ...gsheetsBatchClearSchema,
    handler: batchClear,
  },
  {
    ...gsheetsAutoResizeSchema,
    handler: autoResize,
  },
  {
    ...gsheetsSetNumberFormatSchema,
    handler: setNumberFormat,
  },
  {
    ...gsheetsSetDataValidationSchema,
    handler: setDataValidation,
  },
  {
    ...gsheetsAddConditionalFormatSchema,
    handler: addConditionalFormat,
  },
  {
    ...gsheetsCreateFilterSchema,
    handler: createFilter,
  },
  {
    ...gsheetsAddProtectedRangeSchema,
    handler: addProtectedRange,
  },
  {
    ...gsheetsDeleteProtectedRangeSchema,
    handler: deleteProtectedRange,
  },
  {
    ...gsheetsUpdateProtectedRangeSchema,
    handler: updateProtectedRange,
  },
  {
    ...gsheetsFindReplaceSchema,
    handler: findReplace,
  },
  {
    ...gsheetsAddNamedRangeSchema,
    handler: addNamedRange,
  },
  {
    ...gsheetsUpdateNamedRangeSchema,
    handler: updateNamedRange,
  },
  {
    ...gsheetsDeleteNamedRangeSchema,
    handler: deleteNamedRange,
  },
  {
    ...gsheetsFreezeRowsSchema,
    handler: freezeRows,
  },
  {
    ...gsheetsFreezeColumnsSchema,
    handler: freezeColumns,
  },
  {
    ...gsheetsAddChartSchema,
    handler: addChart,
  },
  {
    ...gsheetsUpdateChartSchema,
    handler: updateChart,
  },
  {
    ...gsheetsDeleteChartSchema,
    handler: deleteChart,
  },
  {
    ...gsheetsAddHistogramSchema,
    handler: addHistogram,
  },
  {
    ...gsheetsAddWaterfallSchema,
    handler: addWaterfall,
  },
  {
    ...gsheetsAddCandlestickSchema,
    handler: addCandlestick,
  },
  {
    ...gsheetsAddComboSchema,
    handler: addCombo,
  },
  {
    ...gsheetsAddBubbleSchema,
    handler: addBubble,
  },
  {
    ...gsheetsAddTreemapSchema,
    handler: addTreemap,
  },
  {
    ...gsheetsAddOrgChartSchema,
    handler: addOrgChart,
  },
  {
    ...gsheetsAddFilterViewSchema,
    handler: addFilterView,
  },
  {
    ...gsheetsAddPivotTableSchema,
    handler: addPivotTable,
  },
  {
    ...gsheetsAddDimensionGroupSchema,
    handler: addDimensionGroup,
  },
  {
    ...gsheetsDeleteDimensionGroupSchema,
    handler: deleteDimensionGroup,
  },
  {
    ...gsheetsUpdateDimensionGroupSchema,
    handler: updateDimensionGroup,
  },
  {
    ...gsheetsCreateDeveloperMetadataSchema,
    handler: createDeveloperMetadata,
  },
  {
    ...gsheetsUpdateDeveloperMetadataSchema,
    handler: updateDeveloperMetadata,
  },
  {
    ...gsheetsDeleteDeveloperMetadataSchema,
    handler: deleteDeveloperMetadata,
  },
  // Google Docs tools
  {
    ...gdocsCreateSchema,
    handler: createDocument,
  },
  {
    ...gdocsReadSchema,
    handler: readDocument,
  },
  {
    ...gdocsGetMetadataSchema,
    handler: getMetadata,
  },
  {
    ...gdocsListDocumentsSchema,
    handler: listDocuments,
  },
  {
    ...gdocsInsertTextSchema,
    handler: insertText,
  },
  {
    ...gdocsUpdateTextSchema,
    handler: updateText,
  },
  {
    ...gdocsDeleteTextSchema,
    handler: deleteText,
  },
  {
    ...gdocsReplaceTextSchema,
    handler: replaceText,
  },
  {
    ...gdocsAppendTextSchema,
    handler: appendText,
  },
  {
    ...gdocsFormatTextSchema,
    handler: formatText,
  },
  {
    ...gdocsCreateHeadingSchema,
    handler: createHeading,
  },
  {
    ...gdocsCreateListSchema,
    handler: createList,
  },
  {
    ...gdocsSetAlignmentSchema,
    handler: setAlignment,
  },
  {
    ...gdocsApplyStyleSchema,
    handler: applyStyle,
  },
  {
    ...gdocsInsertImageSchema,
    handler: insertImage,
  },
  {
    ...gdocsCreateTableSchema,
    handler: createTable,
  },
  {
    ...gdocsInsertPageBreakSchema,
    handler: insertPageBreak,
  },
  {
    ...gdocsInsertLinkSchema,
    handler: insertLink,
  },
  {
    ...gdocsInsertTocSchema,
    handler: insertToc,
  },
  {
    ...gdocsBatchUpdateSchema,
    handler: gdocsBatchUpdate,
  },
  {
    ...gdocsMergeDocumentsSchema,
    handler: mergeDocuments,
  },
  {
    ...gdocsExportSchema,
    handler: exportDocument,
  },
  {
    ...gdocsSuggestModeSchema,
    handler: suggestMode,
  },
  // Gmail tools
  {
    ...gmailListLabelsSchema,
    handler: listLabels,
  },
  {
    ...gmailSearchMessagesSchema,
    handler: searchMessages,
  },
  {
    ...gmailGetMessageSchema,
    handler: getMessage,
  },
  {
    ...gmailGetThreadSchema,
    handler: getThread,
  },
  {
    ...gmailModifyLabelsSchema,
    handler: modifyLabels,
  },
  {
    ...gmailManageLabelSchema,
    handler: manageLabel,
  },
  {
    ...gmailSendMessageSchema,
    handler: sendMessage,
  },
  {
    ...gmailDraftMessageSchema,
    handler: draftMessage,
  },
  {
    ...gmailGetMessagesBatchSchema,
    handler: getMessagesBatch,
  },
  {
    ...gmailGetThreadsBatchSchema,
    handler: getThreadsBatch,
  },
  {
    ...gmailBatchModifyLabelsSchema,
    handler: batchModifyLabels,
  },

  // Calendar tools
  {
    ...calendarListEventsSchema,
    handler: listEvents,
  },
  {
    ...calendarGetEventSchema,
    handler: getEvent,
  },
  {
    ...calendarCreateEventSchema,
    handler: createEvent,
  },
  {
    ...calendarUpdateEventSchema,
    handler: updateEvent,
  },
  {
    ...calendarDeleteEventSchema,
    handler: deleteEvent,
  },
  {
    ...calendarFreeBusyQuerySchema,
    handler: queryFreeBusy,
  },
  {
    ...calendarListListSchema,
    handler: listCalendarList,
  },
  {
    ...calendarListGetSchema,
    handler: getCalendarListEntry,
  },
  {
    ...calendarEventsQuickAddSchema,
    handler: quickAddEvent,
  },
  {
    ...calendarEventsInstancesSchema,
    handler: listEventInstances,
  },
  {
    ...calendarEventsMoveSchema,
    handler: moveEvent,
  },
  {
    ...calendarColorsGetSchema,
    handler: getColors,
  },
  {
    ...calendarCalendarsInsertSchema,
    handler: insertCalendar,
  },
  {
    ...calendarCalendarsGetSchema,
    handler: getCalendar,
  },
  {
    ...calendarCalendarsUpdateSchema,
    handler: updateCalendar,
  },
  {
    ...calendarAclListSchema,
    handler: listAcl,
  },
  {
    ...calendarAclInsertSchema,
    handler: insertAcl,
  },
  {
    ...calendarSettingsListSchema,
    handler: listSettings,
  },
  // Slides - Basic operations
  {
    ...slidesCreatePresentationSchema,
    handler: createPresentation,
  },
  {
    ...slidesGetPresentationSchema,
    handler: getPresentation,
  },
  {
    ...slidesAddSlideSchema,
    handler: addSlide,
  },
  // Slides - Content operations
  {
    ...slidesInsertTextSchema,
    handler: slidesInsertText,
  },
  {
    ...slidesInsertImageSchema,
    handler: slidesInsertImage,
  },
  // Slides - Batch operations
  {
    ...slidesBatchUpdateSchema,
    handler: slidesBatchUpdate,
  },
  // Slides - Reading operations (additional)
  {
    ...slidesGetPageSchema,
    handler: getPage,
  },
  // Slides - Editing operations
  {
    ...slidesDuplicateSlideSchema,
    handler: duplicateSlide,
  },
  {
    ...slidesUpdateSlidesPositionSchema,
    handler: updateSlidesPosition,
  },
  {
    ...slidesReplaceAllTextSchema,
    handler: replaceAllText,
  },
  {
    ...slidesDeleteObjectSchema,
    handler: deleteObject,
  }
];
