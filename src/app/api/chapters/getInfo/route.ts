/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { summeryChain } from "~/lib/ai";
import { getTranscript, getYoutubeVideoId } from "~/lib/youtube";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { chapters } from "~/server/db/schema";

const bodyParse = z.object({
  lessonId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to create a course" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { lessonId } = bodyParse.parse(body);
    const cnt = 0;
    const chapter = await db.query.chapters.findFirst({
      where: eq(chapters.id, lessonId),
    });

    if (!chapter) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    const { youtubeSearchQuery, summery, videoId } = chapter;
    let search_videoId: string | undefined = undefined;

    if (!summery && !videoId) {
      for (let attempt = 0; attempt < 5; attempt++) {
        if (!search_videoId) {
          try {
            search_videoId = await getYoutubeVideoId(youtubeSearchQuery!);
            if (search_videoId) break;
          } catch (error) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }
      if (search_videoId) {
        const transcript = await getTranscript(search_videoId);

        await new Promise((res) => setTimeout(res, 1000));
        if (transcript) {
          let summeryResponse: { summery: string } | undefined = undefined;
          for (let attempt = 0; attempt < 5; attempt++) {
            if (!summeryResponse) {
              summeryResponse = await summeryChain.invoke({
                transcript,
              });
              if (summeryResponse) {
                break;
              }
            } else {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }

          if (summeryResponse!.summery) {
            await db
              .update(chapters)
              .set({
                videoId: search_videoId,
                summery: summeryResponse!.summery,
              })
              .where(eq(chapters.id, lessonId));
            return NextResponse.json({ success: true }, { status: 200 });
          }
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // console.log(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to  create chapter", success: false },
      { status: 500 },
    );
  }
}
