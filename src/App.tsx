import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnalyticsProvider } from './components/Analytics/AnalyticsProvider';
import { AuthProvider } from './components/Auth/AuthProvider';
import { PrivateRoute } from './components/Auth/PrivateRoute';
import { MainLayout } from './components/Layout/MainLayout';
import { ErrorBoundary } from 'react-error-boundary';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Pricing from './pages/Pricing';
import Configuracoes from './pages/Configuracoes';
import AdminDashboard from './pages/AdminDashboard';
import AdminPromptGenerator from './pages/AdminPromptGenerator';
import AdminUsers from './pages/AdminUsers';
import AdminCompanies from './pages/AdminCompanies';
import AdminAuditLogs from './pages/AdminAuditLogs';
import AdminAccessLevels from './pages/AdminAccessLevels';
import AdminPlans from './pages/AdminPlans';
import AdminInvoices from './pages/AdminInvoices';
import AdminSubscriptions from './pages/AdminSubscriptions';
import AdminIntegrations from './pages/AdminIntegrations';
import AdminApiKeys from './pages/AdminApiKeys';
import AdminSettings from './pages/AdminSettings';
import AdminNotifications from './pages/AdminNotifications';
import AdminBackups from './pages/AdminBackups';
import AdminSystem from './pages/AdminSystem';
import AdminSecurity from './pages/AdminSecurity';
import AdminSupport from './pages/AdminSupport';
import AdminBilling from './pages/AdminBilling';
import AdminAppearance from './pages/AdminAppearance';
import AdminPerformance from './pages/AdminPerformance';
import AdminDevTools from './pages/AdminDevTools';
import AdminPromptTemplates from './pages/AdminPromptTemplates';
import AdminDocuments from './pages/AdminDocuments';
import AdminWorkflows from './pages/AdminWorkflows';
import AdminReports from './pages/AdminReports';
import AdminMarketplace from './pages/AdminMarketplace';
import AdminContent from './pages/AdminContent';
import AdminAi from './pages/AdminAi';
import AdminExperiments from './pages/AdminExperiments';
import AdminMobile from './pages/AdminMobile';
import AdminI18n from './pages/AdminI18n';
import AdminDev from './pages/AdminDev';
import AdminPrompt from './pages/AdminPrompt';
import AdminPromptEditor from './pages/AdminPromptEditor';
import AdminPromptLibrary from './pages/AdminPromptLibrary';
import AdminPromptExamples from './pages/AdminPromptExamples';
import AdminPromptSandbox from './pages/AdminPromptSandbox';
import AdminPromptWorkflows from './pages/AdminPromptWorkflows';
import AdminPromptComponents from './pages/AdminPromptComponents';
import AdminPromptSnippets from './pages/AdminPromptSnippets';
import AdminPromptBlueprints from './pages/AdminPromptBlueprints';
import AdminPromptTemplatesNew from './pages/AdminPromptTemplatesNew';
import AdminPromptTemplatesEdit from './pages/AdminPromptTemplatesEdit';
import AdminPromptTemplatesView from './pages/AdminPromptTemplatesView';
import AdminPromptTemplatesList from './pages/AdminPromptTemplatesList';
import AdminPromptTemplatesCategories from './pages/AdminPromptTemplatesCategories';
import AdminPromptTemplatesTags from './pages/AdminPromptTemplatesTags';
import AdminPromptTemplatesAuthors from './pages/AdminPromptTemplatesAuthors';
import AdminPromptTemplatesCollections from './pages/AdminPromptTemplatesCollections';
import AdminPromptTemplatesPricing from './pages/AdminPromptTemplatesPricing';
import AdminPromptTemplatesReviews from './pages/AdminPromptTemplatesReviews';
import AdminPromptTemplatesAnalytics from './pages/AdminPromptTemplatesAnalytics';
import AdminPromptTemplatesSettings from './pages/AdminPromptTemplatesSettings';
import AdminPromptTemplatesIntegrations from './pages/AdminPromptTemplatesIntegrations';
import AdminPromptTemplatesApi from './pages/AdminPromptTemplatesApi';
import AdminPromptTemplatesWebhooks from './pages/AdminPromptTemplatesWebhooks';
import AdminPromptTemplatesMobile from './pages/AdminPromptTemplatesMobile';
import AdminPromptTemplatesI18n from './pages/AdminPromptTemplatesI18n';
import AdminPromptTemplatesDev from './pages/AdminPromptTemplatesDev';
import AdminPromptTemplatesPrompt from './pages/AdminPromptTemplatesPrompt';
import AdminPromptTemplatesPromptEditor from './pages/AdminPromptTemplatesPromptEditor';
import AdminPromptTemplatesPromptLibrary from './pages/AdminPromptTemplatesPromptLibrary';
import AdminPromptTemplatesPromptExamples from './pages/AdminPromptTemplatesPromptExamples';
import AdminPromptTemplatesPromptSandbox from './pages/AdminPromptTemplatesPromptSandbox';
import AdminPromptTemplatesPromptWorkflows from './pages/AdminPromptTemplatesPromptWorkflows';
import AdminPromptTemplatesPromptComponents from './pages/AdminPromptTemplatesPromptComponents';
import AdminPromptTemplatesPromptSnippets from './pages/AdminPromptTemplatesPromptSnippets';
import AdminPromptTemplatesPromptBlueprints from './pages/AdminPromptTemplatesPromptBlueprints';
import AdminAuditoria from './pages/AdminAuditoria';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <AnalyticsProvider>
              <Suspense fallback={<div>Carregando...</div>}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/sign-up" element={<SignUp />} />
                  <Route path="/pricing" element={<Pricing />} />
                  
                  <Route path="/app" element={<PrivateRoute />}>
                    <Route element={<MainLayout />}>
                      <Route path="configuracoes" element={<Configuracoes />} />
                      <Route path="admin/dashboard" element={<AdminDashboard />} />
                      <Route path="admin/prompt-generator" element={<AdminPromptGenerator />} />
                      <Route path="admin/users" element={<AdminUsers />} />
                      <Route path="admin/companies" element={<AdminCompanies />} />
                      <Route path="admin/audit-logs" element={<AdminAuditLogs />} />
                      <Route path="admin/access-levels" element={<AdminAccessLevels />} />
                      <Route path="admin/plans" element={<AdminPlans />} />
                      <Route path="admin/invoices" element={<AdminInvoices />} />
                      <Route path="admin/subscriptions" element={<AdminSubscriptions />} />
                      <Route path="admin/integrations" element={<AdminIntegrations />} />
                      <Route path="admin/api-keys" element={<AdminApiKeys />} />
                      <Route path="admin/settings" element={<AdminSettings />} />
                      <Route path="admin/notifications" element={<AdminNotifications />} />
                      <Route path="admin/backups" element={<AdminBackups />} />
                      <Route path="admin/system" element={<AdminSystem />} />
                      <Route path="admin/security" element={<AdminSecurity />} />
                      <Route path="admin/support" element={<AdminSupport />} />
                      <Route path="admin/billing" element={<AdminBilling />} />
                      <Route path="admin/appearance" element={<AdminAppearance />} />
                      <Route path="admin/performance" element={<AdminPerformance />} />
                      <Route path="admin/dev-tools" element={<AdminDevTools />} />
                      <Route path="admin/prompt-templates" element={<AdminPromptTemplates />} />
                      <Route path="admin/documents" element={<AdminDocuments />} />
                      <Route path="admin/workflows" element={<AdminWorkflows />} />
                      <Route path="admin/reports" element={<AdminReports />} />
                      <Route path="admin/marketplace" element={<AdminMarketplace />} />
                      <Route path="admin/content" element={<AdminContent />} />
                      <Route path="admin/ai" element={<AdminAi />} />
                      <Route path="admin/experiments" element={<AdminExperiments />} />
                      <Route path="admin/mobile" element={<AdminMobile />} />
                      <Route path="admin/i18n" element={<AdminI18n />} />
                      <Route path="admin/dev" element={<AdminDev />} />
                      <Route path="admin/prompt" element={<AdminPrompt />} />
                      <Route path="admin/prompt-editor" element={<AdminPromptEditor />} />
                      <Route path="admin/prompt-library" element={<AdminPromptLibrary />} />
                      <Route path="admin/prompt-examples" element={<AdminPromptExamples />} />
                      <Route path="admin/prompt-sandbox" element={<AdminPromptSandbox />} />
                      <Route path="admin/prompt-workflows" element={<AdminPromptWorkflows />} />
                      <Route path="admin/prompt-components" element={<AdminPromptComponents />} />
                      <Route path="admin/prompt-snippets" element={<AdminPromptSnippets />} />
                      <Route path="admin/prompt-blueprints" element={<AdminPromptBlueprints />} />
                      <Route path="admin/prompt-templates/new" element={<AdminPromptTemplatesNew />} />
                      <Route path="admin/prompt-templates/edit/:id" element={<AdminPromptTemplatesEdit />} />
                      <Route path="admin/prompt-templates/view/:id" element={<AdminPromptTemplatesView />} />
                      <Route path="admin/prompt-templates/list" element={<AdminPromptTemplatesList />} />
                      <Route path="admin/prompt-templates/categories" element={<AdminPromptTemplatesCategories />} />
                      <Route path="admin/prompt-templates/tags" element={<AdminPromptTemplatesTags />} />
                      <Route path="admin/prompt-templates/authors" element={<AdminPromptTemplatesAuthors />} />
                      <Route path="admin/prompt-templates/collections" element={<AdminPromptTemplatesCollections />} />
                      <Route path="admin/prompt-templates/pricing" element={<AdminPromptTemplatesPricing />} />
                      <Route path="admin/prompt-templates/reviews" element={<AdminPromptTemplatesReviews />} />
                      <Route path="admin/prompt-templates/analytics" element={<AdminPromptTemplatesAnalytics />} />
                      <Route path="admin/prompt-templates/settings" element={<AdminPromptTemplatesSettings />} />
                      <Route path="admin/prompt-templates/integrations" element={<AdminPromptTemplatesIntegrations />} />
                      <Route path="admin/prompt-templates/api" element={<AdminPromptTemplatesApi />} />
                      <Route path="admin/prompt-templates/webhooks" element={<AdminPromptTemplatesWebhooks />} />
                      <Route path="admin/prompt-templates/mobile" element={<AdminPromptTemplatesMobile />} />
                      <Route path="admin/prompt-templates/i18n" element={<AdminPromptTemplatesI18n />} />
                      <Route path="admin/prompt-templates/dev" element={<AdminPromptTemplatesDev />} />
                      <Route path="admin/prompt-templates/prompt" element={<AdminPromptTemplatesPrompt />} />
                      <Route path="admin/prompt-templates/prompt-editor" element={<AdminPromptTemplatesPromptEditor />} />
                      <Route path="admin/prompt-templates/prompt-library" element={<AdminPromptTemplatesPromptLibrary />} />
                      <Route path="admin/prompt-templates/prompt-examples" element={<AdminPromptTemplatesPromptExamples />} />
                      <Route path="admin/prompt-templates/prompt-sandbox" element={<AdminPromptTemplatesPromptSandbox />} />
                      <Route path="admin/prompt-templates/prompt-workflows" element={<AdminPromptTemplatesPromptWorkflows />} />
                      <Route path="admin/prompt-templates/prompt-components" element={<AdminPromptTemplatesPromptComponents />} />
                      <Route path="admin/prompt-templates/prompt-snippets" element={<AdminPromptTemplatesPromptSnippets />} />
                      <Route path="admin/prompt-templates/prompt-blueprints" element={<AdminPromptTemplatesPromptBlueprints />} />
                      <Route path="admin/auditoria" element={<AdminAuditoria />} />
                    </Route>
                  </Route>
                </Routes>
              </Suspense>
            </AnalyticsProvider>
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
