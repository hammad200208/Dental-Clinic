import { useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaUserPlus,
  FaCalendarAlt,
  FaFileInvoiceDollar,
  FaCog,
  FaTooth,
} from "react-icons/fa";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: <FaHome /> },
    { label: "Patients", path: "/patients", icon: <FaUsers /> },
    { label: "Add Patient", path: "/patients/new", icon: <FaUserPlus /> },
    { label: "Appointments", path: "/appointments", icon: <FaCalendarAlt /> },
    { label: "Billing", path: "/billing", icon: <FaFileInvoiceDollar /> },
    { label: "Settings", path: "/settings", icon: <FaCog /> },
    { label: "Reports", path: "/reports", icon: <FaTooth /> },
  ];

  return (
    <aside className="w-72 bg-slate-900 text-white flex flex-col print:hidden">
      
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
            <FaTooth size={22} />
          </div>

          <div>
            <h2 className="font-bold text-lg">Dental Clinic</h2>
            <p className="text-xs text-slate-400">Management System</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive =
  location.pathname === item.path ||
  (item.path !== "/dashboard" &&
    location.pathname.startsWith(item.path));

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition
                ${
                  isActive
                    ? "bg-blue-600"
                    : "hover:bg-slate-800 text-slate-300"
                }
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}