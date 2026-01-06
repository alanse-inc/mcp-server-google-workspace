import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { moveEvent } from '../calendar/events_advanced/calendar_events_move.js';

vi.mock('googleapis');

describe('calendar_events_move', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should move event successfully', async () => {
    const mockCalendar = {
      events: {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'event-123',
            summary: 'Team Meeting',
            start: { dateTime: '2024-01-15T10:00:00Z' },
            end: { dateTime: '2024-01-15T11:00:00Z' },
          },
        }),
        move: vi.fn().mockResolvedValue({
          data: {
            id: 'event-123',
            summary: 'Team Meeting',
            start: { dateTime: '2024-01-15T10:00:00Z' },
            end: { dateTime: '2024-01-15T11:00:00Z' },
            htmlLink: 'https://calendar.google.com/event-123',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await moveEvent({
      calendarId: 'source@example.com',
      eventId: 'event-123',
      destination: 'destination@example.com',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Event moved successfully');
    expect(result.content[0].text).toContain('From Calendar: source@example.com');
    expect(result.content[0].text).toContain('To Calendar: destination@example.com');
    expect(result.content[0].text).toContain('Team Meeting');

    expect(mockCalendar.events.get).toHaveBeenCalledWith({
      calendarId: 'source@example.com',
      eventId: 'event-123',
    });

    expect(mockCalendar.events.move).toHaveBeenCalledWith({
      calendarId: 'source@example.com',
      eventId: 'event-123',
      destination: 'destination@example.com',
      sendUpdates: 'none',
    });
  });

  it('should support sendUpdates parameter', async () => {
    const mockCalendar = {
      events: {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'event-456',
            summary: 'Project Review',
          },
        }),
        move: vi.fn().mockResolvedValue({
          data: {
            id: 'event-456',
            summary: 'Project Review',
            start: { dateTime: '2024-01-16T14:00:00Z' },
            end: { dateTime: '2024-01-16T15:00:00Z' },
            htmlLink: 'https://calendar.google.com/event-456',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await moveEvent({
      calendarId: 'work@example.com',
      eventId: 'event-456',
      destination: 'archive@example.com',
      sendUpdates: 'all',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Project Review');

    expect(mockCalendar.events.move).toHaveBeenCalledWith({
      calendarId: 'work@example.com',
      eventId: 'event-456',
      destination: 'archive@example.com',
      sendUpdates: 'all',
    });
  });

  it('should move event between different calendars', async () => {
    const mockCalendar = {
      events: {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'personal-event',
            summary: 'Personal Appointment',
          },
        }),
        move: vi.fn().mockResolvedValue({
          data: {
            id: 'personal-event',
            summary: 'Personal Appointment',
            start: { dateTime: '2024-01-20T15:00:00Z' },
            end: { dateTime: '2024-01-20T16:00:00Z' },
            htmlLink: 'https://calendar.google.com/personal-event',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await moveEvent({
      calendarId: 'primary',
      eventId: 'personal-event',
      destination: 'personal@example.com',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Personal Appointment');
    expect(result.content[0].text).toContain('From Calendar: primary');
    expect(result.content[0].text).toContain('To Calendar: personal@example.com');
  });

  it('should handle errors gracefully', async () => {
    const mockCalendar = {
      events: {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'event-error',
            summary: 'Test Event',
          },
        }),
        move: vi.fn().mockRejectedValue(new Error('Permission denied')),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await moveEvent({
      calendarId: 'source@example.com',
      eventId: 'event-error',
      destination: 'forbidden@example.com',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
