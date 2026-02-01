// TypeScript interfaces for pressure report data

export interface Athlete {
    name: string;
    player_id?: string;
    height_cm: number;
    weight_kg: number;
    dominant_arm: string;
    bowling_style: string;
}

export interface SessionMeta {
    session_id: string;
    surface: string;
    notes: string;
}

export interface ReportReadme {
    how_to_read: string[];
    metric_glossary: Record<string, string>;
}

export interface PhaseDetails {
    foot: string;
    ct_s: number;
    ct_band: string;
    impulse_proxy: number;
    impulse_proxy_band: string;
    loading_rate_proxy: number;
    loading_rate_proxy_band: string;
    heel_share_0_1: number;
    heel_share_band: string;
    ml_balance_0_1: number;
    ml_balance_band: string;
    heel_to_fore_delay_ms: number;
    pattern: string;
    coach_text: string;
}

export interface PhaseSummary {
    foot: string;
    ct_s: number;
    ct_band: string;
    impulse_band: string;
    pattern: string;
}

export interface Impact {
    pace: string;
    accuracy: string;
    load: string;
    injury_risk: string;
}

export interface Interpretation {
    label: string;
    explanation: string;
    what_youre_doing: string;
    why_it_happens: string;
    confidence: string;
    coach_cues: string[];
    impact: Impact;
}

export interface Drill {
    name: string;
    dosage: string;
    key_points: string[];
}

export interface TrainingSession {
    day: number;
    focus: string;
    drills: Drill[];
}

export interface TrainingFocus {
    title: string;
    program_name: string;
    load_guidance: string;
    sessions: TrainingSession[];
    progression: string;
    exit_goal: string;
}

export interface QCSummary {
    status: string;
    notes: string[];
}

export interface Delivery {
    ball_id: number;
    usable_delivery: boolean;
    phase_summary: {
        BFC: PhaseSummary;
        FFC: PhaseSummary;
    };
    interpretation: Interpretation;
    training_focus: TrainingFocus;
    qc_summary: QCSummary;
    phase_details: {
        BFC: PhaseDetails;
        FFC: PhaseDetails;
    };
    insights: {
        BFC: string[];
        FFC: string[];
    };
}

// Analytics Insights structure
export interface InsightItem {
    title: string;
    claim: string;
    why_it_matters: string;
    evidence?: {
        phase: string;
        metrics: Array<{
            metric: string;
            value?: number;
            delta_pct?: number;
            unit?: string;
            note?: string;
        }>;
        confidence: string;
    };
    keep_doing?: string[];
    risk_if_ignored?: string;
    what_to_try?: string[];
}

export interface ActionItem {
    priority: number;
    action: string;
    why: string;
    targets_next_session?: Array<{
        metric: string;
        target: string;
    }>;
    drills?: Array<{
        name: string;
        dosage: string;
    }>;
}

export interface PhaseAnalytics {
    dashboard: Array<{
        metric: string;
        value: number;
        iqr: number[];
        status: string;
        meaning: string;
    }>;
    what_is_going_well: InsightItem[];
    what_is_costing_you: InsightItem[];
    what_to_do_next: ActionItem[];
}

export interface AnalyticsInsights {
    by_phase: {
        RUNUP_LAST: PhaseAnalytics;
        BFC: PhaseAnalytics;
        FFC: PhaseAnalytics;
    };
}

export interface PressureReport {
    athlete: Athlete;
    session_meta: SessionMeta;
    report_readme: ReportReadme;
    deliveries: Delivery[];
    analytics_insights?: AnalyticsInsights;
    analytics_raw?: {
        baselines_by_phase: {
            RUNUP_LAST: Record<string, { p25: number; p50: number; p75: number; p90: number; p99?: number }>;
            BFC: Record<string, { p25: number; p50: number; p75: number; p90: number; p99?: number }>;
            FFC: Record<string, { p25: number; p50: number; p75: number; p90: number; p99?: number }>;
        };
        trends_by_phase: {
            RUNUP_LAST: Record<string, { slope: number; r_squared: number; direction: string }> & { trend_confidence: string; _n_balls: number };
            BFC: Record<string, { slope: number; r_squared: number; direction: string }> & { trend_confidence: string; _n_balls: number };
            FFC: Record<string, { slope: number; r_squared: number; direction: string }> & { trend_confidence: string; _n_balls: number };
        };
        baselines: Record<string, { p25: number; p50: number; p75: number; p90: number; p99?: number }>;
        trends: Record<string, { slope: number; r_squared: number; direction: string }> & { trend_confidence: string; _n_balls: number };
    };
}

// Stance Metrics Interfaces (for loading from stance_metrics.json)
export interface CoPPoint {
    t_ms: number;
    x: number;
    y: number;
    sumW: number;  // Total pressure at this time point
    sensors: Record<string, number>;  // Individual sensor values (S1-S8)
}

export interface StanceMetric {
    stance_id: number;
    foot: string;
    ct_s: number;
    peak_proxy: number;
    impulse_proxy: number;
    loading_rate_proxy: number;
    heel_to_fore_delay_ms: number;
    ml_balance_0_1: number;
    heel_share_0_1: number;
    phase: string;
    phase_confidence: string;
    qc_status: string;
    cop_trajectory: CoPPoint[];
    pattern?: string;
    ui?: {
        bands?: Record<string, string>;
        insights?: Array<{
            verdict: string;
            title: string;
            what_it_means: string;
            why_it_matters: string;
            fast_bowling_impact: string[];
            drills: Array<{ name: string; dosage: string }>;
            evidence: Record<string, any>;
        }>;
        tags?: string[];
        cop_summary?: Record<string, number>;
    };
}

export interface BallStanceData {
    ball_id: number;
    stance_metrics: {
        Left: StanceMetric[];
        Right: StanceMetric[];
    };
}

export interface StanceMetricsFile {
    balls: BallStanceData[];
}

// Events Interfaces (for loading from events.json)
export interface ContactEvent {
    stance_id: number;
    foot: string;
    ic_ts_ms: number;
    to_ts_ms: number;
    ct_s: number;
    peak_ts_ms: number;
}

export interface BallEvents {
    ball_id: number;
    events: {
        Left: ContactEvent[];
        Right: ContactEvent[];
    }; // Note: Based on inspection, events might be an object or array containing object. Assuming Object based on "Left/Right" keys.
    // Actually PowerShell output showed [0] accessed it. Let's assume it's like stance_metrics structure? 
    // If it is an array in JSON: events: [{Left:..., Right:...}]? 
    // Stance metrics has "stance_metrics": { Left:..., Right:... }. 
    // Let's assume "events": { Left:..., Right:... } based on standard pipeline.
    // If strict JSON check needed, I'd rely on standard pipeline pattern.
    // But I will treat 'events' as key containing the Left/Right lists directly or via index 0?
    // Let's assume simplest: events: { Left:[], Right:[] }.
    // If typescript error, I'll fix.
}

// Wait, inspection output showed:
// First event structure: Left : {...} ...
// converting JSON often makes single objects.
// Let's define it flexibly or check stance_metrics parallel.
// stance_metrics structure is `stance_metrics: { Left:..., Right:... }`
// events.json likely `events: { Left:..., Right:... }`?
// BUT, if `events` is a list in `events.json` top level?
// `events.json` -> `balls` -> `ball_id`, `events`.
// I'll try defining it matching the inspected logical structure.

export interface BallEventData {
    ball_id: number;
    events: {
        Left: ContactEvent[];
        Right: ContactEvent[];
    } | Array<{
        Left: ContactEvent[];
        Right: ContactEvent[];
    }>; // Handle potential array wrap
}

export interface EventsFile {
    balls: BallEventData[];
}
