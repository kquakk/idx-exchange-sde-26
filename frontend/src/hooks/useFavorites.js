import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "idx:favorites";

function readFromStorage() {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
        return [];
    }
}

function writeToStorage(ids) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {

    }
}

const SYNC_EVENT = "idx:favorites-changed";

export default function useFavorites() {
    const [favorites, setFavorites] = useState(readFromStorage);

    useEffect(() => {
        const resync = () => setFavorites(readFromStorage());

        window.addEventListener(SYNC_EVENT, resync);
        window.addEventListener("storage", resync);

        return () => {
            window.removeEventListener(SYNC_EVENT, resync);
            window.removeEventListener("storage", resync);
        };
    }, []);

    const commit = useCallback((nextIds) => {
        writeToStorage(nextIds);
        setFavorites(nextIds);
        window.dispatchEvent(new Event(SYNC_EVENT));
    }, []);

    const isFavorite = useCallback(
        (id) => favorites.includes(String(id)),
        [favorites]
    );

    const addFavorite = useCallback(
        (id) => {
            const key = String(id);
            const current = readFromStorage();
            if (current.includes(key)) return;
            commit([...current, key]);
        },
        [commit]
    );

    const removeFavorite = useCallback(
        (id) => {
            const key = String(id);
            const current = readFromStorage();
            commit(current.filter((existing) => existing !== key));
        },
        [commit]
    );

    const toggleFavorite = useCallback(
        (id) => {
            const key = String(id);
            const current = readFromStorage();
            if (current.includes(key)) {
                commit(current.filter((existing) => existing !== key));
            } else {
                commit([...current, key]);
            }
        },
        [commit]
    );

    const clearFavorites = useCallback(() => commit([]), [commit]);

    return {
        favorites,
        count: favorites.length,
        isFavorite,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        clearFavorites,
    };
}