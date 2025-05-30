// app/main/layout.jsx
'use client';
import { useEffect } from 'react';
import withAuth from '@/components/withAuth';
import Navbar from '@/components/Navbar/Navbar';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useCompanyData } from '@/hooks/useCompanyData';
import useBusinessStore from '@/store/useBusinessStore';
import useLeadsStore from '@/store/useLeadsStore2';

const MainLayout = ({ children }) => {
  const { fetchBusinesses } = useBusinessStore();
  const { fetchLeads } = useLeadsStore();
  useCompanyData();

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([fetchBusinesses(), fetchLeads()]);
    };
    loadInitialData();
  }, [fetchBusinesses, fetchLeads]);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block lg:w-[280px] shrink-0 border-r bg-slate-100 h-screen sticky top-0">
        <Sidebar />
      </div>
      {/* === Área de Contenido Principal === */}
      <div className="flex flex-col flex-1 w-full lg:w-[calc(100%-280px)]">
        {/* Navbar (ya es sticky) */}
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default withAuth(MainLayout);
