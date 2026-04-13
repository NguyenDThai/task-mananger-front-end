/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Link } from 'react-router-dom';

type Props = {
  type: 'login' | 'register';
  onSubmit: (data: any) => void;
};

export default function AuthForm({ type, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Vui lòng nhập đầy đủ');
      return;
    }

    if (type === 'register' && password !== confirmPassword) {
      alert('Mật khẩu không khớp');
      return;
    }

    if (type === 'register') {
      onSubmit({ name, email, password, confirmPassword });
    } else {
      onSubmit({ email, password });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6 border border-gray-100"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {type === 'login' ? 'Đăng nhập' : 'Đăng ký'}
        </h2>
        <p className="text-gray-500 text-sm">
          {type === 'login'
            ? 'Đăng nhập để tiếp tục hành trình'
            : 'Hãy tham gia cùng chúng tôi và bắt đầu cuộc phiêu lưu của bạn'}
        </p>
      </div>

      <div className="space-y-4">
        {type === 'register' && (
          <div className="relative">
            <input
              type="text"
              placeholder="Tên của bạn"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}
        <div className="relative">
          <input
            type="email"
            placeholder="Email của bạn"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="relative">
          <input
            type="password"
            placeholder="Nhập mật khẩu"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {type === 'register' && (
          <div className="relative">
            <input
              type="password"
              placeholder="Nhập lại mật khẩu"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {type === 'login' ? 'Đăng nhập' : 'Đăng ký'}
        </button>
      </div>

      <p className="text-center text-sm text-gray-500">
        {type === 'login' ? (
          <>
            Bạn không có tài khoản?{' '}
            <Link to="/register">
              <button className="text-blue-600 hover:text-blue-700 font-semibold">
                Đăng ký
              </button>
            </Link>
          </>
        ) : (
          <>
            Bạn đã có tài khoản?{' '}
            <Link to="/login">
              <button className="text-blue-600 hover:text-blue-700 font-semibold">
                Đăng nhập
              </button>
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
