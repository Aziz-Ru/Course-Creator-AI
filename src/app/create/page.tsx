import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";

import CreateCourseForm from "~/components/CreateCourseForm";
import { Provider } from "~/components/Provider";
import { auth } from "~/server/auth";

const CreateCourse = async () => {
  const session = await auth();
  if (!session?.user) redirect("/gallery");

  return (
    <div className="mx-auto my-16 flex max-w-xl flex-col items-start px-8 sm:px-0">
      <h1 className="self-center text-center text-3xl font-bold sm:text-6xl">
        Learning Journey
      </h1>
      <div className="bg-secondary mt-5 flex rounded-md border-none p-4 shadow-md">
        <InfoIcon className="mr-3 h-12 w-12 text-blue-400" />
        <div className="">
          <p>
            {" "}
            Enter a course title or what you want to learn. Then List of units
            which are the specifiq you want to learn. AI will generate a course
            for you!{" "}
          </p>
        </div>
      </div>
      <Provider>
        <CreateCourseForm />
      </Provider>
    </div>
  );
};

export default CreateCourse;
