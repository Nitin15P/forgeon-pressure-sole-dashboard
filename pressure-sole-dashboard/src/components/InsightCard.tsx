import React from 'react';
import { getInsightIcon } from '../utils/formatters';

interface InsightCardProps {
    type: 'good' | 'cost' | 'next';
    title: string;
    content: string | string[];
    icon?: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ type, title, content, icon }) => {
    const getCardStyle = () => {
        switch (type) {
            case 'good':
                return {
                    borderLeft: '4px solid var(--success)',
                    backgroundColor: 'var(--success-light)',
                };
            case 'cost':
                return {
                    borderLeft: '4px solid var(--warning)',
                    backgroundColor: 'var(--warning-light)',
                };
            case 'next':
                return {
                    borderLeft: '4px solid var(--info)',
                    backgroundColor: 'var(--info-light)',
                };
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'good': return 'var(--success)';
            case 'cost': return 'var(--warning)';
            case 'next': return 'var(--info)';
        }
    };

    return (
        <div className="card fade-in" style={getCardStyle()}>
            <div className="flex items-center gap-md mb-md">
                <span style={{ fontSize: '1.5rem', color: getIconColor() }}>
                    {icon || getInsightIcon(type)}
                </span>
                <h3 className="card-title" style={{ marginBottom: 0 }}>{title}</h3>
            </div>
            <div className="insight-content">
                {Array.isArray(content) ? (
                    <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                        {content.map((item, index) => (
                            <li key={index} style={{ marginBottom: 'var(--spacing-sm)' }}>
                                {item}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ margin: 0 }}>{content}</p>
                )}
            </div>
        </div>
    );
};

export default InsightCard;
