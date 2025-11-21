// src/utils/generateICS.js
import ics from 'ics';

export const generateICS = (session) => {
  const event = {
    start: [
      session.startTime.getFullYear(),
      session.startTime.getMonth() + 1,
      session.startTime.getDate(),
      session.startTime.getHours(),
      session.startTime.getMinutes(),
    ],
    duration: { hours: 1 },
    title: `MentorConnect: ${session.topic}`,
    description: `Session with ${session.mentor?.profile?.fullName || 'Mentor'}`,
    location: session.zoomLink,
    url: session.zoomLink,
    status: 'CONFIRMED',
  };

  const { error, value } = ics.createEvent(event);
  if (error) {
    console.error('ICS Error:', error);
    return null;
  }
  return value;
};