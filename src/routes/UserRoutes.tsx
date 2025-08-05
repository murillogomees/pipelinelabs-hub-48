
import React from 'react';
import { Route } from 'react-router-dom';
import UserDadosPessoais from '@/pages/UserDadosPessoais';

export function UserRoutes() {
  return (
    <Route path="user">
      <Route path="dados-pessoais" element={<UserDadosPessoais />} />
    </Route>
  );
}
