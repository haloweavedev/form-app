import { Form, useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@vercel/remix";
import { requireUserId } from "~/utils/session.server";
import { getAllSubmissions, deleteFormSubmission, type FormSubmission } from "~/utils/db.server";

type LoaderData = {
  submissions: FormSubmission[];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);
  const result = await getAllSubmissions();
  
  // Ensure concerns is always an array in the data
  const submissions = (result.Items || []).map(item => ({
    ...item,
    concerns: Array.isArray(item.concerns) ? item.concerns : [],
  })) as FormSubmission[];

  return json<LoaderData>({ submissions });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireUserId(request);
  const formData = await request.formData();
  const userEmail = formData.get("userEmail");

  if (typeof userEmail !== "string") {
    return json({ error: "Invalid email" }, { status: 400 });
  }

  await deleteFormSubmission(userEmail);
  return json({ success: true });
}

export default function Submissions() {
  const { submissions } = useLoaderData<typeof loader>();

  // Helper function to format concerns array
  const formatConcerns = (concerns: string[] | undefined | null): string => {
    if (!concerns || !Array.isArray(concerns)) return '';
    return concerns.join(', ');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Form Submissions ({submissions.length} total)
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-sm rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DOB</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concerns</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comments</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {submissions.map((submission) => (
              <tr key={submission.userEmail}>
                <td className="px-6 py-4">{submission.firstName}</td>
                <td className="px-6 py-4">{submission.lastName}</td>
                <td className="px-6 py-4">{submission.email}</td>
                <td className="px-6 py-4">{submission.phone}</td>
                <td className="px-6 py-4">{submission.location}</td>
                <td className="px-6 py-4">
                  {submission.dob ? new Date(submission.dob).toLocaleDateString() : ''}
                </td>
                <td className="px-6 py-4">{submission.serviceType}</td>
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    {formatConcerns(submission.concerns)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xs overflow-hidden">
                    <p className="text-sm text-gray-600 truncate" title={submission.comments}>
                      {submission.comments}
                    </p>
                    {submission.comments && submission.comments.length > 50 && (
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
                  {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : ''}
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