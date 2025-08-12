import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Home() {
  const [forms, setForms] = useState([]);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const fetchAllForms = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_URL || process.env.REACT_APP_URL}/user/getpreview`,
        { email }
      );

      setForms(response.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch forms. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Navbar */}
      <nav className="flex justify-between items-center bg-indigo-700 text-white px-6 py-4 rounded-lg shadow-md max-w-7xl mx-auto">
        <h1 className="text-2xl font-extrabold tracking-wide">📋 Form Builder</h1>
        <div className="flex space-x-6">
          <Link
            to="/"
            className="text-indigo-100 hover:text-white font-semibold transition"
          >
            Home
          </Link>
          <Link
            to="/createform"
            className="bg-white text-indigo-700 px-5 py-2 rounded-md shadow-md font-semibold hover:bg-indigo-100 transition"
          >
            Create Form
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto mt-10">
        {/* Input Section */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white p-6 rounded-xl shadow-lg">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-grow border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <button
            onClick={fetchAllForms}
            className="bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-800 transition font-semibold text-lg w-full sm:w-auto"
            aria-label="Fetch Forms"
          >
            Fetch Forms
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-4 text-center text-red-600 font-medium">{error}</p>
        )}

        {/* Forms Grid */}
        <section className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {forms.length === 0 ? (
            <p className="text-center text-gray-500 col-span-full">
              No forms to display. Please enter your email and fetch forms.
            </p>
          ) : (
            forms.map((form, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition cursor-pointer flex flex-col justify-between"
                tabIndex={0}
                aria-label={`Form titled ${form.title}`}
              >
                <h2 className="text-xl font-semibold text-indigo-700 mb-4 truncate">
                  {form.title}
                </h2>
                <Link
                  to={`/getpreview/${form._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-block px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-center font-medium"
                  aria-label={`View form titled ${form.title}`}
                >
                  View Form
                </Link>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default Home;
