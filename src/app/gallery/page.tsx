import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { db } from "~/server/db";

const Gallery = async () => {
  const courses = await db.query.courses.findMany({});
  return (
    <div className="w-full">
      <div className="mx-auto flex max-w-5xl flex-wrap gap-4">
        {courses.map((course) => {
          return (
            <div className="" key={course.id}>
              <Link href={`create/${course.id}`}>
                <Card className="h-[250px] w-[300px] p-2">
                  <CardContent>
                    <Image
                      src={course.image!}
                      alt={course.name!}
                      width={300}
                      height={200}
                    />
                  </CardContent>
                  <CardTitle>{course.name}</CardTitle>
                </Card>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Gallery;
