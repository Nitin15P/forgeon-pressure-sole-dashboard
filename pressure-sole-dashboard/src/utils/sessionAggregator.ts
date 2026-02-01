import type { PressureReport, PhaseAnalytics } from '../types/pressure-report';
import { cleanTerminology } from './formatters';

export interface PhaseRecommendation {
    text: string;
    drillName?: string;
}

export interface PhaseInsight {
    goingWell: string[];
    costing: string[];
    nextSteps: PhaseRecommendation[];
}

export interface SessionInsights {
    RUNUP_LAST: PhaseInsight;
    BFC: PhaseInsight;
    FFC: PhaseInsight;
}

export interface SessionHighlights {
    totalDeliveries: number;
    usableDeliveries: number;
    avgBFCContact: number;
    avgFFCContact: number;
    dominantBFCPattern: string;
    dominantFFCPattern: string;
}

/**
 * Extracts session-level insights from the analytics_insights section
 */
export function aggregateSessionInsights(report: PressureReport): SessionInsights {
    // If analytics_insights exists, use it directly
    if (report.analytics_insights?.by_phase) {
        const { RUNUP_LAST, BFC, FFC } = report.analytics_insights.by_phase;

        return {
            RUNUP_LAST: extractPhaseInsight(RUNUP_LAST),
            BFC: extractPhaseInsight(BFC),
            FFC: extractPhaseInsight(FFC)
        };
    }

    // Fallback to empty insights if analytics_insights doesn't exist
    return {
        RUNUP_LAST: { goingWell: [], costing: [], nextSteps: [] },
        BFC: { goingWell: [], costing: [], nextSteps: [] },
        FFC: { goingWell: [], costing: [], nextSteps: [] }
    };
}

/**
 * Extracts insights from a PhaseAnalytics object
 */
function extractPhaseInsight(phaseAnalytics: PhaseAnalytics): PhaseInsight {
    const goingWell: string[] = [];
    const costing: string[] = [];
    const nextSteps: PhaseRecommendation[] = [];

    // Extract "what's going well"
    phaseAnalytics.what_is_going_well.forEach(item => {
        goingWell.push(cleanTerminology(`${item.title}: ${item.claim}`));
        if (item.keep_doing && item.keep_doing.length > 0) {
            item.keep_doing.forEach(action => {
                goingWell.push(cleanTerminology(`  → ${action}`));
            });
        }
    });

    // Extract "what's costing you"
    phaseAnalytics.what_is_costing_you.forEach(item => {
        costing.push(cleanTerminology(`${item.title}`));
        costing.push(cleanTerminology(`  ${item.claim}`));
        if (item.what_to_try && item.what_to_try.length > 0) {
            item.what_to_try.forEach(suggestion => {
                costing.push(cleanTerminology(`  → Try: ${suggestion}`));
            });
        }
    });

    // Extract "what to do next"
    phaseAnalytics.what_to_do_next.forEach(item => {
        nextSteps.push({
            text: cleanTerminology(`Priority ${item.priority}: ${item.action}`),
            drillName: undefined
        });
        if (item.drills && item.drills.length > 0) {
            item.drills.forEach(drill => {
                nextSteps.push({
                    text: cleanTerminology(`  → ${drill.name} (${drill.dosage})`),
                    drillName: drill.name
                });
            });
        }
    });

    return { goingWell, costing, nextSteps };
}

/**
 * Calculates session highlights
 */
export function calculateSessionHighlights(report: PressureReport): SessionHighlights {
    const usableDeliveries = report.deliveries.filter(d => d.usable_delivery);

    const avgBFCContact = usableDeliveries.length > 0
        ? usableDeliveries.reduce((sum, d) => sum + d.phase_summary.BFC.ct_s, 0) / usableDeliveries.length
        : 0;

    const avgFFCContact = usableDeliveries.length > 0
        ? usableDeliveries.reduce((sum, d) => sum + d.phase_summary.FFC.ct_s, 0) / usableDeliveries.length
        : 0;

    // Find dominant patterns
    const bfcPatterns = usableDeliveries.map(d => d.phase_summary.BFC.pattern);
    const ffcPatterns = usableDeliveries.map(d => d.phase_summary.FFC.pattern);

    const dominantBFCPattern = getMostCommon(bfcPatterns);
    const dominantFFCPattern = getMostCommon(ffcPatterns);

    return {
        totalDeliveries: report.deliveries.length,
        usableDeliveries: usableDeliveries.length,
        avgBFCContact,
        avgFFCContact,
        dominantBFCPattern,
        dominantFFCPattern
    };
}

function getMostCommon(arr: string[]): string {
    if (arr.length === 0) return 'N/A';

    const counts = arr.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}
