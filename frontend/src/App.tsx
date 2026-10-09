
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

// AUTENTICAÇÃO
import AuthPage from "./components/auth/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PermissionRoute from "./components/PermissionRoute";

// PÁGINAS PRINCIPAIS
import Home from "./pages/Home";
import Companies from "./pages/Companies/Companies";
import Departments from "./pages/Departments/Departments";
import Positions from "./pages/Positions/Positions";
import Employees from "./pages/Employees/Employees";
import EmployeeDetails from "./pages/Employees/EmployeesDetails";

// PÁGINAS ADMINISTRATIVAS
// Ajuste estes caminhos conforme sua estrutura real.
import UsersPage from "./pages/Users/Users";
import ProfilesPage from "./pages/Roles/Roles";
import PermissionsPage from "./pages/Permissions/Permissions";


import Vacations from "./pages/Vacations/Vacations";

export default function App() {
  return (
    <Routes>
      {/* ============================================
          ROTA INICIAL
      ============================================= */}

      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* ============================================
          ROTA PÚBLICA
      ============================================= */}

      <Route path="/auth" element={<AuthPage />} />

      {/* ============================================
          ROTAS AUTENTICADAS
      ============================================= */}

      <Route element={<ProtectedRoute />}>
        {/* DASHBOARD */}

        <Route path="/home" element={<Home />} />

        {/* ========================================
            EMPRESAS
        ========================================= */}

        <Route
          element={
            <PermissionRoute
              permissions={["EMPRESAS_VISUALIZAR", "EMPRESAS_GERENCIAR"]}
            />
          }
        >
          <Route path="/empresas" element={<Companies />} />
        </Route>

        {/* ========================================
            DEPARTAMENTOS
        ========================================= */}

        <Route
          element={
            <PermissionRoute
              permissions={[
                "DEPARTAMENTOS_VISUALIZAR",
                "DEPARTAMENTOS_GERENCIAR",
              ]}
            />
          }
        >
          <Route path="/departamentos" element={<Departments />} />
        </Route>

        {/* ========================================
            CARGOS
        ========================================= */}

        <Route
          element={
            <PermissionRoute
              permissions={["CARGOS_VISUALIZAR", "CARGOS_GERENCIAR"]}
            />
          }
        >
          <Route path="/cargos" element={<Positions />} />
        </Route>

        {/* ========================================
            FUNCIONÁRIOS
        ========================================= */}

        <Route
          element={
            <PermissionRoute
              permissions={[
                "FUNCIONARIOS_VISUALIZAR",
                "FUNCIONARIOS_GERENCIAR",
              ]}
            />
          }
        >
          <Route path="/funcionarios" element={<Employees />} />

          <Route path="/funcionarios/:id" element={<EmployeeDetails />} />
        </Route>

        {/* ========================================
            ADMINISTRAÇÃO: USUÁRIOS
        ========================================= */}

        <Route
          element={
            <PermissionRoute
              permissions={["USUARIOS_VISUALIZAR", "USUARIOS_GERENCIAR"]}
            />
          }
        >
          <Route path="/usuarios" element={<UsersPage />} />
        </Route>

        {/* ========================================
            ADMINISTRAÇÃO: PERFIS
        ========================================= */}

        <Route
          element={
            <PermissionRoute
              permissions={["PERFIS_VISUALIZAR", "PERFIS_GERENCIAR"]}
            />
          }
        >
          <Route path="/perfis" element={<ProfilesPage />} />
        </Route>

        {/* ========================================
            ADMINISTRAÇÃO: PERMISSÕES
        ========================================= */}

        <Route
          element={
            <PermissionRoute
              permissions={["PERMISSOES_VISUALIZAR", "PERMISSOES_GERENCIAR"]}
            />
          }
        >
          <Route path="/permissoes" element={<PermissionsPage />} />
        </Route>
      </Route>

        <Route
          element={
            <PermissionRoute
              permissions={["FERIAS_VISUALIZAR", "FERIAS_GERENCIAR"]}
            />
          }
        >
          <Route path="/ferias" element={<Vacations />} />
        </Route>


      {/* ============================================
          ROTAS DESCONHECIDAS
      ============================================= */}

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}