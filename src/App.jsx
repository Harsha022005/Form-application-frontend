import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Form from "./components/form";
import Preview from "./components/PreviewForm";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/createform" element={<Form />} />
          <Route path="/getpreview/:id" element={<Preview />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;
