import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { getCalendarListEntry } from '../calendar/calendarlist/calendar_calendarlist_get.js';

vi.mock('googleapis');

describe('calendar_calendarlist_get', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get calendar list entry successfully', async () => {
    const mockCalendar = {
      calendarList: {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'work@example.com',
            summary: 'Work Calendar',
            description: 'Calendar for work events',
            location: 'Office Building',
            timeZone: 'America/New_York',
            accessRole: 'writer',
            primary: false,
            backgroundColor: '#f691b2',
            foregroundColor: '#000000',
            defaultReminders: [
              { method: 'email', minutes: 30 },
              { method: 'popup', minutes: 10 },
            ],
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await getCalendarListEntry({
      calendarId: 'work@example.com',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Work Calendar');
    expect(result.content[0].text).toContain('work@example.com');
    expect(result.content[0].text).toContain('writer');
    expect(result.content[0].text).toContain('America/New_York');
    expect(result.content[0].text).toContain('Default Reminders');
    expect(result.content[0].text).toContain('email: 30 minutes before');

    expect(mockCalendar.calendarList.get).toHaveBeenCalledWith({
      calendarId: 'work@example.com',
    });
  });

  it('should get primary calendar', async () => {
    const mockCalendar = {
      calendarList: {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'primary',
            summary: 'My Calendar',
            timeZone: 'UTC',
            accessRole: 'owner',
            primary: true,
            backgroundColor: '#9fc6e7',
            foregroundColor: '#000000',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await getCalendarListEntry({
      calendarId: 'primary',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('My Calendar');
    expect(result.content[0].text).toContain('Primary Calendar: Yes');

    expect(mockCalendar.calendarList.get).toHaveBeenCalledWith({
      calendarId: 'primary',
    });
  });

  it('should include notification settings when available', async () => {
    const mockCalendar = {
      calendarList: {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'calendar@example.com',
            summary: 'Test Calendar',
            timeZone: 'UTC',
            accessRole: 'reader',
            notificationSettings: {
              notifications: [
                { type: 'eventCreation', method: 'email' },
                { type: 'eventChange', method: 'email' },
              ],
            },
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await getCalendarListEntry({
      calendarId: 'calendar@example.com',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Notification Settings');
    expect(result.content[0].text).toContain('eventCreation: email');
  });

  it('should handle errors gracefully', async () => {
    const mockCalendar = {
      calendarList: {
        get: vi.fn().mockRejectedValue(new Error('Calendar not found')),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await getCalendarListEntry({
      calendarId: 'nonexistent@example.com',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
