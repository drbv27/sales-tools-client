// src/components/Navbar/Navbar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdOutlineDashboard, MdFormatListBulletedAdd } from "react-icons/md";
import LogoutButton from "@/components/logout/LogoutButton";
import { useAuth } from "@/components/AuthProvider";
import useCompanyTheme from '@/store/useCompanyTheme';
import Image from "next/image";

const Navbar = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { theme } = useCompanyTheme();

  const getLinkStyle = (href) => {
    const isActive = pathname.endsWith(href);
    return {
      display: 'flex',
      alignItems: 'end',
      gap: '0.5rem',
      padding: '0.5rem',
      color: isActive ? theme.highlighting : 'white',
      transition: 'color 0.2s',
    };
  };

  const navbarStyle = {
    width: '100%',
    height: '5vh',
    backgroundColor: theme.base1,
    borderRadius: '0.375rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    marginBottom: '0.5rem',
    marginTop: '0.5rem',
    display: 'flex',
    justifyContent: 'space-between',
  };

  // Actualizar también los eventos hover para usar el mismo color
  const handleHover = (e, href) => {
    const isActive = pathname.endsWith(href);
    e.currentTarget.style.color = isActive ? theme.highlighting : 'white';
  };

  return (
    <div style={navbarStyle}>
      <div className="flex gap-2 w-1/3">
        <Link 
          href="/main/dashboard" 
          style={getLinkStyle("/main/dashboard")}
          onMouseEnter={(e) => handleHover(e, "/main/dashboard")}
          onMouseLeave={(e) => handleHover(e, "/main/dashboard")}
        >
          <MdOutlineDashboard size={20} />
          <p className="font-semibold text-sm">Dash</p>
        </Link>
        <Link 
          href="/main/leads" 
          style={getLinkStyle("/main/leads")}
          onMouseEnter={(e) => handleHover(e, "/main/leads")}
          onMouseLeave={(e) => handleHover(e, "/main/leads")}
        >
          <MdFormatListBulletedAdd size={20} />
          <p className="font-semibold text-sm">Lists</p>
        </Link>
      </div>
      <div className="w-1/3 flex justify-center">
        <div>
          <Image
            src="/DialToolsProLogoWhite.png"
            alt="logowhite"
            width={150}
            height={100}
            className="pt-2"
          />
        </div>
      </div>
      <div className="w-1/3 flex justify-end">
        <LogoutButton />
      </div>
    </div>
  );
};

export default Navbar;