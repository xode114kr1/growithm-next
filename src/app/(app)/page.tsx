import { auth, signIn, signOut } from "@/lib/auth/auth";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main>
        <form
          action={async () => {
            "use server";
            await signIn("github");
          }}
        >
          <button type="submit">Login</button>
        </form>
      </main>
    );
  }
  return (
    <main>
      <p>{session.user.name}</p>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button type="submit">Log out</button>
      </form>
    </main>
  );
}
