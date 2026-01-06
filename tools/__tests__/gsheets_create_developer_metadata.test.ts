import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { createDeveloperMetadata } from '../sheets/advanced/gsheets_create_developer_metadata.js';

vi.mock('googleapis');

describe('gsheets_create_developer_metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create spreadsheet-level metadata', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            replies: [
              {
                createDeveloperMetadata: {
                  developerMetadata: {
                    metadataId: 12345,
                  },
                },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await createDeveloperMetadata({
      spreadsheetId: 'test-spreadsheet-id',
      location: {
        type: 'SPREADSHEET',
      },
      metadataKey: 'version',
      metadataValue: '1.0.0',
      visibility: 'DOCUMENT',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('developer metadata');
    expect(result.content[0].text).toContain('version');
    expect(result.content[0].text).toContain('12345');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            expect.objectContaining({
              createDeveloperMetadata: expect.objectContaining({
                developerMetadata: expect.objectContaining({
                  location: expect.objectContaining({
                    spreadsheet: true,
                  }),
                  metadataKey: 'version',
                  metadataValue: '1.0.0',
                  visibility: 'DOCUMENT',
                }),
              }),
            }),
          ],
        },
      })
    );
  });

  it('should create sheet-level metadata', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            replies: [
              {
                createDeveloperMetadata: {
                  developerMetadata: {
                    metadataId: 67890,
                  },
                },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await createDeveloperMetadata({
      spreadsheetId: 'test-spreadsheet-id',
      location: {
        type: 'SHEET',
        sheetId: 0,
      },
      metadataKey: 'sheetType',
      metadataValue: 'dashboard',
      visibility: 'PROJECT',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('67890');
  });

  it('should handle errors', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Invalid metadata')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await createDeveloperMetadata({
      spreadsheetId: 'test-spreadsheet-id',
      location: {
        type: 'SPREADSHEET',
      },
      metadataKey: 'test',
      metadataValue: 'value',
      visibility: 'DOCUMENT',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error creating developer metadata');
  });
});
