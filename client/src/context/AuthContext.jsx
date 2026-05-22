/**
 * useAuth — convenience hook for reading auth state from the Redux store.
 *
 * Usage:
 *   const { user, token, isAuthenticated, isLoading, error } = useAuth();
 */
import { useSelector } from "react-redux";

export function useAuth() {
    return useSelector((state) => state.auth);
}
