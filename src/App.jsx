import { useMemo } from "react";
import { Toaster } from "sonner";
import CalendarManager from './pages/CalendarManager';
import { useDriverTour } from "./hooks/useDriverTour";
import { TOUR } from "./constans/tour";

const App = () => {
  const steps = useMemo(() => (TOUR), []);

  const { start } = useDriverTour(steps, {
    runOnMount: false,
    storageKey: 'tour_home_v1_seen',
  });
  return (
    <div>
      
      <CalendarManager />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export default App;