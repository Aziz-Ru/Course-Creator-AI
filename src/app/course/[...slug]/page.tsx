import { eq } from "drizzle-orm";
import CourseSideBar from "~/components/CourseSideBar";
import { db } from "~/server/db";
import { courses } from "~/server/db/schema";

type Props = {
  params: {
    slug: Promise<string[]> | string[];
  };
};

async function CoursePage({ params }: Props) {
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const p = (await params).slug;

  const [courseId, unitId, lesonId] = await p;
  if (!courseId || !unitId || !lesonId) {
    return <div>Invalid course</div>;
  }
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      units: {
        with: {
          chapters: true,
        },
      },
    },
  });
  if (!course) {
    return <div>Course not found</div>;
  }
  const unitIndex = parseInt(unitId);
  const lessonIndex = parseInt(lesonId);
  const unit = course.units[unitIndex];
  if (!unit) {
    return <div>Unit not found</div>;
  }
  const lesson = unit.chapters[lessonIndex];
  if (!lesson) {
    return <div>Lesson not found</div>;
  }

  return (
    <div className="flex h-[80vh] flex-col justify-between p-4 xl:flex-row">
      <div className="w-full xl:w-1/4">
        <CourseSideBar course={course} />
      </div>
      <div className="w-full xl:w-3/4">
        <div className="p-6">
          <iframe
            src={`https://www.youtube.com/embed/${lesson.videoId}`}
            width={660}
            height={350}
            allowFullScreen
          ></iframe>
          <p>{lesson.summery}</p>
        </div>
      </div>
    </div>
  );
}

export default CoursePage;
