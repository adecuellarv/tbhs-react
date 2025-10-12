import { Toaster } from "sonner";
import CalendarManager from './pages/CalendarManager';

const App = () => {
  return (
    <div>
      <CalendarManager />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export default App;