import React from 'react';
import type { PressureReport } from '../types/pressure-report';
import { generateCoachSynthesis } from '../utils/synthesisUtils';

import InfoPopover from './InfoPopover';

interface CoachSynthesisProps {
    report: PressureReport;
}

const definitions = {
    approach: (
        <ul style={{ paddingLeft: '1rem', margin: 0 }}>
            <li className="mb-xs"><strong>Rhythmic & Repeatable:</strong> High consistency. Momentum is maintained.</li>
            <li className="mb-xs"><strong>Established Rhythm:</strong> Moderate consistency. Functional but variable.</li>
            <li><strong>Variable Rhythm:</strong> Low consistency. Approach noise affecting entry.</li>
        </ul>
    ),
    entry: (
        <ul style={{ paddingLeft: '1rem', margin: 0 }}>
            <li className="mb-xs"><strong>Controlled Entry:</strong> Highly stable platform. Minimal chaos.</li>
            <li className="mb-xs"><strong>Variable Entry:</strong> Moderate stability. Platform holds but can shift.</li>
            <li><strong>Unstable Platform:</strong> Low stability. Chaos at contact forces corrections.</li>
        </ul>
    ),
    execution: (
        <ul style={{ paddingLeft: '1rem', margin: 0 }}>
            <li className="mb-xs"><strong>Stiff / Braking:</strong> Short contact time. High force acceptance.</li>
            <li className="mb-xs"><strong>Redirection:</strong> Balanced contact time. Momentum transfer focus.</li>
            <li><strong>Absorbing / Long:</strong> Long contact time. Energy leak through soft contact.</li>
        </ul>
    )
};

const CoachSynthesis: React.FC<CoachSynthesisProps> = ({ report }) => {
    const synthesis = generateCoachSynthesis(report);

    return (
        <div className="coach-synthesis mb-xl">
            {/* Top Level Session Narrative */}
            <div className="card bg-darker mb-lg" style={{ borderLeft: '4px solid var(--primary-orange)' }}>
                <h3 className="text-lg text-primary mb-xs">SESSION SUMMARY</h3>
                <p className="text-xl leading-relaxed font-medium">
                    "{synthesis.sessionNarrative}"
                </p>
            </div>

            {/* The 3 Buckets */}
            <div className="grid grid-3 gap-md">

                {/* Bucket 1: Approach */}
                <div className="card synthesis-bucket">
                    <div className="bucket-header mb-sm flex justify-between items-center">
                        <div>
                            <span className="badge badge-accent text-xs" style={{ color: 'var(--primary-orange)' }}>RUN-UP ANALYSIS</span>
                            <h3 className="text-lg mt-xs">{synthesis.approach.title}</h3>
                        </div>
                        <InfoPopover title="Analysis Signal Guide" content={definitions.approach} />
                    </div>
                    <div className="bucket-signal mb-sm">
                        <div className="text-sm text-muted" style={{ color: 'var(--primary-orange)', opacity: 0.8 }}>Primary Signal</div>
                        <div className="text-xl font-bold text-primary">{synthesis.approach.primarySignal}</div>
                    </div>
                    <p className="text-sm text-muted mb-md min-h-text">
                        {synthesis.approach.summary}
                    </p>
                    <div className="consistency-meter">
                        <div className="flex justify-between text-xs mb-xs">
                            <span className="text-muted">Consistency</span>
                            <span className={`font-bold ${getConsistencyColor(synthesis.approach.consistency)}`}>
                                {synthesis.approach.consistency}
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: getConsistencyWidth(synthesis.approach.consistency),
                                    backgroundColor: getConsistencyColorCode(synthesis.approach.consistency)
                                }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Bucket 2: Entry */}
                <div className="card synthesis-bucket">
                    <div className="bucket-header mb-sm flex justify-between items-center">
                        <div>
                            <span className="badge badge-accent text-xs" style={{ color: 'var(--primary-orange)' }}>BFC ANALYSIS</span>
                            <h3 className="text-lg mt-xs">{synthesis.entry.title}</h3>
                        </div>
                        <InfoPopover title="Analysis Signal Guide" content={definitions.entry} />
                    </div>
                    <div className="bucket-signal mb-sm">
                        <div className="text-sm text-muted" style={{ color: 'var(--primary-orange)', opacity: 0.8 }}>Quality Check</div>
                        <div className="text-xl font-bold text-primary">{synthesis.entry.primarySignal}</div>
                    </div>
                    <p className="text-sm text-muted mb-md min-h-text">
                        {synthesis.entry.summary}
                    </p>
                    <div className="consistency-meter">
                        <div className="flex justify-between text-xs mb-xs">
                            <span className="text-muted">Stability</span>
                            <span className={`font-bold ${getConsistencyColor(synthesis.entry.consistency)}`}>
                                {synthesis.entry.consistency}
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: getConsistencyWidth(synthesis.entry.consistency),
                                    backgroundColor: getConsistencyColorCode(synthesis.entry.consistency)
                                }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Bucket 3: Execution */}
                <div className="card synthesis-bucket">
                    <div className="bucket-header mb-sm flex justify-between items-center">
                        <div>
                            <span className="badge badge-accent text-xs" style={{ color: 'var(--primary-orange)' }}>FFC ANALYSIS</span>
                            <h3 className="text-lg mt-xs">{synthesis.execution.title}</h3>
                        </div>
                        <InfoPopover title="Analysis Signal Guide" content={definitions.execution} />
                    </div>
                    <div className="bucket-signal mb-sm">
                        <div className="text-sm text-muted" style={{ color: 'var(--primary-orange)', opacity: 0.8 }}>Mechanic Style</div>
                        <div className="text-xl font-bold text-primary">{synthesis.execution.primarySignal}</div>
                    </div>
                    <p className="text-sm text-muted mb-md min-h-text">
                        {synthesis.execution.summary}
                    </p>
                    <div className="consistency-meter">
                        <div className="flex justify-between text-xs mb-xs">
                            <span className="text-muted">Repeatability</span>
                            <span className={`font-bold ${getConsistencyColor(synthesis.execution.consistency)}`}>
                                {synthesis.execution.consistency}
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: getConsistencyWidth(synthesis.execution.consistency),
                                    backgroundColor: getConsistencyColorCode(synthesis.execution.consistency)
                                }}
                            ></div>
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
                .min-h-text {
                    min-height: 3rem;
                }
                .progress-bar {
                    height: 6px;
                    background: var(--bg-dark);
                    border-radius: 3px;
                    overflow: hidden;
                }
                .progress-fill {
                    height: 100%;
                    border-radius: 3px;
                }
                .badge-accent {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--text-muted);
                }
                .bg-darker {
                    background: var(--surface-card); /* Could darken if needed */
                }
            `}</style>
        </div>
    );
};

// Helpers for styling
function getConsistencyColor(level: string): string {
    switch (level) {
        case 'High': return 'text-success';
        case 'Moderate': return 'text-warning';
        case 'Low': return 'text-danger';
        default: return 'text-muted';
    }
}

function getConsistencyColorCode(level: string): string {
    switch (level) {
        case 'High': return 'var(--success)';
        case 'Moderate': return 'var(--warning)';
        case 'Low': return 'var(--error)'; // Assuming --error exists, or hardcode #ff4d4d
        default: return '#ccc';
    }
}

function getConsistencyWidth(level: string): string {
    switch (level) {
        case 'High': return '90%';
        case 'Moderate': return '60%';
        case 'Low': return '30%';
        default: return '0%';
    }
}

export default CoachSynthesis;
