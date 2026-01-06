import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { updateCalendar } from '../calendar/calendars/calendar_calendars_update.js';

vi.mock('googleapis');

describe('calendar_calendars_update', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update calendar summary', async () => {
    const mockCalendar = {
      calendars: {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'team@example.com',
            summary: 'Old Team Calendar',
            timeZone: 'UTC',
          },
        }),
        update: vi.fn().mockResolvedValue({
          data: {
            id: 'team@example.com',
            summary: 'New Team Calendar',
            timeZone: 'UTC',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await updateCalendar({
      calendarId: 'team@example.com',
      summary: 'New Team Calendar',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Calendar updated successfully');
    expect(result.content[0].text).toContain('New Team Calendar');

    expect(mockCalendar.calendars.update).toHaveBeenCalledWith({
      calendarId: 'team@example.com',
      requestBody: {
        summary: 'New Team Calendar',
      },
    });
  });

  it('should update calendar timezone', async () => {
    const mockCalendar = {
      calendars: {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'work@example.com',
            summary: 'Work Calendar',
            timeZone: 'UTC',
          },
        }),
        update: vi.fn().mockResolvedValue({
          data: {
            id: 'work@example.com',
            summary: 'Work Calendar',
            timeZone: 'America/New_York',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await updateCalendar({
      calendarId: 'work@example.com',
      timeZone: 'America/New_York',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('America/New_York');

    expect(mockCalendar.calendars.update).toHaveBeenCalledWith({
      calendarId: 'work@example.com',
      requestBody: {
        timeZone: 'America/New_York',
      },
    });
  });

  it('should update multiple fields simultaneously', async () => {
    const mockCalendar = {
      calendars: {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'project@example.com',
            summary: 'Old Project',
            timeZone: 'UTC',
          },
        }),
        update: vi.fn().mockResolvedValue({
          data: {
            id: 'project@example.com',
            summary: 'Updated Project Calendar',
            description: 'Calendar for project events',
            location: 'Main Office',
            timeZone: 'Europe/London',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await updateCalendar({
      calendarId: 'project@example.com',
      summary: 'Updated Project Calendar',
      description: 'Calendar for project events',
      location: 'Main Office',
      timeZone: 'Europe/London',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Updated Project Calendar');
    expect(result.content[0].text).toContain('Calendar for project events');
    expect(result.content[0].text).toContain('Main Office');
    expect(result.content[0].text).toContain('Europe/London');

    expect(mockCalendar.calendars.update).toHaveBeenCalledWith({
      calendarId: 'project@example.com',
      requestBody: {
        summary: 'Updated Project Calendar',
        description: 'Calendar for project events',
        location: 'Main Office',
        timeZone: 'Europe/London',
      },
    });
  });

  it('should return error when no fields are provided', async () => {
    const mockCalendar = {
      calendars: {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'test@example.com',
            summary: 'Test Calendar',
          },
        }),
        update: vi.fn(),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await updateCalendar({
      calendarId: 'test@example.com',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('No fields provided to update');

    expect(mockCalendar.calendars.update).not.toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    const mockCalendar = {
      calendars: {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'error@example.com',
            summary: 'Error Calendar',
          },
        }),
        update: vi.fn().mockRejectedValue(new Error('Permission denied')),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await updateCalendar({
      calendarId: 'error@example.com',
      summary: 'Updated Summary',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
