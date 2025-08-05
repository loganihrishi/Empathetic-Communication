import { io } from "socket.io-client";
import { fetchAuthSession } from "aws-amplify/auth";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

let socket = null;

export async function getSocket() {
  if (socket?.connected) return socket;
  
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  
  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: false,
    auth: { token }
  });
  
  return socket;
}

export { socket };
