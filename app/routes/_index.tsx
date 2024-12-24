import { Form } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  console.log(data);
  return json({ success: true });
};

export default function Index() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">MindWell Services Intake Form</h1>
        
        <Form method="post" className="space-y-8 bg-white p-8 rounded-lg shadow-lg">
          {/* Location Selection */}
          <div className="space-y-2">
            <label htmlFor="location" className="block text-lg font-medium text-gray-900">
              At which MindWell location are you interested in receiving services?
            </label>
            <select
              id="location"
              name="location"
              required
              className="mt-2 block w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
            >
              <option value="">Select a location</option>
              <option value="ithaca">Ithaca, NY</option>
              <option value="remote">Remote / Telehealth</option>
            </select>
          </div>

          {/* Client Name */}
          <div className="space-y-2">
            <label htmlFor="clientName" className="block text-lg font-medium text-gray-900">
              Client's Name (First Last)
            </label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              required
              className="mt-2 block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
              placeholder="Enter your full name"
            />
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
              className="mt-2 block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 hover:border-gray-400"
              placeholder="Please provide any additional details..."
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Submit Form
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}