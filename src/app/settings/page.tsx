import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

const Settings = async () => {
  const session = await auth();
  if (!session?.user) redirect("/gallery");
  return <div>Settings</div>;
};

export default Settings;
