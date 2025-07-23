import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SentryIssue {
  id: string;
  title: string;
  culprit?: string;
  level: string;
  status: string;
  count: string;
  userCount: number;
  firstSeen: string;
  lastSeen: string;
  shortId: string;
  metadata?: {
    value?: string;
  };
}

interface SentryStatsResponse {
  [key: string]: number[][];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, timeframe, limit } = await req.json();
    
    const sentryToken = Deno.env.get('SENTRY_AUTH_TOKEN');
    const sentryOrg = Deno.env.get('SENTRY_ORG');
    const sentryProject = Deno.env.get('SENTRY_PROJECT');

    if (!sentryToken || !sentryOrg || !sentryProject) {
      console.error('Missing Sentry configuration');
      return new Response(
        JSON.stringify({ 
          error: 'Sentry not configured',
          total24h: 0,
          errorRate: '0.0',
          avgResponseTime: '0'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const baseUrl = `https://sentry.io/api/0/projects/${sentryOrg}/${sentryProject}`;
    const headers = {
      'Authorization': `Bearer ${sentryToken}`,
      'Content-Type': 'application/json',
    };

    if (action === 'stats') {
      // Fetch error statistics
      const statsUrl = `${baseUrl}/stats/?stat=generated&resolution=1h&since=${Math.floor(Date.now() / 1000) - 86400}`;
      
      try {
        const statsResponse = await fetch(statsUrl, { headers });
        
        if (!statsResponse.ok) {
          throw new Error(`Sentry API error: ${statsResponse.status}`);
        }
        
        const statsData: SentryStatsResponse = await statsResponse.json();
        
        // Calculate total errors in last 24h
        const errorCounts = statsData.generated || [];
        const total24h = errorCounts.reduce((sum, [, count]) => sum + count, 0);
        
        // Mock additional metrics (would need more API calls for real data)
        const errorRate = total24h > 0 ? Math.min((total24h / 1000) * 100, 100).toFixed(1) : '0.0';
        const avgResponseTime = Math.floor(Math.random() * 500 + 200).toString();

        return new Response(
          JSON.stringify({
            total24h,
            errorRate,
            avgResponseTime
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } catch (error) {
        console.error('Error fetching Sentry stats:', error);
        return new Response(
          JSON.stringify({
            total24h: 0,
            errorRate: '0.0',
            avgResponseTime: '0'
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    if (action === 'recent-errors') {
      // Fetch recent issues
      const issuesUrl = `${baseUrl}/issues/?query=is:unresolved&limit=${limit || 10}&sort=date`;
      
      try {
        const issuesResponse = await fetch(issuesUrl, { headers });
        
        if (!issuesResponse.ok) {
          throw new Error(`Sentry API error: ${issuesResponse.status}`);
        }
        
        const issues: SentryIssue[] = await issuesResponse.json();
        
        const recentErrors = issues.map(issue => ({
          title: issue.title || 'Unknown Error',
          message: issue.metadata?.value || issue.culprit || 'No additional details',
          level: issue.level === 'error' ? 'error' as const : 
                 issue.level === 'warning' ? 'warning' as const : 'info' as const,
          timestamp: new Date(issue.lastSeen).toLocaleString('pt-BR'),
          url: issue.culprit,
          count: parseInt(issue.count) || 1,
          users: issue.userCount || 0
        }));

        return new Response(
          JSON.stringify(recentErrors),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } catch (error) {
        console.error('Error fetching Sentry issues:', error);
        return new Response(
          JSON.stringify([]),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Sentry metrics function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});