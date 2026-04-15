// import { useEffect } from "react";
// import { useChat } from "./contexts";

// const App = () => {
//   const {chat} = useChat();
//   useEffect(() => {
//     const initAppChat = async () => {
//       if (chat) {
//         try {
//           chat.setConfig({ debugMode: true });

//           const user = await chat.setAuth({ code: '1234', name: 'Huy Tran' });
//           console.log("Auth thành công cho user:", user);

//           await testConnection();
//           await testChat();

//           // await chat.clearAuth();
//           // console.log("Đã xóa thông tin xác thực. ");
//         } catch (error) {
//           console.error("Lỗi khởi tạo chat:", error);
//         }
//       }
//     };

//     initAppChat();
//   }, [chat]);

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

//   const testChat = async () => {
//     if (!chat) return;

//     const receiver = await chat.setReceiver({ code: 'user_3', name: 'Nguyen Duc Thai' });
//     console.log("Người nhận đã được thiết lập:", receiver);

//     if (receiver.id) {
//       const existingChat = await chat.findChatByReceiver(receiver.id);
//       if (existingChat) {
//         console.log("Đã tìm thấy cuộc trò chuyện hiện có với người nhận:", existingChat);
//         const messages = await chat.getMessages(existingChat.id, 10, 1);
//         console.log("Danh sách tin nhắn trong cuộc trò chuyện:", messages);
//         const removeChat = await chat.removeChat(existingChat.id);
//         console.log("Đã xóa cuộc trò chuyện hiện có:", removeChat);

//         const existingChatTest = await chat.findChatByReceiver(receiver.id);
//         console.log("Kiểm tra lại cuộc trò chuyện sau khi xóa:", existingChatTest);

//       } else {
//         console.log("Không tìm thấy cuộc trò chuyện hiện có. Đang tạo mới...");
//         // const chat1 = await chat.addChat(receiver.id, "Xin chào! Đây là tin nhắn đầu tiên.");
//         // console.log("Cuộc trò chuyện đã được tạo hoặc lấy:", chat1);
//       }
//     }

//   }

//   return null;
// };

const App = () => <></>;

export default App;
