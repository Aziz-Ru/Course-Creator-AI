import Link from "next/link";
import type { CourseWithUnitsAndChapters } from "./Modules";

type Props = {
  course: CourseWithUnitsAndChapters;
};

function CourseSideBar({ course }: Props) {
  return (
    <div className="sticky h-[80vh] overflow-auto border-r">
      <div className="">
        {course.units.map((unit, unitIndex) => {
          return unit.chapters.map((chapter, chapterIndex) => {
            return (
              <div className="border-b border-slate-800 p-2" key={chapterIndex}>
                <Link
                  className=""
                  href={`/course/${course.id}/${unitIndex}/${chapterIndex}`}
                >
                  {chapter.name}
                </Link>
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}

export default CourseSideBar;
