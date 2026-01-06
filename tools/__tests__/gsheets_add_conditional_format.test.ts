import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { addConditionalFormat } from '../sheets/protection/gsheets_add_conditional_format.js';

vi.mock('googleapis');

describe('gsheets_add_conditional_format', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add conditional formatting', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addConditionalFormat({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 10,
      startColumn: 0,
      endColumn: 1,
      rule: {
        type: 'NUMBER_GREATER',
        value: '100',
        backgroundColor: { red: 1, green: 0, blue: 0 },
      },
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('NUMBER_GREATER');
  });

  it('should handle errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('API error')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addConditionalFormat({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      startRow: 0,
      endRow: 5,
      startColumn: 0,
      endColumn: 1,
      rule: {
        type: 'TEXT_CONTAINS',
        value: 'error',
      },
    });

    expect(result.isError).toBe(true);
  });
});
