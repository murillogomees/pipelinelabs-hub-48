import { PageHeader as StandardPageHeader } from "@/components/ui/page-header"

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageHeader = ({ title, description, action }: PageHeaderProps) => {
  return (
    <StandardPageHeader
      title={title}
      description={description}
      action={action}
    />
  );
};