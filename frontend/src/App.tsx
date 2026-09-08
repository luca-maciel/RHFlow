import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Home from "./pages/Home";
import Companies from "./pages/Companies/Companies";
import Departments from "./pages/Departments/Departments";
import Positions from "./pages/Positions/Positions";
import Employees from "./pages/Employees/Employees";
import EmployeeDetails from "./pages/Employees/EmployeesDetails";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/home" replace />}
        />

        <Route
          path="/home"
          element={<Home />}
        />

        <Route
          path="/empresas"
          element={<Companies />}
        />

        <Route
          path="/departamentos"
          element={<Departments />}
        />

        <Route
          path="/cargos"
          element={<Positions />}
        />

        <Route
          path="/funcionarios"
          element={<Employees />}
        />

        <Route
          path="/funcionarios/:id"
          element={<EmployeeDetails />}
        />

        <Route
          path="/*"
          element={<Navigate to="/home" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}