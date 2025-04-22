/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import axios from "axios";
import { YoutubeTranscript } from "youtube-transcript";
import { env } from "~/env";
export async function getYoutubeVideoId(searchQuery: string) {
  searchQuery = encodeURIComponent(searchQuery);
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
    searchQuery,
  )}&key=${env.YOUTUBE_API_KEY}`;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data } = await axios.get(url);

  if (!data.items![0]) {
    return null;
  }

  return data.items![0].id.videoId;
}

export async function getTranscript(videoId: string) {
  try {
    const data = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "en",
    });
    let transcript = "";
    data.forEach((item) => {
      transcript += item.text + " ";
    });
    return transcript.replaceAll("\n", " ");
  } catch (error) {
    return null;
  }
}
