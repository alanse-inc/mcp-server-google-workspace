import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { addFilterView } from '../sheets/advanced/gsheets_add_filter_view.js';

vi.mock('googleapis');

describe('gsheets_add_filter_view', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a filter view', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            replies: [
              {
                addFilterView: {
                  filter: {
                    filterViewId: 12345,
                  },
                },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addFilterView({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      title: 'Test Filter View',
      startRow: 0,
      endRow: 100,
      startColumn: 0,
      endColumn: 5,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('filter view');
    expect(result.content[0].text).toContain('Test Filter View');
    expect(result.content[0].text).toContain('12345');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            expect.objectContaining({
              addFilterView: expect.objectContaining({
                filter: expect.objectContaining({
                  title: 'Test Filter View',
                  range: expect.objectContaining({
                    sheetId: 0,
                    startRowIndex: 0,
                    endRowIndex: 100,
                    startColumnIndex: 0,
                    endColumnIndex: 5,
                  }),
                }),
              }),
            }),
          ],
        },
      })
    );
  });

  it('should handle errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Invalid filter view range')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addFilterView({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      title: 'Test Filter View',
      startRow: 0,
      endRow: 100,
      startColumn: 0,
      endColumn: 5,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error creating filter view');
  });
});
