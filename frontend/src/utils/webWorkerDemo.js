/**
 * WebWorker Demo Script
 * Untuk testing dan demo functionality WebWorker
 */

import VideoSyncWorkerManager from '../utils/VideoSyncWorkerManager';

// Demo configuration
const DEMO_CONFIG = {
  maxCorrection: 500,
  syncThreshold: 100,
  latencyWeight: 0.7,
  driftWeight: 0.3
};

class WebWorkerDemo {
  constructor() {
    this.workerManager = null;
    this.demoRunning = false;
    this.intervalId = null;
  }

  async initialize() {
    try {
      console.log('🚀 Initializing VideoSync WebWorker Demo...');
      
      this.workerManager = new VideoSyncWorkerManager();
      await this.workerManager.init(DEMO_CONFIG);
      
      console.log('✅ WebWorker initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ WebWorker initialization failed:', error);
      return false;
    }
  }

  async runLatencyDemo() {
    console.log('\n📡 Running Latency Measurement Demo...');
    
    for (let i = 0; i < 5; i++) {
      const pingTime = performance.now();
      const serverTime = pingTime + Math.random() * 10 + 5; // Simulate server processing
      const pongTime = pingTime + Math.random() * 50 + 20; // Simulate network delay
      
      try {
        const result = await this.workerManager.calculateLatency(pingTime, serverTime, pongTime);
        console.log(`  Measurement ${i + 1}:`, {
          networkLatency: `${result.networkLatency.toFixed(2)}ms`,
          roundTripTime: `${result.roundTripTime.toFixed(2)}ms`,
          serverProcessingTime: `${result.serverProcessingTime.toFixed(2)}ms`
        });
        
        if (result.stats) {
          console.log(`  Stats: avg=${result.stats.average?.toFixed(2)}ms, jitter=${result.stats.jitter?.toFixed(2)}ms`);
        }
      } catch (error) {
        console.error(`  ❌ Measurement ${i + 1} failed:`, error.message);
      }
      
      // Wait between measurements
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  async runDriftDemo() {
    console.log('\n🎯 Running Drift Calculation Demo...');
    
    const scenarios = [
      { expected: 10.0, actual: 9.8, playbackRate: 1.0, description: 'Small drift behind' },
      { expected: 15.5, actual: 16.2, playbackRate: 1.0, description: 'Small drift ahead' },
      { expected: 30.0, actual: 28.5, playbackRate: 1.5, description: 'Drift with fast playback' },
      { expected: 45.0, actual: 47.3, playbackRate: 0.5, description: 'Drift with slow playback' },
      { expected: 60.0, actual: 65.8, playbackRate: 1.0, description: 'Large drift ahead' }
    ];
    
    for (const scenario of scenarios) {
      try {
        const result = await this.workerManager.calculateDrift(
          scenario.expected,
          scenario.actual,
          scenario.playbackRate
        );
        
        console.log(`  ${scenario.description}:`, {
          rawDrift: `${result.rawDrift.toFixed(3)}s`,
          adjustedDrift: `${result.adjustedDrift.toFixed(3)}s`,
          playbackRate: scenario.playbackRate
        });
        
        if (result.stats) {
          console.log(`    Stats: avg=${result.stats.average?.toFixed(3)}s, variance=${result.stats.variance?.toFixed(6)}`);
        }
      } catch (error) {
        console.error(`  ❌ ${scenario.description} failed:`, error.message);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async runAdjustmentDemo() {
    console.log('\n⚙️ Running Playback Adjustment Demo...');
    
    const scenarios = [
      { current: 10.0, target: 10.5, latency: 25, rate: 1.0, description: 'Small adjustment needed' },
      { current: 20.0, target: 18.5, latency: 50, rate: 1.0, description: 'Backward adjustment' },
      { current: 30.0, target: 32.0, latency: 15, rate: 1.5, description: 'Fast playback adjustment' },
      { current: 40.0, target: 35.0, latency: 100, rate: 1.0, description: 'Large backward adjustment' },
      { current: 50.0, target: 50.05, latency: 30, rate: 1.0, description: 'Minimal adjustment' }
    ];
    
    for (const scenario of scenarios) {
      try {
        const result = await this.workerManager.calculateAdjustment(
          scenario.current,
          scenario.target,
          scenario.latency / 1000, // Convert to seconds
          scenario.rate
        );
        
        console.log(`  ${scenario.description}:`, {
          currentTime: `${result.currentTime.toFixed(3)}s`,
          targetTime: `${result.targetTime.toFixed(3)}s`,
          correction: `${(result.correction * 1000).toFixed(1)}ms`,
          newPosition: `${result.newPosition.toFixed(3)}s`,
          method: result.adjustmentMethod,
          confidence: `${(result.confidence * 100).toFixed(1)}%`
        });
      } catch (error) {
        console.error(`  ❌ ${scenario.description} failed:`, error.message);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async runFullSyncDemo() {
    console.log('\n🔄 Running Full Sync Demo...');
    
    const syncData = {
      currentTime: 25.5,
      targetTime: 26.2,
      pingTime: performance.now(),
      serverTime: performance.now() + 8,
      pongTime: performance.now() + 45,
      playbackRate: 1.0
    };
    
    try {
      const result = await this.workerManager.performFullSync(syncData);
      
      console.log('  Full sync result:', {
        latency: result.latency ? `${result.latency.networkLatency.toFixed(2)}ms` : 'N/A',
        drift: result.drift ? `${(result.drift.adjustedDrift * 1000).toFixed(1)}ms` : 'N/A',
        adjustment: result.adjustment ? `${(result.adjustment.correction * 1000).toFixed(1)}ms` : 'N/A',
        method: result.adjustment?.adjustmentMethod || 'N/A',
        confidence: result.adjustment ? `${(result.adjustment.confidence * 100).toFixed(1)}%` : 'N/A',
        usingWorker: result.usingWorker
      });
    } catch (error) {
      console.error('  ❌ Full sync failed:', error.message);
    }
  }

  async runStatsDemo() {
    console.log('\n📊 Running Stats Demo...');
    
    try {
      const stats = await this.workerManager.getStats();
      
      console.log('  Worker Statistics:', {
        available: stats.available,
        latencyCount: stats.latency?.count || 0,
        driftCount: stats.drift?.count || 0,
        config: stats.config ? {
          maxCorrection: `${stats.config.maxCorrection}ms`,
          syncThreshold: `${stats.config.syncThreshold}ms`,
          latencyWeight: stats.config.latencyWeight,
          driftWeight: stats.config.driftWeight
        } : 'N/A'
      });
      
      if (stats.latency?.count > 0) {
        console.log('  Latency Stats:', {
          average: `${stats.latency.average.toFixed(2)}ms`,
          min: `${stats.latency.min.toFixed(2)}ms`,
          max: `${stats.latency.max.toFixed(2)}ms`,
          jitter: `${stats.latency.jitter.toFixed(2)}ms`
        });
      }
      
      if (stats.drift?.count > 0) {
        console.log('  Drift Stats:', {
          average: `${(stats.drift.average * 1000).toFixed(1)}ms`,
          variance: `${(stats.drift.variance * 1000000).toFixed(2)}ms²`,
          trend: `${(stats.drift.trend * 1000).toFixed(1)}ms/measurement`
        });
      }
    } catch (error) {
      console.error('  ❌ Stats demo failed:', error.message);
    }
  }

  async runPerformanceTest() {
    console.log('\n⚡ Running Performance Test...');
    
    const iterations = 100;
    const startTime = performance.now();
    
    try {
      const promises = [];
      
      for (let i = 0; i < iterations; i++) {
        promises.push(
          this.workerManager.calculateLatency(
            performance.now(),
            performance.now() + Math.random() * 10,
            performance.now() + Math.random() * 50 + 20
          )
        );
      }
      
      await Promise.all(promises);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      console.log(`  ✅ Processed ${iterations} calculations in ${totalTime.toFixed(2)}ms`);
      console.log(`  📈 Average: ${(totalTime / iterations).toFixed(3)}ms per calculation`);
      console.log(`  🚀 Throughput: ${((iterations / totalTime) * 1000).toFixed(0)} calculations/second`);
    } catch (error) {
      console.error('  ❌ Performance test failed:', error.message);
    }
  }

  async runCompleteDemo() {
    console.log('🎬 Starting Complete WebWorker Demo\n');
    
    const success = await this.initialize();
    if (!success) {
      console.log('❌ Demo aborted due to initialization failure');
      return;
    }
    
    await this.runLatencyDemo();
    await this.runDriftDemo();
    await this.runAdjustmentDemo();
    await this.runFullSyncDemo();
    await this.runStatsDemo();
    await this.runPerformanceTest();
    
    console.log('\n🏁 Demo completed successfully');
    console.log('💡 WebWorker is ready for production use!');
    
    this.cleanup();
  }

  cleanup() {
    if (this.workerManager) {
      this.workerManager.destroy();
      this.workerManager = null;
    }
    console.log('🧹 Demo cleanup completed');
  }
}

// Export for use in browser console or components
export default WebWorkerDemo;

// Auto-run demo when imported (optional)
if (typeof window !== 'undefined' && window.location.search.includes('demo=webworker')) {
  const demo = new WebWorkerDemo();
  demo.runCompleteDemo().catch(console.error);
}
