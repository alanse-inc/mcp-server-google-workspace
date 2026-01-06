import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { insertCalendar } from '../calendar/calendars/calendar_calendars_insert.js';

vi.mock('googleapis');

describe('calendar_calendars_insert', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create calendar successfully', async () => {
    const mockCalendar = {
      calendars: {
        insert: vi.fn().mockResolvedValue({
          data: {
            id: 'new-calendar@example.com',
            summary: 'Team Calendar',
            description: 'Calendar for team events',
            location: 'Office',
            timeZone: 'America/New_York',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await insertCalendar({
      summary: 'Team Calendar',
      description: 'Calendar for team events',
      location: 'Office',
      timeZone: 'America/New_York',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Calendar created successfully');
    expect(result.content[0].text).toContain('Team Calendar');
    expect(result.content[0].text).toContain('new-calendar@example.com');
    expect(result.content[0].text).toContain('Calendar for team events');
    expect(result.content[0].text).toContain('Office');
    expect(result.content[0].text).toContain('America/New_York');
    expect(result.content[0].text).toContain('You are now the owner');

    expect(mockCalendar.calendars.insert).toHaveBeenCalledWith({
      requestBody: {
        summary: 'Team Calendar',
        description: 'Calendar for team events',
        location: 'Office',
        timeZone: 'America/New_York',
      },
    });
  });

  it('should create calendar with only summary (minimal)', async () => {
    const mockCalendar = {
      calendars: {
        insert: vi.fn().mockResolvedValue({
          data: {
            id: 'minimal-calendar@example.com',
            summary: 'Minimal Calendar',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await insertCalendar({
      summary: 'Minimal Calendar',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Minimal Calendar');

    expect(mockCalendar.calendars.insert).toHaveBeenCalledWith({
      requestBody: {
        summary: 'Minimal Calendar',
        description: undefined,
        location: undefined,
        timeZone: undefined,
      },
    });
  });

  it('should create calendar with custom timezone', async () => {
    const mockCalendar = {
      calendars: {
        insert: vi.fn().mockResolvedValue({
          data: {
            id: 'tokyo-calendar@example.com',
            summary: 'Tokyo Office',
            timeZone: 'Asia/Tokyo',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await insertCalendar({
      summary: 'Tokyo Office',
      timeZone: 'Asia/Tokyo',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Tokyo Office');
    expect(result.content[0].text).toContain('Asia/Tokyo');
  });

  it('should handle errors gracefully', async () => {
    const mockCalendar = {
      calendars: {
        insert: vi.fn().mockRejectedValue(new Error('Permission denied')),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await insertCalendar({
      summary: 'Failed Calendar',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
