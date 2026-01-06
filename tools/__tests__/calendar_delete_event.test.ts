import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { deleteEvent } from '../calendar/basic/calendar_delete_event.js';

vi.mock('googleapis');

describe('calendar_delete_event', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete event successfully', async () => {
    const mockCalendar = {
      events: {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'event123',
            summary: 'Meeting to Delete',
          },
        }),
        delete: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await deleteEvent({
      eventId: 'event123',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('deleted successfully');
    expect(result.content[0].text).toContain('Meeting to Delete');
    expect(result.content[0].text).toContain('event123');

    expect(mockCalendar.events.get).toHaveBeenCalledWith({
      calendarId: 'primary',
      eventId: 'event123',
    });

    expect(mockCalendar.events.delete).toHaveBeenCalledWith({
      calendarId: 'primary',
      eventId: 'event123',
      sendUpdates: 'all',
    });
  });

  it('should delete with custom calendar ID', async () => {
    const mockCalendar = {
      events: {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'event456',
            summary: 'Custom Calendar Event',
          },
        }),
        delete: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await deleteEvent({
      calendarId: 'custom@group.calendar.google.com',
      eventId: 'event456',
    });

    expect(result.isError).toBe(false);

    expect(mockCalendar.events.delete).toHaveBeenCalledWith({
      calendarId: 'custom@group.calendar.google.com',
      eventId: 'event456',
      sendUpdates: 'all',
    });
  });

  it('should delete without sending notifications', async () => {
    const mockCalendar = {
      events: {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'event789',
            summary: 'Silent Delete',
          },
        }),
        delete: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await deleteEvent({
      eventId: 'event789',
      sendUpdates: 'none',
    });

    expect(result.isError).toBe(false);

    expect(mockCalendar.events.delete).toHaveBeenCalledWith({
      calendarId: 'primary',
      eventId: 'event789',
      sendUpdates: 'none',
    });
  });

  it('should handle event without title', async () => {
    const mockCalendar = {
      events: {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'event-no-title',
            summary: null,
          },
        }),
        delete: vi.fn().mockResolvedValue({}),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await deleteEvent({
      eventId: 'event-no-title',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('(No title)');
  });

  it('should handle errors gracefully', async () => {
    const mockCalendar = {
      events: {
        get: vi.fn().mockRejectedValue(new Error('Event not found')),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await deleteEvent({
      eventId: 'nonexistent',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
