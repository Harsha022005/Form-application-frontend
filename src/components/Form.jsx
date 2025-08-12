import React, { useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// CSS Reset for react-beautiful-dnd
const dragDropStyles = `
  .react-beautiful-dnd-draggable {
    user-select: none;
  }
  .react-beautiful-dnd-draggable * {
    pointer-events: none;
  }
`;

function Form() {
  // Main form data state
  const [formData, setFormData] = useState({
    email: "",
    title: "",
    imageurl: "",
    categorised: [],
    cloze: [],
    comprehension: [],
  });

  // Success state for form submission
  const [success, setSuccess] = useState(false);

  // State for categorised question input
  const [currentCategorised, setCurrentCategorised] = useState({
    title: "",
    imageurl: "",
    type: [],
    options: [],
    assigned: {},
  });

  // State for cloze question input
  const [currentCloze, setCurrentCloze] = useState({
    title: "",
    imageurl: "",
    answer: "",
  });

  // State for comprehension question input
  const [currentComprehension, setCurrentComprehension] = useState({
    title: "",
    imageurl: "",
    paragraph: "",
    questions: [],
  });

  // State for current comprehension question input
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: [],
  });

  // State for storing answers to comprehension questions
  const [answers, setAnswers] = useState({});

  // Handle input changes for different sections
  const handleInputChange = (e, section) => {
    const { name, value } = e.target;
    if (section === "form") {
      setFormData({ ...formData, [name]: value });
    } else if (section === "categorised") {
      setCurrentCategorised({ ...currentCategorised, [name]: value });
    } else if (section === "cloze") {
      setCurrentCloze({ ...currentCloze, [name]: value });
    } else if (section === "comprehension") {
      setCurrentComprehension({ ...currentComprehension, [name]: value });
    } else if (section === "question") {
      setCurrentQuestion({ ...currentQuestion, [name]: value });
    }
  };

  // Handle selection of comprehension question options
  const handleOptionChange = (compIdx, qIdx, optionIdx) => {
    setAnswers((prev) => ({
      ...prev,
      [compIdx]: {
        ...prev[compIdx],
        [qIdx]: optionIdx,
      },
    }));
  };

  // Add a categorised question
  const addCategorised = () => {
    if (!currentCategorised.title.trim()) {
      alert("Please enter a title for the categorised question.");
      return;
    }

    const types = currentCategorised.type
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    const options = currentCategorised.options
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    if (types.length === 0 || options.length === 0) {
      alert("Please provide at least one category and one option.");
      return;
    }

    const initialAssigned = { Unassigned: [...options] };
    types.forEach((cat) => (initialAssigned[cat] = []));

    setFormData({
      ...formData,
      categorised: [
        ...formData.categorised,
        { ...currentCategorised, type: types, options, assigned: initialAssigned },
      ],
    });
    setCurrentCategorised({ title: "", imageurl: "", type: [], options: [], assigned: {} });
  };

  // Add a cloze question
  const addCloze = () => {
    if (!currentCloze.title.trim()) {
      alert("Please enter a title for the cloze question.");
      return;
    }
    setFormData({
      ...formData,
      cloze: [...formData.cloze, currentCloze],
    });
    setCurrentCloze({ title: "", imageurl: "", answer: "" });
  };

  // Add a comprehension question
  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      alert("Please enter a question.");
      return;
    }
    const options = currentQuestion.options
      .map((o) => o.trim())
      .filter((o) => o.length > 0);
    if (options.length === 0) {
      alert("Please provide at least one option.");
      return;
    }
    setCurrentComprehension({
      ...currentComprehension,
      questions: [...currentComprehension.questions, { ...currentQuestion, options }],
    });
    setCurrentQuestion({ question: "", options: [] });
  };

  // Add a comprehension section
  const addComprehension = () => {
    if (!currentComprehension.title.trim() || !currentComprehension.paragraph.trim()) {
      alert("Please enter a title and paragraph for the comprehension.");
      return;
    }
    setFormData({
      ...formData,
      comprehension: [...formData.comprehension, currentComprehension],
    });
    setCurrentComprehension({ title: "", imageurl: "", paragraph: "", questions: [] });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.title.trim()) {
      alert("Please fill in the email and form title.");
      return;
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_URL}/user/submit`,
        { ...formData, answers } // Include answers in the payload
      );
      if (response.status === 201) {
        setSuccess(true);
        setFormData({
          email: "",
          title: "",
          imageurl: "",
          categorised: [],
          cloze: [],
          comprehension: [],
        });
        setAnswers({});
      }
    } catch (error) {
      console.error("Error creating form:", error);
      alert("Failed to save form.");
    }
  };

const onDragEnd = (result, qIndex) => {
  const { source, destination } = result;
  if (!destination) return;

  const updatedCategorised = [...formData.categorised];
  const question = {...updatedCategorised[qIndex]};

  const sourceCat = source.droppableId.split("-").slice(1).join("-");
  const destCat = destination.droppableId.split("-").slice(1).join("-");

  const sourceItems = Array.from(question.assigned[sourceCat]);
  const [removed] = sourceItems.splice(source.index, 1);

  if (sourceCat === destCat) {
    sourceItems.splice(destination.index, 0, removed);
    question.assigned[sourceCat] = sourceItems;
  } else {
    const destItems = Array.from(question.assigned[destCat]);
    destItems.splice(destination.index, 0, removed);
    question.assigned[sourceCat] = sourceItems;
    question.assigned[destCat] = destItems;
  }

  updatedCategorised[qIndex] = question;
  setFormData({ ...formData, categorised: updatedCategorised });
};

  return (
      <div className="min-h-screen bg-gradient-to-r from-indigo-50 to-purple-50 p-8">
        <style>{dragDropStyles}</style>

        <nav className="flex justify-between items-center bg-blue-600 text-white px-6 py-3 rounded-md shadow-lg mb-8">
          <h1 className="text-xl font-bold">Form Builder</h1>
          <div className="flex space-x-4">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <Link
              to="/createform"
              className="bg-white text-blue-600 px-4 py-1 rounded-md hover:bg-gray-200 transition"
            >
              Create Form
            </Link>
          </div>
        </nav>

        <h1 className="text-4xl font-extrabold text-center mb-12 text-indigo-700 tracking-wide">
          Create Your Google Form
        </h1>

        <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
          {/* LEFT SIDE: FORM INPUTS */}
          <div className="bg-white p-8 rounded-xl shadow-lg overflow-y-auto max-h-[85vh] flex-1">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Basic Form Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange(e, "form")}
                  required
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  name="title"
                  placeholder="Form Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange(e, "form")}
                  required
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="url"
                  name="imageurl"
                  placeholder="Form Image URL"
                  value={formData.imageurl}
                  onChange={(e) => handleInputChange(e, "form")}
                  className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 md:col-span-2"
                />
              </div>

              {/* Categorised Section */}
              <section className="border border-indigo-300 rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-indigo-700">
                  Add Categorised Question
                </h3>
                <input
                  type="text"
                  placeholder="Title"
                  value={currentCategorised.title}
                  onChange={(e) => handleInputChange(e, "categorised")}
                  name="title"
                  className="p-3 border rounded-lg w-full mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="url"
                  placeholder="Image URL"
                  value={currentCategorised.imageurl}
                  onChange={(e) => handleInputChange(e, "categorised")}
                  name="imageurl"
                  className="p-3 border rounded-lg w-full mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Categories (comma-separated)"
                  value={currentCategorised.type.join(",")}
                  onChange={(e) =>
                    setCurrentCategorised({
                      ...currentCategorised,
                      type: e.target.value.split(",").map((t) => t.trim()),
                    })
                  }
                  className="p-3 border rounded-lg w-full mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Options (comma-separated)"
                  value={currentCategorised.options.join(",")}
                  onChange={(e) =>
                    setCurrentCategorised({
                      ...currentCategorised,
                      options: e.target.value.split(",").map((o) => o.trim()),
                    })
                  }
                  className="p-3 border rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={addCategorised}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Add Categorised
                </button>
              </section>

              {/* Cloze Section */}
              <section className="border border-green-300 rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-green-700">
                  Add Cloze Question
                </h3>
                <input
                  type="text"
                  placeholder="Question"
                  value={currentCloze.title}
                  onChange={(e) => handleInputChange(e, "cloze")}
                  name="title"
                  className="p-3 border rounded-lg w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="url"
                  placeholder="Image URL"
                  value={currentCloze.imageurl}
                  onChange={(e) => handleInputChange(e, "cloze")}
                  name="imageurl"
                  className="p-3 border rounded-lg w-full mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  placeholder="Answer"
                  value={currentCloze.answer}
                  onChange={(e) => handleInputChange(e, "cloze")}
                  name="answer"
                  className="p-3 border rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={addCloze}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Add Cloze
                </button>
              </section>

              {/* Comprehension Section */}
              <section className="border border-purple-300 rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-purple-700">
                  Add Comprehension
                </h3>
                <input
                  type="text"
                  placeholder="Title"
                  value={currentComprehension.title}
                  onChange={(e) => handleInputChange(e, "comprehension")}
                  name="title"
                  className="p-3 border rounded-lg w-full mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="url"
                  placeholder="Image URL"
                  value={currentComprehension.imageurl}
                  onChange={(e) => handleInputChange(e, "comprehension")}
                  name="imageurl"
                  className="p-3 border rounded-lg w-full mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <textarea
                  placeholder="Paragraph"
                  value={currentComprehension.paragraph}
                  onChange={(e) => handleInputChange(e, "comprehension")}
                  name="paragraph"
                  className="p-3 border rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows="4"
                />
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-purple-600">Add Question</h4>
                  <input
                    type="text"
                    placeholder="Question"
                    value={currentQuestion.question}
                    onChange={(e) => handleInputChange(e, "question")}
                    name="question"
                    className="p-3 border rounded-lg w-full mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Options (comma-separated)"
                    value={currentQuestion.options.join(",")}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        options: e.target.value.split(",").map((o) => o.trim()),
                      })
                    }
                    className="p-3 border rounded-lg w-full mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="px-5 py-2 bg-purple-400 text-white rounded-lg hover:bg-purple-500 transition mb-3"
                  >
                    Add Question
                  </button>
                  <button
                    type="button"
                    onClick={addComprehension}
                    className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Add Comprehension
                  </button>
                </div>
              </section>

              {/* Submit Form Button */}
              <button
                type="submit"
                className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
              >
                Submit Form
              </button>
            </form>

            {success && (
              <p className="mt-4 text-center text-green-700 font-semibold">
                Form saved successfully!
              </p>
            )}
          </div>

          {/* RIGHT SIDE: PREVIEW */}
          <div className="bg-white p-6 rounded-xl shadow-lg overflow-y-auto max-h-[85vh] flex-1">
            <h2 className="text-2xl font-bold mb-6 text-indigo-700">Preview Form</h2>

            {formData.imageurl && (
              <img
                src={formData.imageurl}
                alt="Form Image"
                className="rounded-lg mb-4 max-w-full h-auto"
              />
            )}
            <p>
              <strong>Email:</strong> {formData.email || "-"}
            </p>
            <p className="mb-6">
              <strong>Form Title:</strong> {formData.title || "-"}
            </p>

            {/* Categorised Questions */}
            {formData.categorised.map((q, i) => (
              <div key={i} className="mb-8">
                <h4 className="font-bold text-lg text-indigo-600 mb-2">{q.title}</h4>
                {q.imageurl && (
                  <img
                    src={q.imageurl}
                    alt="Category Image"
                    className="rounded-lg mb-3 max-w-full h-auto"
                  />
                )}
                <DragDropContext onDragEnd={(result) => onDragEnd(result, i)}>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.keys(q.assigned).map((cat) => (
                      <Droppable key={cat} droppableId={cat}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`p-3 border border-indigo-200 rounded-lg min-h-[100px] ${
                              snapshot.isDraggingOver ? "bg-indigo-100" : "bg-indigo-50"
                            }`}
                          >
                            <h5 className="font-semibold text-indigo-700 mb-3">{cat}</h5>
                            {q.assigned[cat].map((item, idx) => (
                              <Draggable
                                key={`${i}-${cat}-${item}`}
                                draggableId={`${i}-${cat}-${item}`}
                                index={idx}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`p-2 rounded mb-1 ${
                                      snapshot.isDragging
                                        ? "bg-indigo-300"
                                        : "bg-indigo-100 hover:bg-indigo-200"
                                    }`}
                                  >
                                    {item}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    ))}
                  </div>
                </DragDropContext>
              </div>
            ))}

            {/* Cloze Questions */}
            {formData.cloze.map((q, i) => (
              <div
                key={i}
                className="mb-6 p-4 border border-green-300 rounded-lg bg-green-50 shadow-sm"
              >
                <h4 className="font-bold text-green-700 mb-2">{q.title}</h4>
                {q.imageurl && (
                  <img
                    src={q.imageurl}
                    alt="Cloze Image"
                    className="rounded-lg mb-3 max-w-full h-auto"
                  />
                )}
                <p>
                  <strong>Answer:</strong> {q.answer}
                </p>
              </div>
            ))}

            {/* Comprehension Questions */}
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
              {formData.comprehension.map((c, compIdx) => (
                <div
                  key={compIdx}
                  className="mb-8 p-6 border border-purple-300 rounded-lg bg-purple-50 shadow-sm"
                >
                  <h4 className="font-bold text-lg text-purple-700 mb-4">{c.title}</h4>
                  {c.imageurl && (
                    <img
                      src={c.imageurl}
                      alt="Comprehension"
                      className="rounded-lg mb-5 max-w-full h-auto"
                    />
                  )}
                  <p className="mb-6 text-gray-800 leading-relaxed">{c.paragraph}</p>

                  <h5 className="font-semibold text-purple-700 mb-4">Questions:</h5>

                  {c.questions.map((q, qIdx) => (
                    <div key={qIdx} className="mb-5">
                      <p className="font-medium text-gray-800 mb-2">{`${qIdx + 1}. ${q.question}`}</p>
                      <ul className="ml-6 space-y-3">
                        {q.options.map((opt, optIdx) => {
                          const isChecked = answers[compIdx]?.[qIdx] === optIdx;
                          return (
                            <li
                              key={optIdx}
                              className={`flex items-center cursor-pointer rounded-lg px-3 py-2 transition
                              ${
                                isChecked
                                  ? "bg-purple-300 font-semibold text-purple-900"
                                  : "hover:bg-purple-200"
                              }`}
                            >
                              <input
                                type="radio"
                                id={`comp-${compIdx}-q-${qIdx}-opt-${optIdx}`}
                                name={`question-${compIdx}-${qIdx}`}
                                value={optIdx}
                                checked={isChecked || false}
                                onChange={() => handleOptionChange(compIdx, qIdx, optIdx)}
                                className="mr-3 cursor-pointer"
                              />
                              <label
                                htmlFor={`comp-${compIdx}-q-${qIdx}-opt-${optIdx}`}
                                className="select-none"
                              >
                                {opt}
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
              <button className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition" type="submit"> submit      </button>
            </div>
          </div>
          
        </div>

     
      </div>
  );
}

export default Form;