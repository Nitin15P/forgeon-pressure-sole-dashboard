import React, { useState, useRef } from 'react';

interface InfoPopoverProps {
    title: string;
    content: React.ReactNode;
    containerClassName?: string;
}

const InfoPopover: React.FC<InfoPopoverProps> = ({ title, content, containerClassName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    return (
        <div
            className={`info-popover-container ${containerClassName || ''}`}
            ref={popoverRef}
            style={{ position: 'relative', display: 'inline-block', marginLeft: '8px' }}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button
                className="info-btn"
                aria-label="More information"
                style={{
                    background: 'none',
                    border: '1px solid var(--text-muted)',
                    color: 'var(--text-muted)',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    opacity: 0.7,
                    transition: 'all 0.2s'
                }}
            >
                i
            </button>

            {isOpen && (
                <div className="popover-content" style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: '8px',
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-md)',
                    zIndex: 100,
                    width: '280px',
                    textAlign: 'left',
                    pointerEvents: 'none' /* Optional: usually good to disable if just a tooltip, but if user wants to select text keep it */
                }}>
                    <h4 className="text-sm font-bold mb-xs" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
                        {title}
                    </h4>
                    <div className="text-xs text-muted">
                        {content}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InfoPopover;
