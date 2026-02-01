import React from 'react';

interface TrendData {
    slope: number;
    r_squared: number;
    direction: string;
}

interface RawAnalyticsProps {
    analyticsRaw: {
        trends_by_phase: {
            RUNUP_LAST: Record<string, TrendData> & { trend_confidence: string; _n_balls: number };
            BFC: Record<string, TrendData> & { trend_confidence: string; _n_balls: number };
            FFC: Record<string, TrendData> & { trend_confidence: string; _n_balls: number };
        };
    };
}

const RawAnalytics: React.FC<RawAnalyticsProps> = ({ analyticsRaw }) => {
    const phases = [
        { key: 'RUNUP_LAST', name: 'Run-Up' },
        { key: 'BFC', name: 'Back-Foot Contact' },
        { key: 'FFC', name: 'Front-Foot Contact' }
    ] as const;

    // Map metric names to their units
    const getMetricWithUnit = (metric: string): string => {
        const metricUnits: Record<string, string> = {
            'ct_s': 'Contact Time (s)',
            'peak_proxy': 'Peak Pressure (N)',
            'impulse_proxy': 'Impulse (N·s)',
            'loading_rate_proxy': 'Loading Rate (N/s)',
            'heel_share_0_1': 'Heel Share (0-1)',
            'ml_balance_0_1': 'ML Balance (0-1)'
        };
        return metricUnits[metric] || metric.replace(/_proxy/g, '').replace(/_/g, ' ');
    };

    const renderTrendsTable = (trends: Record<string, TrendData> & { trend_confidence: string; _n_balls: number }) => {
        const metrics = Object.keys(trends).filter(key => !key.startsWith('_') && key !== 'trend_confidence');

        return (
            <div className="mb-lg">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                    <div className="badge badge-info" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        {trends.trend_confidence} confidence
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                <th style={{ textAlign: 'left', padding: 'var(--spacing-xs)', fontWeight: 'bold' }}>Metric</th>
                                <th style={{ textAlign: 'center', padding: 'var(--spacing-xs)' }}>Direction</th>
                            </tr>
                        </thead>
                        <tbody>
                            {metrics.map(metric => {
                                const trend = trends[metric];
                                const directionColor =
                                    trend.direction === 'increasing' ? 'var(--success)' :
                                        trend.direction === 'decreasing' ? 'var(--warning)' :
                                            'var(--text-muted)';

                                return (
                                    <tr key={metric} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                        <td style={{ padding: 'var(--spacing-xs)', fontWeight: '500' }}>
                                            {getMetricWithUnit(metric)}
                                        </td>
                                        <td style={{ textAlign: 'center', padding: 'var(--spacing-xs)' }}>
                                            <span style={{ color: directionColor, fontWeight: 'bold' }}>
                                                {trend.direction}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="raw-analytics">
            <h2 className="mb-lg">Raw Analytics</h2>

            {phases.map(({ key, name }) => (
                <div key={key} className="card mb-xl">
                    <h3 className="card-title">{name} - Trends</h3>
                    <div className="divider"></div>

                    {renderTrendsTable(analyticsRaw.trends_by_phase[key])}
                </div>
            ))}
        </div>
    );
};

export default RawAnalytics;
