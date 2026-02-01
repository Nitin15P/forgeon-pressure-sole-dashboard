import React from 'react';
import type { PressureReport, Delivery, StanceMetricsFile } from '../types/pressure-report';
import { formatMetricLabel, formatValue, formatPattern, simplifyPattern } from '../utils/formatters';
import PhaseInsightCard from './PhaseInsightCard';
import RawAnalytics from './RawAnalytics';
import { aggregateSessionInsights, calculateSessionHighlights } from '../utils/sessionAggregator';
import ReportGuide from './ReportGuide';
import CoachSynthesis from './CoachSynthesis';

interface SessionSummaryProps {
    report: PressureReport;
    stanceMetrics?: StanceMetricsFile;
    onViewDeliveries: () => void;
    onSelectDelivery: (delivery: Delivery) => void;
}

const SessionSummary: React.FC<SessionSummaryProps> = ({ report, stanceMetrics, onSelectDelivery }) => {
    const { athlete, session_meta, deliveries } = report;

    // Calculate session-level data
    const highlights = calculateSessionHighlights(report);
    const insights = aggregateSessionInsights(report);

    return (
        <div className="session-summary">
            {/* Header / Banner */}
            <div className="card mb-xl orange-banner" style={{
                background: 'var(--primary-orange)',
                color: 'var(--text-light)',
                position: 'relative',
                zIndex: 50 /* Ensure popovers stay above subsequent cards */
            }}>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--text-light)' }}>
                            Pressure Sole Analytics
                        </h1>
                        <p className="text-lg" style={{ opacity: 0.9 }}>
                            Session Analysis for {athlete.name}
                        </p>
                    </div>
                    <ReportGuide />
                </div>
            </div>

            {/* Athlete Information */}
            <div className="card mb-lg" style={{ background: 'linear-gradient(to right, #ffffff, var(--bg-secondary))', borderLeft: '4px solid var(--primary)' }}>
                <div className="flex justify-between items-center mb-md">
                    <h2 className="card-title" style={{ margin: 0 }}>Athlete Profile</h2>
                    <div className="text-sm font-bold" style={{ color: 'var(--primary)', opacity: 0.8 }}>
                        PLAYER ID: {athlete.player_id || (() => {
                            const initials = athlete.name.split(' ').map(n => n[0]).join('').toUpperCase();
                            let hash = 0;
                            for (let i = 0; i < athlete.name.length; i++) {
                                hash = ((hash << 5) - hash) + athlete.name.charCodeAt(i);
                                hash |= 0;
                            }
                            const stableNum = Math.abs(hash % 1000);
                            return `${initials}-${stableNum}`;
                        })()}
                    </div>
                </div>
                <div className="flex items-center gap-xl" style={{ padding: '4px 0' }}>
                    <div style={{ flex: '1.2' }}>
                        <div className="text-xs text-muted mb-xs" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{formatMetricLabel('name')}</div>
                        <div className="text-lg font-bold">{athlete.name}</div>
                    </div>

                    <div style={{ flex: '0.8' }}>
                        <div className="text-xs text-muted mb-xs" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{formatMetricLabel('height_cm')}</div>
                        <div className="text-lg font-bold">{formatValue('height_cm', athlete.height_cm)}</div>
                    </div>

                    <div style={{ flex: '0.8' }}>
                        <div className="text-xs text-muted mb-xs" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{formatMetricLabel('weight_kg')}</div>
                        <div className="text-lg font-bold">{formatValue('weight_kg', athlete.weight_kg)}</div>
                    </div>

                    <div style={{ flex: '1' }}>
                        <div className="text-xs text-muted mb-xs" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{formatMetricLabel('bowling_style')}</div>
                        <div className="flex items-center gap-xs">
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span>
                            <div className="text-lg font-bold" style={{ textTransform: 'capitalize' }}>{athlete.bowling_style}</div>
                        </div>
                    </div>

                    <div style={{ flex: '1' }}>
                        <div className="text-xs text-muted mb-xs" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{formatMetricLabel('dominant_arm')}</div>
                        <div className="flex items-center gap-xs">
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--info)' }}></span>
                            <div className="text-lg font-bold" style={{ textTransform: 'capitalize' }}>{athlete.dominant_arm}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Session Information */}
            <div className="card mb-xl">
                <div className="flex justify-between items-center mb-md">
                    <h2 className="card-title" style={{ margin: 0 }}>Session Information</h2>
                    <div className="flex gap-md">
                        <div className="text-sm">
                            <span className="text-muted">Session ID: </span>
                            <span className="font-bold" style={{ color: 'var(--primary-orange)', letterSpacing: '1px', fontSize: '0.9rem' }}>
                                {session_meta.session_id}
                            </span>
                        </div>
                        <div className="text-sm">
                            <span className="text-muted">Surface: </span>
                            <span className="font-bold" style={{ textTransform: 'capitalize' }}>{session_meta.surface}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-4 gap-md">
                    <div className="text-center">
                        <div className="text-sm text-muted mb-xs">Total Deliveries</div>
                        <div className="text-3xl font-bold" style={{ color: 'var(--primary-orange)' }}>
                            {highlights.totalDeliveries}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-muted mb-xs">Usable Deliveries</div>
                        <div className="text-3xl font-bold" style={{ color: 'var(--success)' }}>
                            {highlights.usableDeliveries}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-muted mb-xs">Avg Back-Foot Contact</div>
                        <div className="text-2xl font-bold">
                            {formatValue('ct_s', highlights.avgBFCContact)}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-muted mb-xs">Avg Front-Foot Contact</div>
                        <div className="text-2xl font-bold">
                            {formatValue('ct_s', highlights.avgFFCContact)}
                        </div>
                    </div>
                </div>
                <div className="divider"></div>
                <div className="grid grid-2 gap-md">
                    <div>
                        <div className="text-sm text-muted mb-xs">Dominant BFC Pattern</div>
                        <div className="badge badge-info">{highlights.dominantBFCPattern.replace(/_/g, ' ')}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted mb-xs">Dominant FFC Pattern</div>
                        <div className="badge badge-info">{highlights.dominantFFCPattern.replace(/_/g, ' ')}</div>
                    </div>
                </div>

            </div>

            {/* Coach Synthesis Layer */}
            <div className="mb-xl">
                <CoachSynthesis report={report} />
            </div>

            {/* Session Insights */}
            <div className="analytical-insights mb-xl">
                <h2 className="mb-lg">Session Insights</h2>
                <div className="grid grid-3 gap-lg">
                    <PhaseInsightCard
                        phase="RUNUP_LAST"
                        phaseName="Run-Up"
                        insight={insights.RUNUP_LAST}
                    />
                    <PhaseInsightCard
                        phase="BFC"
                        phaseName="Back-Foot Contact"
                        insight={insights.BFC}
                    />
                    <PhaseInsightCard
                        phase="FFC"
                        phaseName="Front-Foot Contact"
                        insight={insights.FFC}
                    />
                </div>
            </div>
            {/* Individual Deliveries Grid */}
            <div className="deliveries-grid-section mb-xl">
                <h2 className="mb-lg">Individual Deliveries</h2>
                <div className="grid grid-6 gap-md">
                    {deliveries.map((delivery) => {
                        const statusColor = delivery.usable_delivery ? 'var(--success)' : 'var(--error)';

                        // Find run-up pattern if stanceMetrics is provided
                        let runupPattern = 'Neutral';
                        if (stanceMetrics) {
                            const ballStances = stanceMetrics.balls.find(b => b.ball_id === delivery.ball_id);
                            const runupStance = ballStances?.stance_metrics.Left.find(s => s.phase === 'RUNUP_LAST') ||
                                ballStances?.stance_metrics.Right.find(s => s.phase === 'RUNUP_LAST');

                            if (runupStance) {
                                if (runupStance.pattern) {
                                    runupPattern = simplifyPattern(runupStance.pattern);
                                } else if (runupStance.ui?.insights && runupStance.ui.insights.length > 0) {
                                    runupPattern = simplifyPattern(runupStance.ui.insights[0].title);
                                } else if (runupStance.ui?.tags && runupStance.ui.tags.length > 0) {
                                    runupPattern = simplifyPattern(runupStance.ui.tags[0]);
                                }
                            }
                        }

                        const bfcPattern = formatPattern(delivery.phase_summary.BFC.pattern);
                        const ffcPattern = formatPattern(delivery.phase_summary.FFC.pattern);

                        return (
                            <div
                                key={delivery.ball_id}
                                className="card"
                                onClick={() => onSelectDelivery(delivery)}
                                style={{
                                    cursor: 'pointer',
                                    padding: 'var(--spacing-md)',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    border: `1px solid ${delivery.usable_delivery ? 'var(--border)' : 'var(--error-light)'}`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    height: '100%'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>Ball {delivery.ball_id}</span>
                                    <div style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        backgroundColor: statusColor
                                    }} />
                                </div>

                                <div className="divider" style={{ margin: '0' }}></div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem' }}>
                                    <div className="text-xs text-muted" style={{ marginTop: '4px' }}>
                                        <span className="font-bold">Run Up Pattern:</span> {runupPattern}
                                    </div>
                                    <div className="text-xs text-muted">
                                        <span className="font-bold">BFC Pattern:</span> {bfcPattern}
                                    </div>
                                    <div className="text-xs text-muted">
                                        <span className="font-bold">FFC Pattern:</span> {ffcPattern}
                                    </div>
                                    <div style={{ marginTop: '4px' }}>
                                        <span className="text-muted">Interpretation:</span>{' '}
                                        <div className="font-bold" style={{ color: 'var(--text-dark)', lineHeight: '1.2' }}>
                                            {delivery.interpretation.label}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Raw Analytics */}
            {report.analytics_raw && (
                <RawAnalytics analyticsRaw={report.analytics_raw} />
            )}
        </div>
    );
};

export default SessionSummary;
