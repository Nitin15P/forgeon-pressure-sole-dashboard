import type { PressureReport, Delivery } from '../types/pressure-report';

export interface BucketSynthesis {
    title: string;
    summary: string;
    consistency: 'High' | 'Moderate' | 'Low';
    primarySignal: string; // e.g., "Rhythmic" or "Braking Dominant"
}

export interface CoachSynthesisReport {
    sessionNarrative: string;
    approach: BucketSynthesis;
    entry: BucketSynthesis;
    execution: BucketSynthesis;
}

/**
 * Generates the top-level "Coach Synthesis" report from the raw pressure data.
 * This function translates numbers into the "3 Buckets" narrative.
 */
export function generateCoachSynthesis(report: PressureReport): CoachSynthesisReport {
    const usableDeliveries = report.deliveries.filter(d => d.usable_delivery);

    // Safety check for empty session
    if (usableDeliveries.length === 0) {
        return createEmptySynthesis();
    }

    const approach = analyzeApproach(report);
    const entry = analyzeEntry(report, usableDeliveries);
    const execution = analyzeExecution(report, usableDeliveries);

    const sessionNarrative = generateSessionNarrative(approach, entry, execution);

    return {
        sessionNarrative,
        approach,
        entry,
        execution
    };
}

function createEmptySynthesis(): CoachSynthesisReport {
    return {
        sessionNarrative: "No usable data found to generate synthesis.",
        approach: { title: "Approach Behaviour", summary: "Insufficient data", consistency: "Low", primarySignal: "N/A" },
        entry: { title: "Entry Quality", summary: "Insufficient data", consistency: "Low", primarySignal: "N/A" },
        execution: { title: "Execution Style", summary: "Insufficient data", consistency: "Low", primarySignal: "N/A" }
    };
}

/**
 * BUCKET 1: APPROACH (Run-up)
 * Focus: Rhythm, Consistency, Balance
 */
function analyzeApproach(report: PressureReport): BucketSynthesis {
    // We use RUNUP_LAST phase metrics as proxy for approach quality
    // If explicit RUNUP_LAST stats are in analytics_raw, use those.
    // Otherwise, infer from BFC entry consistency (as a proxy for approach consistency)

    // Check if we have explicit Run-up data
    const runupRaw = report.analytics_raw?.baselines_by_phase?.RUNUP_LAST;
    let consistency: 'High' | 'Moderate' | 'Low' = 'Moderate';
    let primarySignal = "Balanced";
    let summary = "";

    if (runupRaw) {
        // Use IQR of loading rate or impulse as a proxy for "Rhythm Consistency"
        // Lower IQR relative to median = Higher Consistency
        const p50 = runupRaw['impulse_proxy']?.p50 || 1;
        const iqr = (runupRaw['impulse_proxy']?.p75 || 0) - (runupRaw['impulse_proxy']?.p25 || 0);
        const cv = iqr / p50; // Coefficient of Variation proxy

        if (cv < 0.1) consistency = 'High';
        else if (cv > 0.25) consistency = 'Low';
        else consistency = 'Moderate';
    } else {
        // Fallback: If BFC timing is highly consistent, Approach is likely consistent
        // Calculate SD of BFC time... but let's stick to simple "Moderate" default if no data.
        primarySignal = "Data Limited";
    }

    // Generate Narrative
    if (consistency === 'High') {
        summary = "Approach rhythm is highly repeatable. The athlete is finding the crease with consistent momentum.";
        primarySignal = "Rhythmic & Repeatable";
    } else if (consistency === 'Low') {
        summary = "Approach variability is impacting entry stability. Rhythm appears broken across the session.";
        primarySignal = "Variable Rhythm";
    } else {
        summary = "Approach shows average consistency. Rhythm is established but susceptible to pressure.";
        primarySignal = "Established Rhythm";
    }

    return {
        title: "Approach Behaviour",
        summary,
        consistency,
        primarySignal
    };
}

/**
 * BUCKET 2: ENTRY (BFC)
 * Focus: Stability, Readiness, Chaos vs Control
 */
function analyzeEntry(report: PressureReport, deliveries: Delivery[]): BucketSynthesis {
    // 1. Identify Dominant Pattern
    const patterns = deliveries.map(d => d.phase_summary.BFC.pattern);
    const dominantPattern = getMode(patterns) || "Neutral";

    // 2. Assess Stability (using Balance or Heel Share consistency)
    // If stats are available...
    const bfcRaw = report.analytics_raw?.baselines_by_phase?.BFC;
    let consistency: 'High' | 'Moderate' | 'Low' = 'Moderate';

    if (bfcRaw && bfcRaw['ml_balance_0_1']) {
        const iqr = (bfcRaw['ml_balance_0_1'].p75 || 0) - (bfcRaw['ml_balance_0_1'].p25 || 0);
        if (iqr < 0.15) consistency = 'High';
        else if (iqr > 0.3) consistency = 'Low';
    }

    let summary = "";
    let primarySignal = dominantPattern.replace(/_/g, " ");

    if (consistency === 'High') {
        summary = `Entry is extremely stable. The athlete is creating a reliable platform (` + primarySignal + `) for delivery.`;
    } else if (consistency === 'Low') {
        summary = `Entry stability is compromised. Chaos at contact is forcing downstream corrections.`;
    } else {
        summary = `Entry quality is functional but varies. The platform is generally ` + primarySignal + ` but lapses under load.`;
    }

    return {
        title: "Entry Quality",
        summary,
        consistency,
        primarySignal: consistency === 'Low' ? "Unstable Platform" : "Controlled Entry"
    };
}

/**
 * BUCKET 3: EXECUTION (FFC)
 * Focus: Braking, Stiffness, Redirection
 */
function analyzeExecution(report: PressureReport, deliveries: Delivery[]): BucketSynthesis {
    // 1. Identify Style (Stiff vs Absorbing)
    // Short CT (< 0.15s approx, but use bands) = Stiff
    const avgCT = deliveries.reduce((sum, d) => sum + d.phase_summary.FFC.ct_s, 0) / deliveries.length;

    let style = "Balanced";
    if (avgCT < 0.18) style = "Stiff / Braking";
    else if (avgCT > 0.25) style = "Absorbing / Long";
    else style = "Redirection";

    // 2. Consistency
    const ffcRaw = report.analytics_raw?.baselines_by_phase?.FFC;
    let consistency: 'High' | 'Moderate' | 'Low' = 'Moderate';

    if (ffcRaw && ffcRaw['ct_s']) {
        const iqr = (ffcRaw['ct_s'].p75 || 0) - (ffcRaw['ct_s'].p25 || 0);
        const cv = iqr / (ffcRaw['ct_s'].p50 || 1);
        if (cv < 0.1) consistency = 'High';
        else if (cv > 0.2) consistency = 'Low';
    }

    let summary = "";
    if (style.includes("Stiff")) {
        summary = "Front foot contact is characterized by high stiffness and sharp braking forces. The block is effective.";
    } else if (style.includes("Absorbing")) {
        summary = "Front foot contact shows significant force absorption. The athlete is 'muscling' rather than blocking.";
    } else {
        summary = "Front foot mechanics show a balance of braking and redirection.";
    }

    if (consistency === 'Low') summary += " Execution varies significantly ball-to-ball.";

    return {
        title: "Execution Style",
        summary,
        consistency,
        primarySignal: style
    };
}

function generateSessionNarrative(approach: BucketSynthesis, entry: BucketSynthesis, execution: BucketSynthesis): string {
    // "Across the session..." narrative in authentic coach-speak
    let narrative = "Overall, the athlete showed ";

    // Part 1: Approach/Entry (Run-up and Base)
    if (approach.consistency === 'High' && entry.consistency === 'High') {
        narrative += "a really smooth approach today, getting into a great rhythm that set up a rock-solid base at the crease. By hitting the deck so consistently at back-foot, they've built a stable platform that lets everything else click into place without any extra noise. ";
    } else if (approach.consistency === 'Low') {
        narrative += "a bit of trouble with the run-up rhythm, which meant the entry into the delivery stride was a bit all over the place. Without that consistent tempo, they were forced to fight for balance at back-foot, which is always going to make it hard to hit a consistent line and length. ";
    } else {
        narrative += "a decent enough rhythm in the run-up, but the entry at the crease is still a bit hit-and-miss under pressure. There's a good foundation there, but they just need to trust that approach a bit more to ensure they're in a strong position every single time they land. ";
    }

    // Part 2: Execution (FFC and Block)
    if (execution.primarySignal.includes("Stiff")) {
        narrative += "The front-foot block was nice and stiff, snapping that front leg to really whip the momentum through the crease. That's exactly the kind of bracing we're looking for to maximize pace and get some extra carry off the pitch.";
    } else if (execution.primarySignal.includes("Absorbing")) {
        narrative += "However, it looks like they're collapsing a bit at front-foot contact, absorbing the impact rather than bracing against it. That 'soft' landing is leaking a lot of energy, so they're having to muscle the ball instead of letting that momentum do the work.";
    } else {
        narrative += "The final delivery stride shows a decent balance between staying tall and pushing through. There's good redirection happening at release, though if they can stiffen up that front leg just a touch more, there's definitely some extra zip to be found.";
    }

    return narrative;
}

function getMode(arr: string[]): string | null {
    if (arr.length === 0) return null;
    const cnts = arr.reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {} as any);
    return Object.keys(cnts).reduce((a, b) => cnts[a] > cnts[b] ? a : b);
}
