import { NextResponse } from "next/server";
import { auth } from "~/server/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to create a course" },
        { status: 401 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to  create chapter" },
      { status: 500 },
    );
  }
}
