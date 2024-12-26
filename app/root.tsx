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
import Navbar from "~/components/Navbar";
import { getUserId } from "~/utils/session.server";
import "~/tailwind.css";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  return new Response(
    JSON.stringify({
      user: userId ? { id: userId } : null,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

type LoaderData = {
  user: { id: string } | null;
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