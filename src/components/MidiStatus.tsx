import type { MidiDevice } from "../hooks/useMidi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface MidiStatusProps {
  isSupported: boolean;
  isConnected: boolean;
  isRequesting: boolean;
  currentDevice: MidiDevice | null;
  availableDevices: MidiDevice[];
  error: string | null;
  onDeviceSelect: (deviceId: string) => void;
  onDisconnect: () => void;
  onRetry: () => void;
}

export default function MidiStatus({
  isSupported,
  isConnected,
  isRequesting,
  currentDevice,
  availableDevices,
  error,
  onDeviceSelect,
  onDisconnect,
  onRetry,
}: MidiStatusProps) {
  // Not supported
  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-800/50 text-zinc-500 rounded cursor-not-allowed">
        <span className="w-2 h-2 rounded-full bg-zinc-600" />
        <span className="hidden sm:inline">MIDI Not Supported</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span className="hidden sm:inline">MIDI Error</span>
      </button>
    );
  }

  // Requesting access
  if (isRequesting) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-800 text-zinc-400 rounded">
        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
        <span className="hidden sm:inline">Connecting...</span>
      </div>
    );
  }

  // Connected - show device with dropdown
  if (isConnected && currentDevice) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-900/30 text-emerald-400 rounded hover:bg-emerald-900/50 transition-colors">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="hidden sm:inline max-w-[120px] truncate">
              {currentDevice.name}
            </span>
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>MIDI Devices</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableDevices.map((device) => (
            <DropdownMenuItem
              key={device.id}
              onClick={() => onDeviceSelect(device.id)}
              className={device.id === currentDevice.id ? "bg-accent" : ""}
            >
              <span className="flex items-center gap-2">
                {device.id === currentDevice.id && (
                  <svg
                    className="w-4 h-4 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                <span className={device.id !== currentDevice.id ? "ml-6" : ""}>
                  {device.name}
                </span>
              </span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDisconnect} className="text-red-400">
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // No devices available
  if (availableDevices.length === 0) {
    return (
      <div
        className="flex items-center gap-1.5 p-1.5 text-muted-foreground rounded-md border border-border"
        title="No MIDI device found"
      >
        <span className="w-2 h-2 rounded-full bg-zinc-500" />
        <span className="hidden sm:inline text-xs">No MIDI</span>
      </div>
    );
  }

  // Devices available but not connected - show dropdown to connect
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700 transition-colors">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="hidden sm:inline">Connect MIDI</span>
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Available Devices</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableDevices.map((device) => (
          <DropdownMenuItem
            key={device.id}
            onClick={() => onDeviceSelect(device.id)}
          >
            {device.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
