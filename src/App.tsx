import { useChatGlobalListener } from './hooks/useChatGlobalListener';

const App = () => {
  // Kích hoạt lắng nghe các sự kiện chat global
  useChatGlobalListener();

  return null;
};

export default App;
