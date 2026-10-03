import React, { useState, useEffect } from 'react';
import { Package, Plus, Minus } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingGroup, setUpdatingGroup] = useState(null);
  const { showSuccess, showError } = useToast();

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.inventory.getInventory();
      if (res.success) {
        setInventory(res.inventory);
      }
    } catch (err) {
      showError(err.message || 'Failed to load blood inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpdateUnits = async (bloodGroup, newUnits) => {
    const units = Math.max(0, parseInt(newUnits, 10));
    setUpdatingGroup(bloodGroup);
    try {
      const res = await api.inventory.updateInventory(bloodGroup, units);
      if (res.success) {
        setInventory((prev) =>
          prev.map((item) => (item.bloodGroup === bloodGroup ? { ...item, units } : item))
        );
        showSuccess(`Stock for ${bloodGroup} updated.`);
      }
    } catch (err) {
      showError(err.message || 'Failed to update stock.');
    } finally {
      setUpdatingGroup(null);
    }
  };

  const totalStock = inventory.reduce((sum, item) => sum + (item.units || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Blood Bank Center</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Hospital Blood Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage and monitor refrigerated blood units in storage across all 8 compatibility classifications
          </p>
        </div>

        <div className="inline-flex items-center space-x-3 bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-2xl">
          <Package className="w-6 h-6 text-blue-600" />
          <div>
            <div className="text-xs text-slate-500">Total Reserve</div>
            <div className="text-sm font-extrabold text-blue-700">{totalStock} Units on Hand</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-xs text-slate-400 border border-slate-200">
          Loading inventory stock...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {inventory.map((item) => {
            const isLow = item.units <= 2;
            const isUpdating = updatingGroup === item.bloodGroup;

            return (
              <div
                key={item.bloodGroup}
                className={`bg-white rounded-3xl p-6 border shadow-sm transition-all space-y-4 ${
                  isLow ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-black text-sm">
                      {item.bloodGroup}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Blood Type</h3>
                      <span className="text-[10px] text-slate-400">Class {item.bloodGroup}</span>
                    </div>
                  </div>

                  {isLow ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      Low Stock
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Adequate
                    </span>
                  )}
                </div>

                <div className="text-center py-2 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-3xl font-black text-slate-900">{item.units}</div>
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Pints Available</div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleUpdateUnits(item.bloodGroup, item.units - 1)}
                      disabled={isUpdating || item.units <= 0}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center disabled:opacity-40 transition-colors"
                      title="Deduct 1 unit"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleUpdateUnits(item.bloodGroup, item.units + 1)}
                      disabled={isUpdating}
                      className="w-8 h-8 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold flex items-center justify-center disabled:opacity-40 transition-colors"
                      title="Add 1 unit"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="number"
                    min="0"
                    value={item.units}
                    onChange={(e) => handleUpdateUnits(item.bloodGroup, e.target.value)}
                    className="w-16 px-2 py-1 rounded-lg border border-slate-300 text-center font-bold text-xs"
                    title="Directly edit unit count"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
