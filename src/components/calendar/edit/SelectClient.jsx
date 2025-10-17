
import { X, Clock, Calendar as CalendarIcon, UserCog, UserRound } from "lucide-react";
import ClientSelection from "../steps/ClientSelection";
import AddClient from "../AddClient";

const Label = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 text-sm text-gray-600">
    {Icon ? <Icon className="w-4 h-4" /> : null}
    <span className="font-medium">{children}</span>
  </div>
);

const SelectClient = ({
  setClientPanelOpen,
  addClientModal,
  setSelectedClient,
  selectedClient,
  setAddClientModal
}) => {
  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-[60] opacity-[.6]"
        onClick={() => setClientPanelOpen(false)}
      />
      <div className="fixed top-[50px] right-0 h-full w-[560px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Label icon={UserRound}>Seleccionar cliente</Label>
          <div className="flex items-center gap-2">

            <button
              className="p-2 flex gap-1 hover:bg-gray-100 rounded-full cursor-pointer"
              onClick={() => setClientPanelOpen(false)}
            >
              Cancelar <X className="w-5 h-6" />
            </button>
          </div>
        </div>

        <div className="h-[calc(100%-56px)] overflow-y-auto p-4">
          {!addClientModal ? (
            <ClientSelection
              onClientSelect={(client) => {
                setSelectedClient(client); // espera { id, name, ...}
                setClientPanelOpen(false);
              }}
              selectedClient={selectedClient}
              setAddClient={setAddClientModal}
            />
          ) : (
            <div className="p-2">
              <AddClient
                back={() => setAddClientModal(false)}
                setSelectedClient={(client) => {
                  setSelectedClient(client);
                  setClientPanelOpen(false);
                  setAddClientModal(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default SelectClient;