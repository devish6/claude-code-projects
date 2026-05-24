// MG Kutz — Google Calendar Helpers
// ⚠️  Replace GOOGLE_CLIENT_ID with your OAuth Client ID from Google Cloud Console
// Found at: console.cloud.google.com → APIs & Services → Credentials → OAuth 2.0 Client IDs
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar.events';

/**
 * Refresh a barber's Google Calendar access token if expired.
 * tokenObj: { access_token, refresh_token, expiry_date }
 * Returns updated tokenObj (caller must save to Supabase).
 */
async function refreshTokenIfNeeded(tokenObj) {
  if (!tokenObj) return null;
  const now = Date.now();
  // Refresh if expired or expires within 5 minutes
  if (tokenObj.expiry_date && tokenObj.expiry_date - now > 5 * 60 * 1000) {
    return tokenObj; // still valid
  }
  // Note: True token refresh requires a backend (client secret can't be in frontend).
  // For this setup, the admin.html OAuth flow re-fetches a fresh token.
  // This function signals that a re-auth may be needed.
  console.warn('GCal token may be expired. Barber may need to reconnect Google Calendar in admin panel.');
  return tokenObj; // Return as-is; createEvent will fail if truly expired
}

/**
 * Check free/busy for a barber on a given date.
 * Returns array of busy intervals: [{ start: ISO, end: ISO }, ...]
 * accessToken: string, calendarId: string, date: 'YYYY-MM-DD'
 */
async function checkFreeBusy(accessToken, calendarId, date) {
  // Shop hours per day (0=Sun, 1=Mon ... 6=Sat)
  const shopHours = {
    0: { open: '09:30', close: '20:00' }, // Sun
    1: { open: '12:00', close: '19:30' }, // Mon
    2: { open: '09:30', close: '20:00' }, // Tue
    3: { open: '09:30', close: '20:00' }, // Wed
    4: { open: '09:30', close: '20:00' }, // Thu
    5: { open: '09:30', close: '20:30' }, // Fri
    6: { open: '09:30', close: '20:30' }, // Sat
  };

  const dayOfWeek = new Date(date + 'T12:00:00').getDay();
  const hours = shopHours[dayOfWeek];
  if (!hours) return [];

  const timeMin = `${date}T${hours.open}:00-05:00`; // EST
  const timeMax = `${date}T${hours.close}:00-05:00`;

  try {
    const resp = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeMin,
        timeMax,
        items: [{ id: calendarId }],
      }),
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.calendars?.[calendarId]?.busy || [];
  } catch {
    return [];
  }
}

/**
 * Generate available time slots for a date, excluding busy intervals.
 * Returns array of ISO strings for slot start times.
 * slotMinutes: duration of the appointment in minutes (30 or 60)
 */
function getAvailableSlots(busyIntervals, date, slotMinutes) {
  const shopHours = {
    0: { open: '09:30', close: '20:00' },
    1: { open: '12:00', close: '19:30' },
    2: { open: '09:30', close: '20:00' },
    3: { open: '09:30', close: '20:00' },
    4: { open: '09:30', close: '20:00' },
    5: { open: '09:30', close: '20:30' },
    6: { open: '09:30', close: '20:30' },
  };

  const dayOfWeek = new Date(date + 'T12:00:00').getDay();
  const hours = shopHours[dayOfWeek];
  if (!hours) return [];

  const slots = [];
  let cursor = new Date(`${date}T${hours.open}:00`);
  const end = new Date(`${date}T${hours.close}:00`);

  while (cursor.getTime() + slotMinutes * 60000 <= end.getTime()) {
    const slotEnd = new Date(cursor.getTime() + slotMinutes * 60000);

    // Check if this slot overlaps with any busy interval
    const isBusy = busyIntervals.some(b => {
      const busyStart = new Date(b.start);
      const busyEnd = new Date(b.end);
      return cursor < busyEnd && slotEnd > busyStart;
    });

    if (!isBusy) {
      slots.push(cursor.toISOString());
    }

    cursor = new Date(cursor.getTime() + 30 * 60000); // advance by 30min increments
  }

  return slots;
}

/**
 * Create a Google Calendar event for a booking.
 * booking: { service, clientName, clientPhone, startISO, endISO }
 * Returns the created event ID or null on failure.
 */
async function createCalendarEvent(accessToken, calendarId, booking) {
  try {
    const resp = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: `${booking.service} — ${booking.clientName}`,
          description: `Client: ${booking.clientName}\nPhone: ${booking.clientPhone}\nService: ${booking.service}\n\nBooked via MG Kutz website.`,
          start: { dateTime: booking.startISO, timeZone: 'America/Toronto' },
          end: { dateTime: booking.endISO, timeZone: 'America/Toronto' },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'popup', minutes: 30 },
              { method: 'email', minutes: 30 },
            ],
          },
        }),
      }
    );
    if (!resp.ok) {
      console.error('Calendar event creation failed:', await resp.text());
      return null;
    }
    const event = await resp.json();
    return event.id;
  } catch (err) {
    console.error('Calendar event error:', err);
    return null;
  }
}
