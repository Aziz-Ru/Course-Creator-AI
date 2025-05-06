/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/await-thenable */
import axios from "axios";
import { YoutubeTranscript } from "youtube-transcript";
const youtubeEndpoint = `https://www.youtube.com`;

export interface YouTubeVideoItem {
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    // Add other properties as needed
  };
}

export interface YouTubeSearchResponse {
  kind: string;
  etag: string;
  items: YouTubeVideoItem[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}
// export async function getYoutubeVideoId(searchQuery: string) {
//   try {
//     searchQuery = encodeURIComponent(searchQuery);

//     const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
//       searchQuery,
//     )}&key=${env.YOUTUBE_API_KEY}`;

//     const { data } = await axios.get<YouTubeSearchResponse>(url);
//     if (data.items.length == 0 || !data.items) {
//       throw new Error("No video found");
//     }
//     return data.items[0].id.videoId;
//   } catch (error) {
//     console.log(error);
//     if (error instanceof AxiosError) {
//       error.message = error.response?.data.error?.message;
//     }
//     throw error;
//   }
// }

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
    console.error("Error fetching transcript:", error);
    return null;
  }
}

const GetYoutubeInitData = async (url: string) => {
  let initdata = await {};
  let apiToken = await null;
  let context = await null;
  try {
    const page = await axios.get(encodeURI(url));
    const ytInitData = await page.data.split("var ytInitialData =");
    if (ytInitData && ytInitData.length > 1) {
      const data = await ytInitData[1].split("</script>")[0].slice(0, -1);

      if (page.data.split("innertubeApiKey").length > 0) {
        apiToken = await page.data
          .split("innertubeApiKey")[1]
          .trim()
          .split(",")[0]
          .split('"')[2];
      }

      if (page.data.split("INNERTUBE_CONTEXT").length > 0) {
        context = await JSON.parse(
          page.data.split("INNERTUBE_CONTEXT")[1].trim().slice(2, -2),
        );
      }

      initdata = await JSON.parse(data);
      return await Promise.resolve({ initdata, apiToken, context });
    } else {
      console.error("cannot_get_init_data");
      return await Promise.reject("cannot_get_init_data");
    }
  } catch (ex) {
    await console.error(ex);
    return await Promise.reject(ex);
  }
};

export const GetYouTubeVideo = async ({
  keyword,
  withPlaylist = false,
  limit = 0,
  options,
}: {
  keyword: string;
  withPlaylist?: boolean;
  limit?: number;
  options?: [{ type: string }];
}) => {
  let endpoint = await `${youtubeEndpoint}/results?search_query=${keyword}`;
  try {
    if (Array.isArray(options) && options.length > 0) {
      const type: any = options.find((z: any) => z.type);
      if (typeof type == "object") {
        if (typeof type.type == "string") {
          switch (type.type.toLowerCase()) {
            case "video":
              endpoint = `${endpoint}&sp=EgIQAQ%3D%3D`;
              break;
            case "channel":
              endpoint = `${endpoint}&sp=EgIQAg%3D%3D`;
              break;
            case "playlist":
              endpoint = `${endpoint}&sp=EgIQAw%3D%3D`;
              break;
            case "movie":
              endpoint = `${endpoint}&sp=EgIQBA%3D%3D`;
              break;
          }
        }
      }
    }
    const page: any = await GetYoutubeInitData(endpoint);

    const sectionListRenderer =
      await page.initdata.contents.twoColumnSearchResultsRenderer
        .primaryContents.sectionListRenderer;

    let contToken = await {};

    const items: any = await [];

    await sectionListRenderer.contents.forEach((content: any) => {
      if (content.continuationItemRenderer) {
        contToken =
          content.continuationItemRenderer.continuationEndpoint
            .continuationCommand.token;
      } else if (content.itemSectionRenderer) {
        content.itemSectionRenderer.contents.forEach((item: any) => {
          if (item.channelRenderer) {
            const channelRenderer: any = item.channelRenderer;
            items.push({
              id: channelRenderer.channelId,
              type: "channel",
              thumbnail: channelRenderer.thumbnail,
              title: channelRenderer.title.simpleText,
            });
          } else {
            const videoRender = item.videoRenderer;
            const playListRender = item.playlistRenderer;

            if (videoRender?.videoId) {
              items.push(VideoRender(item));
            }
            if (withPlaylist) {
              if (playListRender?.playlistId) {
                items.push({
                  id: playListRender.playlistId,
                  type: "playlist",
                  thumbnail: playListRender.thumbnails,
                  title: playListRender.title.simpleText,
                  length: playListRender.videoCount,
                  videos: playListRender.videos,
                  videoCount: playListRender.videoCount,
                  isLive: false,
                });
              }
            }
          }
        });
      }
    });
    // const apiToken = await page.apiToken;
    // const context = await page.context;
    // const nextPageContext = await { context: context, continuation: contToken };
    const itemsResult = limit != 0 ? items.slice(0, limit) : items;
    return await Promise.resolve({
      items: itemsResult,
    });
  } catch (ex) {
    await console.error(ex);
    return await Promise.reject(ex);
  }
};

const VideoRender = (json: any) => {
  try {
    if (json && (json.videoRenderer || json.playlistVideoRenderer)) {
      let videoRenderer = null;
      if (json.videoRenderer) {
        videoRenderer = json.videoRenderer;
      } else if (json.playlistVideoRenderer) {
        videoRenderer = json.playlistVideoRenderer;
      }
      let isLive = false;
      if (
        videoRenderer.badges &&
        videoRenderer.badges.length > 0 &&
        videoRenderer.badges[0].metadataBadgeRenderer &&
        videoRenderer.badges[0].metadataBadgeRenderer.style ==
          "BADGE_STYLE_TYPE_LIVE_NOW"
      ) {
        isLive = true;
      }
      if (videoRenderer.thumbnailOverlays) {
        videoRenderer.thumbnailOverlays.forEach((item: any) => {
          if (
            item.thumbnailOverlayTimeStatusRenderer?.style &&
            item.thumbnailOverlayTimeStatusRenderer.style == "LIVE"
          ) {
            isLive = true;
          }
        });
      }
      const id = videoRenderer.videoId;
      const thumbnail = videoRenderer.thumbnail;
      const title = videoRenderer.title.runs[0].text;
      const shortBylineText = videoRenderer.shortBylineText
        ? videoRenderer.shortBylineText
        : "";
      const lengthText = videoRenderer.lengthText
        ? videoRenderer.lengthText
        : "";
      const channelTitle = videoRenderer.ownerText?.runs
        ? videoRenderer.ownerText.runs[0].text
        : "";
      return {
        id,
        type: "video",
        thumbnail,
        title,
        channelTitle,
        shortBylineText,
        length: lengthText,
        isLive,
      };
    } else {
      return {};
    }
  } catch (ex) {
    throw ex;
  }
};
