import { BrowserRouter, Routes, Route } from "react-router-dom";
import ListingPage from "./pages/ListingPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ListingPage />} />
        <Route path="/property/:id" element={<PropertyDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;