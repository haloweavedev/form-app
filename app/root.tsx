// app/root.tsx
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@vercel/remix";
import Navbar from "~/components/Navbar";
import { getUserId, getUserSession } from "~/utils/session.server";
import "~/tailwind.css";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  const session = await getUserSession(request);
  const userEmail = session.get("email");

  return json({
    user: userId ? { id: userId, email: userEmail } : null,
  });
}

type LoaderData = {
  user: { id: string; email: string } | null;
};

export default function App() {
  const { user } = useLoaderData<LoaderData>();

  return (
    <html lang="en" className="h-full bg-gray-50">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Navbar user={user} />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}