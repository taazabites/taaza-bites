import React from 'react';
import { QuickHelpFloatingWidget } from './QuickHelpFloatingWidget';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <QuickHelpFloatingWidget />
    </>
  );
}

