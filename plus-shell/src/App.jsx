import { Suspense, lazy } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { MfeErrorBoundary } from "./MfeErrorBoundary";

function MfeLoadError({ name, port }) {
  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h2>Nao foi possivel carregar {name}</h2>
      <p>
        O shell precisa do microfrontend na porta {port}. Execute{" "}
        <code>npm run dev</code> dentro de <code>{name}</code> e recarregue a pagina.
      </p>
    </div>
  );
}

const LoginPage = lazy(() =>
  import("mfe_auth/LoginPage").catch(() => ({
    default: () => <MfeLoadError name="plus-mfe-auth" port="4001" />,
  })),
);
const RegisterPage = lazy(() =>
  import("mfe_auth/RegisterPage").catch(() => ({
    default: () => <MfeLoadError name="plus-mfe-auth" port="4001" />,
  })),
);
const AuthDashboardPage = lazy(() =>
  import("mfe_auth/DashboardPage").catch(() => ({
    default: () => <MfeLoadError name="plus-mfe-auth" port="4001" />,
  })),
);
const MediaDashboardPage = lazy(() =>
  import("mfe_media/MediaDashboardPage").catch(() => ({
    default: () => <MfeLoadError name="plus-mfe-media" port="4002" />,
  })),
);

function getStoredToken() {
  return localStorage.getItem("token") || localStorage.getItem("access_token");
}

function PrivateRoute({ children }) {
  const token = getStoredToken();
  return token ? children : <Navigate to="/login" replace />;
}

function LoginRoute() {
  const navigate = useNavigate();
  return <LoginPage onLogin={() => navigate("/dashboard", { replace: true })} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<p>Carregando...</p>}>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <MfeErrorBoundary>
                  <AuthDashboardPage />
                </MfeErrorBoundary>
              </PrivateRoute>
            }
          />
          <Route
            path="/media"
            element={
              <PrivateRoute>
                <MfeErrorBoundary>
                  <MediaDashboardPage />
                </MfeErrorBoundary>
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
