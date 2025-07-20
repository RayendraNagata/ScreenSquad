import React from 'react';
import { getRoleDisplayName, getRoleColor } from '../utils/roleUtils';

const RoleBadge = ({ role, className = '' }) => {
  if (!role) return null;

  const displayName = getRoleDisplayName(role);
  const colorClass = getRoleColor(role);

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {displayName}
    </span>
  );
};

export default RoleBadge;
