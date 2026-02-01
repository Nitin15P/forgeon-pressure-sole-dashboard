import React, { useState, useMemo } from 'react';
import type { Delivery, StanceMetricsFile, CoPPoint, EventsFile, ContactEvent } from '../types/pressure-report';
import { cleanTerminology, formatPattern } from '../utils/formatters';
import PressureTimeGraph from './PressureTimeGraph';
import RegionalPressureTimeline from './RegionalPressureTimeline';
import PressureHeatmapSVG from './PressureHeatmapSVG';
import ReportGuide from './ReportGuide';
import CitationPopover from './CitationPopover';
import { hasCitations } from '../data/researchCitations';

interface DeliveryDetailProps {
    delivery: Delivery;
    stanceMetrics: StanceMetricsFile;
    eventsFile: EventsFile;
    onBack: () => void;
}

const DeliveryDetail: React.FC<DeliveryDetailProps> = ({ delivery, stanceMetrics, eventsFile, onBack }) => {
    const [activeTab, setActiveTab] = useState<'interpretation' | 'training'>('interpretation');

    // Auto-scroll to top when component mounts
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Extract stance data for this specific delivery
    const ballStanceData = useMemo(() => {
        return stanceMetrics.balls.find(ball => ball.ball_id === delivery.ball_id);
    }, [stanceMetrics, delivery.ball_id]);

    // Extract RUNUP_LAST stance for this delivery
    const runupLastStance = useMemo(() => {
        if (!ballStanceData) return null;
        const allStances = [...ballStanceData.stance_metrics.Left, ...ballStanceData.stance_metrics.Right];
        return allStances.find(s => s.phase === 'RUNUP_LAST');
    }, [ballStanceData]);

    // Extract events data for this specific delivery
    const ballEvents = useMemo(() => {
        return eventsFile.balls.find(ball => ball.ball_id === delivery.ball_id);
    }, [eventsFile, delivery.ball_id]);

    // Get ALL CoP trajectory data across all phases for the entire delivery, SYNCHRONIZED
    const { leftData, rightData, phaseMarkers } = useMemo(() => {
        if (!ballStanceData || !ballEvents) return { leftData: [], rightData: [], phaseMarkers: [] };

        // 1. Get Events Map for Sync
        const eventsMap = new Map<number, ContactEvent>(); // stance_id -> Event

        // Handle potentially different structure of events based on interface
        const leftEvents = Array.isArray(ballEvents.events)
            ? ballEvents.events.flatMap(e => e.Left || [])
            : ballEvents.events.Left || [];
        const rightEvents = Array.isArray(ballEvents.events)
            ? ballEvents.events.flatMap(e => e.Right || [])
            : ballEvents.events.Right || [];

        [...leftEvents, ...rightEvents].forEach(evt => {
            eventsMap.set(evt.stance_id, evt);
        });

        // 2. Find Global Start Time (First contact of either foot)
        let minTime = Infinity;
        eventsMap.forEach(evt => {
            if (evt.ic_ts_ms < minTime) minTime = evt.ic_ts_ms;
        });
        if (minTime === Infinity) minTime = 0;

        // 3. Process Left Foot Data
        const processFoot = (stances: any[]) => {
            const allPoints: CoPPoint[] = [];
            stances.forEach(stance => {
                const event = eventsMap.get(stance.stance_id);
                if (!event) return; // Should likely warn or skip

                // Offset = (Stance Absolute Start - Delivery Absolute Start)
                const offset = event.ic_ts_ms - minTime;

                stance.cop_trajectory.forEach((pt: any) => {
                    allPoints.push({
                        ...pt,
                        t_ms: pt.t_ms + offset // Shift to absolute timeline
                    });
                });
            });
            return allPoints.sort((a, b) => a.t_ms - b.t_ms);
        };

        const processedLeft = processFoot(ballStanceData.stance_metrics.Left);
        const processedRight = processFoot(ballStanceData.stance_metrics.Right);

        // 4. Generate Phase Markers
        const markers: any[] = [];
        // Identify BFC and FFC phases from stance data
        const bfcStances = [...ballStanceData.stance_metrics.Left, ...ballStanceData.stance_metrics.Right]
            .filter(s => s.phase === 'BFC'); // Typically BFC is one or few stances
        const ffcStances = [...ballStanceData.stance_metrics.Left, ...ballStanceData.stance_metrics.Right]
            .filter(s => s.phase === 'FFC');

        if (bfcStances.length > 0) {
            const startTimes = bfcStances.map(s => (eventsMap.get(s.stance_id)?.ic_ts_ms || 0) - minTime);
            const endTimes = bfcStances.map(s => (eventsMap.get(s.stance_id)?.to_ts_ms || 0) - minTime);
            markers.push({
                name: 'BFC',
                start: Math.min(...startTimes),
                end: Math.max(...endTimes),
                color: '#FF6B35'
            });
        }

        if (ffcStances.length > 0) {
            const startTimes = ffcStances.map(s => (eventsMap.get(s.stance_id)?.ic_ts_ms || 0) - minTime);
            const endTimes = ffcStances.map(s => (eventsMap.get(s.stance_id)?.to_ts_ms || 0) - minTime);
            markers.push({
                name: 'FFC',
                start: Math.min(...startTimes),
                end: Math.max(...endTimes),
                color: '#2196F3'
            });
        }

        return { leftData: processedLeft, rightData: processedRight, phaseMarkers: markers };

    }, [ballStanceData, ballEvents]);

    // Helper to format band names
    const formatBandName = (key: string): string => {
        const bandNames: Record<string, string> = {
            'ct_band': 'Contact Time',
            'impulse_proxy_band': 'Impulse (Force Output)',
            'loading_rate_proxy_band': 'Loading Rate (Bracing)',
            'heel_share_band': 'Heel Share',
            'ml_balance_band': 'Medial-Lateral Balance'
        };
        return bandNames[key] || key.replace(/_/g, ' ').replace(' band', '');
    };

    // Helper to get band color
    const getBandColor = (band: string): string => {
        const bandColors: Record<string, string> = {
            'elite': 'var(--success)',
            'very_high': 'var(--success)',
            'high': 'var(--info)',
            'good': 'var(--success-light)',
            'moderate': 'var(--warning-light)',
            'developing': 'var(--warning)',
            'concern': 'var(--error)',
            'very_low': 'var(--error)',
            'low': 'var(--warning)'
        };
        return bandColors[band] || 'var(--text-muted)';
    };

    // Correct data categorization issues (e.g. BFC points appearing in FFC)
    const correctedInsights = useMemo(() => {
        const bfc = [...(delivery.insights.BFC || [])];
        const ffc = [...(delivery.insights.FFC || [])];

        const bfcKeywords = ['Heel-dominant loading', 'Braking (Heel Heavy)'];
        const itemsToMove: string[] = [];

        // Identify and move misplaced BFC items from FFC
        const newFFC = ffc.filter(item => {
            const isMisplaced = bfcKeywords.some(kw => item.includes(kw));
            if (isMisplaced) itemsToMove.push(item);
            return !isMisplaced;
        });

        const newBFC = [...bfc, ...itemsToMove];

        return {
            BFC: Array.from(new Set(newBFC)),
            FFC: Array.from(new Set(newFFC))
        };
    }, [delivery.insights]);

    const renderPhaseInsights = (phase: 'BFC' | 'FFC', phaseName: string) => {
        const insights = correctedInsights[phase] || [];

        return (
            <div className="card mb-lg">
                <h3 className="card-title" style={{ color: 'var(--primary-orange)' }}>{phaseName} Insights</h3>
                <div className="divider"></div>
                {insights.length > 0 ? (
                    <ul style={{ paddingLeft: 'var(--spacing-lg)', margin: 0 }}>
                        {insights.map((insight, idx) => (
                            <li key={idx} style={{ marginBottom: 'var(--spacing-xs)', lineHeight: '1.4' }}>
                                {cleanTerminology(insight)}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted">No specific insights for this phase.</p>
                )}
            </div>
        );
    };

    const renderPhaseDetails = (phase: 'BFC' | 'FFC', phaseName: string) => {
        const details = delivery.phase_details[phase];

        // Extract only band fields
        const bandFields = [
            { key: 'ct_band', value: details.ct_band },
            { key: 'impulse_proxy_band', value: details.impulse_proxy_band },
            { key: 'loading_rate_proxy_band', value: details.loading_rate_proxy_band },
            { key: 'heel_share_band', value: details.heel_share_band },
            { key: 'ml_balance_band', value: details.ml_balance_band }
        ];

        return (
            <div className="card mb-lg">
                <h3 className="card-title" style={{ color: 'var(--primary-orange)' }}>{phaseName} Technical Details</h3>
                <div className="divider"></div>
                <div className="grid grid-2 gap-md">
                    {bandFields.map(({ key, value }) => (
                        <div key={key} style={{
                            padding: 'var(--spacing-sm)',
                            borderRadius: '8px',
                            backgroundColor: 'var(--bg-secondary)',
                            border: `2px solid ${getBandColor(value)}`
                        }}>
                            <div className="text-sm text-muted mb-xs">{formatBandName(key)}</div>
                            <div style={{
                                fontWeight: 'bold',
                                color: getBandColor(value),
                                textTransform: 'capitalize'
                            }}>
                                {value.replace(/_/g, ' ')}
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 'var(--spacing-md)' }}>
                    <div className="text-sm text-muted mb-xs">Pattern</div>
                    <div className="font-bold">{formatPattern(details.pattern)}</div>
                </div>
                <div style={{ marginTop: 'var(--spacing-sm)', padding: 'var(--spacing-sm)', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                    <div className="text-sm font-bold mb-xs">Coach Notes:</div>
                    <div className="text-sm">{details.coach_text}</div>
                </div>
            </div>
        );
    };

    // Helper to get normalized Run-Up insights (2-3 bullets)
    const getRunupInsights = (stance: any) => {
        if (!stance) return [];

        // 1. Try to get existing UI insights
        let insights: string[] = [];

        if (stance.ui && stance.ui.insights && stance.ui.insights.length > 0) {
            stance.ui.insights.forEach((insight: any) => {
                // Add title
                insights.push(cleanTerminology(insight.title));
                // Add fast bowling impacts if available
                if (insight.fast_bowling_impact) {
                    insight.fast_bowling_impact.forEach((impact: string) => {
                        insights.push(cleanTerminology(impact));
                    });
                }
            });
        }

        // 2. If we don't have enough insights, generate from metrics
        if (insights.length < 2) {
            // Contact Time Insight
            const ct_ms = Math.round(stance.ct_s * 1000);
            if (ct_ms < 150) insights.push(`Short contact time indicates stiff ankle.`);
            else insights.push(`Longer contact time suggests potential energy leak.`);

            // Force/Impulse Insight if available
            if (stance.impulse_proxy) {
                insights.push(`Impulse generation contributes to delivery momentum.`);
            }

            // Pattern Fallback
            if (stance.pattern && insights.length < 2) {
                insights.push(`Pattern: ${formatPattern(stance.pattern)}`);
            }
        }

        // 3. Deduplicate and slice to 2-3
        return Array.from(new Set(insights)).slice(0, 3);
    };

    // Render RUNUP_LAST insights
    const renderRunupLastInsights = () => {
        if (!runupLastStance) return null;

        const insights = getRunupInsights(runupLastStance);

        return (
            <div className="card mb-lg">
                <h3 className="card-title" style={{ color: 'var(--primary-orange)' }}>Run-Up (Last Step) Insights</h3>
                <div className="divider"></div>

                <ul style={{ paddingLeft: 'var(--spacing-lg)', margin: 0 }}>
                    {insights.length > 0 ? (
                        insights.map((text, idx) => (
                            <li key={idx} style={{ marginBottom: 'var(--spacing-md)', lineHeight: '1.4' }}>
                                <span className="text-sm">{text}</span>
                            </li>
                        ))
                    ) : (
                        <p className="text-muted">No specific insights available.</p>
                    )}
                </ul>
            </div>
        );
    };

    // Render RUNUP_LAST technical details
    const renderRunupLastDetails = () => {
        if (!runupLastStance) return null;

        const bands = [
            { label: 'Contact Time', value: runupLastStance.ui?.bands?.ct },
            { label: 'Impulse (Force Output)', value: runupLastStance.ui?.bands?.impulse },
            { label: 'Loading Rate (Bracing)', value: runupLastStance.ui?.bands?.loading_rate },
            { label: 'Heel Share', value: runupLastStance.ui?.bands?.heel_share },
            { label: 'Medial-Lateral Balance', value: runupLastStance.ui?.bands?.ml_balance }
        ];

        return (
            <div className="card mb-lg">
                <h3 className="card-title" style={{ color: 'var(--primary-orange)' }}>Run-Up Technical Details</h3>
                <div className="divider"></div>

                <div className="grid grid-2 gap-md">
                    {bands.map((band, idx) => (
                        <div key={idx} style={{
                            padding: 'var(--spacing-sm)',
                            borderRadius: '8px',
                            backgroundColor: 'var(--bg-secondary)',
                            border: `2px solid ${getBandColor(band.value || 'developing')}`
                        }}>
                            <div className="text-sm text-muted mb-xs">{band.label}</div>
                            <div style={{
                                fontWeight: 'bold',
                                color: getBandColor(band.value || 'developing'),
                                textTransform: 'capitalize'
                            }}>
                                {(band.value || 'N/A').replace(/_/g, ' ')}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 'var(--spacing-md)' }}>
                    <div className="text-sm text-muted mb-xs">Pattern</div>
                    <div className="font-bold">
                        {formatPattern(runupLastStance.pattern ||
                            (runupLastStance.ui?.insights && runupLastStance.ui.insights[0]?.title) ||
                            (runupLastStance.ui?.tags && runupLastStance.ui.tags[0]) ||
                            'Neutral')}
                    </div>
                </div>

                {runupLastStance.ui?.tags && runupLastStance.ui.tags.length > 0 && (
                    <div style={{ marginTop: 'var(--spacing-sm)', padding: 'var(--spacing-sm)', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                        <div className="text-sm font-bold mb-xs">Key Observations:</div>
                        <ul style={{ marginLeft: 'var(--spacing-md)', fontSize: '0.875rem', listStyleType: 'disc' }}>
                            {runupLastStance.ui.tags.map((tag: string, i: number) => (
                                <li key={i}>{tag}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="delivery-detail">
            {/* Header */}
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <button onClick={onBack} className="btn btn-secondary">← Back</button>
                    <ReportGuide />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <div>
                        <h2>Ball {delivery.ball_id} - Delivery Analysis</h2>
                    </div>
                    <span
                        className="badge"
                        style={{
                            backgroundColor: delivery.usable_delivery ? 'var(--success)' : 'var(--error)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: 'bold'
                        }}
                    >
                        {delivery.usable_delivery ? 'Usable Delivery' : 'Rejected'}
                    </span>
                </div>
            </div>

            {/* Phase Insights */}
            <div className="mb-xl">
                <h3 className="mb-md">Phase Analytics</h3>
                <div className="grid grid-3 gap-lg">
                    {runupLastStance && renderRunupLastInsights()}
                    {renderPhaseInsights('BFC', 'Back-Foot Contact')}
                    {renderPhaseInsights('FFC', 'Front-Foot Contact')}
                </div>
            </div>

            {/* Phase Details */}
            <div className="mb-xl">
                <h3 className="mb-md">Phase Technical Details</h3>
                <div className="grid grid-3 gap-lg">
                    {runupLastStance && renderRunupLastDetails()}
                    {renderPhaseDetails('BFC', 'Back-Foot Contact')}
                    {renderPhaseDetails('FFC', 'Front-Foot Contact')}
                </div>
            </div>

            {/* Pressure Heatmap - Sensor-Level Visualization */}
            {ballStanceData && (
                <div className="mb-xl">
                    <PressureHeatmapSVG
                        leftFootData={leftData}
                        rightFootData={rightData}
                        deliveryName={`Ball ${delivery.ball_id} - Complete Timeline`}
                        phaseMarkers={phaseMarkers}
                    />
                </div>
            )}

            {/* Pressure-Time Graph - Complete Delivery */}
            {ballStanceData && (
                <div className="mb-xl">
                    <h3 className="mb-md">Pressure Analysis - Complete Delivery</h3>
                    <p className="text-sm text-muted mb-lg">
                        This graph shows the complete pressure timeline for the entire delivery.
                        Both feet (left in blue, right in orange) are displayed across all phases,
                        allowing you to identify when each foot contacts, reaches peak pressure, and releases throughout the delivery.
                    </p>
                    <PressureTimeGraph
                        leftFootData={leftData}
                        rightFootData={rightData}
                        phaseName="Complete Delivery Timeline"
                    />
                </div>
            )}

            {/* Regional Pressure Timeline - Complete Delivery */}
            {ballStanceData && (
                <div className="mb-xl">
                    <RegionalPressureTimeline
                        leftFootData={leftData}
                        rightFootData={rightData}
                        phaseName="Complete Delivery Timeline"
                    />
                </div>
            )}

            {/* Tabs: Interpretation & Training Focus */}
            <div className="card">
                <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: 'var(--spacing-lg)' }}>
                    <button
                        onClick={() => setActiveTab('interpretation')}
                        style={{
                            flex: 1,
                            padding: 'var(--spacing-md)',
                            backgroundColor: activeTab === 'interpretation' ? 'white' : '#f5f5f5',
                            color: activeTab === 'interpretation' ? '#1a1a1a' : '#FF6B35',
                            border: 'none',
                            borderBottom: activeTab === 'interpretation' ? '4px solid #FF6B35' : '4px solid transparent',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                            if (activeTab !== 'interpretation') {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e8e8e8';
                            }
                        }}
                        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                            if (activeTab !== 'interpretation') {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f5f5f5';
                            }
                        }}
                    >
                        Interpretation
                    </button>
                    <button
                        onClick={() => setActiveTab('training')}
                        style={{
                            flex: 1,
                            padding: 'var(--spacing-md)',
                            backgroundColor: activeTab === 'training' ? 'white' : '#f5f5f5',
                            color: activeTab === 'training' ? '#1a1a1a' : '#FF6B35',
                            border: 'none',
                            borderBottom: activeTab === 'training' ? '4px solid #FF6B35' : '4px solid transparent',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                            if (activeTab !== 'training') {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e8e8e8';
                            }
                        }}
                        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                            if (activeTab !== 'training') {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f5f5f5';
                            }
                        }}
                    >
                        Training Focus
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'interpretation' && (
                    <div className="interpretation-content">
                        <h3 className="mb-md">{delivery.interpretation.label}</h3>

                        <div className="mb-lg">
                            <h4 className="text-md font-bold mb-sm">Explanation</h4>
                            <p>{delivery.interpretation.explanation}</p>
                        </div>

                        <div className="mb-lg">
                            <h4 className="text-md font-bold mb-sm">What You're Doing</h4>
                            <p>{delivery.interpretation.what_youre_doing}</p>
                        </div>

                        <div className="mb-lg">
                            <h4 className="text-md font-bold mb-sm">Why It Happens</h4>
                            <p>{delivery.interpretation.why_it_happens}</p>
                        </div>

                        <div className="mb-lg">
                            <h4 className="text-md font-bold mb-sm">Confidence</h4>
                            <span className="badge badge-info">{delivery.interpretation.confidence}</span>
                        </div>

                        <div className="mb-lg">
                            <h4 className="text-md font-bold mb-sm">Coach Cues</h4>
                            <ul style={{ paddingLeft: 'var(--spacing-lg)' }}>
                                {delivery.interpretation.coach_cues.map((cue, idx) => (
                                    <li key={idx} style={{ marginBottom: 'var(--spacing-xs)' }}>{cue}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="grid grid-2 gap-md">
                            <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                <h4 className="text-sm font-bold mb-xs">Impact on Pace</h4>
                                <p className="text-sm">{delivery.interpretation.impact.pace}</p>
                            </div>
                            <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                <h4 className="text-sm font-bold mb-xs">Impact on Accuracy</h4>
                                <p className="text-sm">{delivery.interpretation.impact.accuracy}</p>
                            </div>
                            <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                <h4 className="text-sm font-bold mb-xs">Load Impact</h4>
                                <p className="text-sm">{delivery.interpretation.impact.load}</p>
                            </div>
                            <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--error-light)', borderRadius: '8px' }}>
                                <h4 className="text-sm font-bold mb-xs">Injury Risk</h4>
                                <p className="text-sm">{delivery.interpretation.impact.injury_risk}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'training' && (
                    <div className="training-content">
                        <h3 className="mb-md">{delivery.training_focus.title}</h3>

                        <div className="mb-lg">
                            <h4 className="text-md font-bold mb-sm">Program</h4>
                            <p className="font-bold">{delivery.training_focus.program_name}</p>
                        </div>

                        <div className="mb-lg">
                            <h4 className="text-md font-bold mb-sm">Load Guidance</h4>
                            <p>{delivery.training_focus.load_guidance}</p>
                        </div>

                        <div className="mb-lg">
                            <h4 className="text-md font-bold mb-sm">Training Sessions</h4>
                            {delivery.training_focus.sessions.map((session, idx) => (
                                <div key={idx} className="card mb-md" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                    <h5 className="font-bold mb-sm">Day {session.day}: {session.focus}</h5>
                                    <div>
                                        {session.drills.map((drill, drillIdx) => (
                                            <div key={drillIdx} style={{ marginBottom: 'var(--spacing-sm)', paddingLeft: 'var(--spacing-md)' }}>
                                                <div className="font-bold">
                                                    {drill.name}
                                                    {hasCitations(drill.name) && (
                                                        <CitationPopover drillName={drill.name} />
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted">Dosage: {drill.dosage}</div>
                                                <ul style={{ paddingLeft: 'var(--spacing-lg)', fontSize: '0.875rem' }}>
                                                    {drill.key_points.map((point, pointIdx) => (
                                                        <li key={pointIdx}>{point}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mb-lg">
                            <h4 className="text-md font-bold mb-sm">Progression</h4>
                            <p>{delivery.training_focus.progression}</p>
                        </div>

                        <div>
                            <h4 className="text-md font-bold mb-sm">Exit Goal</h4>
                            <p className="font-bold" style={{ color: 'var(--success)' }}>{delivery.training_focus.exit_goal}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryDetail;
