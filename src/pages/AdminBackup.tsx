
import React from 'react';
import { SuperAdminGuard } from '@/components/PermissionGuard';
import { BackupSettings } from '@/components/Admin/BackupSettings';

export default function AdminBackup() {
  return (
    <SuperAdminGuard>
      <div className="container mx-auto py-6">
        <BackupSettings />
      </div>
    </SuperAdminGuard>
  );
}
