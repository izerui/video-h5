import { useEffect, useState, useRef, useCallback } from "react";

// 性能监控 Hook
export const useVideoPerformance = (playerRef) => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    bufferHealth: 0,
    bitrate: 0,
    droppedFrames: 0,
    bandwidth: 0,
    currentLevel: 0,
    levels: [],
    isLive: false,
    duration: 0,
    currentTime: 0,
  });

  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!playerRef.current) return;

    const player = playerRef.current;

    // 记录开始时间
    startTimeRef.current = performance.now();

    // 监听加载完成事件
    const handleLoadedMetadata = () => {
      const loadTime = performance.now() - startTimeRef.current;
      setMetrics((prev) => ({
        ...prev,
        loadTime: Math.round(loadTime),
        duration: player.duration() || 0,
        isLive: player.duration() === Infinity,
      }));
    };

    // 监听质量级别变化
    const handleLevelSwitch = () => {
      if (player.tech_ && player.tech_.hls) {
        const hls = player.tech_.hls;
        setMetrics((prev) => ({
          ...prev,
          currentLevel: hls.currentLevel,
          levels: hls.levels,
          bitrate: hls.levels[hls.currentLevel]?.bitrate || 0,
        }));
      }
    };

    // 监听带宽变化
    const handleBandwidthUpdate = () => {
      if (player.tech_ && player.tech_.hls) {
        const hls = player.tech_.hls;
        setMetrics((prev) => ({
          ...prev,
          bandwidth: hls.bandwidth,
          bitrate: hls.levels[hls.currentLevel]?.bitrate || 0,
        }));
      }
    };

    // 定期更新缓冲健康度
    intervalRef.current = setInterval(() => {
      if (!player || !player.buffered) return;

      const buffered = player.buffered();
      if (buffered.length > 0) {
        const currentTime = player.currentTime();
        const bufferedEnd = buffered.end(buffered.length - 1);
        const bufferHealth = Math.max(0, bufferedEnd - currentTime);

        setMetrics((prev) => ({
          ...prev,
          bufferHealth: Math.round(bufferHealth * 10) / 10,
          currentTime: player.currentTime() || 0,
        }));
      }

      // 获取丢帧信息
      if (player.tech_ && player.tech_.el) {
        const videoElement = player.tech_.el;
        if (videoElement.getVideoPlaybackQuality) {
          const quality = videoElement.getVideoPlaybackQuality();
          setMetrics((prev) => ({
            ...prev,
            droppedFrames: quality.droppedVideoFrames || 0,
          }));
        }
      }
    }, 1000);

    // 绑定事件监听器
    player.on("loadedmetadata", handleLoadedMetadata);
    player.on("levelswitch", handleLevelSwitch);
    player.on("bandwidthupdate", handleBandwidthUpdate);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (player) {
        player.off("loadedmetadata", handleLoadedMetadata);
        player.off("levelswitch", handleLevelSwitch);
        player.off("bandwidthupdate", handleBandwidthUpdate);
      }
    };
  }, [playerRef]);

  return metrics;
};

// 网络状态检测 Hook
export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState({
    online: navigator.onLine,
    connectionType: "unknown",
    downlink: 0,
    effectiveType: "unknown",
    rtt: 0,
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;

      setNetworkStatus({
        online: navigator.onLine,
        connectionType: connection?.type || "unknown",
        downlink: connection?.downlink || 0,
        effectiveType: connection?.effectiveType || "unknown",
        rtt: connection?.rtt || 0,
      });
    };

    // 初始更新
    updateNetworkStatus();

    // 监听网络变化
    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);

    if (navigator.connection) {
      navigator.connection.addEventListener("change", updateNetworkStatus);
    }

    return () => {
      window.removeEventListener("online", updateNetworkStatus);
      window.removeEventListener("offline", updateNetworkStatus);

      if (navigator.connection) {
        navigator.connection.removeEventListener("change", updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
};

// 设备信息检测 Hook
export const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    userAgent: "",
    platform: "",
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    screenWidth: 0,
    screenHeight: 0,
    devicePixelRatio: 1,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;

      const isMobile =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent,
        );
      const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);
      const isDesktop = !isMobile && !isTablet;

      setDeviceInfo({
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        isMobile,
        isTablet,
        isDesktop,
        screenWidth,
        screenHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
      });
    };

    updateDeviceInfo();
    window.addEventListener("resize", updateDeviceInfo);

    return () => {
      window.removeEventListener("resize", updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
};

// 性能测试工具
// 智能预加载Hook
export const useSmartPreload = (playerRef, src) => {
  const [preloadState, setPreloadState] = useState({
    isPreloading: false,
    progress: 0,
    strategy: "moderate",
    bufferTarget: 80,
    preloadAhead: 2,
    estimatedTime: 0,
    networkSpeed: 0,
  });

  const preloadIntervalRef = useRef(null);

  const getNetworkSpeed = useCallback(() => {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    if (connection) {
      return connection.downlink || 0;
    }

    // 通过performance API估算网速
    const img = new Image();
    const startTime = performance.now();
    img.src =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==?" +
      startTime;

    return new Promise((resolve) => {
      img.onload = () => {
        const loadTime = performance.now() - startTime;
        resolve(1000 / loadTime); // 简单估算
      };
      img.onerror = () => resolve(0);
    });
  }, []);

  const determineStrategy = useCallback(async () => {
    const speed = await getNetworkSpeed();
    let strategy = "moderate";

    if (speed > 5) strategy = "aggressive";
    else if (speed < 1) strategy = "conservative";

    const configs = {
      aggressive: { bufferTarget: 120, preloadAhead: 3 },
      moderate: { bufferTarget: 80, preloadAhead: 2 },
      conservative: { bufferTarget: 50, preloadAhead: 1 },
    };

    setPreloadState((prev) => ({
      ...prev,
      strategy,
      ...configs[strategy],
      networkSpeed: speed,
    }));

    return strategy;
  }, [getNetworkSpeed]);

  const startPreload = useCallback(async () => {
    if (!playerRef.current || !src || !src.includes(".m3u8")) return;

    const strategy = await determineStrategy();
    setPreloadState((prev) => ({ ...prev, isPreloading: true, progress: 0 }));

    const configs = {
      aggressive: { duration: 3000, steps: 30 },
      moderate: { duration: 5000, steps: 20 },
      conservative: { duration: 8000, steps: 10 },
    };

    const config = configs[strategy];
    const stepTime = config.duration / config.steps;
    let currentStep = 0;

    preloadIntervalRef.current = setInterval(() => {
      currentStep++;
      const progress = Math.min((currentStep / config.steps) * 100, 100);

      setPreloadState((prev) => ({
        ...prev,
        progress,
        estimatedTime: Math.round(
          (config.duration - currentStep * stepTime) / 1000,
        ),
      }));

      if (currentStep >= config.steps) {
        clearInterval(preloadIntervalRef.current);
        setPreloadState((prev) => ({ ...prev, isPreloading: false }));
      }
    }, stepTime);
  }, [playerRef, src, determineStrategy]);

  const stopPreload = useCallback(() => {
    if (preloadIntervalRef.current) {
      clearInterval(preloadIntervalRef.current);
      setPreloadState((prev) => ({
        ...prev,
        isPreloading: false,
        progress: 0,
      }));
    }
  }, []);

  useEffect(() => {
    return () => {
      stopPreload();
    };
  }, [stopPreload]);

  return {
    preloadState,
    startPreload,
    stopPreload,
    determineStrategy,
  };
};

export const usePerformanceTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  const runPerformanceTest = async (videoUrl, testDuration = 30000) => {
    setIsTesting(true);
    const startTime = performance.now();

    const results = {
      url: videoUrl,
      startTime,
      events: [],
      metrics: {},
    };

    // 创建临时播放器进行测试
    const videoElement = document.createElement("video");
    videoElement.style.display = "none";
    document.body.appendChild(videoElement);

    const player = videojs(videoElement, {
      controls: false,
      preload: "auto",
      muted: true,
    });

    const logEvent = (event, data = {}) => {
      results.events.push({
        event,
        timestamp: performance.now() - startTime,
        data,
      });
    };

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        player.dispose();
        document.body.removeChild(videoElement);

        results.endTime = performance.now();
        results.totalDuration = results.endTime - startTime;

        setTestResults((prev) => [...prev, results]);
        setIsTesting(false);
        resolve(results);
      }, testDuration);

      player.on("loadedmetadata", () => logEvent("loadedmetadata"));
      player.on("canplay", () => logEvent("canplay"));
      player.on("canplaythrough", () => logEvent("canplaythrough"));
      player.on("play", () => logEvent("play"));
      player.on("error", (e) => logEvent("error", { error: player.error() }));

      player.src({
        src: videoUrl,
        type: videoUrl.includes(".m3u8")
          ? "application/x-mpegURL"
          : "video/mp4",
      });

      player.load();
    });
  };

  return {
    testResults,
    isTesting,
    runPerformanceTest,
  };
};
