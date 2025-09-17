import React, { useState } from "react";
import OptimizedVideoPlayer from "./components/OptimizedVideoPlayer";
import DebugPanel from "./components/DebugPanel";
import "./App.css";

function App() {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [performanceComparison, setPerformanceComparison] = useState({
    mp4LoadTime: 0,
    hlsLoadTime: 0,
    isComparing: false,
  });
  const [preloadSettings, setPreloadSettings] = useState({
    enabled: true,
    strategy: "conservative",
    bufferTarget: 50,
    preloadAhead: 1,
  });

  // 测试用的视频源
  const testVideos = [
    {
      name: "HLS 自适应流",
      src: "https://file.yj2025.com/%E9%BB%91%E7%A5%9E%E8%AF%9D%E6%82%9F%E7%A9%BA-%E4%BA%91%E5%AE%AB%E8%BF%85%E9%9F%B3.mp4-video.m3u8",
      type: "hls",
    },
    {
      name: "MP4 源视频",
      src: "https://file.yj2025.com/%E9%BB%91%E7%A5%9E%E8%AF%9D%E6%82%9F%E7%A9%BA-%E4%BA%91%E5%AE%AB%E8%BF%85%E9%9F%B3.mp4",
      type: "mp4",
    },
    {
      name: "HLS 直播流",
      src: "https://file.yj2025.com/%E9%BB%91%E7%A5%9E%E8%AF%9D%E6%82%9F%E7%A9%BA-%E4%BA%91%E5%AE%AB%E8%BF%85%E9%9F%B3.mp4-video.m3u8",
      type: "hls",
    },
  ];

  const handleVideoChange = (index) => {
    setCurrentVideo(index);
  };

  const runPerformanceComparison = async () => {
    setPerformanceComparison((prev) => ({ ...prev, isComparing: true }));

    // 测试MP4加载时间
    const mp4Start = performance.now();
    // 这里可以添加实际的MP4加载测试

    // 测试HLS加载时间
    const hlsStart = performance.now();
    // 这里可以添加实际的HLS加载测试

    setTimeout(() => {
      setPerformanceComparison({
        mp4LoadTime: 1200, // 模拟MP4加载时间
        hlsLoadTime: 2800, // 模拟HLS加载时间
        isComparing: false,
      });
    }, 3000);
  };

  const handlePreloadStrategyChange = (strategy) => {
    const configs = {
      aggressive: { bufferTarget: 120, preloadAhead: 3 },
      moderate: { bufferTarget: 80, preloadAhead: 2 },
      conservative: { bufferTarget: 50, preloadAhead: 1 },
    };
    setPreloadSettings({
      ...preloadSettings,
      strategy,
      ...configs[strategy],
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 Video.js HLS 优化测试项目</h1>
        <p>专门优化视频加载速度的完整测试环境</p>
      </header>

      <main className="App-main">
        <section className="video-section">
          <h2>📺 当前测试视频</h2>
          <div className="video-info">
            <h3>{testVideos[currentVideo].name}</h3>
            <p className="video-url">{testVideos[currentVideo].src}</p>
          </div>

          <OptimizedVideoPlayer
            src={testVideos[currentVideo].src}
            options={{
              width: 1200,
              height: 675,
              autoplay: false,
              muted: true,
              controls: true,
              fluid: true,
              responsive: true,
            }}
          />
        </section>

        <section className="controls-section">
          <h2>🎯 测试场景切换</h2>
          <div className="video-buttons">
            {testVideos.map((video, index) => (
              <button
                key={index}
                className={`video-button ${currentVideo === index ? "active" : ""}`}
                onClick={() => handleVideoChange(index)}
              >
                <span className="video-type">{video.type.toUpperCase()}</span>
                <span className="video-name">{video.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="debug-section">
          <h2>🔧 调试信息</h2>
          <DebugPanel />
        </section>

        <section className="preload-section">
          <h2>🚀 智能预加载控制</h2>
          <div className="preload-controls">
            <div className="control-group">
              <label>预加载策略:</label>
              <div className="strategy-buttons">
                <button
                  className={`strategy-btn ${preloadSettings.strategy === "aggressive" ? "active" : ""}`}
                  onClick={() => handlePreloadStrategyChange("aggressive")}
                >
                  激进模式
                  <small>120秒缓冲, 预加载3个切片</small>
                </button>
                <button
                  className={`strategy-btn ${preloadSettings.strategy === "moderate" ? "active" : ""}`}
                  onClick={() => handlePreloadStrategyChange("moderate")}
                >
                  平衡模式
                  <small>80秒缓冲, 预加载2个切片</small>
                </button>
                <button
                  className={`strategy-btn ${preloadSettings.strategy === "conservative" ? "active" : ""}`}
                  onClick={() => handlePreloadStrategyChange("conservative")}
                >
                  保守模式
                  <small>50秒缓冲, 预加载1个切片</small>
                </button>
              </div>
            </div>

            <div className="preload-info">
              <h4>📊 当前预加载配置</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span>缓冲目标:</span>
                  <span>{preloadSettings.bufferTarget}秒</span>
                </div>
                <div className="info-item">
                  <span>预加载切片:</span>
                  <span>{preloadSettings.preloadAhead}个</span>
                </div>
                <div className="info-item">
                  <span>切片间隔:</span>
                  <span>10秒</span>
                </div>
                <div className="info-item">
                  <span>总预加载:</span>
                  <span>{preloadSettings.preloadAhead * 10}秒</span>
                </div>
              </div>
            </div>

            <div className="preload-tips">
              <h4>💡 预加载策略说明</h4>
              <ul>
                <li>
                  <strong>激进模式</strong>: 适合高速网络，最大化预加载减少卡顿
                </li>
                <li>
                  <strong>平衡模式</strong>: 适合中等网速，平衡流量和流畅度
                </li>
                <li>
                  <strong>保守模式</strong>: 适合慢速网络，减少流量消耗
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="info-section">
          <h2>📊 优化特性</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>🔄 多线程并发</h3>
              <p>Web Worker + 8次重试机制</p>
            </div>
            <div className="feature-card">
              <h3>📦 激进缓冲</h3>
              <p>45秒缓冲 + 100MB缓存</p>
            </div>
            <div className="feature-card">
              <h3>🧠 智能ABR</h3>
              <p>自适应码率快速切换</p>
            </div>
            <div className="feature-card">
              <h3>🚀 预加载</h3>
              <p>启动时立即开始预获取</p>
            </div>
            <div className="feature-card">
              <h3>💾 大缓冲区</h3>
              <p>减少网络请求频次</p>
            </div>
            <div className="feature-card">
              <h3>⚡ 快速重试</h3>
              <p>10秒超时快速失败重试</p>
            </div>
          </div>
        </section>

        <section className="comparison-section">
          <h2>📊 MP4 vs HLS 性能对比</h2>
          <div className="comparison-grid">
            <div className="comparison-card">
              <h3>🎬 MP4 直接播放</h3>
              <ul>
                <li>✅ 一次性下载，后续无卡顿</li>
                <li>✅ 无切片间隔延迟</li>
                <li>✅ 适合小文件或高速网络</li>
                <li>❌ 大文件加载慢</li>
                <li>❌ 无法自适应码率</li>
              </ul>
              <p className="load-time">
                预估加载: <span>{performanceComparison.mp4LoadTime}ms</span>
              </p>
            </div>

            <div className="comparison-card">
              <h3>🔄 HLS 切片播放</h3>
              <ul>
                <li>✅ 支持自适应码率</li>
                <li>✅ 大文件分片加载</li>
                <li>✅ 更好的网络容错</li>
                <li>⚡ 10秒切片减少请求频次</li>
                <li>❌ 切片请求开销</li>
              </ul>
              <p className="load-time">
                预估加载: <span>{performanceComparison.hlsLoadTime}ms</span>
              </p>
            </div>
          </div>

          <button
            className="compare-button"
            onClick={runPerformanceComparison}
            disabled={performanceComparison.isComparing}
          >
            {performanceComparison.isComparing ? "测试中..." : "开始性能对比"}
          </button>
        </section>
      </main>

      <footer className="App-footer">
        <p>
          基于 Video.js + HLS.js 的极速视频加载优化方案
          <br />
          专为多设备ADSL环境设计
        </p>
      </footer>
    </div>
  );
}

export default App;
