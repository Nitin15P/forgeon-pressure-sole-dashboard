import React, { useState } from 'react';

interface RawDataViewerProps {
    data: any;
    title?: string;
}

const RawDataViewer: React.FC<RawDataViewerProps> = ({ data, title = 'Raw Data' }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="raw-data-viewer">
            <div className="card">
                <div className="flex justify-between items-center mb-md">
                    <h3 className="card-title" style={{ marginBottom: 0 }}>{title}</h3>
                    <div className="flex gap-sm">
                        <button className="btn btn-secondary" onClick={handleCopy}>
                            {copied ? '✓ Copied!' : '📋 Copy'}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? '▲ Collapse' : '▼ Expand'}
                        </button>
                    </div>
                </div>

                {isExpanded && (
                    <div
                        className="raw-data-content"
                        style={{
                            background: 'var(--dark-bg)',
                            color: 'var(--text-light)',
                            padding: 'var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'auto',
                            maxHeight: '600px',
                            fontFamily: 'monospace',
                            fontSize: 'var(--font-size-sm)',
                            lineHeight: '1.5',
                        }}
                    >
                        <pre style={{ margin: 0 }}>
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RawDataViewer;
