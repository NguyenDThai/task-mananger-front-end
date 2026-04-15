import { store } from '../redux/store';
import { selectChatSDK } from '../redux/slides/chat/chatSlide';

// Export the singleton instance from the Redux store for non-component usage
export const chatSDK = selectChatSDK(store.getState());
