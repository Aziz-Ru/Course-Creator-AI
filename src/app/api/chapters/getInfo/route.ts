/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSummeryResponse } from "~/lib/ai";
import { getTranscript, GetYouTubeVideo } from "~/lib/youtube";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { lessons } from "~/server/db/schema";

const bodyParse = z.object({
  lessonId: z.string().uuid(),
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
    });

    if (!lesson) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    const { youtubeSearchQuery, success, videoId } = lesson;
    console.log(success, videoId);
    if (!success) {
      // console.log("Requesting videoId");
      try {
        const { items } = await GetYouTubeVideo({
          keyword: youtubeSearchQuery!,
          limit: 1,
          withPlaylist: false,
          options: [{ type: "video" }],
        });
        const search_videoId: string = items[0]?.id;

        if (search_videoId) {
          const transcript = await getTranscript(search_videoId);

          await sleep(500);
          if (transcript) {
            const summery = await getSummeryResponse(transcript);
            // console.log("summery", summery);
            if (summery) {
              // console.log(lessonId);
              // console.log(lessons.id);
              // console.log(search_videoId);
              await db
                .update(lessons)
                .set({
                  videoId: search_videoId,
                  summery: summery,
                  success: true,
                })
                .where(eq(lessons.id, lessonId));
              // console.log("Saved successfully");
              return NextResponse.json({ success: true }, { status: 200 });
            }
          } else {
            await db
              .update(lessons)
              .set({
                videoId: search_videoId,
                success: true,
              })
              .where(eq(lessons.id, lessonId));
          }
        } else {
          // console.log("No video found");
          return NextResponse.json(
            {
              error: "No video found",
              success: false,
            },
            { status: 404 },
          );
        }
        return NextResponse.json({
          error: "No video found",
        });
      } catch (error) {
        return NextResponse.json(
          {
            error: "Failed to fetch videoId Or Youtube request exceeded",
            success: false,
          },
          { status: 500 },
        );
      }
    } else {
      console.log("Already have videoId", videoId, success);

      return NextResponse.json({ success: true }, { status: 200 });
    }
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to  create chapter", success: false },
      { status: 500 },
    );
  }
}
