import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { CoPPoint } from '../types/pressure-report';

interface RegionalPressureTimelineProps {
    leftFootData: CoPPoint[];
    rightFootData: CoPPoint[];
    phaseName: string;
}

const RegionalPressureTimeline: React.FC<RegionalPressureTimelineProps> = ({
    leftFootData,
    rightFootData,
    phaseName
}) => {
    // Process data for each region separately
    const regionalDatasets = React.useMemo(() => {
        const timePoints = new Set<number>();

        // Collect all unique time points
        leftFootData.forEach(point => timePoints.add(point.t_ms));
        rightFootData.forEach(point => timePoints.add(point.t_ms));

        // Sort time points
        const sortedTimes = Array.from(timePoints).sort((a, b) => a - b);

        // Create separate datasets for each region
        const datasets = {
            ForeFoot: sortedTimes.map(t => {
                const leftPoint = leftFootData.find(p => p.t_ms === t);
                const rightPoint = rightFootData.find(p => p.t_ms === t);
                return {
                    time: t,
                    Left: (leftPoint?.sensors?.S1 || 0) + (leftPoint?.sensors?.S2 || 0),
                    Right: (rightPoint?.sensors?.S1 || 0) + (rightPoint?.sensors?.S2 || 0)
                };
            }),
            UpperMid: sortedTimes.map(t => {
                const leftPoint = leftFootData.find(p => p.t_ms === t);
                const rightPoint = rightFootData.find(p => p.t_ms === t);
                return {
                    time: t,
                    Left: (leftPoint?.sensors?.S3 || 0) + (leftPoint?.sensors?.S4 || 0) + (leftPoint?.sensors?.S5 || 0),
                    Right: (rightPoint?.sensors?.S3 || 0) + (rightPoint?.sensors?.S4 || 0) + (rightPoint?.sensors?.S5 || 0)
                };
            }),
            LowerMid: sortedTimes.map(t => {
                const leftPoint = leftFootData.find(p => p.t_ms === t);
                const rightPoint = rightFootData.find(p => p.t_ms === t);
                return {
                    time: t,
                    Left: leftPoint?.sensors?.S6 || 0,
                    Right: rightPoint?.sensors?.S6 || 0
                };
            }),
            Heel: sortedTimes.map(t => {
                const leftPoint = leftFootData.find(p => p.t_ms === t);
                const rightPoint = rightFootData.find(p => p.t_ms === t);
                return {
                    time: t,
                    Left: (leftPoint?.sensors?.S7 || 0) + (leftPoint?.sensors?.S8 || 0),
                    Right: (rightPoint?.sensors?.S7 || 0) + (rightPoint?.sensors?.S8 || 0)
                };
            })
        };

        return datasets;
    }, [leftFootData, rightFootData]);

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'white',
                    padding: 'var(--spacing-sm)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    <p style={{ margin: 0, fontWeight: 'bold', marginBottom: 'var(--spacing-xs)' }}>
                        Time: {payload[0].payload.time} ms
                    </p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ margin: 0, color: entry.color, fontSize: '0.875rem' }}>
                            {entry.name}: {entry.value ? entry.value.toFixed(0) : 'N/A'} a.u.
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Render a single regional chart
    const renderRegionalChart = (regionName: string, data: any[], sensors: string) => (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>{regionName} ({sensors})</h4>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                    <XAxis
                        dataKey="time"
                        label={{ value: 'Time (ms)', position: 'insideBottom', offset: -5 }}
                        stroke="#757575"
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis
                        label={{ value: 'Pressure (a.u.)', angle: -90, position: 'insideLeft' }}
                        stroke="#757575"
                        tick={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: '10px' }}
                        iconType="line"
                    />
                    <Line
                        type="monotone"
                        dataKey="Left"
                        stroke="#2196F3"
                        strokeWidth={2}
                        name="Left Foot"
                        dot={false}
                        connectNulls
                    />
                    <Line
                        type="monotone"
                        dataKey="Right"
                        stroke="#FF6B35"
                        strokeWidth={2}
                        name="Right Foot"
                        dot={false}
                        connectNulls
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    return (
        <div className="card">
            <h3 className="card-title" style={{ marginBottom: 'var(--spacing-md)' }}>
                Regional Pressure Distribution: {phaseName}
            </h3>
            <p className="text-sm text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>
                Track how load shifts across foot regions during the delivery.
                Each chart shows left foot (blue) vs right foot (orange) for a specific region.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                {renderRegionalChart('ForeFoot', regionalDatasets.ForeFoot, 'S1+S2')}
                {renderRegionalChart('UpperMid', regionalDatasets.UpperMid, 'S3+S4+S5')}
                {renderRegionalChart('LowerMid', regionalDatasets.LowerMid, 'S6')}
                {renderRegionalChart('Heel', regionalDatasets.Heel, 'S7+S8')}
            </div>

            <div style={{ marginTop: 'var(--spacing-md)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>How to read:</strong> Compare left vs right foot loading patterns for each region. Look for asymmetries and timing differences.
            </div>
        </div>
    );
};

export default RegionalPressureTimeline;
