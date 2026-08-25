import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import ListingPage from "./pages/ListingPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import FavoritesPage from "./pages/FavoritesPage";
import "./App.css";

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <ErrorBoundary>
                                <ListingPage />
                            </ErrorBoundary>
                        }
                    />
                    <Route
                        path="/favorites"
                        element={
                            <ErrorBoundary>
                                <FavoritesPage />
                            </ErrorBoundary>
                        }
                    />
                    <Route
                        path="/property/:id"
                        element={
                            <ErrorBoundary>
                                <PropertyDetailPage />
                            </ErrorBoundary>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;