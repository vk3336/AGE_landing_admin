This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# For env detail:

NODE_ENV: this variable is use to disable the network cache.
NEXT_PUBLIC_API_URL : Use the full API URL — for local development, it might be http://localhost:7000/api, and for production, it would be your deployed backend URL + /api

NEXT_PUBLIC_SUPER_ADMIN : This defines who the super admin is on the frontend.

NEXT_PUBLIC_API_KEY_NAME : This is the name of a special header key used for secure admin API requests.

NEXT_PUBLIC_API_SECRET_KEY : This is the secret value sent with the API_KEY_NAME to authorize admin-level API calls.

NEXT_PUBLIC_ROLE_MANAGEMENT_KEY : This is the name of the header used to verify super admin permissions for managing roles.

NEXT_PUBLIC_ROLE_MANAGEMENT_KEY_VALUE : This is the value that goes with the above header (ROLE_MANAGEMENT_KEY) to prove the user is a super admin. it should be same in frontend and in the backend.

## Getting Start

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
