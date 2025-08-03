
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  document: string;
  phone: string;
}

export function useAuthForm() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    document: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    console.log('Is sign up?', isSignUp);

    setIsLoading(true);

    try {
      if (isSignUp) {
        // SECURITY FIX: Add mandatory emailRedirectTo for secure authentication
        const redirectUrl = `${window.location.origin}/app`;
        
        // Cadastro
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              display_name: formData.name,
              document: formData.document,
              phone: formData.phone,
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Cadastro realizado com sucesso! Verifique seu email para confirmar a conta.",
        });
      } else {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!",
        });
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      
      let message = "Erro inesperado. Tente novamente.";
      
      if (error.message?.includes("Invalid login credentials")) {
        message = "Email ou senha incorretos";
      } else if (error.message?.includes("User already registered")) {
        message = "Este email já está cadastrado";
      } else if (error.message?.includes("Password should be at least")) {
        message = "A senha deve ter pelo menos 6 caracteres";
      }

      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      document: "",
      phone: "",
    });
  };

  return {
    formData,
    handleInputChange,
    handleSubmit,
    isLoading,
    isSignUp,
    toggleMode,
  };
}
