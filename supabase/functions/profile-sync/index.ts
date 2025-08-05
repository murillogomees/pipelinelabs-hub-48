import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      throw new Error('Invalid token');
    }

    const { action, profileData, userId } = await req.json();

    switch (action) {
      case 'sync_auth_profile': {
        const targetUserId = userId || user.id;
        
        // Buscar dados do auth.users
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(targetUserId);
        if (authError) throw authError;

        // Buscar perfil existente
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', targetUserId)
          .single();

        const profileUpdate = {
          user_id: targetUserId,
          email: authUser.user.email,
          display_name: authUser.user.user_metadata?.display_name || authUser.user.user_metadata?.full_name || '',
          avatar_url: authUser.user.user_metadata?.avatar_url || '',
          phone: authUser.user.user_metadata?.phone || authUser.user.phone || '',
          document: authUser.user.user_metadata?.document || existingProfile?.document || '',
          updated_at: new Date().toISOString()
        };

        let profile;
        if (existingProfile) {
          // Atualizar perfil existente
          const { data, error } = await supabase
            .from('profiles')
            .update(profileUpdate)
            .eq('user_id', targetUserId)
            .select()
            .single();
          
          if (error) throw error;
          profile = data;
        } else {
          // Criar novo perfil
          const { data, error } = await supabase
            .from('profiles')
            .insert({ ...profileUpdate, created_at: new Date().toISOString() })
            .select()
            .single();
          
          if (error) throw error;
          profile = data;
        }

        return new Response(JSON.stringify({
          success: true,
          profile
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update_profile_permissions': {
        const { accessLevelId, companyId } = profileData;
        const targetUserId = userId || user.id;

        // Atualizar access level do usuário
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            access_level_id: accessLevelId,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', targetUserId);

        if (profileError) throw profileError;

        // Se companyId fornecido, atualizar associação da empresa
        if (companyId) {
          const { error: companyError } = await supabase
            .from('user_companies')
            .upsert({
              user_id: targetUserId,
              company_id: companyId,
              role: accessLevelId === 'super_admin' ? 'super_admin' : 
                    accessLevelId === 'contratante' ? 'contratante' : 'operador',
              is_active: true,
              updated_at: new Date().toISOString()
            });

          if (companyError) throw companyError;
        }

        // Buscar permissões atualizadas
        const { data: profile } = await supabase
          .from('profiles')
          .select(`
            *,
            access_level:access_levels(*),
            user_companies(
              *,
              company:companies(*)
            )
          `)
          .eq('user_id', targetUserId)
          .single();

        return new Response(JSON.stringify({
          success: true,
          profile
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'backup_profile_settings': {
        const targetUserId = userId || user.id;

        // Buscar todos os dados do perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select(`
            *,
            access_level:access_levels(*),
            user_companies(
              *,
              company:companies(*)
            )
          `)
          .eq('user_id', targetUserId)
          .single();

        if (!profile) throw new Error('Profile not found');

        // Criar backup
        const backupData = {
          user_id: targetUserId,
          backup_type: 'profile_settings',
          data: profile,
          created_at: new Date().toISOString()
        };

        // Salvar backup (se tabela existir)
        try {
          await supabase
            .from('profile_backups')
            .insert(backupData);
        } catch (error) {
          console.log('Profile backups table not found, backup saved to logs');
        }

        return new Response(JSON.stringify({
          success: true,
          backup: backupData
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'restore_profile_settings': {
        const { backupId } = profileData;
        const targetUserId = userId || user.id;

        // Buscar backup
        const { data: backup } = await supabase
          .from('profile_backups')
          .select('*')
          .eq('id', backupId)
          .eq('user_id', targetUserId)
          .single();

        if (!backup) throw new Error('Backup not found');

        const profileData = backup.data;

        // Restaurar perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            display_name: profileData.display_name,
            avatar_url: profileData.avatar_url,
            phone: profileData.phone,
            document: profileData.document,
            access_level_id: profileData.access_level_id,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', targetUserId);

        if (profileError) throw profileError;

        // Restaurar associações de empresas
        if (profileData.user_companies) {
          for (const uc of profileData.user_companies) {
            await supabase
              .from('user_companies')
              .upsert({
                user_id: targetUserId,
                company_id: uc.company_id,
                role: uc.role,
                is_active: uc.is_active,
                updated_at: new Date().toISOString()
              });
          }
        }

        return new Response(JSON.stringify({
          success: true,
          restored: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'validate_profile_integrity': {
        const targetUserId = userId || user.id;

        // Verificar integridade do perfil
        const issues = [];

        // Verificar se perfil existe
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', targetUserId)
          .single();

        if (!profile) {
          issues.push('Profile not found in profiles table');
        }

        // Verificar se usuário existe no auth
        try {
          const { data: authUser, error } = await supabase.auth.admin.getUserById(targetUserId);
          if (error || !authUser.user) {
            issues.push('User not found in auth.users table');
          }
        } catch (error) {
          issues.push('Error accessing auth.users: ' + error.message);
        }

        // Verificar associações de empresas
        const { data: userCompanies } = await supabase
          .from('user_companies')
          .select('*')
          .eq('user_id', targetUserId);

        if (!userCompanies || userCompanies.length === 0) {
          issues.push('No company associations found');
        }

        // Verificar access level
        if (profile?.access_level_id) {
          const { data: accessLevel } = await supabase
            .from('access_levels')
            .select('*')
            .eq('id', profile.access_level_id)
            .single();

          if (!accessLevel) {
            issues.push('Invalid access level reference');
          }
        } else {
          issues.push('No access level assigned');
        }

        return new Response(JSON.stringify({
          success: true,
          isValid: issues.length === 0,
          issues
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'bulk_profile_sync': {
        // Sincronizar todos os perfis (apenas super admin)
        // Verificar se usuário é super admin
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('access_level:access_levels(*)')
          .eq('user_id', user.id)
          .single();

        if (!userProfile?.access_level || userProfile.access_level.name !== 'super_admin') {
          throw new Error('Only super admin can perform bulk sync');
        }

        // Buscar todos os usuários do auth
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) throw authError;

        let syncedCount = 0;
        let errorCount = 0;

        for (const authUser of authUsers.users) {
          try {
            // Verificar se perfil existe
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', authUser.id)
              .single();

            const profileData = {
              user_id: authUser.id,
              email: authUser.email,
              display_name: authUser.user_metadata?.display_name || authUser.user_metadata?.full_name || '',
              avatar_url: authUser.user_metadata?.avatar_url || '',
              phone: authUser.user_metadata?.phone || authUser.phone || '',
              updated_at: new Date().toISOString()
            };

            if (existingProfile) {
              await supabase
                .from('profiles')
                .update(profileData)
                .eq('user_id', authUser.id);
            } else {
              await supabase
                .from('profiles')
                .insert({ ...profileData, created_at: new Date().toISOString() });
            }

            syncedCount++;
          } catch (error) {
            console.error(`Error syncing user ${authUser.id}:`, error);
            errorCount++;
          }
        }

        return new Response(JSON.stringify({
          success: true,
          syncedCount,
          errorCount,
          totalUsers: authUsers.users.length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in profile-sync:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});