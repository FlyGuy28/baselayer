"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ShieldCheck, AlertCircle, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Product {
  id: string;
  product_name: string;
  barcode: string | null;
  ingredients: string;
  verification_count: number;
  is_verified: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('product_master')
      .select('*')
      .order('verification_count', { ascending: false });
    
    if (error) {
      console.error('Error loading products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const verifyProduct = async (productId: string, currentStatus: boolean) => {
    setVerifying(productId);
    const { error } = await supabase
      .from('product_master')
      .update({ is_verified: !currentStatus })
      .eq('id', productId);
    
    if (error) {
      console.error('Error verifying product:', error);
      alert('Failed to update product status');
    } else {
      loadProducts();
    }
    setVerifying(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter mb-2">ADMIN DASHBOARD</h1>
            <p className="text-slate-500 font-medium">Manage community-verified products</p>
          </div>
          <div className="flex gap-3">
            <a href="/" className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#1a1d23] rounded-full font-bold text-sm shadow-lg">
              <ArrowLeft size={18} /> Back to App
            </a>
            <button onClick={loadProducts} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-bold text-sm shadow-lg">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <RefreshCw className="mx-auto animate-spin text-blue-600 mb-4" size={48} />
            <p className="font-bold text-slate-400">Loading products...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1a1d23] rounded-4xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Barcode</th>
                    <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Verifications</th>
                    <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm">{product.product_name}</div>
                        <div className="text-xs text-slate-400 truncate max-w-md">{product.ingredients.substring(0, 100)}...</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {product.barcode || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          product.verification_count >= 3 ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' :
                          product.verification_count >= 1 ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                          'bg-slate-100 dark:bg-white/10 text-slate-400'
                        }`}>
                          {product.verification_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {product.is_verified ? (
                          <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-bold text-sm">
                            <CheckCircle size={16} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 font-bold text-sm">
                            <AlertCircle size={16} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => verifyProduct(product.id, product.is_verified)}
                          disabled={verifying === product.id}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            product.is_verified
                              ? 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          } ${verifying === product.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {verifying === product.id ? (
                            <RefreshCw className="animate-spin mx-auto" size={14} />
                          ) : product.is_verified ? (
                            'Revoke'
                          ) : (
                            'Verify'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {products.length === 0 && (
              <div className="text-center py-20">
                <ShieldCheck className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="font-bold text-slate-400">No products in database yet</p>
                <p className="text-sm text-slate-500 mt-2">Products will appear here after community submissions</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-6">
          <h3 className="font-black text-sm text-blue-600 dark:text-blue-400 mb-2">VERIFICATION RULES</h3>
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <li>• Products require 3 independent community submissions to be eligible for verification</li>
            <li>• Admins can manually verify products that meet the threshold</li>
            <li>• Verified products are trusted as accurate in the main app</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
