import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';

export const AddPaperConfig: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    configName: '',
    step: 1,
    formulaList: 'add,sub',
    resultMinValue: 0,
    resultMaxValue: 100,
    numberOfFormulas: 10,
    whereIsResult: 0,
    enableBrackets: false,
    carry: 1,
    abdication: 1,
    remainder: 1,
    solution: 0,
    numberMode: 'integer',
    decimalPlaces: 2,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!id) return;

    try {
      await api.parents.addPaperConfig(id, formData);
      navigate(`/children/${id}/configs`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button onClick={() => navigate(`/children/${id}/configs`)} className="text-blue-500 hover:text-blue-700">
            ← 返回
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">添加试卷配置</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">配置名称</label>
            <input
              type="text"
              value={formData.configName}
              onChange={(e) => setFormData({ ...formData, configName: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">步数</label>
            <input
              type="number"
              value={formData.step}
              onChange={(e) => setFormData({ ...formData, step: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="3"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">题目数</label>
            <input
              type="number"
              value={formData.numberOfFormulas}
              onChange={(e) => setFormData({ ...formData, numberOfFormulas: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="100"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">结果最小值</label>
              <input
                type="number"
                value={formData.resultMinValue}
                onChange={(e) => setFormData({ ...formData, resultMinValue: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">结果最大值</label>
              <input
                type="number"
                value={formData.resultMaxValue}
                onChange={(e) => setFormData({ ...formData, resultMaxValue: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">运算模式</label>
              <select
                value={formData.numberMode}
                onChange={(e) => setFormData({ ...formData, numberMode: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="integer">整数模式</option>
                <option value="decimal">小数模式</option>
              </select>
            </div>
            {formData.numberMode === 'decimal' && (
              <div>
                <label className="block text-gray-700 mb-2">小数位数</label>
                <select
                  value={formData.decimalPlaces}
                  onChange={(e) => setFormData({ ...formData, decimalPlaces: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 位</option>
                  <option value={2}>2 位</option>
                  <option value={3}>3 位</option>
                </select>
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">运算类型</label>
            <select
              value={formData.formulaList}
              onChange={(e) => setFormData({ ...formData, formulaList: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="add">加法</option>
              <option value="sub">减法</option>
              <option value="add,sub">加减混合</option>
              <option value="mul">乘法</option>
              <option value="div">除法</option>
              <option value="mul,div">乘除混合</option>
              <option value="add,sub,mul,div">四则运算</option>
            </select>
          </div>
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.enableBrackets}
                onChange={(e) => setFormData({ ...formData, enableBrackets: e.target.checked })}
                className="mr-2"
              />
              <span className="text-gray-700">启用括号</span>
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? '添加中...' : '添加配置'}
          </button>
        </form>
      </div>
    </div>
  );
};
