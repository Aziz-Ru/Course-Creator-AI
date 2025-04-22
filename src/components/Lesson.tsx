import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { forwardRef, useImperativeHandle, useState } from "react";
import { cn } from "~/lib/utils";
import type { Chapter } from "./Modules";

export type LesssonCardHandler = {
  triggerLoad: () => void;
};
export type LessonCardProps = {
  lesson: Chapter;
  chIndex: number;
};

const Lesson = forwardRef<LesssonCardHandler, LessonCardProps>(
  ({ lesson, chIndex }, ref) => {
    const [success, setSuccess] = useState<boolean>(false);
    const { mutate: getChapterInfo, isPending } = useMutation({
      mutationFn: async () => {
        const response = await axios.post("/api/chapters/getInfo", {
          lessonId: lesson.id,
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return response.data;
      },
    });

    useImperativeHandle(ref, () => ({
      async triggerLoad() {
        getChapterInfo(undefined, {
          onSuccess: (data) => {
            setSuccess(true);
          },
        });
      },
    }));

    return (
      <div
        className={cn(
          "my-2 flex justify-between rounded p-2",
          success ? "bg-green-600/60" : "bg-secondary-foreground/10",
        )}
        key={lesson.id}
      >
        <div className="">
          <h5>
            Chapters {chIndex}: {lesson.name}
          </h5>
        </div>
      </div>
    );
  },
);

Lesson.displayName = "Lesson";

export default Lesson;
