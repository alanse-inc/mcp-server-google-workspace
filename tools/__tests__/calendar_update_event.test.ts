import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { updateEvent } from '../calendar/basic/calendar_update_event.js';

vi.mock('googleapis');

describe('calendar_update_event', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockExistingEvent = {
    id: 'event123',
    summary: 'Original Meeting',
    start: { dateTime: '2024-01-15T10:00:00Z' },
    end: { dateTime: '2024-01-15T11:00:00Z' },
    location: 'Office',
    description: 'Original description',
  };

  it('should update event summary successfully', async () => {
    const mockCalendar = {
      events: {
        get: vi.fn().mockResolvedValue({
          data: mockExistingEvent,
        }),
        update: vi.fn().mockResolvedValue({
          data: {
            ...mockExistingEvent,
            summary: 'Updated Meeting',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await updateEvent({
      eventId: 'event123',
      summary: 'Updated Meeting',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Event updated successfully');
    expect(result.content[0].text).toContain('Updated Meeting');

    expect(mockCalendar.events.get).toHaveBeenCalledWith({
      calendarId: 'primary',
      eventId: 'event123',
    });

    expect(mockCalendar.events.update).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarId: 'primary',
        eventId: 'event123',
        sendUpdates: 'all',
      })
    );
  });

  it('should update event time successfully', async () => {
    const mockCalendar = {
      events: {
        get: vi.fn().mockResolvedValue({
          data: mockExistingEvent,
        }),
        update: vi.fn().mockResolvedValue({
          data: {
            ...mockExistingEvent,
            start: { dateTime: '2024-01-16T14:00:00Z' },
            end: { dateTime: '2024-01-16T15:00:00Z' },
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await updateEvent({
      eventId: 'event123',
      startTime: '2024-01-16T14:00:00Z',
      endTime: '2024-01-16T15:00:00Z',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Event updated successfully');
  });

  it('should update multiple fields', async () => {
    const mockCalendar = {
      events: {
        get: vi.fn().mockResolvedValue({
          data: mockExistingEvent,
        }),
        update: vi.fn().mockResolvedValue({
          data: {
            ...mockExistingEvent,
            summary: 'Completely Updated',
            location: 'New Office',
            description: 'New description',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await updateEvent({
      eventId: 'event123',
      summary: 'Completely Updated',
      location: 'New Office',
      description: 'New description',
    });

    expect(result.isError).toBe(false);
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

    const result = await updateEvent({
      eventId: 'nonexistent',
      summary: 'Updated',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('not found');
  });

  it('should reject partial time updates', async () => {
    const mockCalendar = {
      events: {
        get: vi.fn().mockResolvedValue({
          data: mockExistingEvent,
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await updateEvent({
      eventId: 'event123',
      startTime: '2024-01-16T14:00:00Z',
      // Missing endTime
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Both startTime and endTime must be provided together');
  });

  it('should handle errors gracefully', async () => {
    const mockCalendar = {
      events: {
        get: vi.fn().mockRejectedValue(new Error('Update failed')),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await updateEvent({
      eventId: 'event123',
      summary: 'Updated',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
