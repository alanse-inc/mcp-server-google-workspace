# Google Workspace MCP API 機能比較表

最終更新: 2026-01-06

このドキュメントは、MCP Google Workspaceサーバーで実装されている機能と、各Google Workspace APIで提供されている機能の詳細な比較表です。

---

## 📊 統計サマリー

### 全体実装状況

| サービス | MCP実装数 | 備考 |
| --------- | ----------- | ------ |
| **Google Drive** | 21 | ファイル操作・フォルダ管理・権限管理・高度な機能 |
| **Google Sheets** | 57 | 完全なスプレッドシート操作 |
| **Google Docs** | 23 | ドキュメント作成・編集 |
| **Gmail** | 11 | メール操作・ラベル管理・送信 |
| **総計** | **112** | - |

### Google Drive 実装状況

| カテゴリ | MCP実装数 | Drive API提供数 | カバー率 |
|---------|-----------|-----------------|---------|
| **Basic Operations** | 4 | 4 | 100% |
| **File Operations** | 7 | 7 | 100% |
| **Folder Management** | 3 | 3 | 100% |
| **Permissions** | 4 | 4 | 100% |
| **Advanced** | 3 | 3 | 100% |
| **Drive総計** | **21** | **21** | **100%** |

### Google Sheets 実装状況

| カテゴリ | MCP実装数 | Sheets API提供数 | カバー率 |
|---------|-----------|-----------------|---------|
| **Spreadsheet & Sheet Management** | 8 | 11 | 73% |
| **Data Operations** | 9 | 25 | 36% |
| **Row & Column** | 5 | 10 | 50% |
| **Formatting** | 8 | 15 | 53% |
| **Charts** | 10 | 16 | 63% |
| **Filters & Views** | 1 (+1 Phase 11) | 6 | 17-33% |
| **Pivot Tables** | 0 (+1 Phase 11) | 3 | 0-33% |
| **Protection & Named Ranges** | 6 | 6 | 100% |
| **Developer Metadata** | 0 | 5 | 0% |
| **Data Sources** | 0 | 4 | 0% |
| **Grouping** | 0 | 3 | 0% |
| **Sheets総計** | **49** | **~106** | **~46%** |

### Gmail 実装状況

| カテゴリ | MCP実装数 | Gmail API提供数 | カバー率 |
| --------- | ----------- | ---------------- | --------- |
| **Basic Operations** | 4 | 6 | 67% |
| **Label Management** | 2 | 4 | 50% |
| **Send Operations** | 2 | 3 | 67% |
| **Batch Operations** | 3 | 3 | 100% |
| **Gmail総計** | **11** | **~16** | **~69%** |

### カバレッジ分析

**強み（高いカバー率）：**
- ✅ **Drive操作**: 100% カバー（完全実装）
- ✅ **保護範囲・名前付き範囲**: 100% カバー
- ✅ **基本シート管理**: 73% カバー（主要機能は実装済み）
- ✅ **チャート機能**: 63% カバー（高度なチャートタイプも網羅）
- ✅ **Gmail操作**: 69% カバー（主要機能は実装済み）

**改善の余地（低いカバー率）：**
- ⚠️ **データ処理**: 36% カバー（自動入力、テキスト分割、重複削除等が未実装）
- ⚠️ **フィルタ・ビュー**: 17-33% カバー（Phase 11で改善予定）
- ⚠️ **ピボットテーブル**: 0-33% カバー（Phase 11で改善予定）
- ⚠️ **開発者メタデータ**: 0% カバー（Phase 12で実装予定）
- ⚠️ **データソース**: 0% カバー（未計画）
- ⚠️ **行列グループ化**: 0% カバー（Phase 12で実装予定）

---

## 詳細比較表

### 1. Google Drive Operations

#### Basic Operations (4 tools)

| カテゴリ | 機能 | MCP | Drive API |
|---------|------|-----|-----------|
| Search | ファイル検索（高度なクエリ対応） | ✅ drive_search | ✅ files.list |
| Read | ファイル内容読み込み | ✅ drive_read_file | ✅ files.get |
| List | ファイル一覧取得（フィルタ・ページネーション・ソート） | ✅ drive_list_files | ✅ files.list |
| Metadata | ファイルメタデータ取得 | ✅ drive_get_metadata | ✅ files.get |

#### File Operations (7 tools)

| カテゴリ | 機能 | MCP | Drive API |
|---------|------|-----|-----------|
| Upload | ファイルアップロード | ✅ drive_upload_file | ✅ files.create |
| Create | 空ファイル作成 | ✅ drive_create_file | ✅ files.create |
| Delete | ファイル削除（ゴミ箱へ移動） | ✅ drive_delete_file | ✅ files.delete |
| Copy | ファイルコピー | ✅ drive_copy_file | ✅ files.copy |
| Move | ファイル移動 | ✅ drive_move_file | ✅ files.update |
| Rename | ファイル名変更 | ✅ drive_rename_file | ✅ files.update |
| Update | ファイル内容更新 | ✅ drive_update_file | ✅ files.update |

#### Folder Management (3 tools)

| カテゴリ | 機能 | MCP | Drive API |
|---------|------|-----|-----------|
| Create | フォルダ作成 | ✅ drive_create_folder | ✅ files.create |
| List | フォルダ内容一覧 | ✅ drive_list_folder_contents | ✅ files.list |
| Move | フォルダへ移動 | ✅ drive_move_to_folder | ✅ files.update |

#### Permissions Management (4 tools)

| カテゴリ | 機能 | MCP | Drive API |
|---------|------|-----|-----------|
| Share | ファイル共有（ユーザー・グループ・ドメイン・全体公開） | ✅ drive_share_file | ✅ permissions.create |
| List | 権限一覧取得 | ✅ drive_list_permissions | ✅ permissions.list |
| Update | 権限ロール更新 | ✅ drive_update_permission | ✅ permissions.update |
| Remove | 権限削除 | ✅ drive_remove_permission | ✅ permissions.delete |

#### Advanced Operations (3 tools)

| カテゴリ | 機能 | MCP | Drive API |
|---------|------|-----|-----------|
| Export | Google Workspaceドキュメントのエクスポート（PDF/DOCX等） | ✅ drive_export_file | ✅ files.export |
| Revisions | ファイル履歴一覧 | ✅ drive_list_revisions | ✅ revisions.list |
| Trash | ゴミ箱を空にする | ✅ drive_empty_trash | ✅ files.emptyTrash |

---

### 2. Spreadsheet & Sheet Management (Basic)

| カテゴリ | 機能 | MCP | Sheets API |
|---------|------|-----|------------|
| Spreadsheet | スプレッドシート作成 | ✅ gsheets_create_spreadsheet | ✅ spreadsheets.create |
| Spreadsheet | スプレッドシート取得 | ❌ | ✅ spreadsheets.get |
| Spreadsheet | スプレッドシートプロパティ更新 | ❌ | ✅ UpdateSpreadsheetPropertiesRequest |
| Sheet | シート追加 | ✅ gsheets_add_sheet | ✅ AddSheetRequest |
| Sheet | シート削除 | ✅ gsheets_delete_sheet | ✅ DeleteSheetRequest |
| Sheet | シート複製 | ✅ gsheets_duplicate_sheet | ✅ DuplicateSheetRequest |
| Sheet | シート名変更 | ✅ gsheets_rename_sheet | ✅ UpdateSheetPropertiesRequest |
| Sheet | シート一覧取得 | ✅ gsheets_list_sheets | ✅ spreadsheets.get |
| Sheet | シートコピー (別スプレッドシートへ) | ✅ gsheets_copy_to | ✅ spreadsheets.sheets.copyTo |
| Sheet | シートコピー (同一スプレッドシート内) | ✅ gsheets_copy_sheet | ✅ DuplicateSheetRequest |
| Sheet | シートプロパティ更新 | 🔧 部分対応 | ✅ UpdateSheetPropertiesRequest |

---

### 3. Data Operations

| カテゴリ | 機能 | MCP | Sheets API |
|---------|------|-----|------------|
| セル操作 | セル読み取り | ✅ gsheets_read | ✅ spreadsheets.values.get |
| セル操作 | セル更新 | ✅ gsheets_update_cell | ✅ spreadsheets.values.update |
| セル操作 | セルバッチ更新 | ✅ gsheets_batch_update | ✅ spreadsheets.values.batchUpdate |
| セル操作 | データ追加 (append) | ✅ gsheets_append_data | ✅ spreadsheets.values.append |
| セル操作 | データクリア | ✅ gsheets_clear_data | ✅ spreadsheets.values.clear |
| セル操作 | バッチクリア | ✅ gsheets_batch_clear | ✅ spreadsheets.values.batchClear |
| セル操作 | セル一括更新 (UpdateCellsRequest) | ❌ | ✅ UpdateCellsRequest |
| セル操作 | セル追加 (AppendCellsRequest) | ❌ | ✅ AppendCellsRequest |
| セル操作 | セル繰り返し (RepeatCellRequest) | ❌ | ✅ RepeatCellRequest |
| 範囲操作 | 範囲挿入 | ❌ | ✅ InsertRangeRequest |
| 範囲操作 | 範囲削除 | ❌ | ✅ DeleteRangeRequest |
| データ処理 | 検索・置換 | ✅ gsheets_find_replace | ✅ FindReplaceRequest |
| データ処理 | 並べ替え | ✅ gsheets_sort_range | ✅ SortRangeRequest |
| データ処理 | コピー&ペースト | ❌ | ✅ CopyPasteRequest |
| データ処理 | カット&ペースト | ❌ | ✅ CutPasteRequest |
| データ処理 | 自動入力 | ❌ | ✅ AutoFillRequest |
| データ処理 | テキストを列に分割 | ❌ | ✅ TextToColumnsRequest |
| データ処理 | 空白のトリミング | ❌ | ✅ TrimWhitespaceRequest |
| データ処理 | 重複削除 | ❌ | ✅ DeleteDuplicatesRequest |
| データ処理 | ランダム化 | ❌ | ✅ RandomizeRangeRequest |
| データ検証 | データ検証設定 | ✅ gsheets_set_data_validation | ✅ SetDataValidationRequest |

---

### 4. Row & Column Operations

| カテゴリ | 機能 | MCP | Sheets API |
|---------|------|-----|------------|
| 行列操作 | 行挿入 | ✅ gsheets_insert_rows | ✅ InsertDimensionRequest |
| 行列操作 | 列挿入 | ✅ gsheets_insert_columns | ✅ InsertDimensionRequest |
| 行列操作 | 行削除 | ✅ gsheets_delete_rows | ✅ DeleteDimensionRequest |
| 行列操作 | 列削除 | ✅ gsheets_delete_columns | ✅ DeleteDimensionRequest |
| 行列操作 | 行追加 | ❌ | ✅ AppendDimensionRequest |
| 行列操作 | 行列プロパティ更新 | ❌ | ✅ UpdateDimensionPropertiesRequest |
| 行列操作 | 自動サイズ調整 | ✅ gsheets_auto_resize | ✅ AutoResizeDimensionsRequest |
| グループ化 | 行列グループ追加 | ❌ | ✅ AddDimensionGroupRequest |
| グループ化 | 行列グループ削除 | ❌ | ✅ DeleteDimensionGroupRequest |
| グループ化 | 行列グループ更新 | ❌ | ✅ UpdateDimensionGroupRequest |

---

### 5. Formatting Operations

| カテゴリ | 機能 | MCP | Sheets API |
|---------|------|-----|------------|
| セル書式 | セル書式設定 | ✅ gsheets_format_cells | ✅ RepeatCellRequest |
| セル書式 | 数値フォーマット設定 | ✅ gsheets_set_number_format | ✅ RepeatCellRequest |
| セル書式 | 罫線更新 | ✅ gsheets_update_borders | ✅ UpdateBordersRequest |
| セル結合 | セル結合 | ✅ gsheets_merge_cells | ✅ MergeCellsRequest |
| セル結合 | セル結合解除 | ✅ gsheets_unmerge_cells | ✅ UnmergeCellsRequest |
| 固定 | 行固定 | ✅ gsheets_freeze_rows | ✅ UpdateSheetPropertiesRequest |
| 固定 | 列固定 | ✅ gsheets_freeze_columns | ✅ UpdateSheetPropertiesRequest |
| 条件付き書式 | 条件付き書式追加 | ✅ gsheets_add_conditional_format | ✅ AddConditionalFormatRuleRequest |
| 条件付き書式 | 条件付き書式更新 | ❌ | ✅ UpdateConditionalFormatRuleRequest |
| 条件付き書式 | 条件付き書式削除 | ❌ | ✅ DeleteConditionalFormatRuleRequest |
| バンド範囲 | バンド範囲追加 | ❌ | ✅ AddBandedRangeRequest |
| バンド範囲 | バンド範囲更新 | ❌ | ✅ UpdateBandedRangeRequest |
| バンド範囲 | バンド範囲削除 | ❌ | ✅ DeleteBandedRangeRequest |

---

### 6. Chart Operations

| カテゴリ | 機能 | MCP | Sheets API |
|---------|------|-----|------------|
| 基本チャート | チャート追加 (基本) | ✅ gsheets_add_chart | ✅ AddChartRequest |
| 基本チャート | チャート更新 | ✅ gsheets_update_chart | ✅ UpdateChartSpecRequest |
| 基本チャート | チャート削除 | ✅ gsheets_delete_chart | ✅ DeleteEmbeddedObjectRequest |
| 高度なチャート | ヒストグラム | ✅ gsheets_add_histogram | ✅ AddChartRequest (histogramChart) |
| 高度なチャート | ウォーターフォール | ✅ gsheets_add_waterfall | ✅ AddChartRequest (waterfallChart) |
| 高度なチャート | ローソク足 | ✅ gsheets_add_candlestick | ✅ AddChartRequest (candlestickChart) |
| 高度なチャート | 複合チャート | ✅ gsheets_add_combo | ✅ AddChartRequest (basicChart COMBO) |
| 高度なチャート | バブルチャート | ✅ gsheets_add_bubble | ✅ AddChartRequest (bubbleChart) |
| 高度なチャート | ツリーマップ | ✅ gsheets_add_treemap | ✅ AddChartRequest (treemapChart) |
| 高度なチャート | 組織図 | ✅ gsheets_add_org_chart | ✅ AddChartRequest (orgChart) |
| 埋め込みオブジェクト | 埋め込みオブジェクト位置更新 | ❌ | ✅ UpdateEmbeddedObjectPositionRequest |
| 埋め込みオブジェクト | 埋め込みオブジェクト枠線更新 | ❌ | ✅ UpdateEmbeddedObjectBorderRequest |
| スライサー | スライサー追加 | ❌ | ✅ AddSlicerRequest |
| スライサー | スライサー更新 | ❌ | ✅ UpdateSlicerRequest |
| テーブル | テーブル追加 | ❌ | ✅ AddTableRequest |

---

### 7. Filter & View Operations

| カテゴリ | 機能 | MCP | Sheets API |
|---------|------|-----|------------|
| フィルタ | フィルタ作成 | ✅ gsheets_create_filter | ✅ SetBasicFilterRequest |
| フィルタ | フィルタクリア | ❌ | ✅ ClearBasicFilterRequest |
| フィルタビュー | フィルタビュー追加 | 🔧 gsheets_add_filter_view (Phase 11) | ✅ AddFilterViewRequest |
| フィルタビュー | フィルタビュー削除 | ❌ | ✅ DeleteFilterViewRequest |
| フィルタビュー | フィルタビュー複製 | ❌ | ✅ DuplicateFilterViewRequest |
| フィルタビュー | フィルタビュー更新 | ❌ | ✅ UpdateFilterViewRequest |

---

### 8. Pivot Table Operations

| カテゴリ | 機能 | MCP | Sheets API |
|---------|------|-----|------------|
| ピボットテーブル | ピボットテーブル追加 | 🔧 gsheets_add_pivot_table (Phase 11) | ✅ UpdateCellsRequest (pivotTable) |
| ピボットテーブル | ピボットテーブル更新 | ❌ | ✅ UpdateCellsRequest (pivotTable) |
| ピボットテーブル | ピボットテーブル削除 | ❌ | ✅ UpdateCellsRequest (pivotTable) |

---

### 9. Protection & Named Range Operations

| カテゴリ | 機能 | MCP | Sheets API |
|---------|------|-----|------------|
| 名前付き範囲 | 名前付き範囲追加 | ✅ gsheets_add_named_range | ✅ AddNamedRangeRequest |
| 名前付き範囲 | 名前付き範囲更新 | ✅ gsheets_update_named_range | ✅ UpdateNamedRangeRequest |
| 名前付き範囲 | 名前付き範囲削除 | ✅ gsheets_delete_named_range | ✅ DeleteNamedRangeRequest |
| 保護範囲 | 保護範囲追加 | ✅ gsheets_add_protected_range | ✅ AddProtectedRangeRequest |
| 保護範囲 | 保護範囲更新 | ✅ gsheets_update_protected_range | ✅ UpdateProtectedRangeRequest |
| 保護範囲 | 保護範囲削除 | ✅ gsheets_delete_protected_range | ✅ DeleteProtectedRangeRequest |

---

### 10. Developer Metadata Operations

| カテゴリ | 機能 | MCP | Sheets API |
|---------|------|-----|------------|
| メタデータ | 開発者メタデータ作成 | ❌ | ✅ CreateDeveloperMetadataRequest |
| メタデータ | 開発者メタデータ更新 | ❌ | ✅ UpdateDeveloperMetadataRequest |
| メタデータ | 開発者メタデータ削除 | ❌ | ✅ DeleteDeveloperMetadataRequest |
| メタデータ | メタデータ取得 | ❌ | ✅ spreadsheets.developerMetadata.get |
| メタデータ | メタデータ検索 | ❌ | ✅ spreadsheets.developerMetadata.search |

---

### 11. Data Source Operations

| カテゴリ | 機能 | MCP | Sheets API |
|---------|------|-----|------------|
| データソース | データソース追加 | ❌ | ✅ AddDataSourceRequest |
| データソース | データソース削除 | ❌ | ✅ DeleteDataSourceRequest |
| データソース | データソース更新 | ❌ | ✅ RefreshDataSourceRequest |
| データソース | データソース更新キャンセル | ❌ | ✅ CancelDataSourceRefreshRequest |

---

## 12. Gmail Operations

### 12.1 Basic Operations

| カテゴリ | 機能 | MCP | Gmail API |
| --------- | ------ | ----- | ------------ |
| ラベル | ラベル一覧取得 | ✅ gmail_list_labels | ✅ users.labels.list |
| メッセージ | メッセージ検索 | ✅ gmail_search_messages | ✅ users.messages.list |
| メッセージ | メッセージ取得 | ✅ gmail_get_message | ✅ users.messages.get |
| スレッド | スレッド取得 | ✅ gmail_get_thread | ✅ users.threads.get |
| スレッド | スレッド一覧取得 | ❌ | ✅ users.threads.list |
| メッセージ | メッセージ削除 | ❌ | ✅ users.messages.delete |

### 12.2 Label Management

| カテゴリ | 機能 | MCP | Gmail API |
| --------- | ------ | ----- | ------------ |
| ラベル操作 | ラベル追加・削除 | ✅ gmail_modify_labels | ✅ users.messages.modify |
| ラベル管理 | ラベル作成・更新・削除 | ✅ gmail_manage_label | ✅ users.labels.create/update/delete |
| ラベル | ラベル取得 | ❌ | ✅ users.labels.get |
| ラベル | ラベルパッチ | ❌ | ✅ users.labels.patch |

### 12.3 Send Operations

| カテゴリ | 機能 | MCP | Gmail API |
| --------- | ------ | ----- | ------------ |
| 送信 | メッセージ送信 | ✅ gmail_send_message | ✅ users.messages.send |
| 下書き | 下書き作成 | ✅ gmail_draft_message | ✅ users.drafts.create |
| 下書き | 下書き送信 | ❌ | ✅ users.drafts.send |

### 12.4 Batch Operations

| カテゴリ | 機能 | MCP | Gmail API |
| --------- | ------ | ----- | ------------ |
| バッチ取得 | メッセージバッチ取得 | ✅ gmail_get_messages_batch | ✅ users.messages.batchGet (Promise.all) |
| バッチ取得 | スレッドバッチ取得 | ✅ gmail_get_threads_batch | ✅ users.threads.batchGet (Promise.all) |
| バッチ操作 | ラベルバッチ変更 | ✅ gmail_batch_modify_labels | ✅ users.messages.batchModify |

---

## 今後の実装計画

### Phase 11: Filter Views & Pivot Tables（進行中）
- ✅ gsheets_add_filter_view（ファイル作成済み）
- ✅ gsheets_add_pivot_table（ファイル作成済み）
- ⏳ テスト実装
- ⏳ index.ts統合

### Phase 12: Grouping & Metadata（未着手）
- 🔄 AddDimensionGroupRequest（行列グループ追加）
- 🔄 DeleteDimensionGroupRequest（行列グループ削除）
- 🔄 UpdateDimensionGroupRequest（行列グループ更新）
- 🔄 CreateDeveloperMetadataRequest（メタデータ作成）
- 🔄 UpdateDeveloperMetadataRequest（メタデータ更新）
- 🔄 DeleteDeveloperMetadataRequest（メタデータ削除）

### 優先度の高い未実装機能

#### データ処理拡張
1. **DeleteDuplicatesRequest**（重複削除）
   - 優先度: 高
   - 用途: データクレンジング、重複レコード削除

2. **AutoFillRequest**（自動入力）
   - 優先度: 中
   - 用途: パターン認識による自動入力

3. **TrimWhitespaceRequest**（空白トリミング）
   - 優先度: 中
   - 用途: データクレンジング

#### 条件付き書式の完全対応
1. **UpdateConditionalFormatRuleRequest**
   - 優先度: 中
   - 用途: 既存の条件付き書式ルールの更新

2. **DeleteConditionalFormatRuleRequest**
   - 優先度: 中
   - 用途: 条件付き書式ルールの削除

#### フィルタビューの完全対応
1. **DeleteFilterViewRequest**
   - 優先度: 中
   - 用途: フィルタビューの削除

2. **DuplicateFilterViewRequest**
   - 優先度: 低
   - 用途: フィルタビューの複製

3. **UpdateFilterViewRequest**
   - 優先度: 中
   - 用途: フィルタビューの更新

---

## 参照資料

### Google Sheets

- [Google Sheets API v4 REST Reference](https://developers.google.com/workspace/sheets/api/reference/rest)
- [Requests | Google Sheets API](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/request)
- [Batch requests | Google Sheets API](https://developers.google.com/workspace/sheets/api/guides/batch)
- [Update spreadsheets | Google Sheets API](https://developers.google.com/workspace/sheets/api/guides/batchupdate)

### Gmail

- [Gmail API v1 REST Reference](https://developers.google.com/gmail/api/reference/rest)
- [Gmail API Guides](https://developers.google.com/gmail/api/guides)
- [Batch requests | Gmail API](https://developers.google.com/gmail/api/guides/batch)

### 参考リポジトリ

- [MCP Google Spreadsheet Repository](https://github.com/kazz187/mcp-google-spreadsheet)
- [Google Workspace MCP Reference](https://github.com/taylorwilsdon/google_workspace_mcp)

---

## 凡例

| 記号 | 意味 |
|------|------|
| ✅ | 実装済み |
| 🔧 | 実装中（ファイル作成済み、テスト・統合待ち） |
| ❌ | 未実装 |

---

**結論**: このMCPサーバーは、**合計93ツール**（Drive: 2、Sheets: 57、Docs: 23、Gmail: 11）を実装し、Google Workspaceの主要サービスをカバーしています。

**Google Sheets**: APIの主要機能の約**46%をカバー**しており、特に基本的なシート管理、チャート作成、保護範囲・名前付き範囲の操作において高いカバー率を達成しています。Phase 11-12の実装により、カバー率は**50-55%**程度まで向上する見込みです。

**Gmail**: APIの主要機能の約**69%をカバー**しており、基本的なメッセージ操作、ラベル管理、送信操作、バッチ処理を網羅しています。特にバッチ操作は**100%**のカバー率を達成しています。
