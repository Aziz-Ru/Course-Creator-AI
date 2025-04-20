/* eslint-disable @typescript-eslint/no-unsafe-return */
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Delete, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { createCourseSchema } from "~/lib/validators/course";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
// type Props = {};

type InputType = z.infer<typeof createCourseSchema>;

const CreateCourseForm = () => {
  const router = useRouter();

  const { mutate: createCourse, isPending } = useMutation({
    mutationFn: async (data: InputType) => {
      const res = await axios.post("/api/course/createChapters", data);
      return res.data;
    },
  });
  const form = useForm<InputType>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: "",
      units: ["", "", ""],
    },
  });

  const onsubmit = (data: InputType) => {
    createCourse(data, {
      onSuccess: ({ id }) => {
        toast("Course Created Successfully");
        void router.push(`/create-course/${id}`);
      },
      onError: (err) => {
        console.log(err);
      },
    });
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onsubmit)} className="mt-4 w-full">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col items-start sm:flex-row sm:items-center">
                <FormLabel htmlFor="title" className="flex-[2] text-xl">
                  Course Title
                </FormLabel>
                <div className="flex flex-[5] flex-col gap-2">
                  <FormControl className="">
                    <Input
                      placeholder="Enter The Course Title"
                      {...field}
                      className="py-2"
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {form.watch("units").map((_, ind) => {
            return (
              <FormField
                control={form.control}
                name={`units.${ind}`}
                key={ind}
                render={({ field }) => (
                  <FormItem className="mt-4 flex w-full flex-col items-start sm:flex-row sm:items-center">
                    <FormLabel htmlFor="title" className="flex-[2] text-xl">
                      Unit {ind + 1}
                    </FormLabel>
                    <div className="flex flex-[5] flex-col gap-2">
                      <FormControl>
                        <Input
                          placeholder="Enter The Course Title"
                          {...field}
                          className="py-2"
                        />
                      </FormControl>

                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            );
          })}

          <div className="mt-4 flex items-center justify-center gap-3">
            <Separator className="flex-[1]" />
            <div className="flex gap-4">
              <Button
                type="button"
                variant={"secondary"}
                className="font-semibold"
                onClick={() => {
                  form.setValue("units", [...form.getValues("units"), ""]);
                }}
              >
                <Plus className="ml-2 text-green-500" />
                Add Unit
              </Button>
              <Button
                type="button"
                variant={"secondary"}
                className="font-semibold"
                onClick={() => {
                  if (form.getValues("units").length > 2)
                    form.setValue(
                      "units",
                      form.getValues("units").slice(0, -1),
                    );
                }}
              >
                <Delete className="ml-2 text-red-500" />
                Remove Unit
              </Button>
            </div>
            <Separator className="flex-[1]" />
          </div>

          <Button
            className="mt-4 w-full"
            variant={"secondary"}
            type="submit"
            disabled={isPending}
          >
            Lets GO!
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateCourseForm;
