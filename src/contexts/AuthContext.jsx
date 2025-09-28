
"use client";

import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import apiClient from '../api/api'; 
import { loginUser, registerUser } from '../api/authService'; 
import { useNavigate } from 'react-router-dom'; 

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); 

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('accessToken');
    navigate('/login'); 
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      apiClient.get('/api/v1/usuarios/me')
        .then(response => setUser(response.data))
        .catch(() => logout())
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [logout]);

  const login = useCallback(async (email, senha) => {
    try {
      const data = await loginUser(email, senha);
      localStorage.setItem('accessToken', data.access_token);
      
      const userResponse = await apiClient.get('/api/v1/usuarios/me');
      const loggedInUser = userResponse.data;
      setUser(loggedInUser);

      if (loggedInUser.tipo === 'vendedor' && !loggedInUser.loja) {
        navigate('/loja/cadastrar'); 
      } else {
        navigate('/'); 
      }
    } catch (error) {
      console.error("Falha no login", error);
      
      throw new Error("Email ou senha inválidos.");
    }
  }, [navigate]);

  const register = useCallback(async (dados) => {
    try {
      await registerUser(dados);
      alert('Cadastro realizado! Por favor, verifique seu e-mail para ativar sua conta.');
      navigate('/login'); 
    } catch (error) {
      console.error("Falha no cadastro", error);
      alert('Não foi possível realizar o cadastro. Verifique os dados.');
    }
  }, [navigate]);

  const value = {
    isAuthenticated: !!user,
    user,
    isLoading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}