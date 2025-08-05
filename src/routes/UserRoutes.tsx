
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserDadosPessoais from '@/pages/UserDadosPessoais';

export function UserRoutes() {
  return (
    <Routes>
      <Route path="dados-pessoais" element={<UserDadosPessoais />} />
    </Routes>
  );
}
