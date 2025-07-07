import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 공개 경로 정의
const isPublic = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/shared-quizzes(.*)",
]);

// 보호해야 하는 API 경로 정의
const isProtectedApi = createRouteMatcher([
  "/api/user/tickets(.*)",
  "/api/generate-quiz(.*)",
]);

export default clerkMiddleware(
  async (auth, req) => {
    // 👇 보호 API는 무조건 보호
    if (isProtectedApi(req)) {
      await auth.protect(); // ✅ 올바름!
      return;
    }

    // 👇 공개 아닌 나머지도 보호
    if (!isPublic(req)) {
      await auth.protect(); // ✅ 올바름!
    }
  },
  {
    afterSignInUrl: "/create-quiz",
    afterSignUpUrl: "/create-quiz",
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico).*)",
    "/api/(.*)", // ✅ /api 경로 반드시 포함
  ],
};
