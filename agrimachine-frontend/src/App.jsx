import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedOwnerRoute from "./components/ProtectedOwnerRoute";
import ProtectedUserRoute from "./components/ProtectedUserRoute";
import Home from "./pages/Home";
import Machines from "./pages/Machines";
import MyBookings from "./pages/MyBookings";
import OwnerLogin from "./pages/OwnerLogin";
import OwnerRegister from "./pages/OwnerRegister";
import Owner from "./pages/Owner";
import OwnerMachines from "./pages/OwnerMachines";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import User from "./pages/User";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/machines" element={<Machines />} />
        <Route
          path="/my-bookings"
          element={
            <ProtectedUserRoute>
              <MyBookings />
            </ProtectedUserRoute>
          }
        />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/user-register" element={<UserRegister />} />
        <Route
          path="/user"
          element={
            <ProtectedUserRoute>
              <User />
            </ProtectedUserRoute>
          }
        />
        <Route path="/owner-login" element={<OwnerLogin />} />
        <Route path="/owner-register" element={<OwnerRegister />} />
        <Route
          path="/owner"
          element={
            <ProtectedOwnerRoute>
              <Owner />
            </ProtectedOwnerRoute>
          }
        />
        <Route
          path="/owner-machines"
          element={
            <ProtectedOwnerRoute>
              <OwnerMachines />
            </ProtectedOwnerRoute>
          }
        />
      </Routes>
    </Router>
  );
}
