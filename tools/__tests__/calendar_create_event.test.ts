import { describe, it, expect, vi, beforeEach } from 'vitest';
import { google } from 'googleapis';
import { createEvent } from '../calendar/basic/calendar_create_event.js';

vi.mock('googleapis');

describe('calendar_create_event', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create event successfully', async () => {
    const mockCalendar = {
      events: {
        insert: vi.fn().mockResolvedValue({
          data: {
            id: 'new-event-123',
            summary: 'New Meeting',
            start: { dateTime: '2024-01-15T10:00:00Z' },
            end: { dateTime: '2024-01-15T11:00:00Z' },
            location: 'Office',
            description: 'Discuss new project',
            htmlLink: 'https://calendar.google.com/new-event-123',
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await createEvent({
      summary: 'New Meeting',
      startTime: '2024-01-15T10:00:00Z',
      endTime: '2024-01-15T11:00:00Z',
      location: 'Office',
      description: 'Discuss new project',
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Event created successfully');
    expect(result.content[0].text).toContain('New Meeting');

    expect(mockCalendar.events.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarId: 'primary',
        sendUpdates: 'none',
        requestBody: expect.objectContaining({
          summary: 'New Meeting',
          start: { dateTime: '2024-01-15T10:00:00Z' },
          end: { dateTime: '2024-01-15T11:00:00Z' },
          location: 'Office',
          description: 'Discuss new project',
        }),
      })
    );
  });

  it('should create event with attendees', async () => {
    const mockCalendar = {
      events: {
        insert: vi.fn().mockResolvedValue({
          data: {
            id: 'event-with-attendees',
            summary: 'Team Meeting',
            start: { dateTime: '2024-01-15T10:00:00Z' },
            end: { dateTime: '2024-01-15T11:00:00Z' },
            attendees: [
              { email: 'john@example.com' },
              { email: 'jane@example.com' },
            ],
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await createEvent({
      summary: 'Team Meeting',
      startTime: '2024-01-15T10:00:00Z',
      endTime: '2024-01-15T11:00:00Z',
      attendees: ['john@example.com', 'jane@example.com'],
      sendUpdates: 'all',
    });

    expect(result.isError).toBe(false);

    expect(mockCalendar.events.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        sendUpdates: 'all',
        requestBody: expect.objectContaining({
          attendees: [
            { email: 'john@example.com' },
            { email: 'jane@example.com' },
          ],
        }),
      })
    );
  });

  it('should create event with Google Meet', async () => {
    const mockCalendar = {
      events: {
        insert: vi.fn().mockResolvedValue({
          data: {
            id: 'event-with-meet',
            summary: 'Virtual Meeting',
            start: { dateTime: '2024-01-15T10:00:00Z' },
            end: { dateTime: '2024-01-15T11:00:00Z' },
            conferenceData: {
              entryPoints: [
                {
                  entryPointType: 'video',
                  uri: 'https://meet.google.com/abc-defg-hij',
                },
              ],
            },
          },
        }),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await createEvent({
      summary: 'Virtual Meeting',
      startTime: '2024-01-15T10:00:00Z',
      endTime: '2024-01-15T11:00:00Z',
      conferenceData: true,
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Virtual Meeting');

    expect(mockCalendar.events.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        conferenceDataVersion: 1,
        requestBody: expect.objectContaining({
          conferenceData: expect.objectContaining({
            createRequest: expect.any(Object),
          }),
        }),
      })
    );
  });

  it('should handle invalid time range', async () => {
    const result = await createEvent({
      summary: 'Invalid Event',
      startTime: '2024-01-15T11:00:00Z',
      endTime: '2024-01-15T10:00:00Z', // End before start
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('End time must be after start time');
  });

  it('should handle errors gracefully', async () => {
    const mockCalendar = {
      events: {
        insert: vi.fn().mockRejectedValue(new Error('Creation failed')),
      },
    };

    vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

    const result = await createEvent({
      summary: 'Test Event',
      startTime: '2024-01-15T10:00:00Z',
      endTime: '2024-01-15T11:00:00Z',
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error');
  });
});
