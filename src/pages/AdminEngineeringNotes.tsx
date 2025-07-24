import React, { useState } from 'react';
import { AdminPageLayout } from '@/components/Admin/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Plus, Download, FileText } from 'lucide-react';
import { useEngineeringNotes, EngineeringNote } from '@/hooks/useEngineeringNotes';
import { NoteEditor } from '@/components/Admin/EngineeringNotes/NoteEditor';
import { NotesGrid } from '@/components/Admin/EngineeringNotes/NotesGrid';
import { SummaryComparison } from '@/components/Admin/EngineeringNotes/SummaryComparison';
import { ReadingMode } from '@/components/Admin/EngineeringNotes/ReadingMode';

export default function AdminEngineeringNotes() {
  const {
    notes,
    isLoading,
    summaries,
    isGeneratingSummaries,
    createNote,
    updateNote,
    deleteNote,
    duplicateNote,
    generateSummaries,
    exportAsMarkdown,
    exportAsPDF,
    clearSummaries,
  } = useEngineeringNotes();

  const [editingNote, setEditingNote] = useState<EngineeringNote | null>(null);
  const [viewingNote, setViewingNote] = useState<EngineeringNote | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const handleCreateNew = () => {
    setEditingNote(null);
    setShowEditor(true);
    clearSummaries();
  };

  const handleEdit = (note: EngineeringNote) => {
    setEditingNote(note);
    setShowEditor(true);
    setViewingNote(null);
    clearSummaries();
  };

  const handleSave = async (noteData: { title: string; notes: string; tag?: string }) => {
    if (editingNote) {
      await updateNote(editingNote.id, noteData);
    } else {
      await createNote(noteData);
    }
    setShowEditor(false);
    setEditingNote(null);
  };

  const handleCancel = () => {
    setShowEditor(false);
    setEditingNote(null);
  };

  const handleView = (note: EngineeringNote) => {
    setViewingNote(note);
    clearSummaries();
  };

  const handleCloseReading = () => {
    setViewingNote(null);
  };

  const handleGenerateSummaries = (content: string) => {
    generateSummaries(content);
  };

  const handleDuplicate = async (note: EngineeringNote) => {
    await duplicateNote(note);
  };

  const handleDelete = async (note: EngineeringNote) => {
    if (confirm('Tem certeza que deseja excluir esta visão técnica?')) {
      await deleteNote(note.id);
    }
  };

  return (
    <>
      <AdminPageLayout
        title="Engineering Insights Copilot"
        description="Escreva visões técnicas e gere resumos em múltiplos tons com IA"
      >
        <div className="space-y-6">
          {/* Ações principais */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Button
              onClick={handleCreateNew}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Visão Técnica
            </Button>
            
            {notes.length > 0 && (
              <div className="flex gap-2">
                <Button
                  onClick={exportAsMarkdown}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Exportar MD
                </Button>
                <Button
                  onClick={exportAsPDF}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar PDF
                </Button>
              </div>
            )}
          </div>

          {/* Editor */}
          {showEditor && (
            <NoteEditor
              note={editingNote}
              onSave={handleSave}
              onCancel={handleCancel}
              onGenerateSummaries={handleGenerateSummaries}
            />
          )}

          {/* Comparação de resumos */}
          {(summaries.length > 0 || isGeneratingSummaries) && (
            <SummaryComparison
              summaries={summaries}
              isGenerating={isGeneratingSummaries}
              onClose={clearSummaries}
            />
          )}

          {/* Grid de notas */}
          {!showEditor && (
            <NotesGrid
              notes={notes}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onView={handleView}
            />
          )}
        </div>
      </AdminPageLayout>

      {/* Modo leitura */}
      {viewingNote && (
        <ReadingMode
          note={viewingNote}
          onClose={handleCloseReading}
          onEdit={() => handleEdit(viewingNote)}
          onDuplicate={() => handleDuplicate(viewingNote)}
          onGenerateSummaries={() => handleGenerateSummaries(viewingNote.notes)}
        />
      )}
    </>
  );
}