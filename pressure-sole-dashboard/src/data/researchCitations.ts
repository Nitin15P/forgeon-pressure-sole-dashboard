// Research citations for drill recommendations
// Based on ForgeOn Pressure Sole Analytics Engine documentation

export interface Citation {
    authors: string;
    year: number;
    title: string;
    journal: string;
    volume?: string;
    pages?: string;
    relevance: string;
}

export interface DrillResearch {
    drillName: string;
    domain: string;
    keyAuthors: string;
    keyFinding: string;
    citations: Citation[];
}

/**
 * Map of drill names to their supporting research.
 * Keys are normalized drill names (lowercase).
 */
export const DRILL_CITATIONS: Record<string, DrillResearch> = {
    'ankle stiffness pogos': {
        drillName: 'Ankle Stiffness Pogos',
        domain: 'Leg stiffness, ground contact time',
        keyAuthors: 'Farley & Morgenroth (1999), Arampatzis et al. (2001)',
        keyFinding: 'Shorter ground contact times at back-foot contact (BFC) and higher ankle stiffness are associated with greater momentum retention through the crease.',
        citations: [
            {
                authors: 'Portus, M.R., Mason, B.R., Elliott, B.C., Pfitzner, M.C., & Done, R.P.',
                year: 2004,
                title: 'Technique factors related to ball release speed and trunk injuries in high performance cricket fast bowlers',
                journal: 'Sports Biomechanics',
                volume: '3(2)',
                pages: '263-284',
                relevance: 'Established that approach velocity and efficient ground contact mechanics correlate with release speed.'
            },
            {
                authors: 'Farley, C.T., & Morgenroth, D.C.',
                year: 1999,
                title: 'Leg stiffness primarily depends on ankle stiffness during human hopping',
                journal: 'Journal of Biomechanics',
                volume: '32(3)',
                pages: '267-273',
                relevance: 'Foundational paper showing ankle stiffness is the primary determinant of overall leg stiffness during bouncing/hopping movements.'
            },
            {
                authors: 'Arampatzis, A., Schade, F., Walsh, M., & Brüggemann, G.P.',
                year: 2001,
                title: 'Influence of leg stiffness and its effect on myodynamic jumping performance',
                journal: 'Journal of Electromyography and Kinesiology',
                volume: '11(5)',
                pages: '355-364',
                relevance: 'Higher leg stiffness associated with shorter ground contact times and improved power output.'
            },
            {
                authors: 'Spurrs, R.W., Murphy, A.J., & Watsford, M.L.',
                year: 2003,
                title: 'The effect of plyometric training on distance running performance',
                journal: 'European Journal of Applied Physiology',
                volume: '89(1)',
                pages: '1-7',
                relevance: 'Pogo-style plyometrics improve running economy through enhanced stiffness.'
            }
        ]
    },
    'low amplitude bounds': {
        drillName: 'Low Amplitude Bounds',
        domain: 'Horizontal force, momentum transfer',
        keyAuthors: 'Worthington et al. (2013), Weyand et al. (2000)',
        keyFinding: 'The bound phase is critical for transferring run-up momentum into the crease; horizontal bounding drills replicate this demand.',
        citations: [
            {
                authors: 'Worthington, P.J., King, M.A., & Ranson, C.A.',
                year: 2013,
                title: 'Relationships between fast bowling technique and ball release speed in cricket',
                journal: 'Journal of Applied Biomechanics',
                volume: '29(1)',
                pages: '78-84',
                relevance: 'Run-up speed and momentum entering the delivery stride significantly influence ball release speed.'
            },
            {
                authors: 'Weyand, P.G., Sternlight, D.B., Bellizzi, M.J., & Wright, S.',
                year: 2000,
                title: 'Faster top running speeds are achieved with greater ground forces not more rapid leg movements',
                journal: 'Journal of Applied Physiology',
                volume: '89(5)',
                pages: '1991-1999',
                relevance: 'Horizontal force application during ground contact determines velocity maintenance.'
            },
            {
                authors: 'Mero, A., & Komi, P.V.',
                year: 1994,
                title: 'EMG, force, and power analysis of sprint-specific strength exercises',
                journal: 'Journal of Applied Biomechanics',
                volume: '10(1)',
                pages: '1-13',
                relevance: 'Bounding drills develop horizontal force production capacity relevant to sprint-based activities.'
            },
            {
                authors: 'Rimmer, E., & Sleivert, G.',
                year: 2000,
                title: 'Effects of a plyometrics intervention program on sprint performance',
                journal: 'Journal of Strength and Conditioning Research',
                volume: '14(3)',
                pages: '295-301',
                relevance: 'Bounding improves horizontal power transfer.'
            }
        ]
    },
    'isometric bfc stability hold': {
        drillName: 'Isometric BFC Stability Hold',
        domain: 'Position-specific strength, kinetic chain',
        keyAuthors: 'Ferdinands et al. (2010), Rio et al. (2015)',
        keyFinding: 'Back-foot contact stability determines how effectively momentum transfers to the front leg; isometric holds build position-specific strength.',
        citations: [
            {
                authors: 'Ferdinands, R.E.D., Marshall, R.N., & Kersting, U.',
                year: 2010,
                title: 'Centre of mass kinematics of fast bowling in cricket',
                journal: 'Sports Biomechanics',
                volume: '9(3)',
                pages: '139-152',
                relevance: 'Back-foot contact provides a stable pivot point; collapse at BFC disrupts the kinetic chain.'
            },
            {
                authors: 'Rio, E., Kidgell, D., Purdam, C., Gaida, J., Moseley, G.L., Pearce, A.J., & Cook, J.',
                year: 2015,
                title: 'Isometric exercise induces analgesia and reduces inhibition in patellar tendinopathy',
                journal: 'British Journal of Sports Medicine',
                volume: '49(19)',
                pages: '1277-1283',
                relevance: 'Isometric holds are effective for building position-specific strength and have rehabilitative benefits.'
            },
            {
                authors: 'Orchard, J.W., James, T., & Portus, M.R.',
                year: 2006,
                title: 'Injuries to elite male cricketers in Australia over a 10-year period',
                journal: 'Journal of Science and Medicine in Sport',
                volume: '9(6)',
                pages: '459-467',
                relevance: 'Lower limb strength deficits contribute to injury; position-specific strength training is protective.'
            },
            {
                authors: 'Schache, A.G., Dorn, T.W., Blanch, P.D., Brown, N.A., & Pandy, M.G.',
                year: 2012,
                title: 'Mechanics of the human hamstring muscles during sprinting',
                journal: 'Medicine & Science in Sports & Exercise',
                volume: '44(4)',
                pages: '647-658',
                relevance: 'Isometric strength at specific joint angles transfers to dynamic performance.'
            }
        ]
    },
    'front leg brace walk-throughs': {
        drillName: 'Front Leg Brace Walk-throughs',
        domain: 'Front-leg bracing, release speed',
        keyAuthors: 'King et al. (2016), Worthington et al. (2013)',
        keyFinding: 'The front-leg brace is the single most important technical factor in determining ball release speed. Walk-through drills ingrain the motor pattern at low intensity.',
        citations: [
            {
                authors: 'King, M.A., Worthington, P.J., & Ranson, C.A.',
                year: 2016,
                title: 'Does maximising run-up speed improve fast bowling performance?',
                journal: 'Journal of Sports Sciences',
                volume: '34(24)',
                pages: '2259-2266',
                relevance: 'Front-leg bracing action is the primary mechanism for converting linear momentum into ball speed.'
            },
            {
                authors: 'Worthington, P.J., King, M.A., & Ranson, C.A.',
                year: 2013,
                title: 'Relationships between fast bowling technique and ball release speed in cricket',
                journal: 'Journal of Applied Biomechanics',
                volume: '29(1)',
                pages: '78-84',
                relevance: 'Front knee extension angle at ball release is the strongest predictor of release speed.'
            },
            {
                authors: 'Glazier, P.S., Paradisis, G.P., & Cooper, S.M.',
                year: 2000,
                title: 'Anthropometric and kinematic influences on release speed in men\'s fast-medium bowling',
                journal: 'Journal of Sports Sciences',
                volume: '18(12)',
                pages: '1013-1021',
                relevance: 'Effective blocking action of the front leg correlates with higher ball speeds.'
            },
            {
                authors: 'Ranson, C.A., Burnett, A.F., King, M., Patel, N., & O\'Sullivan, P.B.',
                year: 2008,
                title: 'The relationship between bowling action classification and three-dimensional lower trunk motion in fast bowlers in cricket',
                journal: 'Journal of Sports Sciences',
                volume: '26(3)',
                pages: '267-276',
                relevance: 'Front-leg mechanics influence trunk rotation and load distribution.'
            }
        ]
    },
    'active recovery walk': {
        drillName: 'Active Recovery Walk',
        domain: 'Metabolic recovery, fatigue management',
        keyAuthors: 'Dupont et al. (2004), Menzies et al. (2010)',
        keyFinding: 'Low-intensity active recovery facilitates metabolic clearance and prepares the body for subsequent high-intensity bouts without adding mechanical stress.',
        citations: [
            {
                authors: 'Dupont, G., Moalla, W., Guinhouya, C., Ahmaidi, S., & Berthoin, S.',
                year: 2004,
                title: 'Passive versus active recovery during high-intensity intermittent exercises',
                journal: 'Medicine & Science in Sports & Exercise',
                volume: '36(2)',
                pages: '302-308',
                relevance: 'Active recovery accelerates lactate clearance compared to passive rest.'
            },
            {
                authors: 'Menzies, P., Menzies, C., McIntyre, L., Paterson, P., Wilson, J., & Kemi, O.J.',
                year: 2010,
                title: 'Blood lactate clearance during active recovery after an intense running bout depends on the intensity of the active recovery',
                journal: 'Journal of Sports Sciences',
                volume: '28(9)',
                pages: '975-982',
                relevance: 'Low-intensity walking optimizes metabolic recovery.'
            },
            {
                authors: 'Petersen, C.J., Pyne, D., Portus, M., & Dawson, B.',
                year: 2009,
                title: 'Validity and reliability of GPS units to monitor cricket-specific movement patterns',
                journal: 'International Journal of Sports Physiology and Performance',
                volume: '4(3)',
                pages: '381-393',
                relevance: 'Recovery between bowling spells is critical for maintaining performance across a match.'
            },
            {
                authors: 'Burnett, A.F., Elliott, B.C., & Marshall, R.N.',
                year: 1995,
                title: 'The effect of a 12-over spell on fast bowling technique in cricket',
                journal: 'Journal of Sports Sciences',
                volume: '13(4)',
                pages: '329-341',
                relevance: 'Fatigue degrades bowling technique; active recovery may mitigate this effect.'
            }
        ]
    }
};

/**
 * Look up research citations for a drill name.
 * @param drillName - The name of the drill (case-insensitive)
 * @returns DrillResearch or undefined if not found
 */
export function getCitationsForDrill(drillName: string): DrillResearch | undefined {
    const normalizedName = drillName.toLowerCase().trim();
    return DRILL_CITATIONS[normalizedName];
}

/**
 * Check if a drill has associated research citations.
 * @param drillName - The name of the drill (case-insensitive)
 * @returns true if citations exist
 */
export function hasCitations(drillName: string): boolean {
    const normalizedName = drillName.toLowerCase().trim();
    return normalizedName in DRILL_CITATIONS;
}
