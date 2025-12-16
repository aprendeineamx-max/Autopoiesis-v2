/**
 * Extract rate limit information from response headers
 * Compatible with SambaNova rate limit headers
 */
extractRateLimits(headers) {
    if (!headers) return null;

    const rateLimits = {};

    // SambaNova-style headers
    if (headers['x-ratelimit-limit-requests']) {
        rateLimits.limitRequests = parseInt(headers['x-ratelimit-limit-requests']);
        rateLimits.remainingRequests = parseInt(headers['x-ratelimit-remaining-requests'] || 0);
        rateLimits.resetRequests = headers['x-ratelimit-reset-requests'];
    }

    if (headers['x-ratelimit-limit-requests-day']) {
        rateLimits.limitRequestsDay = parseInt(headers['x-ratelimit-limit-requests-day']);
        rateLimits.remainingRequestsDay = parseInt(headers['x-ratelimit-remaining-requests-day'] || 0);
        rateLimits.resetRequestsDay = headers['x-ratelimit-reset-requests-day'];
    }

    return Object.keys(rateLimits).length > 0 ? rateLimits : null;
}
