// Fallback function for simulated Zoom links
export const generateZoomLink = (sessionId) => {
  const fakeId = Math.floor(100000000 + Math.random() * 900000000);

  return {
    meeting_id: fakeId.toString(),
    join_url: `https://zoom.us/j/${fakeId}?pwd=mentorconnect2025&session=${sessionId}`,
    password: "mentorconnect",
    encrypted_password: "mentorconnect",
  };
};
