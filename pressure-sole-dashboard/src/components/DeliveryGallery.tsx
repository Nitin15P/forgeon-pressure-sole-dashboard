import React from 'react';
import type { Delivery, StanceMetricsFile } from '../types/pressure-report';

interface DeliveryGalleryProps {
    deliveries: Delivery[];
    stanceMetrics?: StanceMetricsFile;
    onSelectDelivery: (delivery: Delivery) => void;
    onBackToSession: () => void;
}

const DeliveryGallery: React.FC<DeliveryGalleryProps> = ({ deliveries, stanceMetrics, onSelectDelivery, onBackToSession }) => {
    return (
        <div className="delivery-gallery">
            {/* Back Button */}
            <button
                onClick={onBackToSession}
                style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    backgroundColor: 'transparent',
                    color: 'var(--primary)',
                    border: '2px solid var(--primary)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginBottom: 'var(--spacing-lg)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-xs)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary)';
                    e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--primary)';
                }}
            >
                ← Back to Session Summary
            </button>

            <h2 className="mb-lg">Deliveries</h2>
            <div className="grid grid-4 gap-md">
                {deliveries.map((delivery) => {
                    const statusColor = delivery.usable_delivery ? 'var(--success)' : 'var(--error)';
                    const statusText = delivery.usable_delivery ? 'Usable' : 'Rejected';

                    return (
                        <div
                            key={delivery.ball_id}
                            className="card"
                            onClick={() => onSelectDelivery(delivery)}
                            style={{
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                border: `2px solid ${delivery.usable_delivery ? 'var(--border)' : 'var(--error-light)'}`
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                                <h3 className="card-title" style={{ margin: 0 }}>Ball {delivery.ball_id}</h3>
                                <span
                                    className="badge"
                                    style={{
                                        backgroundColor: statusColor,
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {statusText}
                                </span>
                            </div>

                            <div className="divider" style={{ margin: 'var(--spacing-sm) 0' }}></div>

                            <div style={{ fontSize: '0.875rem' }}>
                                <div style={{ marginBottom: 'var(--spacing-xs)' }}>
                                    <span className="text-muted">Run Up Pattern:</span>{' '}
                                    <span className="font-bold">
                                        {(() => {
                                            if (!stanceMetrics) return 'Neutral';
                                            const ballStances = stanceMetrics.balls.find(b => b.ball_id === delivery.ball_id);
                                            const runupStance = ballStances?.stance_metrics.Left.find(s => s.phase === 'RUNUP_LAST') ||
                                                ballStances?.stance_metrics.Right.find(s => s.phase === 'RUNUP_LAST');

                                            if (!runupStance) return 'Neutral';
                                            if (runupStance.pattern) return runupStance.pattern.replace(/_/g, ' ');
                                            if (runupStance.ui?.insights && runupStance.ui.insights.length > 0) return runupStance.ui.insights[0].title;
                                            if (runupStance.ui?.tags && runupStance.ui.tags.length > 0) return runupStance.ui.tags[0];
                                            return 'Neutral';
                                        })()}
                                    </span>
                                </div>
                                <div style={{ marginBottom: 'var(--spacing-xs)' }}>
                                    <span className="text-muted">BFC Pattern:</span>{' '}
                                    <span className="font-bold">{delivery.phase_summary.BFC.pattern.replace(/_/g, ' ')}</span>
                                </div>
                                <div style={{ marginBottom: 'var(--spacing-xs)' }}>
                                    <span className="text-muted">FFC Pattern:</span>{' '}
                                    <span className="font-bold">{delivery.phase_summary.FFC.pattern.replace(/_/g, ' ')}</span>
                                </div>
                                <div>
                                    <span className="text-muted">Interpretation:</span>{' '}
                                    <span className="font-bold" style={{ fontSize: '0.8rem' }}>
                                        {delivery.interpretation.label}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DeliveryGallery;
