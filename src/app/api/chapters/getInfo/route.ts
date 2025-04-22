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

    const chapter = await db.query.chapters.findFirst({
      where: eq(chapters.id, lessonId),
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    const { youtubeSearchQuery } = chapter;

    const videoId: string = await getYoutubeVideoId(youtubeSearchQuery!);
    if (!videoId) {
      return NextResponse.json(
        { error: "Failed to get video id" },
        { status: 500 },
      );
    }
    const transcript = await getTranscript(videoId);

    if (transcript) {
      const { summery } = await summeryChain.invoke({ transcript });
      if (summery) {
        await db
          .update(chapters)
          .set({
            videoId: videoId,
            summery: summery,
          })
          .where(eq(chapters.id, lessonId));

        return NextResponse.json({ success: true }, { status: 200 });
      }
    }

    return NextResponse.json({ success: false }, { status: 500 });
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
