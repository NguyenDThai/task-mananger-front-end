import { useState } from 'react';
import type { User } from '../../types';
import { useUpdateAvatarMutation } from '../../redux/api/userApi';
import AvatarAdjustmentModal from './AvatarAdjustmentModal';

const RenderProfile = ({ user }: { user: User | null }) => {
  const [, { isLoading }] = useUpdateAvatarMutation();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [selectedImageSource, setSelectedImageSource] = useState<string>('');

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?._id) return;

    try {
      // Create a data URL for the image preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageSource = event.target?.result as string;
        setSelectedImageSource(imageSource);
        setIsAdjustmentModalOpen(true);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 animate-fade-in space-y-8">
      <div className="relative h-64 bg-linear-to-br from-blue-600 to-indigo-700 rounded-[3rem] shadow-2xl shadow-blue-500/20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-1/2 -translate-y-1/2 left-12 flex items-end space-x-8">
          <div className="group relative">
            {/* Interactive Avatar Area */}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={isLoading}
              className="hidden"
              id="avatar-input"
            />
            <label
              htmlFor="avatar-input"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl relative z-10 overflow-hidden border-4 border-white/50 transition-transform hover:scale-105 cursor-pointer flex items-center justify-center"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-4xl object-cover border-2 border-blue-500/20"
                />
              ) : (
                <div className="w-full h-full rounded-4xl bg-linear-to-br from-blue-100 to-purple-100 flex items-center justify-center text-4xl font-black text-blue-600 border-2 border-blue-500/20 active:rotate-12 transition-all">
                  {user?.name?.[0].toUpperCase() || 'A'}
                </div>
              )}
              <div
                className={`absolute inset-0 bg-black/40 ${isHovered ? 'opacity-100' : 'opacity-0'} flex items-center justify-center transition-opacity rounded-4xl`}
              >
                <span className="text-white text-xs font-bold uppercase tracking-widest">
                  📷 Change Avatar
                </span>
              </div>
            </label>
            {/* Action Buttons for Interact.js simulation */}
            <div className="absolute -right-4 top-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <button className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-blue-50 text-blue-600">
                📐
              </button>
              <button className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-blue-50 text-blue-600">
                🔄
              </button>
            </div>
          </div>
          <div className="pb-8 mb-16">
            <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-md">
              {user?.name || 'Admin'}
            </h2>
            <p className="text-blue-100 font-semibold tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Online Status • Handsome Developer
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 px-6">
        <div className="col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl space-y-8">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                👤
              </span>
              Thông tin của bạn
            </h3>
            <div className="grid grid-cols-2 gap-10">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Họ và tên
                </label>
                <p className="text-lg font-bold text-gray-800 bg-gray-50 px-4 py-3 rounded-2xl">
                  {user?.name || 'N/A'}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Địa chỉ email
                </label>
                <p className="text-lg font-bold text-gray-800 bg-gray-50 px-4 py-3 rounded-2xl">
                  {user?.email || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AvatarAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        user={user}
        imageSource={selectedImageSource}
      />
    </div>
  );
};

export default RenderProfile;
