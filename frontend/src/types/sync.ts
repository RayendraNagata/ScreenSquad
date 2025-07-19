// TypeScript interfaces for video synchronization

/**
 * Result object returned by adjustPlayback function
 */
export interface SyncResult {
  /** Adjusted video position in seconds */
  adjustedPosition: number;
  
  /** Measured latency in milliseconds */
  latency: number;
  
  /** Applied correction amount in milliseconds */
  correction: number;
  
  /** Whether adjustment was actually applied */
  applied: boolean;
  
  /** Error message if adjustment failed */
  error?: string;
}

/**
 * Triangular latency measurement result
 */
export interface TriangularLatencyResult {
  /** Calculated latency in milliseconds */
  latency: number;
  
  /** Server timestamp when pong was sent */
  serverTime: number;
  
  /** Total round trip time in milliseconds */
  roundTripTime: number;
}

/**
 * Ring buffer structure for latency history
 */
export interface LatencyRingBuffer {
  /** Fixed-size buffer array (5 elements) */
  buffer: number[];
  
  /** Current write index */
  index: number;
  
  /** Current number of valid measurements */
  size: number;
}

/**
 * Video sync configuration
 */
export interface SyncConfig {
  /** Maximum correction threshold in seconds (default: 0.5) */
  maxCorrectionSeconds?: number;
  
  /** Minimum correction threshold in seconds (default: 0.05) */
  minCorrectionSeconds?: number;
  
  /** Ring buffer size for latency history (default: 5) */
  ringBufferSize?: number;
}

/**
 * Extended HTMLVideoElement with sync capabilities
 */
export interface SyncableVideoElement extends HTMLVideoElement {
  /** Last sync timestamp */
  lastSyncTime?: number;
  
  /** Applied correction amount */
  lastCorrection?: number;
}
