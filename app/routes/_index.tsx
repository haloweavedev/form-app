import { Form, useLoaderData, useActionData, useNavigation } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@vercel/remix";
import { requireUserId, getUserSession } from "~/utils/session.server";
import { saveFormSubmission, getFormSubmission, type FormSubmission } from "~/utils/db.server";

type LoaderData = {
  submission: FormSubmission | null;
};

type ActionData = {
  success?: boolean;
  error?: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);
  const session = await getUserSession(request);
  const userEmail = session.get("email");
  
  if (!userEmail) {
    return json<LoaderData>({ submission: null });
  }

  const response = await getFormSubmission(userEmail);
  return json<LoaderData>({ submission: response.Item as FormSubmission | null });
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const userId = await requireUserId(request);
    const session = await getUserSession(request);
    const userEmail = session.get("email");

    if (!userEmail) {
      return json<ActionData>(
        { success: false, error: "User email not found" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    
    // Get all selected concerns (handle multiple checkboxes with same name)
    const concernEntries = Array.from(formData.entries())
      .filter(([key]) => key === 'concerns')
      .map(([, value]) => value as string);

    // Create the data object, removing the original concerns entries
    const entries = Array.from(formData.entries()).filter(([key]) => key !== 'concerns');
    const data = {
      ...Object.fromEntries(entries),
      concerns: concernEntries,
    };

    await saveFormSubmission(userId, userEmail, data);
    
    // Redirect after successful submission
    return redirect("/submissions");

  } catch (error) {
    console.error('Form submission error:', error);
    return json<ActionData>(
      { success: false, error: "Failed to save submission" },
      { status: 500 }
    );
  }
}

export default function Index() {
  const { submission } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">MindWell Services Intake Form</h1>

        {actionData?.error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-8">
            {actionData.error}
          </div>
        )}

        {submission && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-800">
              Previous submission from {new Date(submission.submittedAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Submitting again will update your previous response.
            </p>
          </div>
        )}

        <Form method="post" className="space-y-8 bg-white p-8 rounded-lg shadow-lg">

          {/* Contact Information Section */}
          <div className="space-y-6 border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
            
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  defaultValue={submission?.firstName || ""}
                  className="mt-1 block w-full rounded-lg border-2 border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  defaultValue={submission?.lastName || ""}
                  className="mt-1 block w-full rounded-lg border-2 border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  defaultValue={submission?.email || ""}
                  className="mt-1 block w-full rounded-lg border-2 border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  defaultValue={submission?.phone || ""}
                  className="mt-1 block w-full rounded-lg border-2 border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          {/* Location Selection */}
          <div className="space-y-2">
            <label htmlFor="location" className="block text-lg font-medium text-gray-900">
              At which MindWell location are you interested in receiving services?
            </label>
            <select
              id="location"
              name="location"
              required
              defaultValue={submission?.location || ""}
              className="mt-2 block w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
            >
              <option value="">Select a location</option>
              <option value="ithaca">Ithaca, NY</option>
              <option value="remote">Remote / Telehealth</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <label htmlFor="dob" className="block text-lg font-medium text-gray-900">
              Client Date of Birth
            </label>
            <input
              type="date"
              id="dob"
              name="dob"
              required
              defaultValue={submission?.dob || ""}
              max={new Date().toISOString().split('T')[0]}
              min="1900-01-01"
              className="mt-2 block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
            />
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <label className="block text-lg font-medium text-gray-900">
              Are you seeking services for:
            </label>
            <div className="mt-4 space-y-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="therapy"
                  name="serviceType"
                  value="therapy"
                  defaultChecked={submission?.serviceType === "therapy"}
                  required
                  className="h-5 w-5 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="therapy" className="ml-3 block text-base text-gray-700">
                  Therapy (including couples therapy)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="assessment"
                  name="serviceType"
                  value="assessment"
                  defaultChecked={submission?.serviceType === "assessment"}
                  className="h-5 w-5 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="assessment" className="ml-3 block text-base text-gray-700">
                  Comprehensive Psychological Assessment
                </label>
              </div>
            </div>
          </div>

          {/* Primary Concerns */}
          <div className="space-y-2">
            <label className="block text-lg font-medium text-gray-900">
              Please check the primary concern(s) for which the client is seeking services
            </label>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {[
                "Anxiety Disorder",
                "Depression",
                "ADHD",
                "Autism Spectrum Disorder",
                "Relationship Issues",
                "Trauma"
              ].map((concern) => (
                <div key={concern} className="flex items-center">
                  <input
                    type="checkbox"
                    id={concern.toLowerCase().replace(/\s+/g, '-')}
                    name="concerns"
                    value={concern}
                    defaultChecked={submission?.concerns?.includes(concern)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={concern.toLowerCase().replace(/\s+/g, '-')}
                    className="ml-3 block text-base text-gray-700"
                  >
                    {concern}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Comments */}
          <div className="space-y-2">
            <label htmlFor="comments" className="block text-lg font-medium text-gray-900">
              Please briefly describe why you are seeking services
            </label>
            <textarea
              id="comments"
              name="comments"
              rows={4}
              defaultValue={submission?.comments || ""}
              className="mt-2 block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
              placeholder="Please provide any additional details..."
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Form"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}