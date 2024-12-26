import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { getAllSubmissions } from "~/utils/db.server";

interface Submission {
  userEmail: string;
  location: string;
  clientName: string;
  serviceType: string;
  submittedAt: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);

  const result = await getAllSubmissions();

  return new Response(
    JSON.stringify({
      submissions: result.Items || [],
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export default function Submissions() {
  const { submissions } = useLoaderData<{ submissions: Submission[] }>();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Form Submissions</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-sm rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {submissions.map((submission: Submission) => (
              <tr key={submission.userEmail}>
                <td className="px-6 py-4">{submission.userEmail}</td>
                <td className="px-6 py-4">{submission.location}</td>
                <td className="px-6 py-4">{submission.clientName}</td>
                <td className="px-6 py-4">{submission.serviceType}</td>
                <td className="px-6 py-4">
                  {new Date(submission.submittedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}