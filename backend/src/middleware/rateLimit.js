import rateLimit from 'express-rate-limit';

/**
 * Rate limiting middleware untuk berbagai endpoint
 */

// Rate limit untuk pembuatan squad/room - lebih ketat
export const createSquadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // maksimal 5 squad per 15 menit per IP
  message: {
    error: 'Too many squads created',
    message: 'Too many squads created from this IP. Please try again after 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Custom handler untuk rate limit exceeded
  handler: (req, res, next, options) => {
    console.log(`Rate limit exceeded for IP: ${req.ip}, User: ${req.user?.userId || 'anonymous'}`);
    res.status(options.statusCode).json(options.message);
  },
  // Skip successful requests untuk reset counter lebih cepat
  skipSuccessfulRequests: false,
  // Skip failed requests
  skipFailedRequests: true,
});

// Rate limit untuk join squad - sedang
export const joinSquadRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 menit
  max: 10, // maksimal 10 join attempts per 5 menit
  message: {
    error: 'Too many join attempts',
    message: 'Too many squad join attempts. Please try again after 5 minutes.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit untuk invite - sedang
export const inviteRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 menit
  max: 20, // maksimal 20 invites per 10 menit
  message: {
    error: 'Too many invites sent',
    message: 'Too many invitations sent. Please try again after 10 minutes.',
    retryAfter: '10 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit umum untuk semua POST requests - lebih longgar
export const generalPostRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 30, // maksimal 30 POST requests per menit
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP. Please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip untuk requests yang sudah di-rate limit oleh middleware lain
  skip: (req) => {
    // Skip jika request sudah melewati rate limit lain
    return req.rateLimit?.used !== undefined;
  }
});

// Rate limit untuk authentication endpoints - ketat
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // maksimal 10 login/register attempts per 15 menit
  message: {
    error: 'Too many authentication attempts',
    message: 'Too many login/register attempts. Please try again after 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit untuk video upload/streaming endpoints - sedang-ketat
export const videoRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 menit
  max: 15, // maksimal 15 video operations per 5 menit
  message: {
    error: 'Too many video operations',
    message: 'Too many video upload/sync operations. Please try again after 5 minutes.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export default {
  createSquadRateLimit,
  joinSquadRateLimit,
  inviteRateLimit,
  generalPostRateLimit,
  authRateLimit,
  videoRateLimit
};
