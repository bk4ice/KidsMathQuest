import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { config } from '../config';

export const EditChild: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    name: '',
    grade: 1,
    avatarUrl: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingChild, setLoadingChild] = useState(true);

  useEffect(() => {
    if (id) {
      loadChild();
    }
  }, [id]);

  const loadChild = async () => {
    try {
      const response = await api.parents.getChildren();
      const child = response.data.find((c: any) => c.id === id);
      if (child) {
        setFormData({
          name: child.name,
          grade: child.grade,
          avatarUrl: child.avatarUrl || '',
        });
        if (child.avatarUrl) {
          setPreviewUrl(child.avatarUrl.startsWith('http') ? child.avatarUrl : `${config.API_BASE_URL}${child.avatarUrl}`);
        }
      }
    } catch (err: any) {
      setError(err.message || '加载孩子信息失败');
    } finally {
      setLoadingChild(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      handleAvatarUpload(file);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    console.log('handleAvatarUpload called, file:', file.name);
    if (!file) return;

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('avatar', file);

    console.log('Uploading avatar file:', file.name);

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/upload/avatar`, {
        method: 'POST',
        body: uploadFormData,
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const text = await response.text();
        console.error('Upload failed:', text);
        try {
          const data = JSON.parse(text);
          throw new Error(data.error?.message || 'Upload failed');
        } catch {
          throw new Error('Upload failed');
        }
      }

      const data = await response.json();
      console.log('Upload success, data:', data);
      // 存储时仅保存相对路径，例如 /uploads/xxx.png
      const relativeUrl = data.data.url;
      console.log('Setting avatarUrl to:', relativeUrl);
      setFormData(prev => ({ ...prev, avatarUrl: relativeUrl }));
      // 预览时需要加上 API 地址
      setPreviewUrl(`${config.API_BASE_URL}${relativeUrl}`);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const submitData: any = {
      name: formData.name,
      grade: formData.grade,
    };

    if (formData.avatarUrl) {
      submitData.avatarUrl = formData.avatarUrl;
    }

    console.log('Updating child with data:', submitData);

    try {
      await api.parents.updateChild(id!, submitData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingChild) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>;
  }

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
        <h1 className="text-2xl font-bold mb-6">编辑孩子</h1>
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
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">年级</label>
            <select
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            >
              {[1, 2, 3, 4, 5, 6].map((grade) => (
                <option key={grade} value={grade}>
                  {grade}年级
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '保存中...' : '保存'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
