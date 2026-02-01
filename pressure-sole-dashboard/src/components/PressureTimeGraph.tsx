import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { CoPPoint } from '../types/pressure-report';

interface PressureTimeGraphProps {
    leftFootData: CoPPoint[];
    rightFootData: CoPPoint[];
    phaseName: string;
}

const PressureTimeGraph: React.FC<PressureTimeGraphProps> = ({ leftFootData, rightFootData, phaseName }) => {
    // Combine data from both feet into a single dataset for the chart
    const combinedData = React.useMemo(() => {
        const timePoints = new Set<number>();

        // Collect all unique time points
        leftFootData.forEach(point => timePoints.add(point.t_ms));
        rightFootData.forEach(point => timePoints.add(point.t_ms));

        // Sort time points
        const sortedTimes = Array.from(timePoints).sort((a, b) => a - b);

        // Create combined dataset
        return sortedTimes.map(t => {
            const leftPoint = leftFootData.find(p => p.t_ms === t);
            const rightPoint = rightFootData.find(p => p.t_ms === t);

            return {
                time: t,
                leftPressure: leftPoint?.sumW || null,
                rightPressure: rightPoint?.sumW || null
            };
        });
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

    return (
        <div className="card">
            <h3 className="card-title" style={{ marginBottom: 'var(--spacing-md)' }}>
                Pressure-Time Curve: {phaseName}
            </h3>
            <p className="text-sm text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>
                This graph shows how pressure builds and releases during foot contact.
                The curve shape reveals loading rate (steepness), peak pressure (height), and contact duration (width).
            </p>

            <ResponsiveContainer width="100%" height={400}>
                <LineChart
                    data={combinedData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                    <XAxis
                        dataKey="time"
                        label={{ value: 'Time (ms)', position: 'insideBottom', offset: -5 }}
                        stroke="#757575"
                    />
                    <YAxis
                        label={{ value: 'Total Pressure (a.u.)', angle: -90, position: 'insideLeft' }}
                        stroke="#757575"
                        tick={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="line"
                    />
                    <Line
                        type="monotone"
                        dataKey="leftPressure"
                        stroke="#2196F3"
                        strokeWidth={2}
                        name="Left Foot"
                        dot={false}
                        connectNulls
                    />
                    <Line
                        type="monotone"
                        dataKey="rightPressure"
                        stroke="#FF6B35"
                        strokeWidth={2}
                        name="Right Foot"
                        dot={false}
                        connectNulls
                    />
                </LineChart>
            </ResponsiveContainer>

            <div style={{ marginTop: 'var(--spacing-md)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>How to read:</strong> Steeper rise = faster loading; Higher peak pressure = greater force; Wider curve = longer contact time
            </div>
        </div>
    );
};

export default PressureTimeGraph;
