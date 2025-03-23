
import React from 'react';
import Navbar from './Navbar';
import { Toaster } from '@/components/ui/sonner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto w-full">{children}</div>
      </main>
      <footer className="py-6 px-4 text-center text-sm text-muted-foreground border-t bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <p>Type Garden • A beautiful way to organize your typography</p>
        </div>
      </footer>
      <Toaster position="top-right" />
    </div>
  );
};

export default Layout;
