import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home.jsx";
import Form from "./Pages/Form.jsx";
import Results from "./Pages/Results.jsx";
/** 
import QuickResults from "./Pages/QuickResults.jsx";
*/

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/form" element={<Form />} />
      <Route path="/results" element={<Results />} />
      {/**
      <Route path="/quickresults/:item" element={<QuickResults />} />
      */}
    </Routes>
  );
}

export default App;
