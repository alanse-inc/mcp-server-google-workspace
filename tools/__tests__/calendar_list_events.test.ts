import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { listEvents } from '../calendar/basic/calendar_list_events.js';

vi.mock('googleapis');

describe('calendar_list_events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list events successfully', async () => {
    const mockCalendar = {
      events: {
        list: vi.fn().mockResolvedValue({
          data: {
            items: [
              {
                id: 'event1',
                summary: 'Team Meeting',
                start: { dateTime: '2024-01-15T10:00:00Z' },
                end: { dateTime: '2024-01-15T11:00:00Z' },
                htmlLink: 'https://calendar.google.com/event1',
              },
              {
                id: 'event2',
                summary: 'Project Review',
                start: { dateTime: '2024-01-16T14:00:00Z' },
                end: { dateTime: '2024-01-16T15:00:00Z' },
                htmlLink: 'https://calendar.google.com/event2',
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await listEvents({
      timeMin: '2024-01-15T00:00:00Z',
      timeMax: '2024-01-31T23:59:59Z',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Found 2 event(s)');
    expect(result.content[0].text).toContain('Team Meeting');
    expect(result.content[0].text).toContain('Project Review');

    expect(mockCalendar.events.list).toHaveBeenCalledWith({
      calendarId: 'primary',
      timeMin: '2024-01-15T00:00:00Z',
      timeMax: '2024-01-31T23:59:59Z',
      q: undefined,
      maxResults: 10,
      pageToken: undefined,
      singleEvents: true,
      orderBy: 'startTime',
    });
  });

  it('should handle pagination', async () => {
    const mockCalendar = {
      events: {
        list: vi.fn().mockResolvedValue({
          data: {
            items: [
              {
                id: 'event1',
                summary: 'Event 1',
                start: { dateTime: '2024-01-15T10:00:00Z' },
                end: { dateTime: '2024-01-15T11:00:00Z' },
              },
            ],
            nextPageToken: 'next-page-token-123',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await listEvents({
      maxResults: 10,
      pageToken: 'current-token',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('next-page-token-123');

    expect(mockCalendar.events.list).toHaveBeenCalledWith({
      calendarId: 'primary',
      timeMin: undefined,
      timeMax: undefined,
      q: undefined,
      maxResults: 10,
      pageToken: 'current-token',
      singleEvents: true,
      orderBy: 'startTime',
    });
  });

  it('should handle search query', async () => {
    const mockCalendar = {
      events: {
        list: vi.fn().mockResolvedValue({
          data: {
            items: [
              {
                id: 'event1',
                summary: 'Meeting with John',
                start: { dateTime: '2024-01-15T10:00:00Z' },
                end: { dateTime: '2024-01-15T11:00:00Z' },
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await listEvents({
      q: 'Meeting',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Meeting with John');

    expect(mockCalendar.events.list).toHaveBeenCalledWith({
      calendarId: 'primary',
      timeMin: undefined,
      timeMax: undefined,
      q: 'Meeting',
      maxResults: 10,
      pageToken: undefined,
      singleEvents: true,
      orderBy: 'startTime',
    });
  });

  it('should handle no results', async () => {
    const mockCalendar = {
      events: {
        list: vi.fn().mockResolvedValue({
          data: {
            items: [],
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await listEvents({});

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('No events found');
  });

  it('should handle errors gracefully', async () => {
    const mockCalendar = {
      events: {
        list: vi.fn().mockRejectedValue(new Error('API Error')),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await listEvents({});

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
