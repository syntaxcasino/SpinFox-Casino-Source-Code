// hooks/useDepositSocket.ts
import { useEffect } from 'react';
import { socket } from '@/lib/socket';

export const useDepositSocket = (userId?: number) => {
  useEffect(() => {
    if (!userId) return;

    // Connect if not connected
    if (!socket.connected) socket.connect();

    // Join the user-specific room
    socket.emit('join_room', { room: `user_${userId}` });

    // Listen for deposit confirmations
    socket.on('deposit_confirmed', (data) => {
      console.log('✅ Deposit confirmed:', data);
      alert(`Deposit confirmed: ${data.amount} ${data.token}`);
    });

    // Cleanup when unmounting
    return () => {
      socket.off('deposit_confirmed');
      socket.disconnect();
    };
  }, [userId]);
};
