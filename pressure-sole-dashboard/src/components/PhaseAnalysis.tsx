import type { Delivery } from '../types/pressure-report';
import { formatPhaseLabel, formatValue, formatPattern, cleanTerminology } from '../utils/formatters';
import MetricBadge from './MetricBadge';
import InsightCard from './InsightCard';
import TrainingFocus from './TrainingFocus';

interface PhaseAnalysisProps {
    delivery: Delivery;
}

const PhaseAnalysis: React.FC<PhaseAnalysisProps> = ({ delivery }) => {
    const { interpretation, phase_details, insights, training_focus } = delivery;

    // Determine what's going well based on high/elite bands
    const getWhatsGoingWell = (): string[] => {
        const positives: string[] = [];

        Object.entries(phase_details).forEach(([phase, details]) => {
            const phaseName = formatPhaseLabel(phase);

            if (details.impulse_proxy_band === 'elite' || details.impulse_proxy_band === 'high') {
                positives.push(`${phaseName}: Strong force output (${details.impulse_proxy_band})`);
            }

            if (details.pattern.includes('explosive') || details.pattern.includes('stiff')) {
                positives.push(`${phaseName}: Efficient ${formatPattern(details.pattern)} pattern`);
            }
        });

        return positives.length > 0 ? positives : ['Continue monitoring for positive patterns'];
    };

    // Determine what's costing based on interpretation and low bands
    const getWhatsCostingYou = (): string[] => {
        const costs: string[] = [];

        // Add main interpretation
        costs.push(interpretation.explanation);

        // Add specific impacts
        if (interpretation.impact.pace !== 'Minimal' && !interpretation.impact.pace.includes('Maintained')) {
            costs.push(`Pace Impact: ${interpretation.impact.pace}`);
        }
        if (interpretation.impact.injury_risk.includes('High') || interpretation.impact.injury_risk.includes('Elevated')) {
            costs.push(`⚠️ Injury Risk: ${interpretation.impact.injury_risk}`);
        }

        return costs;
    };

    // Determine what to do next
    const getWhatToDoNext = (): string[] => {
        return [
            ...interpretation.coach_cues,
            `Focus: ${training_focus.load_guidance}`,
        ];
    };

    return (
        <div className="phase-analysis">
            {/* Interpretation Header */}
            <div className="card mb-lg">
                <div className="card-header">
                    <h2 className="card-title" style={{ color: 'var(--primary-orange)' }}>
                        {interpretation.label}
                    </h2>
                    <p className="text-lg">{interpretation.what_youre_doing}</p>
                    <p className="text-sm text-muted mt-sm">
                        <strong>Why this happens:</strong> {interpretation.why_it_happens}
                    </p>
                </div>

                {/* Impact Summary */}
                <div className="grid grid-4 gap-md">
                    <div>
                        <div className="text-sm text-muted mb-xs">Pace</div>
                        <div className="text-sm font-bold">{interpretation.impact.pace}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted mb-xs">Accuracy</div>
                        <div className="text-sm font-bold">{interpretation.impact.accuracy}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted mb-xs">Load</div>
                        <div className="text-sm font-bold">{interpretation.impact.load}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted mb-xs">Injury Risk</div>
                        <div
                            className="text-sm font-bold"
                            style={{
                                color: interpretation.impact.injury_risk.includes('High') ? 'var(--warning)' : 'inherit'
                            }}
                        >
                            {interpretation.impact.injury_risk}
                        </div>
                    </div>
                </div>
            </div>

            {/* Three Key Sections */}
            <div className="grid gap-lg mb-lg">
                <InsightCard
                    type="good"
                    title="What's Going Well"
                    content={getWhatsGoingWell()}
                />

                <InsightCard
                    type="cost"
                    title="What's Costing You"
                    content={getWhatsCostingYou()}
                />

                <InsightCard
                    type="next"
                    title="What to Do Next"
                    content={getWhatToDoNext()}
                />
            </div>

            {/* Phase Details */}
            <div className="grid grid-2 gap-lg mb-lg">
                {Object.entries(phase_details).map(([phase, details]) => (
                    <div key={phase} className="card">
                        <h3 className="card-title">{formatPhaseLabel(phase)}</h3>
                        <div className="badge mb-md" style={{
                            background: 'var(--light-bg)',
                            color: 'var(--text-dark)'
                        }}>
                            {details.foot} Foot • {formatPattern(details.pattern)}
                        </div>

                        <div className="grid grid-2 gap-md mb-md">
                            <MetricBadge
                                label="Contact Time"
                                value={formatValue('ct_s', details.ct_s)}
                                band={details.ct_band}
                            />
                            <MetricBadge
                                label="Force Output"
                                value={formatValue('impulse_proxy', details.impulse_proxy)}
                                band={details.impulse_proxy_band}
                            />
                            <MetricBadge
                                label="Impact Rate"
                                value={formatValue('loading_rate_proxy', details.loading_rate_proxy)}
                                band={details.loading_rate_proxy_band}
                            />
                            <MetricBadge
                                label="Heel Loading"
                                value={formatValue('heel_share_0_1', details.heel_share_0_1)}
                                band={details.heel_share_band}
                            />
                        </div>

                        <div className="divider"></div>

                        <div>
                            <div className="text-sm font-bold mb-xs">Key Insights:</div>
                            <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                {insights[phase as 'BFC' | 'FFC'].map((insight, index) => (
                                    <li key={index} className="text-sm text-muted">{cleanTerminology(insight)}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>

            {/* Training Focus */}
            <TrainingFocus trainingFocus={training_focus} />
        </div>
    );
};

export default PhaseAnalysis;
