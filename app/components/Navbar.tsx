import { Link, Form } from "@remix-run/react";

interface NavbarProps {
  user: { id: string } | null;
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">
              MindWell
            </Link>
          </div>
          <div className="flex items-center">
            {user ? (
              <>
                <span className="text-gray-600 mr-4">
                  Logged In
                </span>
                <Form action="/logout" method="post">
                  <button
                    type="submit"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
                  >
                    Logout
                  </button>
                </Form>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}