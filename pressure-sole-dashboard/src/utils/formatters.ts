// Utility functions for formatting and human-readable text

/**
 * Convert metric keys to human-readable labels
 */
export const formatMetricLabel = (key: string): string => {
    const labels: Record<string, string> = {
        ct_s: 'Contact Time',
        impulse_proxy: 'Force Output',
        impulse_proxy_band: 'Force Output Level',
        loading_rate_proxy: 'Impact Rate',
        loading_rate_proxy_band: 'Impact Rate Level',
        peak_proxy: 'Peak Pressure',
        heel_share_0_1: 'Heel Loading',
        heel_share_band: 'Heel Loading Level',
        ml_balance_0_1: 'Medial-Lateral Balance',
        ml_balance_band: 'Balance Level',
        heel_to_fore_delay_ms: 'Heel-to-Forefoot Timing',
        ct_band: 'Contact Time Level',
        height_cm: 'Height',
        weight_kg: 'Weight',
        dominant_arm: 'Dominant Arm',
        bowling_style: 'Bowling Style',
        session_id: 'Session ID',
        surface: 'Surface',
        notes: 'Notes',
    };
    return labels[key] || key.replace(/_proxy/g, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Convert phase codes to full names
 */
export const formatPhaseLabel = (phase: string): string => {
    const phases: Record<string, string> = {
        BFC: 'Back-Foot Contact',
        FFC: 'Front-Foot Contact',
        RUNUP_LAST: 'Run-Up (Last Step)',
        BOUND: 'Bound Phase',
    };
    return phases[phase] || phase;
};

/**
 * Format values with appropriate units
 */
export const formatValue = (key: string, value: number | string): string => {
    if (typeof value === 'string') return value;

    const formatters: Record<string, (v: number) => string> = {
        ct_s: (v) => `${(v * 1000).toFixed(0)} ms`,
        height_cm: (v) => `${v} cm`,
        weight_kg: (v) => `${v} kg`,
        heel_to_fore_delay_ms: (v) => `${v > 0 ? '+' : ''}${v} ms`,
        heel_share_0_1: (v) => `${(v * 100).toFixed(0)}%`,
        ml_balance_0_1: (v) => `${(v * 100).toFixed(0)}%`,
        impulse_proxy: (v) => v.toLocaleString(),
        loading_rate_proxy: (v) => v.toFixed(1),
    };

    return formatters[key] ? formatters[key](value) : value.toString();
};

/**
 * Map band levels to colors
 */
export const formatBandColor = (band: string): string => {
    const colors: Record<string, string> = {
        very_low: '#F44336',
        low: '#FF9800',
        developing: '#FFC107',
        high: '#8BC34A',
        elite: '#4CAF50',
        very_high: '#2196F3',
    };
    return colors[band] || '#9E9E9E';
};

/**
 * Format band labels for display
 */
export const formatBandLabel = (band: string): string => {
    const labels: Record<string, string> = {
        very_low: 'Very Low',
        low: 'Low',
        developing: 'Developing',
        high: 'High',
        elite: 'Elite',
        very_high: 'Very High',
    };
    return labels[band] || band.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Format pattern names to be more readable
 */
export const formatPattern = (pattern: string): string => {
    const patterns: Record<string, string> = {
        neutral_bfc: 'Neutral',
        braking_heel_bfc: 'Braking (Heel Heavy)',
        collapsing_bfc: 'Collapsing BFC',
        absorptive_bracing: 'Absorptive Bracing',
        explosive_bracing: 'Explosive Bracing',
        stiff_bracing: 'Stiff Bracing',
    };
    return patterns[pattern] || pattern.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Get icon for insight type
 */
export const getInsightIcon = (type: 'good' | 'cost' | 'next'): string => {
    const icons = {
        good: '✓',
        cost: '⚠',
        next: '→',
    };
    return icons[type];
};

/**
 * Capitalize first letter
 */
/**
 * Cleans coaching terminology in a string (removes proxy, replaces peak)
 */
export const cleanTerminology = (text: string): string => {
    const cleaned = text
        .replace(/_proxy/gi, '')
        .replace(/proxy/gi, '')
        .replace(/peak/gi, 'Peak Pressure')
        .replace(/\s+/g, ' ')
        .trim();

    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

/**
 * Simplifies descriptive patterns into definitive 1-2 word labels
 */
export const simplifyPattern = (pattern: string): string => {
    if (!pattern || pattern === 'Neutral') return 'Neutral';

    const lower = pattern.toLowerCase();

    if (lower.includes('side-load')) return 'Side-Load';
    if (lower.includes('stiff block')) return 'Stiff Block';
    if (lower.includes('medial bias')) return 'Medial Bias';
    if (lower.includes('lateral bias')) return 'Lateral Bias';
    if (lower.includes('collapsing')) return 'Collapsing';
    if (lower.includes('braking heel')) return 'Braking Heel';
    if (lower.includes('absorptive')) return 'Absorptive';
    if (lower.includes('efficient')) return 'Efficient';

    // Fallback: take first two words and strip common suffixes
    const words = pattern.split(' ').slice(0, 2).join(' ');
    return words.replace(/[—,-]/g, '').trim();
};

export const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
