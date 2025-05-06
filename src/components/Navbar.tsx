import Link from "next/link";
import { auth } from "~/server/auth";
import SignInButton from "./SignInButton";
import UserProfileNavbar from "./UserProfileNavbar";

const Navbar = async () => {
  const session = await auth();

  return (
    <nav className="fixed inset-x-0 top-0 h-fit border-b border-zinc-300 py-2 dark:bg-gray-950">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-center gap-2 px-8 sm:justify-between">
        <Link href={"/gallery"} className="hidden items-center gap-2 sm:flex">
          <span className="rounded-lg border-2 border-r-4 border-b-4 border-black px-2 py-1 text-xl font-bold text-black transition-all hover:-translate-y-[2px] md:block dark:border-white">
            Learing Journey
          </span>
        </Link>
        <div className="flex items-center gap-3 md:gap-8">
          <Link href={"/gallery"} className="hover:underline">
            Gallery
          </Link>
          {session?.user && (
            <>
              <Link href={"/create"} className="hover:underline">
                Create Course
              </Link>
            </>
          )}

          {session?.user ? (
            <UserProfileNavbar user={session.user} />
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
