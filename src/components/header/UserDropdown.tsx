import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { LogOut } from "lucide-react";
import { Dropdown } from "../ui/dropdown/Dropdown";

type User = {
  username?: string;
  email?: string;
  phone?: string;
};

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_API_URL as string;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        console.error("Invalid user in localStorage");
      }
    }
  }, []);

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const closeDropdown = () => setIsOpen(false);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${BASE_URL}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch {
      // logout route optional
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/signin");
  };

  const getInitial = () => {
    const name = user?.username || user?.email || "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="relative">
      {/* ===== Trigger ===== */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleDropdown();
        }}
        className="dropdown-toggle flex items-center gap-3 text-gray-700 dark:text-gray-400"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-semibold text-white">
          {getInitial()}
        </div>

        <span className="font-medium text-theme-sm">
          {user?.username || "User"}
        </span>

        <svg
          className={`transition-transform duration-200 stroke-gray-500 dark:stroke-gray-400 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* ===== Dropdown ===== */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="mt-[17px] w-[260px] rounded-2xl p-4 dark:bg-gray-dark"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-semibold text-white">
            {getInitial()}
          </div>

          <div>
            <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
              {user?.email || "No Email"}
            </span>
             <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
              {user?.phone || "No Phone"}
            </span>
          </div>
        </div>

        <div className="my-3 border-t border-gray-200 dark:border-gray-800" />

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-theme-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign out</span>
        </button>
      </Dropdown>
    </div>
  );
}
