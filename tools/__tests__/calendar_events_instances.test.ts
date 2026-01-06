import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { listEventInstances } from '../calendar/events_advanced/calendar_events_instances.js';

vi.mock('googleapis');

describe('calendar_events_instances', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list recurring event instances successfully', async () => {
    const mockCalendar = {
      events: {
        instances: vi.fn().mockResolvedValue({
          data: {
            items: [
              {
                id: 'recurring-event-1',
                summary: 'Weekly Team Meeting',
                start: { dateTime: '2024-01-15T10:00:00Z' },
                end: { dateTime: '2024-01-15T11:00:00Z' },
                status: 'confirmed',
              },
              {
                id: 'recurring-event-2',
                summary: 'Weekly Team Meeting',
                start: { dateTime: '2024-01-22T10:00:00Z' },
                end: { dateTime: '2024-01-22T11:00:00Z' },
                status: 'confirmed',
              },
              {
                id: 'recurring-event-3',
                summary: 'Weekly Team Meeting',
                start: { dateTime: '2024-01-29T10:00:00Z' },
                end: { dateTime: '2024-01-29T11:00:00Z' },
                status: 'confirmed',
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await listEventInstances({
      eventId: 'recurring-event-id',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Recurring Event Instances');
    expect(result.content[0].text).toContain('3 instances');
    expect(result.content[0].text).toContain('Weekly Team Meeting');

    expect(mockCalendar.events.instances).toHaveBeenCalledWith({
      calendarId: 'primary',
      eventId: 'recurring-event-id',
      timeMin: undefined,
      timeMax: undefined,
      maxResults: undefined,
      pageToken: undefined,
      showDeleted: undefined,
    });
  });

  it('should support time range filtering', async () => {
    const mockCalendar = {
      events: {
        instances: vi.fn().mockResolvedValue({
          data: {
            items: [
              {
                id: 'instance-1',
                summary: 'Daily Standup',
                start: { dateTime: '2024-01-15T09:00:00Z' },
                end: { dateTime: '2024-01-15T09:30:00Z' },
                status: 'confirmed',
              },
              {
                id: 'instance-2',
                summary: 'Daily Standup',
                start: { dateTime: '2024-01-16T09:00:00Z' },
                end: { dateTime: '2024-01-16T09:30:00Z' },
                status: 'confirmed',
              },
            ],
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await listEventInstances({
      calendarId: 'work@example.com',
      eventId: 'standup-recurring',
      timeMin: '2024-01-15T00:00:00Z',
      timeMax: '2024-01-17T00:00:00Z',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Daily Standup');

    expect(mockCalendar.events.instances).toHaveBeenCalledWith({
      calendarId: 'work@example.com',
      eventId: 'standup-recurring',
      timeMin: '2024-01-15T00:00:00Z',
      timeMax: '2024-01-17T00:00:00Z',
      maxResults: undefined,
      pageToken: undefined,
      showDeleted: undefined,
    });
  });

  it('should handle pagination', async () => {
    const mockCalendar = {
      events: {
        instances: vi.fn().mockResolvedValue({
          data: {
            items: [
              {
                id: 'instance-1',
                summary: 'Recurring Meeting',
                start: { dateTime: '2024-01-15T10:00:00Z' },
                end: { dateTime: '2024-01-15T11:00:00Z' },
                status: 'confirmed',
              },
            ],
            nextPageToken: 'next-page-token-456',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await listEventInstances({
      eventId: 'recurring-id',
      maxResults: 10,
      pageToken: 'current-token',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('next-page-token-456');

    expect(mockCalendar.events.instances).toHaveBeenCalledWith({
      calendarId: 'primary',
      eventId: 'recurring-id',
      timeMin: undefined,
      timeMax: undefined,
      maxResults: 10,
      pageToken: 'current-token',
      showDeleted: undefined,
    });
  });

  it('should handle no instances found', async () => {
    const mockCalendar = {
      events: {
        instances: vi.fn().mockResolvedValue({
          data: {
            items: [],
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await listEventInstances({
      eventId: 'event-with-no-instances',
      timeMin: '2024-12-01T00:00:00Z',
      timeMax: '2024-12-31T23:59:59Z',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('No instances found');
  });

  it('should handle errors gracefully', async () => {
    const mockCalendar = {
      events: {
        instances: vi.fn().mockRejectedValue(new Error('Event not found')),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await listEventInstances({
      eventId: 'nonexistent-event',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
