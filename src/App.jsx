import { useMemo } from "react";
import { Toaster } from 'react-hot-toast';
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
      <Toaster position="top-right"/>
    </div>
  );
}

export default App;