import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface EngineerNote {
  id: string;
  user_id: string;
  title: string;
  notes: string;
  tag?: string;
  created_at: string;
  updated_at: string;
}

export function useEngineerNotes() {
  const [notes, setNotes] = useState<EngineerNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const { toast } = useToast();

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('copilot_engineer_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedTag) {
        query = query.eq('tag', selectedTag);
      }

      const { data, error } = await query;

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar as notas técnicas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNote = async (noteData: Omit<EngineerNote, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('copilot_engineer_notes')
        .insert([{
          ...noteData,
          user_id: userData.user.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Nota técnica criada com sucesso",
      });

      await fetchNotes();
      return data;
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar a nota técnica",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateNote = async (id: string, noteData: Partial<EngineerNote>) => {
    try {
      const { error } = await supabase
        .from('copilot_engineer_notes')
        .update(noteData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Nota técnica atualizada com sucesso",
      });

      await fetchNotes();
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar a nota técnica",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('copilot_engineer_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Nota técnica removida com sucesso",
      });

      await fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover a nota técnica",
        variant: "destructive",
      });
      throw error;
    }
  };

  const duplicateNote = async (note: EngineerNote) => {
    try {
      await createNote({
        title: `${note.title} (Cópia)`,
        notes: note.notes,
        tag: note.tag
      });
    } catch (error) {
      console.error('Error duplicating note:', error);
    }
  };

  const generateSummary = async (noteContent: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('engineer-notes-summary', {
        body: { notes: noteContent }
      });

      if (error) throw error;
      return data.summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Erro",
        description: "Falha ao gerar resumo técnico",
        variant: "destructive",
      });
      throw error;
    }
  };

  const exportToMarkdown = () => {
    const markdown = notes.map(note => 
      `# ${note.title}\n\n**Tag:** ${note.tag || 'Sem tag'}\n**Data:** ${new Date(note.created_at).toLocaleDateString('pt-BR')}\n\n${note.notes}\n\n---\n\n`
    ).join('');
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `engineering-notes-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getUniqueTags = () => {
    const tags = notes.map(note => note.tag).filter(Boolean) as string[];
    return [...new Set(tags)];
  };

  useEffect(() => {
    fetchNotes();
  }, [selectedTag]);

  return {
    notes,
    isLoading,
    selectedTag,
    setSelectedTag,
    createNote,
    updateNote,
    deleteNote,
    duplicateNote,
    generateSummary,
    exportToMarkdown,
    getUniqueTags,
    refreshNotes: fetchNotes
  };
}