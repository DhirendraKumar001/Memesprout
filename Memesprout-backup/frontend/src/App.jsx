import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Feed from "./pages/Feed.jsx";
import Explore from "./pages/Explore.jsx";
import Profile from "./pages/Profile.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Settings from "./pages/Settings.jsx";
import Saved from "./pages/Saved.jsx";
import Messages from "./pages/Messages.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-ink bg-vignette lg:flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="lg:hidden">
          <Navbar />
        </div>
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/u/:handle" element={<Profile />} />
            <Route path="/p/:id" element={<PostDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saved"
              element={
                <ProtectedRoute>
                  <Saved />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages/:handle"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <footer className="border-t border-hairline mt-16">
          <div className="px-5 lg:px-10 py-8 text-center">
            <p className="text-xs text-ivory-dim">© {new Date().getFullYear()} MemeSprout</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
