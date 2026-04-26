import { auth, signIn, signOut } from "@/lib/auth/auth";
import Dropdown from "@/components/dropdown";
import Image from "next/image";

export default async function Header() {
  const session = await auth();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100">
      <div className="flex items-center gap-8">
        <span className="text-2xl font-bold text-teal-900 italic font-h1-editorial">
          Growithm
        </span>
        <div className="hidden md:flex gap-6">
          <a
            className="font-serif text-sm tracking-tight text-teal-900 font-semibold border-b-2 border-teal-900"
            href=""
          >
            Home
          </a>
          <a
            className="font-serif text-sm tracking-tight text-slate-500 hover:text-teal-800 transition-colors"
            href="/problem"
          >
            Problem
          </a>
          <a
            className="font-serif text-sm tracking-tight text-slate-500 hover:text-teal-800 transition-colors"
            href="study"
          >
            Study
          </a>
          <a
            className="font-serif text-sm tracking-tight text-slate-500 hover:text-teal-800 transition-colors"
            href="friend"
          >
            Friend
          </a>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {session?.user ? (
          <Dropdown
            ariaLabel="Open account menu"
            buttonClassName="flex size-9 items-center justify-center rounded-full outline-none ring-offset-2 ring-offset-white transition hover:ring-2 hover:ring-cyan-200 focus-visible:ring-2 focus-visible:ring-teal-900"
            className="relative"
            menuClassName="absolute right-0 top-12 w-36 rounded-lg border border-slate-200 bg-white p-1 shadow-lg shadow-teal-950/10"
            trigger={
              session.user.image ? (
                <Image
                  alt="GitHub avatar"
                  className="size-9 rounded-full border border-slate-200 bg-slate-100 object-cover"
                  height={36}
                  src={session.user.image}
                  width={36}
                />
              ) : (
                <span className="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-bold text-teal-900">
                  GH
                </span>
              )
            }
          >
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button
                className="w-full rounded-md px-3 py-2 text-left font-serif text-sm tracking-tight text-slate-600 transition-colors hover:bg-slate-50 hover:text-teal-800"
                role="menuitem"
                type="submit"
              >
                Log out
              </button>
            </form>
          </Dropdown>
        ) : (
          <form
            action={async () => {
              "use server";
              await signIn("github");
            }}
          >
            <button
              className="px-4 py-2 font-serif text-sm tracking-tight text-slate-500 transition-colors hover:text-teal-800"
              type="submit"
            >
              Log In
            </button>
          </form>
        )}
      </div>
    </nav>
  );
}
