import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import DetailPanel from '../components/DetailPanel';
import FormModal from '../components/FormModal';
import AIPanel from '../components/AIPanel';
import { getColumns, getFormFields } from '../services/featureConfig';

function FeaturePage({ feature }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [search, setSearch] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(feature.api);
      // Handle paginated response { data: [...], pagination: {...} }
      setItems(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [feature.api]);

  useEffect(() => {
    fetchItems();
    setSelected(null);
    setShowForm(false);
    setShowAI(false);
    setSearch('');
  }, [feature.key, fetchItems]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`${feature.api}/${id}`);
      toast.success('Deleted successfully');
      setSelected(null);
      fetchItems();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editItem) {
        await api.put(`${feature.api}/${editItem.id}`, formData);
        toast.success('Updated successfully');
      } else {
        await api.post(feature.api, formData);
        toast.success('Created successfully');
      }
      setShowForm(false);
      setEditItem(null);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setShowForm(true);
    setSelected(null);
  };

  const columns = getColumns(feature.key);
  const formFields = getFormFields(feature.key);

  const filteredItems = items.filter(item => {
    if (!search) return true;
    const s = search.toLowerCase();
    return Object.values(item).some(v =>
      String(v).toLowerCase().includes(s)
    );
  });

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1>{feature.icon} {feature.label}</h1>
          <p className="desc">{feature.desc}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {feature.aiAction && (
            <button className="btn btn-secondary" onClick={() => setShowAI(!showAI)}>
              ✦ AI Assistant
            </button>
          )}
          <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowForm(true); }}>
            + New Item
          </button>
        </div>
      </div>

      {showAI && feature.aiAction && (
        <AIPanel feature={feature} onClose={() => setShowAI(false)} />
      )}

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`Search ${feature.label.toLowerCase()}...`}
        />
      </div>

      {loading ? (
        <div className="ai-loading">
          <div className="dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          Loading...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">
          <div className="icon">{feature.icon}</div>
          <h3>No items yet</h3>
          <p>Click "New Item" to create your first {feature.label.toLowerCase()} entry.</p>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} onClick={() => setSelected(item)}>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(item[col.key], item) : (
                        String(item[col.key] || '').substring(0, 80) + (String(item[col.key] || '').length > 80 ? '...' : '')
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <DetailPanel
          item={selected}
          feature={feature}
          onClose={() => setSelected(null)}
          onEdit={() => handleEdit(selected)}
          onDelete={() => handleDelete(selected.id)}
        />
      )}

      {showForm && (
        <FormModal
          fields={formFields}
          item={editItem}
          title={editItem ? `Edit ${feature.label}` : `New ${feature.label}`}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditItem(null); }}
        />
      )}
    </div>
  );
}

export default FeaturePage;
