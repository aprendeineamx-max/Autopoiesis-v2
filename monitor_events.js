#!/usr/bin/env node

/**
 * EVENT MONITOR - Watch API_EVENTS_LOG.json for changes
 * 
 * This script monitors the event log file and prints new events as they arrive.
 * Run this in a separate terminal to see events in real-time.
 */

const fs = require('fs');
const path = require('path');

const EVENT_LOG_PATH = path.join(__dirname, 'API_EVENTS_LOG.json');
let lastEventCount = 0;

console.log('🔍 Event Monitor Started');
console.log(`Watching: ${EVENT_LOG_PATH}`);
console.log('Waiting for events...\n');

// Initial read
if (fs.existsSync(EVENT_LOG_PATH)) {
    try {
        const data = JSON.parse(fs.readFileSync(EVENT_LOG_PATH, 'utf8'));
        lastEventCount = data.totalEvents || 0;
        console.log(`Found existing log with ${lastEventCount} events`);
    } catch (e) {
        console.log('No existing log found, starting fresh');
    }
}

// Watch for changes
fs.watchFile(EVENT_LOG_PATH, { interval: 500 }, (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
        try {
            const data = JSON.parse(fs.readFileSync(EVENT_LOG_PATH, 'utf8'));
            const currentCount = data.totalEvents || 0;

            if (currentCount > lastEventCount) {
                const newEvents = data.events.slice(lastEventCount);

                console.log(`\n📢 ${newEvents.length} New Event(s) - ${new Date().toLocaleTimeString()}`);
                console.log('━'.repeat(60));

                newEvents.forEach((evt, i) => {
                    console.log(`\n Event #${lastEventCount + i + 1}: ${evt.event}`);
                    console.log(`   Time: ${new Date(evt.timestamp).toLocaleTimeString()}`);
                    console.log(`   Data:`, JSON.stringify(evt.data, null, 2).split('\n').map(line => `         ${line}`).join('\n').trim());
                });

                console.log('\n' + '━'.repeat(60));
                console.log(`Total events: ${currentCount}`);

                lastEventCount = currentCount;
            }
        } catch (e) {
            console.error('Error reading log file:', e.message);
        }
    }
});

// Keep process alive
process.stdin.resume();

console.log('\n✅ Monitor is active. Press Ctrl+C to stop.\n');
