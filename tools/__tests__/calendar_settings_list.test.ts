import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { listSettings } from '../calendar/settings/calendar_settings_list.js';

vi.mock('googleapis');

describe('calendar_settings_list', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list calendar settings successfully', async () => {
    const mockCalendar = {
      settings: {
        list: vi.fn().mockResolvedValue({
          data: {
            items: [
              { id: 'timezone', value: 'America/New_York' },
              { id: 'dateFieldOrder', value: 'MDY' },
              { id: 'timeFormat', value: '12' },
              { id: 'weekStart', value: '0' },
              { id: 'locale', value: 'en' },
              { id: 'country', value: 'US' },
            ],
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await listSettings({});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Calendar Settings');
    expect(result.content[0].text).toContain('6 settings');
    expect(result.content[0].text).toContain('America/New_York');
    expect(result.content[0].text).toContain('timezone');

    expect(mockCalendar.settings.list).toHaveBeenCalledWith({
      maxResults: undefined,
      pageToken: undefined,
    });
  });

  it('should handle pagination', async () => {
    const mockCalendar = {
      settings: {
        list: vi.fn().mockResolvedValue({
          data: {
            items: [
              { id: 'timezone', value: 'UTC' },
              { id: 'locale', value: 'en' },
            ],
            nextPageToken: 'next-settings-token-123',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await listSettings({
      maxResults: 10,
      pageToken: 'current-token',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('next-settings-token-123');

    expect(mockCalendar.settings.list).toHaveBeenCalledWith({
      maxResults: 10,
      pageToken: 'current-token',
    });
  });

  it('should categorize settings by type', async () => {
    const mockCalendar = {
      settings: {
        list: vi.fn().mockResolvedValue({
          data: {
            items: [
              { id: 'timezone', value: 'America/Los_Angeles' },
              { id: 'dateFieldOrder', value: 'YMD' },
              { id: 'timeFormat', value: '24' },
              { id: 'locale', value: 'ja' },
              { id: 'country', value: 'JP' },
              { id: 'showDeclinedEvents', value: 'false' },
              { id: 'weekStart', value: '1' },
            ],
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await listSettings({});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Time & Date:');
    expect(result.content[0].text).toContain('timezone: America/Los_Angeles');
    expect(result.content[0].text).toContain('Locale:');
    expect(result.content[0].text).toContain('locale: ja');
    expect(result.content[0].text).toContain('country: JP');
    expect(result.content[0].text).toContain('General:');
    expect(result.content[0].text).toContain('showDeclinedEvents: false');
  });

  it('should handle errors gracefully', async () => {
    const mockCalendar = {
      settings: {
        list: vi.fn().mockRejectedValue(new Error('API Error')),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await listSettings({});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
