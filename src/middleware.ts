import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublic = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/shared-quizzes(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) {
    // 보호할 경로는 이 한 줄로 끝!
    await auth.protect();
  }
}, {
  afterSignInUrl: '/create-quiz',
  afterSignUpUrl: '/create-quiz',
});
