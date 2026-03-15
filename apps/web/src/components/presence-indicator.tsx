'use client';

import { useRealtime } from '@/hooks/use-realtime';
import { cn } from '@/lib/utils';

export function PresenceIndicator() {
  const { isConnected, onlineUsers } = useRealtime();

  if (!isConnected) return null;

  return (
    <div className="flex items-center gap-2" aria-label={`${onlineUsers.length} users online`}>
      <div className="flex -space-x-1">
        {onlineUsers.slice(0, 5).map((user) => (
          <div
            key={user}
            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-teal-500 text-[10px] font-medium text-white dark:border-gray-800"
            title={user}
          >
            {user[0]?.toUpperCase() || '?'}
          </div>
        ))}
        {onlineUsers.length > 5 && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-400 text-[10px] font-medium text-white dark:border-gray-800">
            +{onlineUsers.length - 5}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <div className={cn(
          'h-2 w-2 rounded-full',
          isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
        )} />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {onlineUsers.length} online
        </span>
      </div>
    </div>
  );
}

interface UserPresenceDotProps {
  isOnline: boolean;
  className?: string;
}

export function UserPresenceDot({ isOnline, className }: UserPresenceDotProps) {
  return (
    <span
      className={cn(
        'inline-block h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-800',
        isOnline ? 'bg-green-400' : 'bg-gray-300',
        className
      )}
      aria-label={isOnline ? 'Online' : 'Offline'}
    />
  );
}
