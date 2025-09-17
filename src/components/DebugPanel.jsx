import React, { useEffect, useState } from 'react';
import { useNetworkStatus, useDeviceInfo } from '../hooks/useVideoPerformance';

const DebugPanel = () => {
  const networkStatus = useNetworkStatus();
  const deviceInfo = useDeviceInfo();
  const [fps, setFps] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);

  useEffect(() => {
    // FPS 监控
    let lastTime = performance.now();
    let frames = 0;

    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frames * 1000) / (currentTime - lastTime)));
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };

    const fpsId = requestAnimationFrame(measureFPS);

    // 内存使用监控
    const updateMemoryUsage = () => {
      if (performance.memory) {
        const memory = performance.memory;
        const used = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
        setMemoryUsage(used);
      }
    };

    const memoryInterval = setInterval(updateMemoryUsage, 1000);

    return () => {
      cancelAnimationFrame(fpsId);
      clearInterval(memoryInterval);
    };
  }, []);

  return (
    <div className="debug-panel">
      <h3>🔧 实时调试信息</h3>
      
      <div className="debug-grid">
        <div className="debug-section">
          <h4>🌐 网络状态</h4>
          <div className="debug-item">
            <span>在线状态:</span>
            <span className={networkStatus.online ? 'status-online' : 'status-offline'}>
              {networkStatus.online ? '在线' : '离线'}
            </span>
          </div>
          <div className="debug-item">
            <span>连接类型:</span>
            <span>{networkStatus.connectionType}</span>
          </div>
          <div className="debug-item">
            <span>下行带宽:</span>
            <span>{networkStatus.downlink} Mbps</span>
          </div>
          <div className="debug-item">
            <span>有效类型:</span>
            <span>{networkStatus.effectiveType}</span>
          </div>
          <div className="debug-item">
            <span>往返时延:</span>
            <span>{networkStatus.rtt} ms</span>
          </div>
        </div>

        <div className="debug-section">
          <h4>📱 设备信息</h4>
          <div className="debug-item">
            <span>设备类型:</span>
            <span>
              {deviceInfo.isMobile ? '手机' : 
               deviceInfo.isTablet ? '平板' : '桌面'}
            </span>
          </div>
          <div className="debug-item">
            <span>屏幕尺寸:</span>
            <span>{deviceInfo.screenWidth} × {deviceInfo.screenHeight}</span>
          </div>
          <div className="debug-item">
            <span>像素密度:</span>
            <span>{deviceInfo.devicePixelRatio}x</span>
          </div>
          <div className="debug-item">
            <span>平台:</span>
            <span>{deviceInfo.platform}</span>
          </div>
        </div>

        <div className="debug-section">
          <h4>⚡ 性能指标</h4>
          <div className="debug-item">
            <span>帧率:</span>
            <span>{fps} FPS</span>
          </div>
          <div className="debug-item">
            <span>内存使用:</span>
            <span>{memoryUsage} MB</span>
          </div>
          {performance.memory && (
            <>
              <div className="debug-item">
                <span>内存限制:</span>
                <span>{(performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .debug-panel {
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          font-family: 'Courier New', monospace;
          font-size: 12px;
        }

        .debug-panel h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 14px;
        }

        .debug-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .debug-section {
          background: white;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
        }

        .debug-section h4 {
          margin: 0 0 10px 0;
          color: #667eea;
          font-size: 13px;
        }

        .debug-item {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          padding: 2px 0;
        }

        .debug-item span:first-child {
          color: #666;
        }

        .debug-item span:last-child {
          color: #333;
          font-weight: bold;
        }

        .status-online {
          color: #00c853;
        }

        .status-offline {
          color: #d32f2f;
        }

        @media (max-width: 768px) {
          .debug-grid {
            grid-template-columns: 1fr;
          }
          
          .debug-panel {
            font-size: 11px;
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default DebugPanel;