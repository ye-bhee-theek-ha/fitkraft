import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useRef,
  useMemo,
} from "react";
import {
  Audio,
  AVPlaybackStatus,
  InterruptionModeAndroid,
  InterruptionModeIOS,
} from "expo-av";
import { MusicPlayerContextType, PlaybackState, Song, UiState } from "@/constants/types";

// Create Context
export const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

// Status update throttling interval (ms)
const STATUS_UPDATE_INTERVAL = 500;

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Sound reference with typed null safety
  const soundRef = useRef<Audio.Sound | null>(null);
  
  // Last status update timestamp for throttling
  const lastStatusUpdateRef = useRef<number>(0);
  
  // Operation lock to prevent concurrent sound operations
  const isOperationLockRef = useRef<boolean>(false);
  
  // Group UI-related state to reduce renders
  const [uiState, setUiState] = useState<UiState>({
    controlsVisible: false,
    isExpanded: false,
    isLoading: false,
    errorMessage: null,
  });
  
  // Current song state
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  
  // Playback state
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentPosition: 0,
    duration: 0,
    currentSongIndex: 0,
    shuffle: false,
    repeat: "off" as "off" | "all" | "one",
    queue: [] as Song[],
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
        setUiState(prev => ({ ...prev, errorMessage: "Could not initialize audio system" }));
      }
    };

    setupAudio();

    // Cleanup function
    return () => {
      if (soundRef.current) {
        const sound = soundRef.current;
        sound.unloadAsync().catch(e => console.error("Cleanup error:", e));
        soundRef.current = null;
      }
    };
  }, []);

  // Throttled status update function
  const handlePlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    
    const now = Date.now();
    // Throttle position updates during normal playback
    if (status.isPlaying && !status.didJustFinish && now - lastStatusUpdateRef.current < STATUS_UPDATE_INTERVAL) {
      return;
    }
    
    lastStatusUpdateRef.current = now;
    
    // Update position and duration
    setPlaybackState(prev => ({
      ...prev,
      currentPosition: status.positionMillis,
      duration: status.durationMillis || prev.duration,
      isPlaying: status.isPlaying,
    }));
    
    // Handle playback end separately to ensure it's always processed
    if (status.didJustFinish) {
      handleSongEnd();
    }
  }, []);

  // Execute an audio operation with locking
  const executeOperation = useCallback(async <T,>(operation: () => Promise<T>): Promise<T | null> => {
    // If another operation is in progress, skip this one
    if (isOperationLockRef.current) {
      return null;
    }
    
    isOperationLockRef.current = true;
    setUiState(prev => ({ ...prev, isLoading: true, errorMessage: null }));
    
    try {
      const result = await operation();
      return result;
    } catch (e) {
      console.error("Operation failed:", e);
      setUiState(prev => ({ ...prev, errorMessage: "Operation failed. Please try again." }));
      return null;
    } finally {
      isOperationLockRef.current = false;
      setUiState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Clean up existing sound if needed
  const unloadCurrentSound = useCallback(async () => {
    if (!soundRef.current) return;
    
    const sound = soundRef.current;
    soundRef.current = null; // Clear ref first to prevent duplicate unloading attempts
    
    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
    } catch (e) {
      console.error("Failed to unload sound:", e);
      // Continue even if unloading fails
    }
  }, []);

  // Load a song - optimized to avoid unnecessary unloads
  const loadSong = useCallback(async (song: Song): Promise<boolean> => {
    try {
      // Check if we're already playing this song
      if (soundRef.current && currentSong?.id === song.id) {
        return true;
      }
      
      // Unload current song if different
      await unloadCurrentSound();
      
      // Create new sound instance with throttled status updates
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.audioUrl },
        { shouldPlay: true },
        handlePlaybackStatusUpdate
      );
      
      soundRef.current = newSound;
      
      // Update UI state once instead of multiple separate state updates
      setUiState(prev => ({
        ...prev, 
        controlsVisible: true,
        errorMessage: null
      }));
      
      // Update playback state
      setPlaybackState(prev => ({
        ...prev,
        isPlaying: true,
        currentPosition: 0,
      }));
      
      return true;
    } catch (e) {
      console.error("Failed to load song:", e);
      setUiState(prev => ({ 
        ...prev, 
        errorMessage: `Failed to load: ${song.title}` 
      }));
      return false;
    }
  }, [currentSong?.id, handlePlaybackStatusUpdate, unloadCurrentSound]);

  // Handle song end - separated for clarity
  const handleSongEnd = useCallback(() => {
    executeOperation(async () => {
      const { repeat, currentSongIndex, queue } = playbackState;
      
      if (repeat === "one" && soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          await soundRef.current.setPositionAsync(0);
          await soundRef.current.playAsync();
          
          // Only update position, not the entire state
          setPlaybackState(prev => ({
            ...prev,
            currentPosition: 0,
          }));
        }
      } else if (currentSongIndex < queue.length - 1 || repeat === "all") {
        const nextIndex = (currentSongIndex + 1) % queue.length;
        const nextSong = queue[nextIndex];
        
        // Update state first to avoid jank
        setPlaybackState(prev => ({
          ...prev, 
          currentSongIndex: nextIndex,
          currentPosition: 0
        }));
        
        setCurrentSong(nextSong);
        await loadSong(nextSong);
      } else {
        // End of queue reached
        setPlaybackState(prev => ({ 
          ...prev, 
          isPlaying: false, 
          currentPosition: 0 
        }));
      }
      return true;
    }).catch(e => console.error("Error handling song end:", e));
  }, [executeOperation, loadSong, playbackState]);

  // Skip to next song
  const skipToNext = useCallback(() => {
    executeOperation(async () => {
      const { queue, currentSongIndex, shuffle } = playbackState;
      if (queue.length <= 1) return false;

      let nextIndex: number;
      if (shuffle) {
        // Ensure we don't pick the same song if there are options
        do {
          nextIndex = Math.floor(Math.random() * queue.length);
        } while (nextIndex === currentSongIndex && queue.length > 1);
      } else {
        nextIndex = (currentSongIndex + 1) % queue.length;
      }

      const nextSong = queue[nextIndex];
      
      // Update state before loading to improve perceived performance
      setPlaybackState(prev => ({
        ...prev,
        currentSongIndex: nextIndex,
        currentPosition: 0,
      }));
      
      setCurrentSong(nextSong);
      await loadSong(nextSong);
      return true;
    }).catch(e => console.error("Error skipping to next:", e));
  }, [executeOperation, loadSong, playbackState]);

  // Toggle play/pause - simplified
  const togglePlay = useCallback(() => {
    executeOperation(async () => {
      if (!soundRef.current || !currentSong) return false;

      try {
        const status = await soundRef.current.getStatusAsync();
        
        if (!status.isLoaded) {
          // Reload sound if needed
          await loadSong(currentSong);
          return true;
        }
        
        if (status.isPlaying) {
          await soundRef.current.pauseAsync();
        } else {
          await soundRef.current.playAsync();
        }
        
        // Update only the isPlaying flag
        setPlaybackState(prev => ({
          ...prev,
          isPlaying: !prev.isPlaying,
        }));
        return true;
      } catch (e) {
        console.error("Failed to toggle play:", e);
        setUiState(prev => ({ ...prev, errorMessage: "Failed to play/pause" }));
        return false;
      }
    }).catch(e => console.error("Error toggling play:", e));
  }, [currentSong, executeOperation, loadSong]);

  // Play a song - optimized flow
  const playSong = useCallback((song: Song, replaceQueue = true) => {
    executeOperation(async () => {
      // Check if this is the currently playing song
      if (currentSong?.id === song.id) {
        if (!playbackState.isPlaying) {
          await togglePlay();
        } else {
          // Already playing, just expand the player
          setUiState(prev => ({ ...prev, isExpanded: true }));
        }
        return true;
      }
      
      // Update queue first for better UX
      if (replaceQueue) {
        setPlaybackState(prev => ({
          ...prev,
          queue: [song],
          currentSongIndex: 0,
          currentPosition: 0,
        }));
      } else {
        setPlaybackState(prev => {
          const newQueue = [...prev.queue];
          newQueue.splice(prev.currentSongIndex + 1, 0, song);
          return {
            ...prev,
            queue: newQueue,
          };
        });
      }
      
      // Update current song before loading
      setCurrentSong(song);
      await loadSong(song);
      return true;
    }).catch(e => console.error("Error playing song:", e));
  }, [currentSong?.id, executeOperation, loadSong, playbackState.isPlaying, togglePlay]);

  // Add to queue - optimized
  const addToQueue = useCallback((song: Song) => {
    // No need for executeOperation here as this is a simple state update
    setPlaybackState(prev => {
      const isFirstSong = prev.queue.length === 0;
      return {
        ...prev,
        queue: [...prev.queue, song],
        currentSongIndex: isFirstSong ? 0 : prev.currentSongIndex,
      };
    });

    // Play the song if nothing is currently playing
    if (!currentSong) {
      playSong(song, false);
    }
  }, [currentSong, playSong]);

  // Clear queue - simplified
  const clearQueue = useCallback(() => {
    executeOperation(async () => {
      await unloadCurrentSound();
      
      // Reset all state in one update
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
      
      setUiState(prev => ({
        ...prev,
        controlsVisible: false,
        isExpanded: false,
        errorMessage: null,
      }));
      
      return true;
    }).catch(e => console.error("Error clearing queue:", e));
  }, [executeOperation, unloadCurrentSound]);

  // Skip to previous
  const skipToPrevious = useCallback(() => {
    executeOperation(async () => {
      const { queue, currentSongIndex, currentPosition } = playbackState;
      if (queue.length <= 1) return false;

      // If song has played for over 3 seconds, restart it instead of going to previous
      if (currentPosition > 3000 && soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          await soundRef.current.setPositionAsync(0);
          
          // Update only the position
          setPlaybackState(prev => ({
            ...prev,
            currentPosition: 0,
          }));
          return true;
        }
      }

      const prevIndex = (currentSongIndex - 1 + queue.length) % queue.length;
      const prevSong = queue[prevIndex];
      
      // Update state before loading
      setPlaybackState(prev => ({
        ...prev,
        currentSongIndex: prevIndex,
        currentPosition: 0,
      }));
      
      setCurrentSong(prevSong);
      await loadSong(prevSong);
      return true;
    }).catch(e => console.error("Error skipping to previous:", e));
  }, [executeOperation, loadSong, playbackState]);

  // Seek to position - simplified
  const seek = useCallback((position: number) => {
    executeOperation(async () => {
      if (!soundRef.current) return false;
      
      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) return false;
      
      await soundRef.current.setPositionAsync(position);
      
      // Update only position for better performance
      setPlaybackState(prev => ({
        ...prev,
        currentPosition: position,
      }));
      return true;
    }).catch(e => console.error("Error seeking:", e));
  }, [executeOperation]);

  // Toggle shuffle - simple state update
  const toggleShuffle = useCallback(() => {
    setPlaybackState(prev => ({
      ...prev,
      shuffle: !prev.shuffle,
    }));
  }, []);

  // Toggle repeat - simple state update
  const toggleRepeat = useCallback(() => {
    setPlaybackState(prev => {
      const modes: ("off" | "all" | "one")[] = ["off", "all", "one"];
      const currentIndex = modes.indexOf(prev.repeat);
      const nextIndex = (currentIndex + 1) % modes.length;
      return {
        ...prev,
        repeat: modes[nextIndex],
      };
    });
  }, []);

  // Set volume - simplified
  const setVolume = useCallback((volume: number) => {
    executeOperation(async () => {
      if (!soundRef.current) return false;
      
      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) return false;
      
      await soundRef.current.setVolumeAsync(volume);
      
      // Update only volume for better performance
      setPlaybackState(prev => ({
        ...prev,
        volume,
      }));
      return true;
    }).catch(e => console.error("Error setting volume:", e));
  }, [executeOperation]);

  // Toggle mini player visibility
  const togglePlayerExpansion = useCallback(() => {
    setUiState(prev => ({
      ...prev,
      isExpanded: !prev.isExpanded,
    }));
  }, []);

  // Dismiss the error message
  const dismissError = useCallback(() => {
    setUiState(prev => ({
      ...prev,
      errorMessage: null,
    }));
  }, []);

  // Create memoized context value to avoid unnecessary re-renders
  const contextValue = useMemo(() => ({
    // Player state
    currentSong,
    playbackState,
    
    // UI state
    uiState,
    
    // Player controls
    playSong,
    togglePlay,
    skipToNext,
    skipToPrevious,
    seek,
    addToQueue,
    clearQueue,
    toggleShuffle,
    toggleRepeat,
    setVolume,
    
    // UI controls
    togglePlayerExpansion,
    dismissError,
  }), [
    currentSong,
    playbackState,
    uiState,
    playSong,
    togglePlay,
    skipToNext,
    skipToPrevious,
    seek,
    addToQueue,
    clearQueue,
    toggleShuffle,
    toggleRepeat,
    setVolume,
    togglePlayerExpansion,
    dismissError,
  ]);

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

// Custom hook for using the music player context
export const useMusicPlayer = (): MusicPlayerContextType => {
  const context = useContext(MusicPlayerContext);
  
  if (context === undefined) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }
  
  return context;
};