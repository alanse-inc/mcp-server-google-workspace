import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { formatText } from '../docs/content/gdocs_format_text.js';

vi.mock('googleapis');

describe('gdocs_format_text', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should apply bold formatting successfully', async () => {
    const mockDocs = {
      documents: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            documentId: '1abcdefghijklmnopqrstuvwxyz123456789',
          },
        }),
      },
    };

    vi.mocked(google.docs).mockReturnValue(mockDocs as any);

    const result = await formatText({
      documentId: '1abcdefghijklmnopqrstuvwxyz123456789',
      startIndex: 1,
      endIndex: 10,
      format: {
        bold: true,
      },
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Text formatted successfully');
    expect(result.content[0].text).toContain('1abcdefghijklmnopqrstuvwxyz123456789');

    expect(mockDocs.documents.batchUpdate).toHaveBeenCalledWith({
      documentId: '1abcdefghijklmnopqrstuvwxyz123456789',
      requestBody: {
        requests: [
          {
            updateTextStyle: {
              range: {
                startIndex: 1,
                endIndex: 10,
              },
              textStyle: {
                bold: true,
              },
              fields: 'bold',
            },
          },
        ],
      },
    });
  });

  it('should apply multiple formatting options', async () => {
    const mockDocs = {
      documents: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            documentId: '1abcdefghijklmnopqrstuvwxyz123456789',
          },
        }),
      },
    };

    vi.mocked(google.docs).mockReturnValue(mockDocs as any);

    const result = await formatText({
      documentId: '1abcdefghijklmnopqrstuvwxyz123456789',
      startIndex: 1,
      endIndex: 20,
      format: {
        bold: true,
        italic: true,
        underline: true,
        fontSize: 24,
        fontFamily: 'Arial',
        foregroundColor: { red: 1.0, green: 0.0, blue: 0.0 },
        backgroundColor: { red: 1.0, green: 1.0, blue: 0.0 },
      },
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Text formatted successfully');

    const batchUpdateCall = mockDocs.documents.batchUpdate.mock.calls[0][0];
    const textStyle = batchUpdateCall.requestBody.requests[0].updateTextStyle.textStyle;

    expect(textStyle.bold).toBe(true);
    expect(textStyle.italic).toBe(true);
    expect(textStyle.underline).toBe(true);
    expect(textStyle.fontSize?.magnitude).toBe(24);
    expect(textStyle.weightedFontFamily?.fontFamily).toBe('Arial');
    expect(textStyle.foregroundColor?.color?.rgbColor).toEqual({ red: 1.0, green: 0.0, blue: 0.0 });
    expect(textStyle.backgroundColor?.color?.rgbColor).toEqual({ red: 1.0, green: 1.0, blue: 0.0 });
  });

  it('should apply font size only', async () => {
    const mockDocs = {
      documents: {
        batchUpdate: vi.fn().mockResolvedValue({
          data: {
            documentId: '1abcdefghijklmnopqrstuvwxyz123456789',
          },
        }),
      },
    };

    vi.mocked(google.docs).mockReturnValue(mockDocs as any);

    const result = await formatText({
      documentId: '1abcdefghijklmnopqrstuvwxyz123456789',
      startIndex: 5,
      endIndex: 15,
      format: {
        fontSize: 18,
      },
    });

    expect(result.isError).toBe(false);

    const batchUpdateCall = mockDocs.documents.batchUpdate.mock.calls[0][0];
    const textStyle = batchUpdateCall.requestBody.requests[0].updateTextStyle.textStyle;

    expect(textStyle.fontSize?.magnitude).toBe(18);
    expect(textStyle.fontSize?.unit).toBe('PT');
  });

  it('should handle errors gracefully', async () => {
    const mockDocs = {
      documents: {
        batchUpdate: vi.fn().mockRejectedValue(new Error('Invalid range')),
      },
    };

    vi.mocked(google.docs).mockReturnValue(mockDocs as any);

    const result = await formatText({
      documentId: '1abcdefghijklmnopqrstuvwxyz123456789',
      startIndex: 100,
      endIndex: 50,
      format: {
        bold: true,
      },
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
    expect(result.content[0].text).toContain('Invalid range');
  });
});
