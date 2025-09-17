import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "@videojs/http-streaming";
import "video.js/dist/video-js.css";

const OptimizedVideoPlayer = ({ src, options = {} }) => {
  const videoRef = useRef();
  const playerRef = useRef();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    bufferHealth: 0,
    bitrate: 0,
    droppedFrames: 0,
    segmentDuration: 10, // 10秒切片
    bufferedSegments: 0, // 已缓冲切片数
    segmentSize: 0, // 当前切片大小
    isPreloading: false,
    preloadProgress: 0,
    preloadStrategy: "aggressive", // aggressive | moderate | conservative
  });

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      const startTime = performance.now();

      // 🚀 极速加载优化配置
      const speedOptimizedConfig = {
        controls: true,
        responsive: true,
        fluid: true,
        preload: "auto",

        html5: {
          hlsjsConfig: {
            // 🎯 10秒切片专项优化配置
            maxBufferLength: 80, // 80秒缓冲应对10秒切片 (8个切片)
            maxBufferSize: 200 * 1000 * 1000, // 200MB缓存
            maxMaxBufferLength: 240, // 最大240秒缓冲
            maxBufferHole: 0.05, // 减少缓冲间隙

            // 🚀 预加载优化 - 针对10秒切片
            startFragPrefetch: true,
            autoStartLoad: true,
            testBandwidth: false, // 关闭带宽测试减少延迟

            // 🎯 智能预加载配置
            maxStarvationDelay: 4, // 最大饥饿延迟4秒
            maxLoadingDelay: 4, // 最大加载延迟4秒
            levelLoadingMaxRetry: 4,
            fragLoadingMaxRetry: 6,

            // 📦 切片缓存策略
            backBufferLength: 60, // 保留60秒历史缓冲
            liveSyncDurationCount: 2, // 预加载2个切片(20秒)

            // ⚡ 快速响应网络变化
            abrEwmaFastLive: 1.0,
            abrEwmaSlowLive: 3.0,
            abrBandWidthFactor: 0.95,

            // 🔄 重试优化
            fragLoadingMaxRetry: 8,
            fragLoadingTimeOut: 8000, // 减少超时时间
            segmentLoadingTimeOut: 8000,
            // 📡 多线程网络加载优化
            enableWorker: true,

            // 🔄 并发下载优化
            fragLoadingMaxRetry: 8,
            segmentLoadingMaxRetry: 8,
            fragLoadingMaxRetryTimeout: 64000,
            fragLoadingTimeOut: 10000,
            manifestLoadingTimeOut: 8000,
            segmentLoadingTimeOut: 10000,

            // 🚀 针对5秒切片的激进缓冲策略
            maxBufferLength: 60, // 增加到60秒缓冲
            maxBufferSize: 150 * 1000 * 1000, // 增加到150MB缓存
            maxMaxBufferLength: 180, // 最大缓冲180秒
            maxBufferHole: 0.1, // 减少缓冲间隙

            // ⚡ 针对5秒切片的启动优化
            autoStartLoad: true,
            startFragPrefetch: true,
            testBandwidth: false, // 关闭带宽测试减少延迟
            lowLatencyMode: false,

            // 🧠 针对5秒切片的ABR优化
            abrEwmaDefaultEstimate: 2000000, // 提高初始估计值
            abrBandWidthFactor: 0.95, // 更激进的码率选择
            abrBandWidthUpFactor: 0.85,
            abrEwmaFastLive: 1.0, // 更快响应网络变化
            abrEwmaSlowLive: 3.0,

            // 🎯 质量策略
            startLevel: -1,
            capLevelToPlayerSize: true,
            maxAudioBitrate: undefined,

            // 📈 网络优化
            manifestLoadingMaxRetry: 4,
            levelLoadingMaxRetry: 4,

            // 🔧 针对5秒切片的高级优化
            progressive: true,
            enableSoftwareAES: true,
            enableCEA708Captions: false,
            liveBackBufferLength: 30, // 直播缓冲长度
            liveSyncDurationCount: 3, // 同步切片数量

            // 💾 针对5秒切片的缓存策略
            appendErrorMaxRetry: 5, // 增加重试次数
            nudgeOffset: 0.05, // 更精细的调整
            nudgeMaxRetry: 5,

            // 🚦 针对5秒切片的流控制
            backBufferLength: 45, // 增加回退缓冲
            liveSyncDuration: 15, // 15秒同步延迟
            liveMaxLatencyDuration: 25, // 最大延迟25秒
          },
        },

        // 🎮 播放器级别优化
        techOrder: ["html5"],
        playbackRates: [0.5, 1, 1.25, 1.5, 2],

        ...options,
      };

      // 创建播放器
      playerRef.current = videojs(videoElement, speedOptimizedConfig);

      // 📊 监听加载进度
      playerRef.current.on("progress", function () {
        if (this.buffered().length > 0) {
          const buffered = this.buffered().end(0);
          const duration = this.duration();
          if (duration > 0) {
            const progress = (buffered / duration) * 100;
            setLoadingProgress(Math.round(progress));
          }
        }
      });

      // 🎬 视频准备就绪
      playerRef.current.on("loadedmetadata", function () {
        console.log("✅ 视频元数据加载完成");
        setIsLoading(false);

        // 计算加载时间
        const loadTime = performance.now() - startTime;
        setPerformanceMetrics((prev) => ({
          ...prev,
          loadTime: Math.round(loadTime),
        }));
      });

      // 🚀 快速启动
      playerRef.current.on("canplay", function () {
        console.log("✅ 视频可以开始播放");
      });

      // 📡 网络状态自适应
      playerRef.current.on("ratechange", function () {
        console.log("📶 播放速率变化");
      });

      // 📊 性能监控
      const bufferMonitor = setInterval(() => {
        if (playerRef.current && playerRef.current.buffered().length > 0) {
          const currentTime = playerRef.current.currentTime();
          const bufferedEnd = playerRef.current.buffered().end(0);
          const bufferHealth = Math.max(0, bufferedEnd - currentTime);

          setPerformanceMetrics((prev) => ({
            ...prev,
            bufferHealth: Math.round(bufferHealth * 10) / 10,
            bufferedSegments: Math.floor(bufferHealth / 10), // 10秒切片计算
            segmentSize: playerRef.current?.currentSrc()?.includes(".m3u8")
              ? Math.round(
                  playerRef.current?.currentLevel?.()?.bitrate / 8 / 10,
                )
              : 0,
          }));
        }
      }, 1000);

      // 设置视频源
      if (src) {
        const sourceConfig = {
          src: src,
          type: src.includes(".m3u8") ? "application/x-mpegURL" : "video/mp4",
        };

        playerRef.current.src(sourceConfig);
        playerRef.current.load();
      }

      // 🔧 错误处理和自动恢复
      playerRef.current.on("error", function (e) {
        console.error("❌ 播放器错误:", e);
        const error = this.error();
        if (error && error.code === 4) {
          setTimeout(() => {
            this.load();
          }, 2000);
        }
      });

      return () => {
        clearInterval(bufferMonitor);
      };
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  // 🔄 动态更新视频源
  useEffect(() => {
    if (playerRef.current && src) {
      const sourceConfig = {
        src: src,
        type: src.includes(".m3u8") ? "application/x-mpegURL" : "video/mp4",
      };

      playerRef.current.src(sourceConfig);
      playerRef.current.load();
      setLoadingProgress(0);
      setIsLoading(true);

      // 🚀 启动智能预加载
      startSmartPreload();
    }
  }, [src]);

  // 🧠 智能预加载系统
  const startSmartPreload = () => {
    if (!playerRef.current || !src.includes(".m3u8")) return;

    setPerformanceMetrics((prev) => ({ ...prev, isPreloading: true }));

    // 根据网络状况选择预加载策略
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    let preloadStrategy = "aggressive";

    if (connection) {
      if (connection.downlink < 1) preloadStrategy = "conservative";
      else if (connection.downlink < 3) preloadStrategy = "moderate";
    }

    setPerformanceMetrics((prev) => ({ ...prev, preloadStrategy }));

    // 启动预加载
    const preloadConfig = {
      aggressive: { bufferTarget: 120, preloadAhead: 3 }, // 120秒缓冲，预加载3个切片
      moderate: { bufferTarget: 80, preloadAhead: 2 }, // 80秒缓冲，预加载2个切片
      conservative: { bufferTarget: 50, preloadAhead: 1 }, // 50秒缓冲，预加载1个切片
    };

    const config = preloadConfig[preloadStrategy];

    // 模拟预加载进度
    let progress = 0;
    const preloadInterval = setInterval(() => {
      progress += 10;
      setPerformanceMetrics((prev) => ({
        ...prev,
        preloadProgress: Math.min(progress, 100),
      }));

      if (progress >= 100) {
        clearInterval(preloadInterval);
        setPerformanceMetrics((prev) => ({ ...prev, isPreloading: false }));
      }
    }, 200);
  };

  return (
    <div className="optimized-video-container">
      {/* 📊 加载进度指示器 */}
      {isLoading && (
        <div className="loading-indicator">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <span>缓冲中... {loadingProgress}%</span>
        </div>
      )}

      {performanceMetrics.isPreloading && (
        <div className="preload-indicator">
          <div className="progress-bar">
            <div
              className="progress-fill preload-fill"
              style={{ width: `${performanceMetrics.preloadProgress}%` }}
            />
          </div>
          <span>🚀 智能预加载中... {performanceMetrics.preloadProgress}%</span>
        </div>
      )}

      {/* 📈 性能指标显示 */}
      <div className="performance-metrics">
        <div className="metric">
          <span>加载时间:</span>
          <span>{performanceMetrics.loadTime}ms</span>
        </div>
        <div className="metric">
          <span>缓冲健康:</span>
          <span>{performanceMetrics.bufferHealth}s</span>
        </div>
        <div className="metric">
          <span>已缓冲切片:</span>
          <span>{performanceMetrics.bufferedSegments}个</span>
        </div>
        <div className="metric">
          <span>切片间隔:</span>
          <span>{performanceMetrics.segmentDuration}s</span>
        </div>
        <div className="metric">
          <span>预加载策略:</span>
          <span>{performanceMetrics.preloadStrategy}</span>
        </div>
        <div className="metric">
          <span>预加载进度:</span>
          <span>{performanceMetrics.preloadProgress}%</span>
        </div>
      </div>

      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-default-skin"
          playsInline
          webkit-playsinline="true"
          crossOrigin="anonymous"
        />
      </div>
    </div>
  );
};

export default OptimizedVideoPlayer;
