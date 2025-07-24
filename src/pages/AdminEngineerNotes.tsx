import React, { useState } from 'react';
import { SuperAdminGuard } from '@/components/PermissionGuard';
import { AdminPageLayout } from '@/components/Admin/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NoteCard } from '@/components/EngineerNotes/NoteCard';
import { NoteDialog } from '@/components/EngineerNotes/NoteDialog';
import { ReadingMode } from '@/components/EngineerNotes/ReadingMode';
import { useEngineerNotes, EngineerNote } from '@/hooks/useEngineerNotes';
import { 
  Plus, 
  Search, 
  FileDown, 
  Code2,
  AlertCircle 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function AdminEngineerNotes() {
  const { toast } = useToast();
  const {
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
    getUniqueTags
  } = useEngineerNotes();

  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [readingModeOpen, setReadingModeOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<EngineerNote | null>(null);

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.tag && note.tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateNote = () => {
    setSelectedNote(null);
    setDialogOpen(true);
  };

  const handleEditNote = (note: EngineerNote) => {
    setSelectedNote(note);
    setDialogOpen(true);
  };

  const handleViewNote = (note: EngineerNote) => {
    setSelectedNote(note);
    setReadingModeOpen(true);
  };

  const handleSaveNote = async (noteData: Omit<EngineerNote, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (selectedNote) {
      await updateNote(selectedNote.id, noteData);
    } else {
      await createNote(noteData);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta nota técnica?')) {
      await deleteNote(id);
    }
  };

  const handleDuplicateNote = async (note: EngineerNote) => {
    await duplicateNote(note);
  };

  const handleExportNote = (note: EngineerNote) => {
    const markdown = `# ${note.title}\n\n**Tag:** ${note.tag || 'Sem tag'}\n**Data:** ${new Date(note.created_at).toLocaleDateString('pt-BR')}\n\n${note.notes}`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateNoteSummary = async (note: EngineerNote) => {
    try {
      const summary = await generateSummary(note.notes);
      const updatedNotes = `${note.notes}\n\n## Resumo Técnico (GPT-4)\n\n${summary}`;
      await updateNote(note.id, { notes: updatedNotes });
      toast({
        title: "Resumo Gerado",
        description: "O resumo técnico foi adicionado à nota",
      });
    } catch (error) {
      console.error('Error generating summary for note:', error);
    }
  };

  return (
    <SuperAdminGuard>
      <AdminPageLayout
        title="Engineering Notes Copilot"
        description="Gerencie suas visões técnicas sobre a aplicação com integração GPT-4"
      >
        <div className="space-y-6">
          {/* Header com ações */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar notas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as tags</SelectItem>
                  {getUniqueTags().map(tag => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                onClick={exportToMarkdown}
                variant="outline"
                size="sm"
                disabled={notes.length === 0}
              >
                <FileDown className="w-4 h-4 mr-2" />
                Exportar Tudo
              </Button>
              
              <Button onClick={handleCreateNote}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Nota
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total de Notas</p>
                  <p className="text-2xl font-bold">{notes.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Filtradas</p>
                  <p className="text-2xl font-bold">{filteredNotes.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Tags Únicas</p>
                  <p className="text-2xl font-bold">{getUniqueTags().length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" text="Carregando notas técnicas..." />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && notes.length === 0 && (
            <div className="text-center py-12">
              <Code2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma nota técnica</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando sua primeira visão técnica sobre a aplicação
              </p>
              <Button onClick={handleCreateNote}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Nota
              </Button>
            </div>
          )}

          {/* No results */}
          {!isLoading && notes.length > 0 && filteredNotes.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nenhuma nota encontrada com os filtros aplicados.
              </AlertDescription>
            </Alert>
          )}

          {/* Notes grid */}
          {!isLoading && filteredNotes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEditNote}
                  onDuplicate={handleDuplicateNote}
                  onDelete={handleDeleteNote}
                  onView={handleViewNote}
                  onExport={handleExportNote}
                  onGenerateSummary={handleGenerateNoteSummary}
                />
              ))}
            </div>
          )}
        </div>

        {/* Dialogs */}
        <NoteDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          note={selectedNote}
          onSave={handleSaveNote}
          onGenerateSummary={generateSummary}
        />

        <ReadingMode
          note={selectedNote}
          open={readingModeOpen}
          onClose={() => setReadingModeOpen(false)}
        />
      </AdminPageLayout>
    </SuperAdminGuard>
  );
}