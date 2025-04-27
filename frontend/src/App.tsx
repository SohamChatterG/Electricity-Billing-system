import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from "./MyComponents/Login";
import Signup from "./MyComponents/Signup";
import LogoutButton from "./MyComponents/LogoutButton";
import ConnectionsPage from './pages/Connections';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import CustomersPage from './pages/Customers';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Bills from './pages/Bills';
import Reports from './pages/Reports';
import MeterReadings from './pages/MeterReadings';
const Home = () => <div className="p-4 text-center text-xl">Welcome to the Electricity Billing System ⚡</div>;
const Notifications = () => <div className="p-4">User Notifications</div>;

const Navbar = () => {
  const { isLoggedIn, userRole } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="text-lg font-bold">⚡ Electricity Billing</div>
      <div className="flex space-x-4 items-center">
        <Link to="/" className="hover:underline">Home</Link>
        {isLoggedIn ? (
          <>
            <Link to="/customers" className="hover:underline">Customers</Link>
            <Link to="/connections" className="hover:underline">Connections</Link>
            <Link to="/meter-readings" className="hover:underline">Meter</Link>
            <Link to="/bills" className="hover:underline">Bills</Link>

            {userRole === 'admin' && (
              <>
                <Link to="/reports" className="hover:underline">Reports</Link>
                <Link to="/notifications" className="hover:underline">Notifications</Link>
                <Link to="/reports" className="hover:underline">Reports</Link>
              </>
            )}
            <LogoutButton />
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/signup" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default function App() {
  return (

    <AuthProvider>
      <ToastContainer />

      <Router>
        <Navbar />
        <div className="container mx-auto mt-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/connections" element={<ConnectionsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/meter-readings/:meterNumber?" element={<MeterReadings />} />
            <Route path="/meter-readings" element={<MeterReadings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}