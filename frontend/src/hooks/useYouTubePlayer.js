import { useState, useRef, useCallback } from 'react';

export const useYouTubePlayer = () => {
  const playerRef = useRef(null);
  
  const [playerState, setPlayerState] = useState({
    videoId: null,
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    playbackRate: 1,
    isReady: false,
  });

  // Called when react-youtube onReady fires
  const onReady = useCallback((event) => {
    playerRef.current = event.target;
    setPlayerState(prev => ({
      ...prev,
      isReady: true,
      duration: event.target.getDuration(),
      playbackRate: event.target.getPlaybackRate()
    }));
  }, []);

  const onStateChange = useCallback((event) => {
    // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
    const isPlaying = event.data === 1;
    setPlayerState(prev => ({ ...prev, isPlaying }));
  }, []);

  const onPlaybackRateChange = useCallback((event) => {
    setPlayerState(prev => ({ ...prev, playbackRate: event.data }));
  }, []);

  // Update current time periodically when playing
  // We'll expose a function that components can call in a requestAnimationFrame or interval
  const getCurrentTime = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
      return playerRef.current.getCurrentTime();
    }
    return 0;
  }, []);

  // Controls
  const play = useCallback(() => {
    if (playerRef.current) playerRef.current.playVideo();
  }, []);

  const pause = useCallback(() => {
    if (playerRef.current) playerRef.current.pauseVideo();
  }, []);

  const seekTo = useCallback((seconds) => {
    if (playerRef.current) playerRef.current.seekTo(seconds, true);
  }, []);

  const setPlaybackRate = useCallback((rate) => {
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(rate);
      setPlayerState(prev => ({ ...prev, playbackRate: rate }));
    }
  }, []);

  const setVideoId = useCallback((id) => {
    setPlayerState(prev => ({ ...prev, videoId: id }));
  }, []);

  return {
    ...playerState,
    onReady,
    onStateChange,
    onPlaybackRateChange,
    getCurrentTime,
    play,
    pause,
    seekTo,
    setPlaybackRate,
    setVideoId
  };
};
