import React from 'react';

export const ChatbotSearchList = ({
  m,
  setCurrentChat,
  setSearchQuery,
}: any) => {
  return (
    <div
      onClick={() => {
        setCurrentChat(m);
        setSearchQuery('');
      }}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white cursor-pointer border border-transparent hover:border-slate-100 transition-all"
    >
      {m.avatar ? (
        <img
          src={m.avatar}
          alt={m.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
          {m.name.charAt(0)}
        </div>
      )}
      <div>
        <h4 className="text-sm font-semibold text-slate-800">{m.name}</h4>
        <p className="text-xs text-slate-500">{m.email}</p>
      </div>
    </div>
  );
};
