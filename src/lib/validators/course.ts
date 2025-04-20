import { z } from "zod";

export const createCourseSchema = z.object({
  title: z
    .string({
      message: "Course title must be a string",
    })
    .min(4, { message: "Course title must be atleast 4 charcter" })
    .max(255),
  units: z
    .array(
      z
        .string({
          message: "Unit title must be a string",
        })
        .min(4, { message: "Unit title must be atleast 4 charcter" })
        .max(255),
      {
        message: "Units must be an array of strings",
      },
    )
    .min(2),
});
