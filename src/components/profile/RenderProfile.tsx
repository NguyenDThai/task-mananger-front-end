import type { User } from '../../types';

const RenderProfile = ({ user }: { user: User | null }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 animate-fade-in space-y-8">
      <div className="relative h-64 bg-linear-to-br from-blue-600 to-indigo-700 rounded-[3rem] shadow-2xl shadow-blue-500/20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute -bottom-16 left-12 flex items-end space-x-8">
          <div className="group relative">
            {/* Interactive Avatar Area */}
            <div className="w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl relative z-10 overflow-hidden border-4 border-white/50 transition-transform hover:scale-105 cursor-pointer">
              <div className="w-full h-full rounded-4xl bg-linear-to-br from-blue-100 to-purple-100 flex items-center justify-center text-4xl font-black text-blue-600 border-2 border-blue-500/20 active:rotate-12 transition-all">
                {user?.name?.[0].toUpperCase() || 'A'}
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs font-bold uppercase tracking-widest">
                  Edit & Drag
                </span>
              </div>
            </div>
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
              Online Status • Senior Developer
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-3 gap-8 pt-8 px-6">
        <div className="col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl space-y-8">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                👤
              </span>
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-10">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Full Name
                </label>
                <p className="text-lg font-bold text-gray-800 bg-gray-50 px-4 py-3 rounded-2xl">
                  {user?.name || 'N/A'}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Email Address
                </label>
                <p className="text-lg font-bold text-gray-800 bg-gray-50 px-4 py-3 rounded-2xl">
                  {user?.email || 'N/A'}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Phone Number
                </label>
                <p className="text-lg font-bold text-gray-800 bg-gray-50 px-4 py-3 rounded-2xl">
                  +84 987 654 321
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Total Achievements
                </label>
                <div className="flex gap-2">
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-xs font-bold">
                    Top 5%
                  </span>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold">
                    Fast Learner
                  </span>
                </div>
              </div>
            </div>
            <button className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white py-4 rounded-3xl font-black shadow-xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all">
              Update Profile Data
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Stats</h3>
            <div className="space-y-6">
              {[
                { l: 'Tasks Completed', v: '85%', c: 'bg-blue-600' },
                { l: 'Work Efficiency', v: '92%', c: 'bg-emerald-500' },
                { l: 'Team Feedback', v: '100%', c: 'bg-amber-500' },
              ].map((s) => (
                <div key={s.l} className="space-y-2">
                  <div className="flex justify-between text-xs font-black text-gray-500 uppercase tracking-widest">
                    <span>{s.l}</span>
                    <span>{s.v}</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${s.c}`}
                      style={{ width: s.v }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenderProfile;
