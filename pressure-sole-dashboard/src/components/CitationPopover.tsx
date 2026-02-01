import React, { useState, useRef, useEffect } from 'react';
import { getCitationsForDrill, type Citation } from '../data/researchCitations';

interface CitationPopoverProps {
    drillName: string;
}

const CitationPopover: React.FC<CitationPopoverProps> = ({ drillName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLSpanElement>(null);

    const research = getCitationsForDrill(drillName);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setIsPinned(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    if (!research) {
        return null;
    }

    const handleMouseEnter = () => {
        if (!isPinned) {
            setIsOpen(true);
        }
    };

    const handleMouseLeave = () => {
        if (!isPinned) {
            setIsOpen(false);
        }
    };

    const handleClick = () => {
        setIsPinned(!isPinned);
        setIsOpen(true);
    };

    return (
        <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <span
                ref={triggerRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
                style={{
                    cursor: 'pointer',
                    marginLeft: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    color: isPinned ? 'var(--primary-orange)' : 'var(--text-muted)',
                    fontSize: '0.85rem',
                    transition: 'color 0.2s'
                }}
                title="View research sources"
            >
                📚{research.citations.length}
            </span>

            {isOpen && (
                <div
                    ref={popoverRef}
                    style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginBottom: '8px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        padding: 'var(--spacing-md)',
                        zIndex: 1000,
                        minWidth: '350px',
                        maxWidth: '450px',
                        maxHeight: '400px',
                        overflowY: 'auto'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-dark)' }}>
                            📚 Research Sources
                        </h4>
                        <button
                            onClick={() => { setIsOpen(false); setIsPinned(false); }}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                color: 'var(--text-muted)',
                                padding: '0 4px'
                            }}
                        >
                            ×
                        </button>
                    </div>

                    <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#666666', marginBottom: '4px' }}>Key Finding</div>
                        <div style={{ fontSize: '0.85rem', color: '#1a1a1a', lineHeight: '1.4' }}>
                            {research.keyFinding}
                        </div>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        Click to pin this popover open
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {research.citations.map((citation, idx) => (
                            <CitationItem key={idx} citation={citation} index={idx + 1} />
                        ))}
                    </div>
                </div>
            )}
        </span>
    );
};

interface CitationItemProps {
    citation: Citation;
    index: number;
}

const CitationItem: React.FC<CitationItemProps> = ({ citation, index }) => {
    return (
        <div style={{
            padding: '8px',
            borderLeft: '3px solid var(--primary-orange)',
            backgroundColor: '#f5f5f5',
            borderRadius: '0 6px 6px 0'
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{
                    backgroundColor: 'var(--primary-orange)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    flexShrink: 0
                }}>
                    {index}
                </span>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dark)', fontWeight: 500, marginBottom: '2px' }}>
                        {citation.authors.split(',')[0].split('&')[0].trim()} ({citation.year})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontStyle: 'italic' }}>
                        {citation.journal}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dark)', lineHeight: '1.3' }}>
                        {citation.relevance}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CitationPopover;
