import React from 'react';
import InfoPopover from './InfoPopover';

interface ReportGuideProps { }

const ReportGuide: React.FC<ReportGuideProps> = () => {
    const guideContent = (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--spacing-xl)', minWidth: '550px' }}>
            {/* Column 1: Core Concepts */}
            <div>
                <h4 style={{ color: 'var(--primary)', marginBottom: 'var(--spacing-sm)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Key Concepts</h4>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, listStyleType: 'disc', fontSize: '0.85rem' }}>
                    <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                        <strong>Focus Phases:</strong> BFC (Back-Foot Contact) & FFC (Front-Foot Contact).
                        <div className="text-xs text-muted" style={{ marginTop: '2px' }}>Ignore 'Runup' and 'Bound' for analysis.</div>
                    </li>
                    <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                        <strong>Relative Values:</strong> All numbers relative to <em>this athlete, this session</em>.
                        <div className="text-xs text-muted" style={{ marginTop: '2px' }}>Not calibrated to external force plates.</div>
                    </li>
                    <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                        <strong>Bands (Low/High):</strong> Percentile-based for this session.
                        <div className="text-xs text-muted" style={{ marginTop: '2px' }}>"Low" means low for YOU today.</div>
                    </li>
                </ul>
            </div>

            {/* Column 2: Glossary */}
            <div>
                <h4 style={{ color: 'var(--primary)', marginBottom: 'var(--spacing-sm)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Metric Glossary</h4>
                <div style={{ display: 'grid', gap: 'var(--spacing-sm)', fontSize: '0.85rem' }}>
                    <div><strong>CT:</strong> Contact Time (Lower = Faster/Stiffer)</div>
                    <div><strong>Impulse:</strong> Total energy put into ground</div>
                    <div><strong>Loading Rate:</strong> Sharpness of impact/bracing</div>
                    <div><strong>Heel Share:</strong> Fraction of load on heel (1.0=All)</div>
                    <div><strong>M-L Balance:</strong> Medial vs Lateral (0=Out, 1=In)</div>
                    <div><strong>H-to-F Delay:</strong> Timing sequence (+ve=Heel 1st)</div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <InfoPopover
                title="How to Read This Report"
                content={guideContent}
                containerClassName="report-guide-popover"
            />
            <style>{`
                .report-guide-popover .info-btn {
                    border: 1px solid rgba(255, 255, 255, 0.4) !important;
                    color: white !important;
                    width: 20px !important;
                    height: 20px !important;
                    background: rgba(255, 255, 255, 0.1) !important;
                }
                .report-guide-popover .info-btn:hover {
                    background: rgba(255, 255, 255, 0.2) !important;
                    border-color: white !important;
                }
                .report-guide-popover .popover-content {
                    width: auto !important;
                    max-width: 600px !important;
                    right: 0 !important;
                    left: auto !important;
                    transform: none !important;
                    background-color: #ffffff !important; /* Force solid white */
                    background-image: none !important;
                    opacity: 1 !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.25) !important;
                    padding: 24px !important;
                    z-index: 1000 !important;
                    border: 1px solid var(--border) !important;
                }
            `}</style>
        </div>
    );
};

export default ReportGuide;
