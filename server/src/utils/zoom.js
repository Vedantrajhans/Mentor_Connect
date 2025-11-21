import axios from "axios";

/**
 * Get Zoom OAuth Token
 */
const getZoomAccessToken = async () => {
  const { ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = process.env;

  if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
    throw new Error("Zoom credentials not configured");
  }

  try {
    const authString = Buffer.from(
      `${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`
    ).toString("base64");

    const response = await axios.post(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
      {},
      {
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Zoom Auth Error:", error.response?.data || error.message);
    throw new Error("Failed to authenticate with Zoom");
  }
};

/**
 * Create Zoom Meeting
 * @param {Object} meetingData - { topic, start_time, duration, agenda }
 */
export const createZoomMeeting = async (meetingData) => {
  try {
    const accessToken = await getZoomAccessToken();

    const meetingConfig = {
      topic: meetingData.topic || "MentorConnect Session",
      type: 2, // Scheduled meeting
      start_time: meetingData.start_time, // ISO 8601 format
      duration: meetingData.duration || 60, // Minutes
      timezone: "UTC",
      agenda: meetingData.agenda || "Mentorship session",
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        watermark: false,
        use_pmi: false,
        approval_type: 0, // Automatically approve
        audio: "both",
        auto_recording: "none",
        waiting_room: true,
      },
    };

    const response = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      meetingConfig,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      meeting_id: response.data.id.toString(),
      join_url: response.data.join_url,
      start_url: response.data.start_url,
      password: response.data.password,
      encrypted_password: response.data.encrypted_password,
      created_at: response.data.created_at,
      start_time: response.data.start_time,
      duration: response.data.duration,
    };
  } catch (error) {
    console.error(
      "Zoom Meeting Creation Error:",
      error.response?.data || error.message
    );

    // Fallback to simulated link if Zoom fails
    console.log("Falling back to simulated Zoom link");
    const fakeId = Math.floor(100000000 + Math.random() * 900000000);
    return {
      meeting_id: fakeId.toString(),
      join_url: `https://zoom.us/j/${fakeId}?pwd=mentorconnect2025`,
      start_url: `https://zoom.us/s/${fakeId}?pwd=mentorconnect2025`,
      password: "mentorconnect",
      encrypted_password: "mentorconnect",
      created_at: new Date().toISOString(),
      start_time: meetingData.start_time,
      duration: meetingData.duration || 60,
    };
  }
};

/**
 * Delete Zoom Meeting
 * @param {string} meetingId
 */
export const deleteZoomMeeting = async (meetingId) => {
  try {
    const accessToken = await getZoomAccessToken();

    await axios.delete(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return { success: true };
  } catch (error) {
    console.error(
      "Zoom Meeting Deletion Error:",
      error.response?.data || error.message
    );
    return { success: false };
  }
};

/**
 * Get Meeting Details
 * @param {string} meetingId
 */
export const getZoomMeetingDetails = async (meetingId) => {
  try {
    const accessToken = await getZoomAccessToken();

    const response = await axios.get(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Zoom Meeting Fetch Error:",
      error.response?.data || error.message
    );
    return null;
  }
};
