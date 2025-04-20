import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

const ProfilePage = async () => {
  const session = await auth();
  if (!session?.user) redirect("/gallery");
  return <div>ProfilePage</div>;
};

export default ProfilePage;
