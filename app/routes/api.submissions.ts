// app/routes/api.submissions.ts
import { json } from "@vercel/remix";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { getAllSubmissions } from "~/utils/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);
  const result = await getAllSubmissions();
  
  // Format the data specifically for the extension
  const submissions = (result.Items || []).map(item => ({
    firstName: item.firstName || '',
    lastName: item.lastName || '',
    email: item.email || '',
    phone: item.phone || '',
  }));

  // Set CORS headers to allow the extension to access this endpoint
  return json(
    { submissions },
    {
      headers: {
        "Access-Control-Allow-Origin": "https://secure.simplepractice.com",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}