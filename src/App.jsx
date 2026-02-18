import { useMemo } from "react";
import { Toaster } from "react-hot-toast";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import CalendarManager from "./pages/CalendarManager";
import { useDriverTour } from "./hooks/useDriverTour";
import { TOUR } from "./constans/tour";

const App = ({ shadowRoot }) => {
  const steps = useMemo(() => TOUR, []);

  const { start } = useDriverTour(steps, {
    runOnMount: false,
    storageKey: "tour_home_v1_seen",
  });

  const muiCache = useMemo(() => {
    if (!shadowRoot) return null;
    return createCache({
      key: "mui-shadow",
      container: shadowRoot,
      prepend: true,
    });
  }, [shadowRoot]);

  if (!shadowRoot || !muiCache) return null;

  return (
    <CacheProvider value={muiCache}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <div>
          <CalendarManager startTour={start} />
          <Toaster position="top-right" />
        </div>
      </LocalizationProvider>
    </CacheProvider>
  );
};

export default App;
