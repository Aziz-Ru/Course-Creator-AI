"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { courses } from "~/server/db/schema";

const SpecifiqCourse = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const session = await auth();
  if (!session?.user) {
    redirect("/gallery");
  }
  const { id } = await params;

  if (!id) {
    redirect("/create-course");
  }
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, id),
    with: {
      units: {
        columns: {
          name: true,
          id: true,
        },
        with: {
          chapters: true,
        },
      },
    },
  });
  if (!course) {
    redirect("/create-course");
  }
  return <div>{course.title}</div>;
};

export default SpecifiqCourse;
