import axios from "axios";
import { env } from "~/env";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getUnsplashImage = async (query: string): Promise<any> => {
  try {
    const response = await axios.get(`
      https://api.unsplash.com/search/photos?per_page=1&query=${query}&client_id=${env.UNSPLASH_ACCESS_KEY}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return response.data.results[0].urls.small_s3;
  } catch (error) {
    console.error("Error fetching image from Unsplash:", error);
    return null;
  }
};
