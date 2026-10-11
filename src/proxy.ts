import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Lessons and problems are public to browse. Running or submitting SQL asks the visitor to sign
// in (handled in the UI), and the AI hint API checks the session itself. Only the profile page
// is fully private.
const isProtectedRoute = createRouteMatcher(["/profile(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|wasm|data)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
