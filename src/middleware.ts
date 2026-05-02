import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/landing(.*)',
  '/terms(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/jobs',
  '/api/billing/webhook(.*)',
]);

export default clerkMiddleware((auth, request) => {
  const { userId } = auth();
  const path = request.nextUrl.pathname;
  if (
    userId &&
    (path.startsWith('/sign-in') || path.startsWith('/sign-up'))
  ) {
    return NextResponse.redirect(new URL('/swipe', request.url));
  }
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
