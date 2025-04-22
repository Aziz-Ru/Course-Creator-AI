"use client";
import Link from "next/link";
import React from "react";
import Lesson, { type LesssonCardHandler } from "./Lesson";
import { Button, buttonVariants } from "./ui/button";
import { Separator } from "./ui/separator";
export interface Chapter {
  id: string;
  unitId: string;
  name: string;
  youtubeSearchQuery: string;
  videoId: string;
  summery: string;
}

export interface Unit {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface CourseWithUnitsAndChapters {
  id: string;
  title: string;
  image: string;
  createdById: string;
  units: Unit[];
}

const Modules = ({ course }: { course: CourseWithUnitsAndChapters }) => {
  const chapterRef = React.useMemo(() => {
    const ref: Record<string, React.RefObject<LesssonCardHandler | null>> = {};

    const allchapterId = course.units.flatMap((unit) =>
      unit.chapters.map((chapter) => chapter.id),
    );
    allchapterId.forEach((id) => {
      ref[id] = React.createRef<LesssonCardHandler>();
    });

    return ref;
  }, [course]);

  console.log(chapterRef);

  return (
    <div className="mt-4 w-full">
      {course.units.map((module, index) => {
        return (
          <div key={index} className="mt-5">
            <h2 className="text-secondary-foreground/60 text-sm uppercase">
              Module {index + 1}
            </h2>
            <h1 className="text-xl font-bold">{module.name}</h1>

            <div className="">
              {module.chapters.map((chapter, chIndex) => {
                return (
                  <Lesson
                    ref={chapterRef[chapter.id]}
                    key={chIndex}
                    lesson={chapter}
                    chIndex={chIndex + 1}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="mt-5 flex items-center justify-center gap-4">
        <Separator className="flex-[1]" />
        <div className="mx-4 flex items-center">
          <Link href={"/create-course"} className={buttonVariants()}>
            Back
          </Link>

          <Button
            className="ml-4"
            onClick={() => {
              Object.values(chapterRef).forEach((ref) => {
                if (ref.current) {
                  ref.current.triggerLoad();
                }
              });
            }}
          >
            Generate
          </Button>
        </div>
        <Separator className="flex-[1]" />
      </div>
    </div>
  );
};

export default Modules;
