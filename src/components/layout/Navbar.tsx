
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b backdrop-blur-md px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <NavLink to="/" className="flex items-center space-x-2 text-primary">
          <Leaf className="h-6 w-6" />
          <span className="font-display text-lg font-semibold">Type Garden</span>
        </NavLink>
        <div className="flex items-center space-x-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
            end
          >
            Garden
          </NavLink>
          <NavLink
            to="/fonts"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            Fonts
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            Projects
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
