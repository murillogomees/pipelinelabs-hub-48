import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EngineeringNote {
  id: string;
  title: string;
  notes: string;
  tag: string | null;
  created_at: string;
  user_id: string;
}

export interface NoteSummary {
  tone: string;
  summary: string;
}

export const useEngineeringNotes = () => {
  const [notes, setNotes] = useState<EngineeringNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summaries, setSummaries] = useState<NoteSummary[]>([]);
  const [isGeneratingSummaries, setIsGeneratingSummaries] = useState(false);
  const { toast } = useToast();

  // Fetch all notes
  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('copilot_engineer_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar notas: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create new note
  const createNote = async (noteData: { title: string; notes: string; tag?: string }) => {
    try {
      const { data, error } = await supabase
        .from('copilot_engineer_notes')
        .insert([noteData])
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => [data, ...prev]);
      toast({
        title: 'Sucesso',
        description: 'Nota criada com sucesso!',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar nota: ' + error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Update note
  const updateNote = async (id: string, noteData: { title: string; notes: string; tag?: string }) => {
    try {
      const { data, error } = await supabase
        .from('copilot_engineer_notes')
        .update(noteData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => prev.map(note => note.id === id ? data : note));
      toast({
        title: 'Sucesso',
        description: 'Nota atualizada com sucesso!',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar nota: ' + error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Delete note
  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('copilot_engineer_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Nota excluída com sucesso!',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir nota: ' + error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Duplicate note
  const duplicateNote = async (note: EngineeringNote) => {
    const noteData = {
      title: `${note.title} (Cópia)`,
      notes: note.notes,
      tag: note.tag,
    };
    return await createNote(noteData);
  };

  // Generate summaries with different tones
  const generateSummaries = async (noteContent: string) => {
    setIsGeneratingSummaries(true);
    setSummaries([]);
    
    const tones = [
      { key: 'professional', label: 'Profissional e Empático' },
      { key: 'didactic', label: 'Didático' },
      { key: 'executive', label: 'Executivo' },
      { key: 'technical', label: 'Documentação Técnica' },
    ];

    try {
      const summaryPromises = tones.map(async (tone) => {
        const { data, error } = await supabase.functions.invoke('ai-copilot', {
          body: { notes: noteContent, tone: tone.key },
        });

        if (error) throw error;

        return {
          tone: tone.label,
          summary: data.summary,
        };
      });

      const results = await Promise.all(summaryPromises);
      setSummaries(results);
      
      toast({
        title: 'Sucesso',
        description: 'Resumos gerados com sucesso!',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao gerar resumos: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingSummaries(false);
    }
  };

  // Export notes as Markdown
  const exportAsMarkdown = () => {
    const markdown = notes.map(note => {
      const date = new Date(note.created_at).toLocaleDateString('pt-BR');
      const tag = note.tag ? `**Tag:** ${note.tag}\n\n` : '';
      return `# ${note.title}\n\n${tag}**Data:** ${date}\n\n${note.notes}\n\n---\n\n`;
    }).join('');

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'engineering-notes.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export notes as PDF
  const exportAsPDF = async () => {
    try {
      // Dynamic import for client-side only
      const html2pdf = (await import('html2pdf.js')).default;
      
      const content = notes.map(note => {
        const date = new Date(note.created_at).toLocaleDateString('pt-BR');
        const tag = note.tag ? `<p><strong>Tag:</strong> ${note.tag}</p>` : '';
        return `
          <div style="margin-bottom: 40px; page-break-inside: avoid;">
            <h1 style="color: #4F46E5; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">${note.title}</h1>
            ${tag}
            <p><strong>Data:</strong> ${date}</p>
            <div style="white-space: pre-wrap; font-family: 'Inter', sans-serif; line-height: 1.6;">
              ${note.notes.replace(/\n/g, '<br>')}
            </div>
            <hr style="margin-top: 30px; border: 1px solid #e5e7eb;">
          </div>
        `;
      }).join('');

      const htmlContent = `
        <html>
          <head>
            <title>Engineering Notes</title>
            <style>
              body { font-family: 'Inter', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              h1 { color: #4F46E5; }
              .header { text-align: center; margin-bottom: 40px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Engineering Insights Copilot</h1>
              <p>Notas Técnicas Exportadas</p>
            </div>
            ${content}
          </body>
        </html>
      `;

      const opt = {
        margin: 1,
        filename: 'engineering-notes.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(htmlContent).save();
      
      toast({
        title: 'Sucesso',
        description: 'PDF exportado com sucesso!',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao exportar PDF: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return {
    notes,
    isLoading,
    summaries,
    isGeneratingSummaries,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    duplicateNote,
    generateSummaries,
    exportAsMarkdown,
    exportAsPDF,
    clearSummaries: () => setSummaries([]),
  };
};