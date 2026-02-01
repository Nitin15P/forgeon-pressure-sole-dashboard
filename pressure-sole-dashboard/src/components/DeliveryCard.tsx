import React, { useState } from 'react';
import type { Delivery } from '../types/pressure-report';
import { formatPhaseLabel, formatValue, formatPattern } from '../utils/formatters';
import PhaseAnalysis from './PhaseAnalysis';
import RawDataViewer from './RawDataViewer';

interface DeliveryCardProps {
    delivery: Delivery;
    deliveryNumber: number;
}

const DeliveryCard: React.FC<DeliveryCardProps> = ({ delivery, deliveryNumber }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<'analysis' | 'raw'>('analysis');

    const { interpretation, phase_summary, usable_delivery } = delivery;

    return (
        <div className="delivery-card mb-lg">
            {/* Card Header - Always Visible */}
            <div
                className="card"
                style={{
                    cursor: 'pointer',
                    borderLeft: `4px solid ${usable_delivery ? 'var(--primary-orange)' : 'var(--text-muted)'}`
                }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-md">
                        <div
                            className="ball-number"
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: 'var(--primary-orange)',
                                color: 'var(--text-light)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 'var(--font-size-xl)',
                                fontWeight: 'bold',
                            }}
                        >
                            {deliveryNumber}
                        </div>
                        <div>
                            <h3 className="card-title" style={{ marginBottom: '0.25rem' }}>
                                {interpretation.label}
                            </h3>
                            <div className="flex gap-sm items-center">
                                <span className="badge badge-info">
                                    {formatPhaseLabel('BFC')}: {formatPattern(phase_summary.BFC.pattern)}
                                </span>
                                <span className="badge badge-info">
                                    {formatPhaseLabel('FFC')}: {formatPattern(phase_summary.FFC.pattern)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-md">
                        <div className="text-center">
                            <div className="text-sm text-muted">BFC Contact</div>
                            <div className="font-bold">{formatValue('ct_s', phase_summary.BFC.ct_s)}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-muted">FFC Contact</div>
                            <div className="font-bold">{formatValue('ct_s', phase_summary.FFC.ct_s)}</div>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                        >
                            {isExpanded ? '▲ Collapse' : '▼ View Details'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="delivery-details mt-md fade-in">
                    {/* Tab Navigation */}
                    <div className="flex gap-sm mb-md" style={{ borderBottom: '2px solid var(--light-bg)' }}>
                        <button
                            className={`btn ${activeTab === 'analysis' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setActiveTab('analysis')}
                            style={{ borderRadius: '0', borderTopLeftRadius: 'var(--radius-md)', borderTopRightRadius: 'var(--radius-md)' }}
                        >
                            📊 Phase Analysis
                        </button>
                        <button
                            className={`btn ${activeTab === 'raw' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setActiveTab('raw')}
                            style={{ borderRadius: '0', borderTopLeftRadius: 'var(--radius-md)', borderTopRightRadius: 'var(--radius-md)' }}
                        >
                            📄 Raw Data
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'analysis' ? (
                        <PhaseAnalysis delivery={delivery} />
                    ) : (
                        <RawDataViewer data={delivery} title={`Ball ${deliveryNumber} - Raw Data`} />
                    )}
                </div>
            )}
        </div>
    );
};

export default DeliveryCard;
