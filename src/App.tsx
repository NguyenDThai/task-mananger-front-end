// import { useSelector } from "react-redux";
// import type { RootState } from "./redux/store";
// import type { ISChatUser } from "./types";

// const useApp = () => {
//   const chat = useSelector((state: RootState) => state.chat.instance);

//   const initAppChat = async () => {
//     if (chat) {
//       try {
//         const receiver1 = await chat.setReceiver({ code: "69d7143337e6fda26cd161fd", name: 'Nguyen Duc Thai' });
//         console.log("Người nhận đã được thiết lập:", receiver1);
//         // const receiver2 = await chat.setReceiver({ code: 'ct100', name: 'Nguyen Van A' });
//         // console.log("Người nhận đã được thiết lập:", receiver2);

//         await testConnection();
//         await testChatOneToOne(receiver1);
//         // if (receiver1.id && receiver2.id) {
//         //   await testChatGroup(receiver1.id, receiver2.id);
//         // }

//         // await chat.removeChat(53);

//         // await chat.clearReceiver();
//         // await chat.clearAuth();
//         // console.log("Đã xóa thông tin xác thực và người nhận. ");
//       } catch (error) {
//         console.error("Lỗi khởi tạo chat:", error);
//       }
//     }
//   };

//   const testConnection = async () => {
//     if (!chat) return;

//     console.log("Đang kiểm tra chat instance...");

//     const me = await chat.getAuth();
//     console.log("User hiện tại từ getAuth:", me);

//     const members = await chat.getMembers();
//     console.log("Danh sách thành viên:", members);

//     const chats = await chat.getChats(10, 1);
//     console.log("Danh sách cuộc trò chuyện:", chats);
//   };

//   const testChatOneToOne = async (receiver: ISChatUser) => {
//     if (!chat || !receiver.id) return;

//     const existingChat = await chat.findChatByReceiver(receiver.id);
//     if (existingChat) {
//       console.log("Đã tìm thấy cuộc trò chuyện hiện có với người nhận:", existingChat);
//       const messages = await chat.getMessages(existingChat.id, 10, 1);
//       console.log("Danh sách tin nhắn trong cuộc trò chuyện:", messages);
//       // await chat.removeChat(existingChat.id);
//       // console.log("Đã xóa cuộc trò chuyện hiện có:");
//       // if (messages.data.length > 0) {
//       //   console.log('Các tham số để xóa tin nhắn:', {
//       //     chatId: existingChat.id,
//       //     messageId: messages.data[0].id,
//       //     action: "revoke"
//       //   });
//       //   const removeStatus = await chat.actionMessage(existingChat.id, messages.data[0].id, "remove");
//       //   console.log("Kết quả xóa tin nhắn:", removeStatus);
//       // }
//       // const newMessage = await chat.addMessage(existingChat.id, "Đây là tin nhắn mới sau khi tìm thấy cuộc trò chuyện cũ.");
//       // console.log("Tin nhắn mới đã được gửi trong cuộc trò chuyện hiện có:", newMessage);

//     } else {
//       console.log("Không tìm thấy cuộc trò chuyện hiện có. Đang tạo mới...");
//       const chat1 = await chat.addChat(receiver.id, "Xin chào! Đây là tin nhắn đầu tiên.");
//       console.log("Cuộc trò chuyện đã được tạo hoặc lấy:", chat1);
//     }
//   };

//   const testChatGroup = async (...receiversIds: number[]) => {
//     if (!chat || receiversIds.length < 2) return;
//     console.log("Đang tạo nhóm với các người nhận có ID:", receiversIds);

//     const group = await chat.addGroup(receiversIds, 'Nhóm test');
//     console.log("Nhóm đã được tạo:", group);
//   };

//   return {
//     initAppChat: async () => {
//       setTimeout(() => {
//         initAppChat();
//       }, 500);
//     },
//   };
// };

const useApp = () => {
  return {
    initAppChat: async () => {
      setTimeout(() => {
        console.warn(
          'Đây là hàm initAppChat được gọi sau khi người dùng đã đăng nhập thành công. Bạn có thể thực hiện các thao tác khởi tạo chat ở đây.',
        );
      }, 500);
    },
  };
};

export default useApp;
