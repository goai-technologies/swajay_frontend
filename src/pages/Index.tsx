
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';
import { Authprovider } from '@/contexts/AuthContext';

const Index: React.FC = () => {
  return (
    <Authprovider>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </Authprovider>
  );
};

export default Index;
