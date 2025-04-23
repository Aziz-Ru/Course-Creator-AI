/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { courseChain, imageChain } from "~/lib/ai";
import { getUnsplashImage } from "~/lib/getImage";
import { createCourseSchema } from "~/lib/validators/course";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { chapters, courses, units } from "~/server/db/schema";
import type { CourseOutline } from "./type";

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
    const res = createCourseSchema.parse(body);
    let unit = "";
    res.units.forEach((un) => {
      unit += `${un},`;
    });

    const courseResponse: CourseOutline = await courseChain.invoke({
      course: res.title,
      units: unit,
    });
    const { search_term } = await imageChain.invoke({ courseName: res.title });
    const imgLink = await getUnsplashImage(search_term);

    const course = await db
      .insert(courses)
      .values({
        title: courseResponse.courseName,
        image: imgLink,
        createdById: session.user.id,
      })
      .returning();
    if (!course[0]) {
      return NextResponse.json(
        { error: "Failed to create course" },
        { status: 500 },
      );
    }
    for (const unit of courseResponse.modules) {
      const newmodule = await db
        .insert(units)
        .values({
          name: unit.moduleTitle,
          courseId: course[0].id,
        })
        .returning();
      if (!newmodule[0]) {
        return NextResponse.json(
          { error: "Failed to create module" },
          { status: 500 },
        );
      }
      for (const lesson of unit.lessons) {
        await db.insert(chapters).values({
          unitId: newmodule[0].id,
          name: lesson.lessonTitle,
          youtubeSearchQuery: lesson.youtubeQuery,
        });
      }
    }

    return NextResponse.json({ id: course[0].id }, { status: 200 });
  } catch (error) {
    console.log(error);
    if (error instanceof ZodError) {
      const messages = error.errors.map((err) => err.message);
      return NextResponse.json({ errors: messages }, { status: 400 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 },
    );
  }
}
