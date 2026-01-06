import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { getEvent } from '../calendar/basic/calendar_get_event.js';

vi.mock('googleapis');

describe('calendar_get_event', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get event successfully', async () => {
    const mockCalendar = {
      events: {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'event123',
            summary: 'Team Meeting',
            start: { dateTime: '2024-01-15T10:00:00Z' },
            end: { dateTime: '2024-01-15T11:00:00Z' },
            location: 'Conference Room A',
            description: 'Discuss Q1 plans',
            attendees: [
              { email: 'john@example.com', responseStatus: 'accepted' },
              { email: 'jane@example.com', responseStatus: 'needsAction' },
            ],
            htmlLink: 'https://calendar.google.com/event123',
            status: 'confirmed',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await getEvent({
      eventId: 'event123',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Event ID: event123');
    expect(result.content[0].text).toContain('Team Meeting');
    expect(result.content[0].text).toContain('Conference Room A');
    expect(result.content[0].text).toContain('Discuss Q1 plans');

    expect(mockCalendar.events.get).toHaveBeenCalledWith({
      calendarId: 'primary',
      eventId: 'event123',
    });
  });

  it('should handle custom calendar ID', async () => {
    const mockCalendar = {
      events: {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'event456',
            summary: 'Custom Calendar Event',
            start: { dateTime: '2024-01-15T10:00:00Z' },
            end: { dateTime: '2024-01-15T11:00:00Z' },
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await getEvent({
      calendarId: 'custom@group.calendar.google.com',
      eventId: 'event456',
    });

    expect(result.isError).toBe(false);

    expect(mockCalendar.events.get).toHaveBeenCalledWith({
      calendarId: 'custom@group.calendar.google.com',
      eventId: 'event456',
    });
  });

  it('should handle event not found', async () => {
    const mockCalendar = {
      events: {
        get: vi.fn().mockResolvedValue({
          data: null,
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await getEvent({
      eventId: 'nonexistent',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('not found');
  });

  it('should handle errors gracefully', async () => {
    const mockCalendar = {
      events: {
        get: vi.fn().mockRejectedValue(new Error('Event not found')),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await getEvent({
      eventId: 'event123',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
