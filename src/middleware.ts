// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// ① 로그인 없이 접근 허용할 경로 정의
const isPublic = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/shared-quizzes(.*)",
]);

export default clerkMiddleware(
  async (auth, req) => {
    // public 경로가 아니면 로그인 보호
    if (!isPublic(req)) {
      await auth.protect();
    }
  },
  {
    // 로그인/회원가입 후 리디렉션
    afterSignInUrl: "/create-quiz",
    afterSignUpUrl: "/create-quiz",
  }
);

// ② 여기부터가 핵심: _next, 정적 리소스, favicon, api 라우트 등은
//     미들웨어에서 아예 제외시켜야 정적 파일 404 가 안 뜹니다.
export const config = {
  matcher: [
    /*
     * 아래 패턴은
     *  - /_next/static, /_next/image, /favicon.ico
     *  - Next.js의 정적 파일 요청을 제외
     * 그 외 모든 GET/POST 페이지 URL에만 미들웨어가 적용됩니다.
     */
    "/((?!_next/static|_next/image|favicon\\.ico).*)",
  ],
};
