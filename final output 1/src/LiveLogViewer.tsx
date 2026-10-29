
import React, { useState, useEffect, useRef } from 'react';

// TypeScript Interface for Log Entries
export interface LogEntry {
    id: string;
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
}

type ConnectionStatus = 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED';

export const LiveLogViewer: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
    const [status, setStatus] = useState<ConnectionStatus>('DISCONNECTED');

    const retryDelayRef = useRef<number>(1000); // Initial 1s retry delay
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        let timerId: ReturnType<typeof setTimeout>;

        const connectSSE = () => {
            setStatus('RECONNECTING');

            // Connect to the mock SSE endpoint
            const es = new EventSource('http://localhost:4000/api/logs');
            eventSourceRef.current = es;

            es.onopen = () => {
                setStatus('CONNECTED');
                retryDelayRef.current = 1000; // Reset exponential backoff on successful connection
            };

            es.onmessage = (event) => {
                try {
                    const newLog: LogEntry = JSON.parse(event.data);
                    setLogs((prevLogs) => [newLog, ...prevLogs.slice(0, 99)]); // Keep latest 100 logs
                } catch (err) {
                    console.error('Failed to parse log event:', err);
                }
            };

            es.onerror = () => {
                setStatus('DISCONNECTED');
                es.close();

                // Exponential backoff logic: 1s -> 2s -> 4s (capped at 8s)
                const nextDelay = retryDelayRef.current;
                retryDelayRef.current = Math.min(retryDelayRef.current * 2, 8000);

                console.log(`Connection lost. Retrying in ${nextDelay / 1000} seconds...`);
                timerId = setTimeout(connectSSE, nextDelay);
            };
        };

        connectSSE();

        // Cleanup on component unmount
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
            clearTimeout(timerId);
        };
    }, []);

    // Filter logs by selected severity level
    const filteredLogs = logs.filter((log) => {
        if (filter === 'ALL') return true;
        return log.level === filter;
    });

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Live System Logs (SSE)</h2>

            {/* Connection Status Badge */}
            <div style={{ marginBottom: '15px' }}>
                <strong>Status: </strong>
                <span
                    style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        color: '#fff',
                        backgroundColor:
                            status === 'CONNECTED' ? '#2e7d32' : status === 'RECONNECTING' ? '#ed6c02' : '#d32f2f',
                    }}
                >
                    {status}
                </span>
            </div>

            {/* Severity Filter Buttons */}
            <div style={{ marginBottom: '15px', display: 'flex', gap: '8px' }}>
                {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map((level) => (
                    <button
                        key={level}
                        onClick={() => setFilter(level)}
                        style={{
                            padding: '6px 12px',
                            cursor: 'pointer',
                            fontWeight: filter === level ? 'bold' : 'normal',
                            border: filter === level ? '2px solid #1976d2' : '1px solid #ccc',
                        }}
                    >
                        {level}
                    </button>
                ))}
            </div>

            {/* Log Feed */}
            <div
                style={{
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    height: '400px',
                    overflowY: 'auto',
                    padding: '10px',
                    backgroundColor: '#1e1e1e',
                    color: '#f1f1f1',
                }}
            >
                {filteredLogs.length === 0 ? (
                    <p>No log events received yet...</p>
                ) : (
                    filteredLogs.map((log) => (
                        <div key={log.id} style={{ marginBottom: '6px', fontSize: '13px' }}>
                            <span style={{ color: '#888', marginRight: '8px' }}>[{log.timestamp}]</span>
                            <span
                                style={{
                                    fontWeight: 'bold',
                                    marginRight: '8px',
                                    color:
                                        log.level === 'ERROR' ? '#ff5252' : log.level === 'WARN' ? '#ffd740' : '#69f0ae',
                                }}
                            >
                                [{log.level}]
                            </span>
                            <span>{log.message}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

