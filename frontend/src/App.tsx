import { BrowserRouter, Routes, Route } from "react-router";
import AuthPage from "./components/auth/AuthPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
}