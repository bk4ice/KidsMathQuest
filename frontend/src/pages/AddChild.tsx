import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { config } from '../config';

export const AddChild: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    grade: 1,
    password: '',
    avatarUrl: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // 自动上传头像
      handleAvatarUpload(file);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('avatar', file);

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/upload/avatar`, {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          throw new Error(data.error?.message || 'Upload failed');
        } catch {
          throw new Error('Upload failed');
        }
      }

      const data = await response.json();
      // 存储时仅保存相对路径，例如 /uploads/xxx.png
      const relativeUrl = data.data.url;
      setFormData(prev => ({ ...prev, avatarUrl: relativeUrl }));
      // 预览时需要加上 API 地址
      setPreviewUrl(`${config.API_BASE_URL}${relativeUrl}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 如果 avatarUrl 为空，则不发送该字段
    const submitData = formData.avatarUrl 
      ? formData 
      : { name: formData.name, grade: formData.grade, password: formData.password };

    console.log('Submitting form data:', submitData);

    try {
      await api.parents.addChild(submitData);
      navigate('/dashboard');
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
          <button onClick={() => navigate('/dashboard')} className="text-blue-500 hover:text-blue-700">
            ← 返回
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">添加孩子</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">头像</label>
            <div className="flex items-center gap-4">
              {previewUrl || formData.avatarUrl ? (
                <img
                  src={previewUrl || formData.avatarUrl}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">无</span>
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="mb-2"
                />
                {uploading && <p className="text-sm text-gray-500">上传中...</p>}
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">姓名</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">年级</label>
            <select
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6].map((grade) => (
                <option key={grade} value={grade}>
                  {grade}年级
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">密码</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? '添加中...' : '添加'}
          </button>
        </form>
      </div>
    </div>
  );
};
