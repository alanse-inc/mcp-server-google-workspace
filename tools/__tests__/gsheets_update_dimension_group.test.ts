import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { updateDimensionGroup } from '../sheets/advanced/gsheets_update_dimension_group.js';

vi.mock('googleapis');

describe('gsheets_update_dimension_group', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update dimension group to collapsed', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {},
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await updateDimensionGroup({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      dimension: 'ROWS',
      startIndex: 5,
      endIndex: 10,
      collapsed: true,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('updated rows group');
    expect(result.content[0].text).toContain('Collapsed: true');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            expect.objectContaining({
              updateDimensionGroup: expect.objectContaining({
                dimensionGroup: expect.objectContaining({
                  range: expect.objectContaining({
                    sheetId: 0,
                    dimension: 'ROWS',
                    startIndex: 5,
                    endIndex: 10,
                  }),
                  collapsed: true,
                }),
                fields: 'collapsed',
              }),
            }),
          ],
        },
      })
    );
  });

  it('should update dimension group to expanded', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {},
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await updateDimensionGroup({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      dimension: 'COLUMNS',
      startIndex: 2,
      endIndex: 5,
      collapsed: false,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Collapsed: false');
  });

  it('should handle errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Invalid update')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await updateDimensionGroup({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      dimension: 'ROWS',
      startIndex: 5,
      endIndex: 10,
      collapsed: true,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error updating dimension group');
  });
});
