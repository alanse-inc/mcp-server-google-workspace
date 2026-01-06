import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { quickAddEvent } from '../calendar/events_advanced/calendar_events_quickadd.js';

vi.mock('googleapis');

describe('calendar_events_quickadd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create event from natural language successfully', async () => {
    const mockCalendar = {
      events: {
        quickAdd: vi.fn().mockResolvedValue({
          data: {
            id: 'quickadd-event-123',
            summary: 'Meeting with John',
            start: { dateTime: '2024-01-15T14:00:00Z' },
            end: { dateTime: '2024-01-15T15:00:00Z' },
            htmlLink: 'https://calendar.google.com/quickadd-event-123',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await quickAddEvent({
      text: 'Meeting with John tomorrow at 2pm',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Event created via QuickAdd');
    expect(result.content[0].text).toContain('Meeting with John tomorrow at 2pm');
    expect(result.content[0].text).toContain('Meeting with John');

    expect(mockCalendar.events.quickAdd).toHaveBeenCalledWith({
      calendarId: 'primary',
      text: 'Meeting with John tomorrow at 2pm',
      sendUpdates: 'none',
    });
  });

  it('should support sendUpdates parameter', async () => {
    const mockCalendar = {
      events: {
        quickAdd: vi.fn().mockResolvedValue({
          data: {
            id: 'event-123',
            summary: 'Team Standup',
            start: { dateTime: '2024-01-16T09:00:00Z' },
            end: { dateTime: '2024-01-16T09:30:00Z' },
            htmlLink: 'https://calendar.google.com/event-123',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await quickAddEvent({
      calendarId: 'work@example.com',
      text: 'Team Standup tomorrow 9am',
      sendUpdates: 'all',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Team Standup');

    expect(mockCalendar.events.quickAdd).toHaveBeenCalledWith({
      calendarId: 'work@example.com',
      text: 'Team Standup tomorrow 9am',
      sendUpdates: 'all',
    });
  });

  it('should parse various natural language formats', async () => {
    const mockCalendar = {
      events: {
        quickAdd: vi.fn().mockResolvedValue({
          data: {
            id: 'lunch-event',
            summary: 'Lunch',
            start: { dateTime: '2024-01-19T12:00:00Z' },
            end: { dateTime: '2024-01-19T13:00:00Z' },
            htmlLink: 'https://calendar.google.com/lunch-event',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await quickAddEvent({
      text: 'Lunch at noon on Friday',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Lunch at noon on Friday');
    expect(result.content[0].text).toContain('Lunch');
  });

  it('should handle errors gracefully', async () => {
    const mockCalendar = {
      events: {
        quickAdd: vi.fn().mockRejectedValue(new Error('Invalid text format')),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await quickAddEvent({
      text: 'Invalid event description',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
