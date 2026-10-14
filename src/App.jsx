import { Routes, Route } from "react-router-dom";

import '@fontsource/righteous';
import '@fontsource/lilita-one';
import '@fontsource/roboto/300.css'; // Light
import '@fontsource/roboto/400.css'; // Regular
import '@fontsource/roboto/500.css'; // Medium
import '@fontsource/roboto/700.css'; // Bold
import '@fontsource/silkscreen/400.css'; //Standard
import '@fontsource/silkscreen/700.css'; //Bold

import Home from "./Pages/Home.jsx";
import Form from "./Pages/Form.jsx";
import Results from "./Pages/Results.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/form" element={<Form />} />
      <Route path="/results" element={<Results />} />
    </Routes>
  );
}

export default App;
