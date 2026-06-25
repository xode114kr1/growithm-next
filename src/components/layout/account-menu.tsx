import { signIn, signOut } from "@/lib/auth/auth";
import Dropdown from "@/components/ui/dropdown";
import { UserAvatar } from "@/components/ui/user-avatar";

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
          로그인
        </button>
      </form>
    );
  }

  return (
    <Dropdown
      ariaLabel="계정 메뉴 열기"
      buttonClassName="flex size-9 items-center justify-center rounded-full outline-none ring-offset-2 ring-offset-white transition hover:ring-2 hover:ring-cyan-200 focus-visible:ring-2 focus-visible:ring-teal-900"
      className="relative"
      menuClassName="absolute right-0 top-12 w-36 rounded-lg border border-slate-200 bg-white p-1 shadow-lg shadow-teal-950/10"
      trigger={
        <UserAvatar
          fallback="GH"
          image={user.image}
          name="GitHub 사용자"
          size="sm"
        />
      }
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
          로그아웃
        </button>
      </form>
    </Dropdown>
  );
}
