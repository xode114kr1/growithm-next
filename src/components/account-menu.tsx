import { signIn, signOut } from "@/lib/auth/auth";
import Dropdown from "@/components/dropdown";
import Image from "next/image";

type AccountMenuProps = {
  user?: {
    image?: string | null;
  };
};

export default function AccountMenu({ user }: AccountMenuProps) {
  if (!user) {
    return (
      <form
        action={async () => {
          "use server";
          await signIn("github");
        }}
      >
        <button
          className="px-4 py-2 text-body-sm font-semibold text-slate-500 transition-colors hover:text-primary"
          type="submit"
        >
          Log In
        </button>
      </form>
    );
  }

  return (
    <Dropdown
      ariaLabel="Open account menu"
      buttonClassName="flex size-9 items-center justify-center rounded-full outline-none ring-offset-2 ring-offset-white transition hover:ring-2 hover:ring-cyan-200 focus-visible:ring-2 focus-visible:ring-teal-900"
      className="relative"
      menuClassName="absolute right-0 top-12 w-36 rounded-lg border border-slate-200 bg-white p-1 shadow-lg shadow-teal-950/10"
      trigger={<AccountAvatar image={user.image} />}
    >
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button
          className="w-full rounded-md px-3 py-2 text-left text-body-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary"
          role="menuitem"
          type="submit"
        >
          Log out
        </button>
      </form>
    </Dropdown>
  );
}

function AccountAvatar({ image }: { image?: string | null }) {
  if (!image) {
    return (
      <span className="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-bold text-teal-900">
        GH
      </span>
    );
  }

  return (
    <Image
      alt="GitHub avatar"
      className="size-9 rounded-full border border-slate-200 bg-slate-100 object-cover"
      height={36}
      src={image}
      width={36}
    />
  );
}
