import { auth } from "@/lib/auth/auth";
import { getUserProfile } from "@/services/users/user.query";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  const profile = await getUserProfile(userId);

  if (!profile) {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }

  return Response.json(profile);
}
