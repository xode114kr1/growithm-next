import "server-only";

import type {
  FriendListFilter,
  FriendListMap,
  FriendPageData,
  FriendProfile,
  FriendRequest,
} from "@/features/friend/types";

const friends: FriendProfile[] = [
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCgb3oGiEiz4g96_3kqwsY-QNFoIedmXX0BPnmN0AXv8Yh38rQ9A8_dTxM32DD1vN5QWmRZflrDQyvRL7xg4n3yLcwXxdGqjp4zhaDLrLu9aA3_T-t-AomlgybPdVCObfwtLvTuE-4OHax-dUNRg7lWPRQV4bg44LrqOfg9Be5UpjRX33QNvzCfSE2g34GSYl3C3rqX-6-QpxdmQtR7RmkwxYtcwgUk2OJDMxQa6bFunXMTOga8q0FOYo577bqrTuAnyl80bW0gFYI",
    name: "Alex Rivera",
    relationStatus: "friend",
    tier: "Platinum Tier",
    tierClass:
      "bg-gradient-to-r from-slate-100 to-white border-slate-200 text-slate-600",
  },
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBjrur5qSV0JDOIqu908Sk5Ic8mby8uNS5oX5BufFOIbk7_Gd2ePbr7hkj1ky4WeguvK8Z3Z2nBaqM9R25BUvHHU7QupiulX9EBV20iKvb_BwQ6WllSj3hjNWmj0tHLTWIy1oxMQA0wZjNb_00Jn2w24P64MhNOslSdKzGQV2sqtIc-oYggCFgOfug8PnlOyBah1zjmJ_gBtnJl5YkWyaoEzzGhRdJyaoeDQaBrqOJ9wwdjvKnNNsOLDeiWLu8j1MhVxWtaoT1aWSg",
    name: "Min-Hee Kim",
    relationStatus: "friend",
    tier: "Gold Tier",
    tierClass:
      "bg-gradient-to-r from-amber-100 to-amber-50 border-amber-200 text-amber-700",
  },
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCj_OCCULllL_qo_MoefZ2hFe9NkkjP4vG9Cf9rmRa2wpvqRKc7SDSFhwRXe-VqPXovteOhSwM28I0_4VDd-Htl-o27BNszW1PxFUN88aQY02kXEcNEZxYZ2WfL4kMk5eTuHX_8cArjjDPEI2VJhBrxDIL490YwCKdlG21bYTcqU_nTpCoQN6dS3EHTDICnICm3BH5g7l1Tr89hgKvezOrYlKS80POD6cXIMX72Iz-BQw6iEjrN4rvpTp2ox6svM2Nm0duW3vMsZgY",
    name: "Jordan Smith",
    offline: true,
    relationStatus: "friend",
    tier: "Silver Tier",
    tierClass: "bg-slate-200 border-slate-300 text-slate-600",
  },
];

const receivedRequests: FriendRequest[] = [
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDvRAmcbi1H1VojcYoL4I64HV6vA0X5p2YobQhpT9eR7WyIGWKvW_xRHeNndH2v3DjjiOoRjkg2L2ul12odKjkxIsnwdjxIJh4I6DOkJyJ2kz5w6TvLJFLU7uStpiwassIUXveGvbEdGiUfKGRQThJGZQGVIpGTVK54aDihc7MDib6ETjvr7vYqdqxirkr6USFRfPG-jGmbg8HK_FMJyYLT3pjISl2gvCOCLZVPTbPLIwVO78r6CcNtuXrRG46y6PLzK8HQg8QqNyM",
    name: "Lara Croft",
    relationStatus: "received_request",
    tier: "Gold Tier",
    tierClass:
      "bg-gradient-to-r from-amber-100 to-amber-50 border-amber-200 text-amber-700",
  },
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBhIqvObXTRIHtg7mu95710ayfdbY_LQVsj9zxlhAWjz33v4P_6GAlth1yhM27DI_reYNgk6kyihrKIWXEAiTHZmdUGIuxp-nT9NaeBwBOOzXGbgKo39QrhoKIsKVfBM3syGocl0vCPACuTPEojhP__ccyYNvBvFG3I3Hq37-TCiihvEskiTa5CnPix6KG-Iyt8mG1PUYGaOXd1qSYmukdjZCpMdqtDefDk7xpekt35KtUhiqzEhegSpjZNMGtJnTcQ6Tlpai1d_wE",
    name: "Chen Wei",
    relationStatus: "received_request",
    tier: "Platinum Tier",
    tierClass:
      "bg-gradient-to-r from-slate-100 to-white border-slate-200 text-slate-600",
  },
];

const sentRequests: FriendRequest[] = [
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDj6HEJJjO0GxSUdzmrRTGFcTsya_nRSf8DgY3CVBY6qhxwFF2IHltGhc1LmHICaQxyB0iTJbYR4-tMJ7KlquFP4zNUu0Xm1dRNyJeCnmJXoPY7mWOaAH_E26p9Gb7oZPw8pUrbTdrm73bol9NgQM1iG7cuMbvbaWUZ0PzBu5Q0any15G2xZiT0J0MiLh3L9iXhFTWHXr-AIjW0_zXNw9zsee84vbRC0trDleWc72NF2WnrnU7WwRRuMdOn5bzwznya4Zsdn3BQVjw",
    name: "Elena Rossi",
    relationStatus: "sent_request",
    tier: "Diamond Tier",
    tierClass: "bg-cyan-50 border-cyan-200 text-cyan-800",
  },
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAvigkJc2g3taec1La9zPT-xK5PrDruuyPWGHvg7Ns2cPPjTomCjNpQF70iPCRaX9bfADqCfeD2Hh4kmD3-rr9rXuPkOlFhcVyZK2A2vw48WYvJXDz5WTtW8XhhZ3SvqXNyWEKJ3PhIIAXOJMptPJaug_YdjHPb-og0UiZ7sWjO-xQC8MfKz-TFmcchHzB3FKeZcC0cfxXrQgWkwZeCg2v_yEy-1aimyDAM7YuSd_epHmO4cYoUePhMXJLB_hc7fUpH_fJfCGWvfSk",
    name: "Noah Park",
    relationStatus: "sent_request",
    tier: "Silver Tier",
    tierClass: "bg-slate-200 border-slate-300 text-slate-600",
  },
];

const friendLists: FriendListMap = {
  friends,
  received: receivedRequests,
  sent: sentRequests,
};

export async function getFriendListByFilter<T extends FriendListFilter>(
  filter: T,
): Promise<FriendListMap[T]> {
  return friendLists[filter];
}

export async function getFriendPageData(): Promise<FriendPageData> {
  return {
    lists: friendLists,
  };
}
