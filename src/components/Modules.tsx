"use client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { cn } from "~/lib/utils";
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
  const [success, setSuccess] = useState<boolean>(true);
  const { mutate: getChapterInfo, isPending } = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/api/chapters/getInfo");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response.data;
    },
  });
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
                  <div
                    className={cn(
                      "my-2 flex justify-between rounded p-2",
                      success
                        ? "bg-green-600/60"
                        : "bg-secondary-foreground/10",
                    )}
                    key={chapter.id}
                  >
                    <div className="">
                      <h5>
                        Chapters {chIndex + 1}: {chapter.name}
                      </h5>
                    </div>
                  </div>
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
              console.log("Generate");
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
