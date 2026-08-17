import { BrowserRouter, Routes, Route } from "react-router-dom";
import ListingPage from "./pages/ListingPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import FavoritesPage from "./pages/FavoritesPage";
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<ListingPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/property/:id" element={<PropertyDetailPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;