import { useState, useRef, useEffect } from 'react';
import type { User } from '../../types';
import { useUpdateAvatarMutation } from '../../redux/api/userApi';

interface AvatarAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  imageSource: string;
}

const AvatarAdjustmentModal = ({
  isOpen,
  onClose,
  user,
  imageSource,
}: AvatarAdjustmentModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [updateAvatar, { isLoading }] = useUpdateAvatarMutation();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isCircleCrop, setIsCircleCrop] = useState(true);

  // Draw image on canvas with transformations
  useEffect(() => {
    if (!canvasRef.current || !imgRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imgRef.current;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Move to center
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply zoom and position
    const scaledWidth = img.width * zoom;
    const scaledHeight = img.height * zoom;

    ctx.drawImage(
      img,
      x - scaledWidth / 2,
      y - scaledHeight / 2,
      scaledWidth,
      scaledHeight,
    );

    // Restore context state
    ctx.restore();

    // Draw circle guide if circle crop is enabled
    if (isCircleCrop) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 5;

      // Draw semi-transparent overlay outside circle
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill('evenodd');

      // Draw circle border
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [zoom, rotation, x, y, imageSource, isCircleCrop]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - x,
      y: e.clientY - y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    setX(e.clientX - dragStart.x);
    setY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = async () => {
    if (!canvasRef.current || !user?._id) return;

    try {
      const canvas = canvasRef.current;
      let finalCanvas: HTMLCanvasElement;

      // If circle crop is enabled, create a circular crop
      if (isCircleCrop) {
        finalCanvas = document.createElement('canvas');
        const size = Math.min(canvas.width, canvas.height);
        finalCanvas.width = size;
        finalCanvas.height = size;

        const ctx = finalCanvas.getContext('2d');
        if (!ctx) return;

        // Draw circular clip
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();

        // Draw the canvas content centered
        const offset = (canvas.width - size) / 2;
        ctx.drawImage(canvas, offset, offset, size, size, 0, 0, size, size);
      } else {
        finalCanvas = canvas;
      }

      finalCanvas.toBlob(async (blob) => {
        if (!blob || !user._id) return;

        const formData = new FormData();
        formData.append('avatar', blob, 'avatar.png');

        await updateAvatar({
          userId: user._id,
          file: formData,
        }).unwrap();

        clearData();
        onClose();
      }, 'image/png');
    } catch (error) {
      console.error('Failed to save avatar:', error);
    }
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setX(0);
    setY(0);
  };

  const clearData = () => {
    handleReset();
  };

  const handleClose = () => {
    clearData();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Điều chỉnh ảnh đại diện
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Canvas Area */}
        <div className="mb-8">
          <p className="text-sm text-gray-600 mb-3">
            Kéo để di chuyển | Cuộn để phóng to
          </p>
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-140 h-140 bg-gray-100 rounded-2xl cursor-move border-2 border-gray-200"
          />
        </div>

        {/* Hidden image element for loading */}
        <img
          ref={imgRef}
          src={imageSource}
          alt="Avatar"
          style={{ display: 'none' }}
        />

        {/* Controls */}
        <div className="space-y-6">
          {/* Circle Crop Toggle */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
            <label className="text-sm font-semibold text-gray-700">
              Crop hình tròn
            </label>
            <button
              onClick={() => setIsCircleCrop(!isCircleCrop)}
              disabled={isLoading}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                isCircleCrop ? 'bg-blue-600' : 'bg-gray-300'
              } disabled:opacity-50`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  isCircleCrop ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Zoom Control */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phóng to: {zoom.toFixed(2)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              disabled={isLoading}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Rotation Control */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Xoay: {rotation}°
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setRotation((r) => (r - 90) % 360)}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-gray-700 disabled:opacity-50"
              >
                ↺ -90°
              </button>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={rotation}
                onChange={(e) => setRotation(parseFloat(e.target.value))}
                disabled={isLoading}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-gray-700 disabled:opacity-50"
              >
                ↻ +90°
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            🔄 Đặt lại
          </button>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            ✕ Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                Đang lưu...
              </>
            ) : (
              <>✓ Lưu ảnh</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarAdjustmentModal;
