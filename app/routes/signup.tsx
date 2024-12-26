// app/routes/signup.tsx
import { redirect, type ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { signUp, confirmSignUp, signIn } from "~/utils/auth.server";
import { createUserSession, getUserId } from "~/utils/session.server";
import { json } from "@vercel/remix";
import { useState } from "react";

interface ActionData {
  error?: string;
  verificationRequired?: boolean;
  email?: string;
  success?: boolean;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const _action = formData.get("_action");

  // Sign Up Flow
  if (_action === "signup") {
    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string") {
      return json<ActionData>({ 
        error: "Email and password are required" 
      });
    }

    const result = await signUp(email, password);

    if (!result.success) {
      return json<ActionData>({ 
        error: result.error || "Failed to create account. Please try again."
      });
    }

    return json<ActionData>({
      verificationRequired: true,
      email
    });
  }

  // Confirmation Flow
  if (_action === "confirm") {
    const email = formData.get("email") as string;
    const code = formData.get("code") as string;
    const password = formData.get("password") as string;

    if (!email || !code || !password) {
      return json<ActionData>({ 
        error: "Email, confirmation code, and password are required",
        verificationRequired: true,
        email 
      });
    }

    // First confirm the signup
    const confirmResult = await confirmSignUp(email, code);
    if (!confirmResult.success) {
      return json<ActionData>({ 
        error: confirmResult.error || "Invalid confirmation code",
        verificationRequired: true,
        email 
      });
    }

    // Then automatically sign them in
    const signInResult = await signIn(email, password);
    if (!signInResult.success || !signInResult.data?.AuthenticationResult?.AccessToken) {
      return json<ActionData>({ 
        error: "Account confirmed but failed to sign in. Please go to login page.",
        success: true
      });
    }

    // Create session and redirect to home
    return createUserSession(
      signInResult.data.AuthenticationResult.AccessToken,
      email,
      "/"
    );
  }
}

export default function SignUp() {
  const actionData = useActionData<typeof action>();
  const [password, setPassword] = useState<string>("");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {actionData?.success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700">
                Your account has been confirmed! Please proceed to login.
              </p>
              <a 
                href="/login" 
                className="mt-4 block text-center w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Login
              </a>
            </div>
          ) : actionData?.verificationRequired ? (
            <Form method="post" className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-700">
                  Please check your email ({actionData.email}) for a verification code.
                </p>
              </div>

              <input type="hidden" name="email" value={actionData.email} />
              <input type="hidden" name="password" value={password} />

              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirmation Code
                </label>
                <div className="mt-1">
                  <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {actionData?.error && (
                <div className="text-red-600 text-sm">{actionData.error}</div>
              )}

              <button
                type="submit"
                name="_action"
                value="confirm"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Verify Account
              </button>
            </Form>
          ) : (
            <Form 
              method="post" 
              className="space-y-6"
              onChange={(e) => {
                const form = e.currentTarget;
                const passwordInput = form.elements.namedItem('password') as HTMLInputElement;
                setPassword(passwordInput.value);
              }}
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {actionData?.error && (
                <div className="text-red-600 text-sm">{actionData.error}</div>
              )}

              <button
                type="submit"
                name="_action"
                value="signup"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign up
              </button>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}