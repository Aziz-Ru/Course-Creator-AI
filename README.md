## Course Creator AI Project

This project is a Course Creator AI application built with the T3 Stack (Next.js, NextAuth.js, Prisma/Drizzle, Tailwind CSS, tRPC). It allows users to create courses based on a single prompt.


<img src="/img/img-1cgai.png" />
<img src="/img/img-2cgai.png" />
<img src="/img/img-3cgai.png" />

### Project Structure and Routes

API Routes

- /api/auth/[...nextauth]/route.ts: Handles authentication using NextAuth.js.

- /api/chapters/getInfo/route.ts: Fetches information about course chapters.

- /api/course/createChapters/route.ts: Creates new course chapters.

Page Routes

- /course/[...slug]/page.tsx: Dynamic page to display individual courses.

- /create/page.tsx: Page for creating new courses.

- /gallery/page.tsx: Displays a gallery of available courses.

- /profile/page.tsx: User profile page.

- /settings/page.tsx: User settings page.

