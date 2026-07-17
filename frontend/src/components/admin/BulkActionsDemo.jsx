import React, { useState } from 'react';
import BulkActions from './BulkActions';
import { Search } from 'lucide-react';

const mockData = [
  { id: 1, name: 'React', category: 'Frontend', status: 'Active' },
  { id: 2, name: 'Node.js', category: 'Backend', status: 'Active' },
  { id: 3, name: 'MongoDB', category: 'Database', status: 'Inactive' },
  { id: 4, name: 'Tailwind CSS', category: 'Design', status: 'Active' },
  { id: 5, name: 'Vite', category: 'Build Tool', status: 'Active' }
];

const BulkActionsDemo = () => {
  const [items, setItems] = useState(mockData);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Toggle single item selection
  const toggleSelection = (id) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(item => item.id)));
    }
  };

  // Handle bulk actions
  const handleBulkAction = (actionType) => {
    const count = selectedIds.size;
    
    switch (actionType) {
      case 'delete':
        if (confirm(`Are you sure you want to delete ${count} items?`)) {
          setItems(items.filter(item => !selectedIds.has(item.id)));
          setSelectedIds(new Set());
        }
        break;
      case 'archive':
        alert(`Archived ${count} items`);
        setSelectedIds(new Set());
        break;
      case 'publish':
        alert(`Published ${count} items`);
        setSelectedIds(new Set());
        break;
      case 'export':
        alert(`Exported ${count} items to CSV`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Technologies</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage your tech stack.</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
            <tr>
              <th className="p-4 w-12">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 dark:border-slate-600 text-purple-600 focus:ring-purple-500 bg-transparent"
                  checked={items.length > 0 && selectedIds.size === items.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Name</th>
              <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Category</th>
              <th className="p-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
            {items.map(item => (
              <tr 
                key={item.id} 
                className={`transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/50 ${
                  selectedIds.has(item.id) ? 'bg-purple-50/50 dark:bg-purple-900/20' : ''
                }`}
              >
                <td className="p-4">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 dark:border-slate-600 text-purple-600 focus:ring-purple-500 bg-transparent"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelection(item.id)}
                  />
                </td>
                <td className="p-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                <td className="p-4 text-gray-500 dark:text-gray-400">{item.category}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    item.status === 'Active' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Bulk Actions Toolbar */}
      <BulkActions 
        selectedCount={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onAction={handleBulkAction}
      />
    </div>
  );
};

export default BulkActionsDemo;
