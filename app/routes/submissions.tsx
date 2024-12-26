import { Form, useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { getAllSubmissions, deleteFormSubmission } from "~/utils/db.server";

interface Submission {
  userEmail: string;
  userId: string;
  location: string;
  clientName: string;
  serviceType: string;
  submittedAt: string;
  dob: string;
  comments: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);
  const result = await getAllSubmissions();

  return new Response(
    JSON.stringify({
      submissions: result.Items || []
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function action({ request }: ActionFunctionArgs) {
  await requireUserId(request);
  const formData = await request.formData();
  const userEmail = formData.get("userEmail");

  if (typeof userEmail !== "string") {
    return new Response(
      JSON.stringify({ error: "Invalid email" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  await deleteFormSubmission(userEmail);
  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export default function Submissions() {
  const { submissions } = useLoaderData<{ submissions: Submission[] }>();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Form Submissions ({submissions.length} total)
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-sm rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DOB</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comments</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {submissions.map((submission) => (
              <tr key={submission.userEmail}>
                <td className="px-6 py-4">{submission.userEmail}</td>
                <td className="px-6 py-4">{submission.location}</td>
                <td className="px-6 py-4">{submission.clientName}</td>
                <td className="px-6 py-4">
                  {new Date(submission.dob).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">{submission.serviceType}</td>
                <td className="px-6 py-4">
                  <div className="max-w-xs overflow-hidden">
                    <p className="text-sm text-gray-600 truncate" title={submission.comments}>
                      {submission.comments}
                    </p>
                    {submission.comments?.length > 50 && (
                      <button 
                        onClick={() => alert(submission.comments)}
                        className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                      >
                        View Full Comment
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {new Date(submission.submittedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <Form method="post" onSubmit={(e) => {
                    if (!confirm("Are you sure you want to delete this submission?")) {
                      e.preventDefault();
                    }
                  }}>
                    <input type="hidden" name="userEmail" value={submission.userEmail} />
                    <button
                      type="submit"
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </Form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}