import { useState, useEffect, useCallback, useRef } from "react";

export interface MidiDevice {
  id: string;
  name: string;
  manufacturer: string;
}

export interface MidiState {
  isSupported: boolean;
  isConnected: boolean;
  isRequesting: boolean;
  currentDevice: MidiDevice | null;
  availableDevices: MidiDevice[];
  error: string | null;
}

interface UseMidiOptions {
  onNoteOn?: (midiNumber: number, velocity: number) => void;
  onNoteOff?: (midiNumber: number) => void;
}

export function useMidi(options: UseMidiOptions = {}) {
  const { onNoteOn, onNoteOff } = options;
  const onNoteOnRef = useRef(onNoteOn);
  const onNoteOffRef = useRef(onNoteOff);

  // Keep refs updated
  useEffect(() => {
    onNoteOnRef.current = onNoteOn;
    onNoteOffRef.current = onNoteOff;
  }, [onNoteOn, onNoteOff]);

  const [state, setState] = useState<MidiState>({
    isSupported:
      typeof navigator !== "undefined" && "requestMIDIAccess" in navigator,
    isConnected: false,
    isRequesting: false,
    currentDevice: null,
    availableDevices: [],
    error: null,
  });

  const midiAccessRef = useRef<MIDIAccess | null>(null);
  const activeInputRef = useRef<MIDIInput | null>(null);

  // Handle MIDI messages
  const handleMidiMessage = useCallback((event: MIDIMessageEvent) => {
    const [status, note, velocity] = event.data ? [...event.data] : [0, 0, 0];

    // Extract message type and channel
    const messageType = status & 0xf0;

    // Note On: 0x90 (144)
    if (messageType === 0x90 && velocity > 0) {
      onNoteOnRef.current?.(note, velocity);
    }
    // Note Off: 0x80 (128) or Note On with velocity 0
    else if (messageType === 0x80 || (messageType === 0x90 && velocity === 0)) {
      onNoteOffRef.current?.(note);
    }
  }, []);

  // Connect to a specific MIDI input
  const connectToDevice = useCallback(
    (deviceId: string) => {
      if (!midiAccessRef.current) return;

      // Disconnect previous device
      if (activeInputRef.current) {
        activeInputRef.current.onmidimessage = null;
        activeInputRef.current = null;
      }

      const input = midiAccessRef.current.inputs.get(deviceId);
      if (input) {
        input.onmidimessage = handleMidiMessage;
        activeInputRef.current = input;

        const device: MidiDevice = {
          id: input.id,
          name: input.name || "Unknown Device",
          manufacturer: input.manufacturer || "Unknown",
        };

        setState((prev) => ({
          ...prev,
          isConnected: true,
          currentDevice: device,
          error: null,
        }));

        // Save preference
        localStorage.setItem("midi-device-id", deviceId);
      }
    },
    [handleMidiMessage]
  );

  // Disconnect from current device
  const disconnect = useCallback(() => {
    if (activeInputRef.current) {
      activeInputRef.current.onmidimessage = null;
      activeInputRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isConnected: false,
      currentDevice: null,
    }));

    localStorage.removeItem("midi-device-id");
  }, []);

  // Update available devices list
  const updateDevices = useCallback(() => {
    if (!midiAccessRef.current) return;

    const devices: MidiDevice[] = [];
    midiAccessRef.current.inputs.forEach((input) => {
      devices.push({
        id: input.id,
        name: input.name || "Unknown Device",
        manufacturer: input.manufacturer || "Unknown",
      });
    });

    setState((prev) => ({
      ...prev,
      availableDevices: devices,
    }));

    // Auto-connect to saved device or first available
    const savedDeviceId = localStorage.getItem("midi-device-id");
    const targetDevice = savedDeviceId
      ? devices.find((d) => d.id === savedDeviceId)
      : devices[0];

    if (targetDevice && !activeInputRef.current) {
      connectToDevice(targetDevice.id);
    }

    // If current device was disconnected, update state
    if (
      activeInputRef.current &&
      !devices.find((d) => d.id === activeInputRef.current?.id)
    ) {
      disconnect();
    }
  }, [connectToDevice, disconnect]);

  // Request MIDI access
  const requestAccess = useCallback(async () => {
    if (!state.isSupported) {
      setState((prev) => ({
        ...prev,
        error: "Web MIDI is not supported in this browser. Try Chrome or Edge.",
      }));
      return;
    }

    setState((prev) => ({ ...prev, isRequesting: true, error: null }));

    try {
      const access = await navigator.requestMIDIAccess({ sysex: false });
      midiAccessRef.current = access;

      // Listen for device changes
      access.onstatechange = () => {
        updateDevices();
      };

      updateDevices();
      setState((prev) => ({ ...prev, isRequesting: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isRequesting: false,
        error:
          err instanceof Error ? err.message : "Failed to access MIDI devices",
      }));
    }
  }, [state.isSupported, updateDevices]);

  // Auto-request access on mount
  useEffect(() => {
    if (state.isSupported && !midiAccessRef.current) {
      requestAccess();
    }

    return () => {
      // Cleanup
      if (activeInputRef.current) {
        activeInputRef.current.onmidimessage = null;
      }
    };
  }, [state.isSupported, requestAccess]);

  return {
    ...state,
    requestAccess,
    connectToDevice,
    disconnect,
  };
}
