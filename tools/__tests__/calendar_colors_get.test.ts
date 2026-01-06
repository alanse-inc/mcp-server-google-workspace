import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { getColors } from '../calendar/colors/calendar_colors_get.js';

vi.mock('googleapis');

describe('calendar_colors_get', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get color palette successfully', async () => {
    const mockCalendar = {
      colors: {
        get: vi.fn().mockResolvedValue({
          data: {
            calendar: {
              '1': { background: '#9fc6e7', foreground: '#000000' },
              '2': { background: '#d06b64', foreground: '#000000' },
              '3': { background: '#f691b2', foreground: '#000000' },
            },
            event: {
              '1': { background: '#a4bdfc', foreground: '#1d1d1d' },
              '2': { background: '#7ae7bf', foreground: '#1d1d1d' },
              '3': { background: '#dbadff', foreground: '#1d1d1d' },
            },
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await getColors();

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Google Calendar Color Palette');
    expect(result.content[0].text).toContain('Calendar Colors:');
    expect(result.content[0].text).toContain('Event Colors:');
    expect(result.content[0].text).toContain('#9fc6e7');
    expect(result.content[0].text).toContain('#a4bdfc');

    expect(mockCalendar.colors.get).toHaveBeenCalled();
  });

  it('should return structured calendar colors', async () => {
    const mockCalendar = {
      colors: {
        get: vi.fn().mockResolvedValue({
          data: {
            calendar: {
              '1': { background: '#9fc6e7', foreground: '#000000' },
              '2': { background: '#d06b64', foreground: '#000000' },
            },
            event: {
              '1': { background: '#a4bdfc', foreground: '#1d1d1d' },
            },
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await getColors();

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Calendar Colors:');
    expect(result.content[0].text).toContain('1: Background #9fc6e7');
    expect(result.content[0].text).toContain('2: Background #d06b64');
  });

  it('should return structured event colors', async () => {
    const mockCalendar = {
      colors: {
        get: vi.fn().mockResolvedValue({
          data: {
            calendar: {
              '1': { background: '#9fc6e7', foreground: '#000000' },
            },
            event: {
              '1': { background: '#a4bdfc', foreground: '#1d1d1d' },
              '2': { background: '#7ae7bf', foreground: '#1d1d1d' },
              '3': { background: '#dbadff', foreground: '#1d1d1d' },
            },
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await getColors();

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Event Colors:');
    expect(result.content[0].text).toContain('1: Background #a4bdfc');
    expect(result.content[0].text).toContain('2: Background #7ae7bf');
    expect(result.content[0].text).toContain('3: Background #dbadff');
    expect(result.content[0].text).toContain('Usage: Use these color IDs');
  });
});
