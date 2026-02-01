import React from 'react';
import CitationPopover from './CitationPopover';
import { hasCitations } from '../data/researchCitations';

interface PhaseRecommendation {
    text: string;
    drillName?: string;
}

interface PhaseInsight {
    goingWell: string[];
    costing: string[];
    nextSteps: PhaseRecommendation[];
}

interface PhaseInsightCardProps {
    phase: string;
    phaseName: string;
    insight: PhaseInsight;
}

const PhaseInsightCard: React.FC<PhaseInsightCardProps> = ({ phaseName, insight }) => {
    return (
        <div className="card">
            <div className="card-header" style={{ borderBottom: '2px solid var(--primary-orange)' }}>
                <h3 className="card-title">{phaseName}</h3>
            </div>

            {/* What's Going Well */}
            {insight.goingWell.length > 0 && (
                <div className="mb-lg">
                    <div className="flex items-center gap-sm mb-sm">
                        <span style={{ fontSize: '1.5rem' }}>✅</span>
                        <h4 className="text-lg font-bold" style={{ color: 'var(--success)' }}>
                            What's Going Well
                        </h4>
                    </div>
                    <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                        {insight.goingWell.map((item, idx) => (
                            <li key={idx} className="mb-xs text-sm">
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* What's Costing You */}
            {insight.costing.length > 0 && (
                <div className="mb-lg">
                    <div className="flex items-center gap-sm mb-sm">
                        <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                        <h4 className="text-lg font-bold" style={{ color: 'var(--warning)' }}>
                            What's Costing You
                        </h4>
                    </div>
                    <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                        {insight.costing.map((item, idx) => (
                            <li key={idx} className="mb-xs text-sm">
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* What You Can Do Next */}
            {insight.nextSteps.length > 0 && (
                <div>
                    <div className="flex items-center gap-sm mb-sm">
                        <span style={{ fontSize: '1.5rem' }}>💡</span>
                        <h4 className="text-lg font-bold" style={{ color: 'var(--primary-orange)' }}>
                            What You Can Do Next
                        </h4>
                    </div>
                    <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                        {insight.nextSteps.map((item, idx) => (
                            <li key={idx} className="mb-xs text-sm">
                                <span>{item.text}</span>
                                {item.drillName && hasCitations(item.drillName) && (
                                    <CitationPopover drillName={item.drillName} />
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PhaseInsightCard;
