import { PackageOpen } from 'lucide-react';

export default function EmptyState({ icon: Icon = PackageOpen, title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={36} />
      </div>
      <h3>{title || 'No data yet'}</h3>
      <p>{message || 'Data will appear here once available.'}</p>
      {action && action}
    </div>
  );
}
