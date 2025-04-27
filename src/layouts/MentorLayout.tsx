import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clapperboard as Mortarboard, LayoutDashboard, Users, CalendarClock, Briefcase, LogOut, Menu, X } from 'lucide-react';

const MentorLayout: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navLinks = [
    { path: '/mentor', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/mentor/mentees', icon: <Users size={20} />, label: 'My Mentees' },
    { path: '/mentor/sessions', icon: <CalendarClock size={20} />, label: 'Mentoring Sessions' },
    { path: '/mentor/internships', icon: <Briefcase size={20} />, label: 'Internship Reports' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className="flex items-center">
            <Mortarboard className="h-8 w-8 text-secondary" />
            <span className="ml-2 text-lg font-semibold">Mentor Portal</span>
          </div>
          <button className="md:hidden" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>
        
        {/* Navigation Links */}
        <nav className="px-2 py-4 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/mentor'}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-secondary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              {link.icon}
              <span className="ml-3">{link.label}</span>
            </NavLink>
          ))}
          
          <button
            onClick={() => signOut()}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            <LogOut size={20} />
            <span className="ml-3">Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="md:pl-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white shadow-sm md:px-6">
          <button className="md:hidden" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          
          <div className="flex items-center">
            {currentUser && (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-semibold">
                  {currentUser.profile?.first_name?.[0]}{currentUser.profile?.last_name?.[0]}
                </div>
                <span className="ml-2 text-sm font-medium hidden sm:block">
                  {currentUser.profile?.first_name} {currentUser.profile?.last_name}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Content */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MentorLayout;