import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { createSpreadsheet } from '../sheets/basic/gsheets_create_spreadsheet.js';

vi.mock('googleapis');

describe('gsheets_create_spreadsheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a spreadsheet with default sheet', async () => {
    const mockSheets = {
      spreadsheets: {
        create: vi.fn().mockResolvedValue({
          data: {
            spreadsheetId: 'new-spreadsheet-id',
            spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/new-spreadsheet-id',
            sheets: [
              {
                properties: {
                  sheetId: 0,
                  title: 'Sheet1',
                },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await createSpreadsheet({
      title: 'My New Spreadsheet',
    });

    expect(result.isError).toBe(false);
    const responseData = JSON.parse(result.content[0].text);
    expect(responseData.spreadsheetId).toBe('new-spreadsheet-id');
    expect(responseData.spreadsheetUrl).toContain('new-spreadsheet-id');
    expect(responseData.title).toBe('My New Spreadsheet');

    expect(mockSheets.spreadsheets.create).toHaveBeenCalledWith({
      requestBody: {
        properties: {
          title: 'My New Spreadsheet',
        },
      },
    });
  });

  it('should create a spreadsheet with custom sheets', async () => {
    const mockSheets = {
      spreadsheets: {
        create: vi.fn().mockResolvedValue({
          data: {
            spreadsheetId: 'new-spreadsheet-id',
            spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/new-spreadsheet-id',
            sheets: [
              { properties: { sheetId: 0, title: 'Data' } },
              { properties: { sheetId: 1, title: 'Analysis' } },
            ],
          },
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await createSpreadsheet({
      title: 'Project Report',
      sheets: [
        { title: 'Data', rowCount: 500, columnCount: 10 },
        { title: 'Analysis', rowCount: 200, columnCount: 5 },
      ],
    });

    expect(result.isError).toBe(false);
    expect(mockSheets.spreadsheets.create).toHaveBeenCalledWith({
      requestBody: {
        properties: {
          title: 'Project Report',
        },
        sheets: [
          {
            properties: {
              title: 'Data',
              gridProperties: {
                rowCount: 500,
                columnCount: 10,
              },
            },
          },
          {
            properties: {
              title: 'Analysis',
              gridProperties: {
                rowCount: 200,
                columnCount: 5,
              },
            },
          },
        ],
      },
    });
  });

  it('should handle errors when creation fails', async () => {
    const mockSheets = {
      spreadsheets: {
        create: vi.fn().mockRejectedValue(new Error('Permission denied')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await createSpreadsheet({
      title: 'Test Spreadsheet',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error creating spreadsheet');
    expect(result.content[0].text).toContain('Permission denied');
  });
});
