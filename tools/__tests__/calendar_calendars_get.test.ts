import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { getCalendar } from '../calendar/calendars/calendar_calendars_get.js';

vi.mock('googleapis');

describe('calendar_calendars_get', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get calendar metadata successfully', async () => {
    const mockCalendar = {
      calendars: {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'team@example.com',
            summary: 'Team Calendar',
            description: 'Shared team calendar',
            location: 'Office Building',
            timeZone: 'America/New_York',
            etag: '"etag-123"',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await getCalendar({
      calendarId: 'team@example.com',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Team Calendar');
    expect(result.content[0].text).toContain('team@example.com');
    expect(result.content[0].text).toContain('Shared team calendar');
    expect(result.content[0].text).toContain('Office Building');
    expect(result.content[0].text).toContain('America/New_York');

    expect(mockCalendar.calendars.get).toHaveBeenCalledWith({
      calendarId: 'team@example.com',
    });
  });

  it('should get primary calendar', async () => {
    const mockCalendar = {
      calendars: {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'user@gmail.com',
            summary: 'My Calendar',
            timeZone: 'UTC',
            etag: '"etag-456"',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await getCalendar({
      calendarId: 'primary',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('My Calendar');

    expect(mockCalendar.calendars.get).toHaveBeenCalledWith({
      calendarId: 'primary',
    });
  });

  it('should include conference properties when available', async () => {
    const mockCalendar = {
      calendars: {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'conference@example.com',
            summary: 'Conference Calendar',
            timeZone: 'America/Los_Angeles',
            etag: '"etag-789"',
            conferenceProperties: {
              allowedConferenceSolutionTypes: ['hangoutsMeet', 'eventNamedHangout'],
            },
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await getCalendar({
      calendarId: 'conference@example.com',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Conference Properties');
    expect(result.content[0].text).toContain('hangoutsMeet, eventNamedHangout');
  });

  it('should handle errors gracefully', async () => {
    const mockCalendar = {
      calendars: {
        get: vi.fn().mockRejectedValue(new Error('Calendar not found')),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await getCalendar({
      calendarId: 'nonexistent@example.com',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
