import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { addOrgChart } from '../sheets/charts/gsheets_add_org_chart.js';

vi.mock('googleapis');

describe('gsheets_add_org_chart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create an organizational chart', async () => {
    const mockSheets = {
      spreadsheets: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            replies: [
              {
                addChart: {
                  chart: {
                    chartId: 78901,
                  },
                },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addOrgChart({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      title: 'Company Structure',
      dataSheetId: 0,
      dataStartRow: 1,
      dataEndRow: 10,
      labelsColumn: 0,
      parentLabelsColumn: 1,
      tooltipsColumn: 2,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('organizational chart');
    expect(result.content[0].text).toContain('78901');

    expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'test-spreadsheet-id',
        requestBody: {
          requests: [
            expect.objectContaining({
              addChart: expect.objectContaining({
                chart: expect.objectContaining({
                  spec: expect.objectContaining({
                    title: 'Company Structure',
                    orgChart: expect.any(Object),
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
        batchUpdate: vi.fn().mockRejectedValue(new Error('Invalid organization structure')),
      },
    };

    vi.mocked(google.sheets).mockReturnValue(mockSheets as any);

    const result = await addOrgChart({
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: 0,
      dataSheetId: 0,
      dataStartRow: 1,
      dataEndRow: 10,
      labelsColumn: 0,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error creating organizational');
  });
});
