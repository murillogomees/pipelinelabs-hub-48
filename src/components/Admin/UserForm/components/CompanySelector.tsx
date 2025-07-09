import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Company } from '../types';

interface CompanySelectorProps {
  value: string;
  onChange: (value: string) => void;
  companies: Company[];
  disabled?: boolean;
  isRequired?: boolean;
}

export function CompanySelector({ 
  value, 
  onChange, 
  companies, 
  disabled = false, 
  isRequired = false 
}: CompanySelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="company_id">
        Empresa {isRequired && <span className="text-red-500">*</span>}
      </Label>
      <Select 
        value={value} 
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione a empresa" />
        </SelectTrigger>
        <SelectContent>
          {companies.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}