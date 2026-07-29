import "server-only";

export type UserSummaryRow = {
  email: string | null;
  id: string;
  image: string | null;
  name: string | null;
  score: number;
};

export type UserProfileRow = UserSummaryRow & {
  _count: {
    problemSubmissions: number;
  };
  accounts: {
    providerAccountId: string;
  }[];
  problemSubmissions: {
    createdAt: Date;
    submittedAtText: string | null;
  }[];
  todaySolvedCount: number;
};
