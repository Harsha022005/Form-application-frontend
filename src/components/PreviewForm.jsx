import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";


export default function PreviewForm() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  // State to track comprehension question answers
  const [answers, setAnswers] = useState({});
useEffect(() => {
  async function fetchForm() {
    try {
      const url = "https://form-application-backend.onrender.com"; 
      const res = await axios.get(`${url}/user/getpreview/${id}`);
      setForm(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  fetchForm();
}, [id]);

  // Handle option selection
  const handleOptionChange = (compIdx, qIdx, optionIdx) => {
    setAnswers((prev) => ({
      ...prev,
      [compIdx]: {
        ...prev[compIdx],
        [qIdx]: optionIdx,
      },
    }));
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-indigo-600"></div>
      </div>
    );

  if (!form)
    return (
      <div className="flex justify-center items-center min-h-screen bg-indigo-50">
        <p className="text-lg text-indigo-600 font-semibold">Form not found</p>
      </div>
    );

  // Section component for reuse
  const Section = ({ title, color, iconPath, children }) => (
    <section className="mb-12">
      <h2 className={`text-2xl font-bold mb-5 flex items-center gap-3 text-${color}-600`}>
        <span className={`inline-block bg-${color}-300 rounded-full p-1`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-7 w-7 text-${color}-700`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
          </svg>
        </span>
        {title}
      </h2>
      {children}
    </section>
  );

  return (
    <div className="min-h-screen bg-indigo-50 p-6">

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

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-10">

        {/* Title */}
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-8 border-b border-indigo-200 pb-4 tracking-wide">
          {form.title}
        </h1>

        {/* Image */}
        {form.imageurl && (
          <div className="flex justify-center mb-10">
            <img
              src={form.imageurl}
              alt="Form visual"
              className="rounded-xl shadow-lg max-h-72 object-cover"
            />
          </div>
        )}

        {/* Categorised */}
        {form.categorised?.length > 0 && (
          <Section title="Categorised Questions" color="indigo" iconPath="M4 6h16M4 12h8m-8 6h16">
            <div className="space-y-6">
              {form.categorised.map(({ title, assigned }, idx) => (
                <div
                  key={idx}
                  className="bg-indigo-100 p-6 rounded-2xl shadow-md border border-indigo-300"
                >
                  <p className="font-semibold text-indigo-800 mb-3">{title}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(assigned || {}).map(([category, items]) => (
                      <div key={category} className="bg-indigo-50 p-3 rounded-lg">
                        <h4 className="font-semibold text-indigo-600 mb-2">{category}</h4>
                        <ul className="list-disc list-inside text-indigo-700">
                          {items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Cloze */}
        {form.cloze?.length > 0 && (
          <Section title="Cloze Questions" color="green" iconPath="M12 6v6l4 2">
            <div className="space-y-6">
              {form.cloze.map(({ title, answer }, idx) => (
                <div
                  key={idx}
                  className="bg-green-100 p-6 rounded-2xl shadow-md border border-green-300"
                >
                  <p className="text-green-800 font-medium">{title}</p>
                  <p className="mt-2 text-green-700">{answer}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Comprehension with selectable options */}
        {form.comprehension?.length > 0 && (
          <Section title="Comprehension" color="purple" iconPath="M19 10H5m7-7v14">
            <div className="space-y-10">
              {form.comprehension.map(({ title, paragraph, questions }, compIdx) => (
                <div
                  key={compIdx}
                  className="bg-purple-100 p-6 rounded-2xl shadow-md border border-purple-300"
                >
                  <p className="font-semibold text-purple-800 mb-4">{title}</p>
                  <p className="text-purple-700 leading-relaxed mb-6">{paragraph}</p>
                  {questions?.map(({ question, options }, qIdx) => (
                    <div key={qIdx} className="mb-6">
                      <p className="font-semibold text-purple-700 mb-3">
                        {qIdx + 1}. {question}
                      </p>
                      <div className="flex flex-col space-y-2">
                        {options.map((opt, optIdx) => {
                          const checked = answers[compIdx]?.[qIdx] === optIdx;
                          return (
                            <label
                              key={optIdx}
                              className={`pl-3 cursor-pointer rounded border border-purple-400 hover:bg-purple-200 ${
                                checked ? "bg-purple-300" : "bg-purple-100"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`comp-${compIdx}-q-${qIdx}`}
                                value={optIdx}
                                checked={checked}
                                onChange={() =>
                                  handleOptionChange(compIdx, qIdx, optIdx)
                                }
                                className="mr-2 cursor-pointer"
                              />
                              {opt}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
              <button className=" m-5 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition" type="submit"> submit      </button>

          </Section>

        )}
      </div>
    </div>
  );
}
