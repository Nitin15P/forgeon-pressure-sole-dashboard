import React from 'react';
import { formatBandColor, formatBandLabel } from '../utils/formatters';

interface MetricBadgeProps {
    label: string;
    value: string | number;
    band?: string;
    tooltip?: string;
}

const MetricBadge: React.FC<MetricBadgeProps> = ({ label, value, band, tooltip }) => {
    const getBadgeClass = (band?: string): string => {
        if (!band) return 'badge';
        const bandKey = band.replace(/ /g, '-').toLowerCase();
        return `badge badge-${bandKey}`;
    };

    return (
        <div className="metric-badge" title={tooltip}>
            <div className="metric-label text-sm text-muted">{label}</div>
            <div className="metric-value flex items-center gap-sm">
                <span className="font-bold text-lg">{value}</span>
                {band && (
                    <span
                        className={getBadgeClass(band)}
                        style={{
                            backgroundColor: `${formatBandColor(band)}15`,
                            color: formatBandColor(band),
                            border: `1px solid ${formatBandColor(band)}40`
                        }}
                    >
                        {formatBandLabel(band)}
                    </span>
                )}
            </div>
        </div>
    );
};

export default MetricBadge;
