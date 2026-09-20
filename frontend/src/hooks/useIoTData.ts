import { useIoTContext } from "../context/IoTContext";

export function useIoTData() {
  return useIoTContext();
}
