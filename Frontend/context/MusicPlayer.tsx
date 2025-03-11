import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useRef,
} from "react";
import {
  Audio,
  AVPlaybackStatus,
  InterruptionModeAndroid,
  InterruptionModeIOS,
} from "expo-av";
import { MusicPlayerContextType, PlaybackState, Song } from "@/constants/types";

// Create Context
export const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use a ref to store the current sound instance
  const soundRef = useRef<Audio.Sound | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [controlsVisible, setControlsVisible] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Queue for pending operations
  const operationQueueRef = useRef<Array<() => Promise<any>>>([]);
  const isOperationInProgressRef = useRef<boolean>(false);

  // Playback state
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentPosition: 0,
    duration: 0,
    currentSongIndex: 0,
    shuffle: false,
    repeat: "off",
    queue: [],
    volume: 1.0,
  });

  // Set up audio mode on mount
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          shouldDuckAndroid: true,
        });
      } catch (e) {
        console.error("Failed to setup audio mode:", e);
        setErrorMessage("Could not initialize audio system");
      }
    };

    setupAudio();

    return () => {
      // Ensure cleanup on unmount
      unloadCurrentSound().catch(e => console.error("Cleanup error:", e));
    };
  }, []);

  // Process the operation queue
  const processNextOperation = useCallback(async () => {
    if (isOperationInProgressRef.current || operationQueueRef.current.length === 0) {
      return;
    }
    
    isOperationInProgressRef.current = true;
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const nextOperation = operationQueueRef.current.shift();
      if (nextOperation) {
        await nextOperation();
      }
    } catch (e) {
      console.error("Operation failed:", e);
      setErrorMessage("Operation failed. Please try again.");
    } finally {
      isOperationInProgressRef.current = false;
      setIsLoading(false);
      
      // Process next item in queue if any
      if (operationQueueRef.current.length > 0) {
        setTimeout(processNextOperation, 0);
      }
    }
  }, []);

  // Queue an operation for execution
  const queueOperation = useCallback((operation: () => Promise<any>) => {
    operationQueueRef.current.push(operation);
    processNextOperation();
  }, [processNextOperation]);

  // Clean up any existing sound before creating a new one
  const unloadCurrentSound = useCallback(async () => {
    if (soundRef.current) {
      let sound = soundRef.current;
      soundRef.current = null; // Clear ref first to prevent duplicate unloading attempts
      
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          await sound.stopAsync();
          await sound.unloadAsync();
        }
      } catch (e) {
        console.error("Failed to unload sound:", e);
        // Even if error occurs, proceed with state cleanup
      }
    }
  }, []);

  // Load a song using the sound ref - properly queued
  const loadSong = useCallback(async (song: Song) => {
    try {
      // Make sure any existing sound is unloaded first
      await unloadCurrentSound();

      // Load new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.audioUrl },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          
          // Update position and duration
          setPlaybackState(prev => ({
            ...prev,
            currentPosition: status.positionMillis,
            duration: status.durationMillis || 0,
            isPlaying: status.isPlaying
          }));
          
          // Handle playback end
          if (status.didJustFinish) {
            handleSongEnd();
          }
        }
      );
      
      soundRef.current = newSound;
      setControlsVisible(true);
      
      setPlaybackState(prev => ({
        ...prev,
        isPlaying: true,
      }));
      
      return true;
    } catch (e) {
      console.error("Failed to load song:", e);
      setErrorMessage(`Failed to load: ${song.title}`);
      return false;
    }
  }, [unloadCurrentSound]);

  // Skip to next song - queued operation
  const skipToNext = useCallback(() => {
    queueOperation(async () => {
      const { queue, currentSongIndex, shuffle } = playbackState;
      if (queue.length <= 1) return false;

      let nextIndex: number;
      if (shuffle) {
        do {
          nextIndex = Math.floor(Math.random() * queue.length);
        } while (nextIndex === currentSongIndex && queue.length > 1);
      } else {
        nextIndex = (currentSongIndex + 1) % queue.length;
      }

      setPlaybackState((prev) => ({
        ...prev,
        currentSongIndex: nextIndex,
        currentPosition: 0,
      }));

      setCurrentSong(queue[nextIndex]);
      await loadSong(queue[nextIndex]);
      return true;
    });
  }, [playbackState, loadSong, queueOperation]);

  // Handle song end
  const handleSongEnd = useCallback(() => {
    queueOperation(async () => {
      const { repeat, currentSongIndex, queue } = playbackState;
      
      if (repeat === "one" && soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          await soundRef.current.setPositionAsync(0);
          await soundRef.current.playAsync();
        }
      } else if (currentSongIndex < queue.length - 1 || repeat === "all") {
        const nextIndex = (currentSongIndex + 1) % queue.length;
        setPlaybackState((prev) => ({
          ...prev, 
          currentSongIndex: nextIndex,
          currentPosition: 0
        }));
        setCurrentSong(queue[nextIndex]);
        await loadSong(queue[nextIndex]);
      } else {
        // End of queue reached
        setPlaybackState((prev) => ({ ...prev, isPlaying: false, currentPosition: 0 }));
      }
      return true;
    });
  }, [playbackState, loadSong, queueOperation]);

  // Toggle play/pause - queued operation
  const togglePlay = useCallback(async () => {
    queueOperation(async () => {
      if (!soundRef.current || !currentSong) return false;

      try {
        const status = await soundRef.current.getStatusAsync();
        if (!status.isLoaded) {
          // Reload sound if needed
          await loadSong(currentSong);
          return true;
        }
        
        if (playbackState.isPlaying) {
          await soundRef.current.pauseAsync();
        } else {
          await soundRef.current.playAsync();
        }
        
        setPlaybackState((prev) => ({
          ...prev,
          isPlaying: !prev.isPlaying,
        }));
        return true;
      } catch (e) {
        console.error("Failed to toggle play:", e);
        setErrorMessage("Failed to play/pause");
        return false;
      }
    });
  }, [currentSong, playbackState.isPlaying, queueOperation, loadSong]);

  // Play a song - queued operation
  const playSong = useCallback(async (song: Song, replaceQueue = true) => {
    queueOperation(async () => {
      // Check if this is the currently playing song
      if (currentSong && currentSong.id === song.id) {
        if (!playbackState.isPlaying) {
          await togglePlay();
        } else {
          // If it's already playing, just expand the player
          setIsExpanded(true);
        }
        return true;
      }
      
      if (replaceQueue) {
        setPlaybackState((prev) => ({
          ...prev,
          queue: [song],
          currentSongIndex: 0,
          isPlaying: true,
          currentPosition: 0,
        }));
      } else {
        // Use functional update to ensure we have the latest state
        setPlaybackState((prev) => {
          const newQueue = [...prev.queue];
          newQueue.splice(prev.currentSongIndex + 1, 0, song);
          return {
            ...prev,
            queue: newQueue,
          };
        });
      }
      
      setCurrentSong(song);
      await loadSong(song);
      return true;
    });
  }, [loadSong, togglePlay, currentSong, queueOperation, playbackState.isPlaying]);

  // Add to queue - optimized array handling
  const addToQueue = useCallback((song: Song) => {
    setPlaybackState((prev) => {
      // If queue is empty, update current song index too
      const isFirstSong = prev.queue.length === 0;
      return {
        ...prev,
        queue: [...prev.queue, song],
        currentSongIndex: isFirstSong ? 0 : prev.currentSongIndex,
      };
    });

    if (!currentSong) {
      playSong(song, false);
    }
  }, [currentSong, playSong]);

  // Clear queue - queued operation
  const clearQueue = useCallback(async () => {
    queueOperation(async () => {
      // Ensure we properly unload any existing sound
      await unloadCurrentSound();
      
      // Reset all state
      setPlaybackState({
        isPlaying: false,
        currentPosition: 0,
        duration: 0,
        currentSongIndex: 0,
        shuffle: false,
        repeat: "off",
        queue: [],
        volume: 1.0,
      });
      
      setCurrentSong(null);
      setControlsVisible(false);
      setIsExpanded(false);
      
      return true;
    });
  }, [unloadCurrentSound, queueOperation]);

  // Skip to previous song - queued operation
  const skipToPrevious = useCallback(() => {
    queueOperation(async () => {
      const { queue, currentSongIndex, currentPosition } = playbackState;
      if (queue.length <= 1) return false;

      if (currentPosition > 3000 && soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          await soundRef.current.setPositionAsync(0);
          setPlaybackState((prev) => ({
            ...prev,
            currentPosition: 0,
          }));
          return true;
        }
      }

      const prevIndex = (currentSongIndex - 1 + queue.length) % queue.length;
      setPlaybackState((prev) => ({
        ...prev,
        currentSongIndex: prevIndex,
        currentPosition: 0,
      }));
      
      setCurrentSong(queue[prevIndex]);
      await loadSong(queue[prevIndex]);
      return true;
    });
  }, [playbackState, loadSong, queueOperation]);

  // Seek to position - queued operation
  const seek = useCallback(async (position: number) => {
    queueOperation(async () => {
      if (!soundRef.current) return false;
      
      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) return false;
      
      await soundRef.current.setPositionAsync(position);
      setPlaybackState((prev) => ({
        ...prev,
        currentPosition: position,
      }));
      return true;
    });
  }, [queueOperation]);

  // Toggle shuffle
  const toggleShuffle = useCallback(() => {
    setPlaybackState((prev) => ({
      ...prev,
      shuffle: !prev.shuffle,
    }));
  }, []);

  // Toggle repeat
  const toggleRepeat = useCallback(() => {
    setPlaybackState((prev) => {
      const modes: ("off" | "all" | "one")[] = ["off", "all", "one"];
      const currentIndex = modes.indexOf(prev.repeat);
      const nextIndex = (currentIndex + 1) % modes.length;
      return {
        ...prev,
        repeat: modes[nextIndex],
      };
    });
  }, []);

  // Set volume - queued operation
  const setVolume = useCallback(async (volume: number) => {
    queueOperation(async () => {
      if (!soundRef.current) return false;
      
      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) return false;
      
      await soundRef.current.setVolumeAsync(volume);
      setPlaybackState((prev) => ({
        ...prev,
        volume,
      }));
      return true;
    });
  }, [queueOperation]);

  // Toggle expanded view
  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Context value
  const value: MusicPlayerContextType = {
    playbackState,
    currentSong,
    controlsVisible,
    isExpanded,
    isLoading,
    errorMessage,
    togglePlay,
    skipToNext,
    skipToPrevious,
    seek,
    toggleShuffle,
    toggleRepeat,
    setVolume,
    toggleExpanded,
    playSong,
    addToQueue,
    clearQueue,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

// Hook for using the music player
export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }
  return context;
};