import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { listCalendarList } from '../calendar/calendarlist/calendar_calendarlist_list.js';

vi.mock('googleapis');

describe('calendar_calendarlist_list', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list calendars successfully', async () => {
    const mockCalendar = {
      calendarList: {
        list: vi.fn().mockResolvedValue({
          data: {
            items: [
              {
                id: 'primary',
                summary: 'My Calendar',
                description: 'Primary calendar',
                timeZone: 'America/New_York',
                accessRole: 'owner',
                primary: true,
                backgroundColor: '#9fc6e7',
                foregroundColor: '#000000',
              },
              {
                id: 'calendar2@example.com',
                summary: 'Work Calendar',
                timeZone: 'America/Los_Angeles',
                accessRole: 'writer',
                primary: false,
                backgroundColor: '#f691b2',
                foregroundColor: '#000000',
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await listCalendarList({});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Calendar List');
    expect(result.content[0].text).toContain('2 calendars');
    expect(result.content[0].text).toContain('My Calendar');
    expect(result.content[0].text).toContain('[PRIMARY]');
    expect(result.content[0].text).toContain('Work Calendar');

    expect(mockCalendar.calendarList.list).toHaveBeenCalledWith({
      maxResults: undefined,
      minAccessRole: undefined,
      pageToken: undefined,
      showDeleted: undefined,
      showHidden: undefined,
    });
  });

  it('should handle pagination', async () => {
    const mockCalendar = {
      calendarList: {
        list: vi.fn().mockResolvedValue({
          data: {
            items: [
              {
                id: 'calendar1@example.com',
                summary: 'Calendar 1',
                timeZone: 'UTC',
                accessRole: 'reader',
              },
            ],
            nextPageToken: 'next-page-token-123',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await listCalendarList({
      maxResults: 1,
      pageToken: 'current-token',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('next-page-token-123');

    expect(mockCalendar.calendarList.list).toHaveBeenCalledWith({
      maxResults: 1,
      minAccessRole: undefined,
      pageToken: 'current-token',
      showDeleted: undefined,
      showHidden: undefined,
    });
  });

  it('should filter by minAccessRole', async () => {
    const mockCalendar = {
      calendarList: {
        list: vi.fn().mockResolvedValue({
          data: {
            items: [
              {
                id: 'primary',
                summary: 'My Calendar',
                timeZone: 'UTC',
                accessRole: 'owner',
                primary: true,
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await listCalendarList({
      minAccessRole: 'writer',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('My Calendar');

    expect(mockCalendar.calendarList.list).toHaveBeenCalledWith({
      maxResults: undefined,
      minAccessRole: 'writer',
      pageToken: undefined,
      showDeleted: undefined,
      showHidden: undefined,
    });
  });

  it('should handle empty result', async () => {
    const mockCalendar = {
      calendarList: {
        list: vi.fn().mockResolvedValue({
          data: {
            items: [],
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await listCalendarList({});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('No calendars found');
  });

  it('should handle errors gracefully', async () => {
    const mockCalendar = {
      calendarList: {
        list: vi.fn().mockRejectedValue(new Error('API Error')),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await listCalendarList({});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
