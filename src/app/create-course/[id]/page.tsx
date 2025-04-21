"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Modules from "~/components/Modules";
import { Provider } from "~/components/Provider";
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
  return (
    <div className="mx-auto my-16 flex max-w-xl flex-col items-start">
      <h5 className="text-secondary-foreground/60 text-sm uppercase">
        Course Name
      </h5>
      <h1 className="text-5xl font-bold">{course.title}</h1>
      <Provider>
        <Modules course={course} />
      </Provider>
    </div>
  );
};

export default SpecifiqCourse;
