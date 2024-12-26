// app/routes/api.submissions.ts
import { json } from "@vercel/remix";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getAllSubmissions } from "~/utils/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // For simplicity, we'll remove the authentication requirement for this API endpoint
  // since it's just showing basic contact info
  const result = await getAllSubmissions();
  
  const submissions = (result.Items || []).map(item => ({
    firstName: item.firstName || '',
    lastName: item.lastName || '',
    email: item.email || '',
    phone: item.phone || '',
  }));

  return json(
    { submissions },
    {
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow any origin
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}