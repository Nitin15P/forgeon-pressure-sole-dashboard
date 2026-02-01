import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { CoPPoint } from '../types/pressure-report';

interface PhaseMarker {
    name: string;
    start: number;
    end: number;
    color: string;
}

interface SensorPath {
    element: SVGPathElement;
    sensorId: string;
    gradient: SVGRadialGradientElement;
    stops: SVGStopElement[];
    centroid: { x: number; y: number }; // Added for CoP calculation
}

interface PressureHeatmapSVGProps {
    leftFootData: CoPPoint[];
    rightFootData: CoPPoint[];
    deliveryName: string;
    phaseMarkers?: PhaseMarker[];
}

// Sensor to SVG path color mapping (based on 4-region SVG from ui/svg)
const SENSOR_SVG_COLORS: Record<string, string> = {
    'ForeFoot': '#FFCCBC',  // Toes region
    'UpperMid': '#B4E7AC',  // Midfoot region  
    'LowerMid': '#90CAF9',  // Arch region
    'Heel': '#B39DDB',      // Heel region
};

const SENSOR_REGIONS: Record<string, string[]> = {
    'ForeFoot': ['S1', 'S2'],
    'UpperMid': ['S3', 'S4', 'S5'],
    'LowerMid': ['S6'],
    'Heel': ['S7', 'S8']
};

const NEUTRAL_COLOR = '#e0e0e0'; // Color for inactive/flight phase
type ViewMode = 'heatmap' | 'cop';

const PressureHeatmapSVG: React.FC<PressureHeatmapSVGProps> = ({
    leftFootData,
    rightFootData,
    deliveryName,
    phaseMarkers = []
}) => {
    // State is now Time-Based, not Frame-Based
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [viewMode, setViewMode] = useState<ViewMode>('heatmap');

    const leftSvgRef = useRef<HTMLDivElement>(null);
    const rightSvgRef = useRef<HTMLDivElement>(null);

    // References for dynamic CoP elements
    const leftCopRef = useRef<SVGCircleElement | null>(null);
    const rightCopRef = useRef<SVGCircleElement | null>(null);
    const leftTrailRef = useRef<SVGPolylineElement | null>(null);
    const rightTrailRef = useRef<SVGPolylineElement | null>(null);

    // Store references to path elements and their sensor IDs for fast updates
    // This avoids querying the DOM every frame and solves the attribute overwriting bug
    const leftPathsRef = useRef<SensorPath[]>([]);
    const rightPathsRef = useRef<SensorPath[]>([]);

    // Store sensor centroids from the Pressure SVG for CoP calculation
    // These are loaded once from the 4-region SVG and used for all CoP calculations
    const leftSensorCentroidsRef = useRef<Record<string, { x: number; y: number }>>({});
    const rightSensorCentroidsRef = useRef<Record<string, { x: number; y: number }>>({});

    const animationRef = useRef<number | null>(null);

    // Calculate total duration based on maximum timestamp in data
    const maxTime = useMemo(() => {
        let max = 0;
        const lastLeft = leftFootData[leftFootData.length - 1];
        const lastRight = rightFootData[rightFootData.length - 1];

        if (lastLeft && lastLeft.t_ms > max) max = lastLeft.t_ms;
        if (lastRight && lastRight.t_ms > max) max = lastRight.t_ms;

        return max > 0 ? max : 2000; // Default if empty
    }, [leftFootData, rightFootData]);

    // Get max pressure value PER REGION for normalization
    // This ensures each region glows fully red at its own peak
    const regionMaxPressures = useMemo(() => {
        const calculateMaxes = (data: CoPPoint[]) => {
            const maxes: Record<string, number> = {
                'ForeFoot': 0, 'UpperMid': 0, 'LowerMid': 0, 'Heel': 0
            };

            data.forEach(point => {
                // Calculate sum for each region at this time point
                Object.entries(SENSOR_REGIONS).forEach(([region, sensors]) => {
                    const sum = sensors.reduce((acc, sensor) => acc + (point.sensors[sensor] || 0), 0);
                    if (sum > maxes[region]) maxes[region] = sum;
                });
            });
            return maxes;
        };

        const leftMaxes = calculateMaxes(leftFootData);
        const rightMaxes = calculateMaxes(rightFootData);

        // We can either normalize LEFT/RIGHT independently or together.
        // Usually better to normalize together to see symmetry/asymmetry.
        // Taking the max of both feet for each region.
        return {
            'ForeFoot': Math.max(leftMaxes.ForeFoot, rightMaxes.ForeFoot, 1),
            'UpperMid': Math.max(leftMaxes.UpperMid, rightMaxes.UpperMid, 1),
            'LowerMid': Math.max(leftMaxes.LowerMid, rightMaxes.LowerMid, 1),
            'Heel': Math.max(leftMaxes.Heel, rightMaxes.Heel, 1)
        };
    }, [leftFootData, rightFootData]);

    // Get pressure color based on intensity
    const getPressureColor = (value: number, max: number): string => {
        const intensity = value / max;
        if (intensity < 0.05) return NEUTRAL_COLOR; // Threshold for noise
        if (intensity < 0.25) return '#E3F2FD';  // Light blue
        if (intensity < 0.50) return '#64B5F6';  // Blue
        if (intensity < 0.75) return '#FF9800';  // Orange
        return '#F44336';  // Red
    };

    // Helper to find data point closest to current time
    // Returns null if the closest point is too far away (e.g. > 50ms), implying flight phase
    const findClosestPoint = (data: CoPPoint[], time: number): CoPPoint | null => {
        if (!data || data.length === 0) return null;

        // Simple search (could be optimized with binary search if needed, but N ~ 800 is small enough)
        // Find the point *before* or *at* the current time that is closest
        // Since data is 200Hz (5ms gap), we allow a small window.

        // Improve efficiency by checking bounds
        if (time < data[0].t_ms - 50) return null;
        if (time > data[data.length - 1].t_ms + 50) return null;

        // Optimization: Find index. Data matches usually have closest t_ms.
        // Array.find is acceptable for this size.
        // We look for a point within +/- 25ms window (half of 20fps frame, ample for 200Hz data)
        const closest = data.find(p => Math.abs(p.t_ms - time) < 25);

        return closest || null;
    };

    // Calculate CoP for a given time using sensor-level centroids
    const calculateCoP = (sensorCentroids: Record<string, { x: number; y: number }>, sensors: Record<string, number>) => {
        let totalWeightedX = 0;
        let totalWeightedY = 0;
        let totalForce = 0;

        // Iterate through all sensors (S1-S8) and weight by their individual positions
        Object.keys(sensors).forEach(sensorId => {
            const val = sensors[sensorId] || 0;
            const centroid = sensorCentroids[sensorId];

            if (val > 0 && centroid) {
                totalWeightedX += centroid.x * val;
                totalWeightedY += centroid.y * val;
                totalForce += val;
            }
        });

        if (totalForce === 0) return null;

        return {
            x: totalWeightedX / totalForce,
            y: totalWeightedY / totalForce,
            force: totalForce
        };
    };

    // Get trail points (scan back from current time)
    const getTrailPoints = (data: CoPPoint[], sensorCentroids: Record<string, { x: number; y: number }>) => {
        // Sample points every 50ms going back 500ms
        const trail: string[] = [];
        for (let t = currentTime; t > Math.max(0, currentTime - 600); t -= 40) {
            const point = findClosestPoint(data, t);
            if (point && point.sensors) {
                const pos = calculateCoP(sensorCentroids, point.sensors);
                if (pos) {
                    trail.push(`${pos.x},${pos.y}`);
                }
            }
        }
        return trail.join(' ');
    };


    // Update SVG colors based on current time
    const updateFootVisualization = (
        paths: SensorPath[],
        data: CoPPoint[],
        copRef: React.RefObject<SVGCircleElement | null>,
        trailRef: React.RefObject<SVGPolylineElement | null>,
        sensorCentroids: Record<string, { x: number; y: number }>
    ) => {
        const point = findClosestPoint(data, currentTime);

        // --- HEATMAP MODE ---
        if (viewMode === 'heatmap') {
            // Hide CoP elements
            if (copRef.current) copRef.current.setAttribute('opacity', '0');
            if (trailRef.current) trailRef.current.setAttribute('opacity', '0');

            if (!point || !point.sensors) {
                // Flight phase or no data: reset all stops to neutral
                paths.forEach(({ stops, element, gradient }) => {
                    if (element) {
                        element.setAttribute('stroke', 'none');
                        // Ensure gradient fill is restored even in neutral state
                        if (gradient) {
                            element.setAttribute('fill', `url(#${gradient.id})`);
                        }
                    }
                    if (stops && stops.length >= 2) {
                        stops[0].setAttribute('stop-color', NEUTRAL_COLOR);
                        stops[0].setAttribute('stop-opacity', '1');
                        stops[1].setAttribute('stop-color', NEUTRAL_COLOR);
                        stops[1].setAttribute('stop-opacity', '0');
                    }
                });
                return;
            }

            // 1. Calculate Region Values for this frame
            const regionValues: Record<string, number> = {};
            Object.entries(SENSOR_REGIONS).forEach(([region, sensors]) => {
                const sum = sensors.reduce((acc, sensor) => acc + (point.sensors[sensor] || 0), 0);
                regionValues[region] = sum;
            });

            // 2. Apply colors to region paths
            paths.forEach(({ stops, element, sensorId, gradient }) => {
                // sensorId now contains the region name (ForeFoot, UpperMid, etc.)
                const regionName = sensorId;

                if (regionValues[regionName] !== undefined && stops && stops.length >= 2) {
                    const value = regionValues[regionName];
                    const max = regionMaxPressures[regionName as keyof typeof regionMaxPressures];
                    const color = getPressureColor(value, max);

                    // Restore gradient fill if it was removed
                    if (gradient) {
                        element.setAttribute('fill', `url(#${gradient.id})`);
                        element.setAttribute('fill-opacity', '1');
                    }

                    // Force stroke to none - we rely on the large gradient to merge shapes naturally
                    element.setAttribute('stroke', 'none');

                    // Update stops for fading effect
                    stops[0].setAttribute('stop-color', color);
                    stops[0].setAttribute('stop-opacity', '1');

                    stops[1].setAttribute('stop-color', color); // Use same color strictly fading alpha
                    stops[1].setAttribute('stop-opacity', '0');
                }
            });
        }
        // --- CoP MODE ---
        else {
            // Reset sensors to neutral grey
            paths.forEach(({ stops, element }) => {
                element.setAttribute('stroke', 'none');
                element.setAttribute('fill', NEUTRAL_COLOR); // Ensure fill is neutral
                if (stops && stops.length >= 2) {
                    stops[0].setAttribute('stop-color', NEUTRAL_COLOR);
                    stops[0].setAttribute('stop-opacity', '1');
                    stops[1].setAttribute('stop-color', NEUTRAL_COLOR);
                    stops[1].setAttribute('stop-opacity', '0');
                }
            });

            if (point && point.sensors) {
                const cop = calculateCoP(sensorCentroids, point.sensors);

                // Draw CoP Dot
                if (copRef.current) {
                    if (cop) {
                        copRef.current.setAttribute('cx', cop.x.toString());
                        copRef.current.setAttribute('cy', cop.y.toString());

                        // Dynamic Sizing: 25 (min) to 85 (max) based on force
                        // Assuming force ranges ~0-400
                        const dynamicRadius = Math.min(85, Math.max(25, (cop.force || 0) * 0.2));
                        copRef.current.setAttribute('r', dynamicRadius.toString());

                        copRef.current.setAttribute('opacity', '1');
                    } else {
                        copRef.current.setAttribute('opacity', '0');
                    }
                }

                // Draw Trail
                if (trailRef.current) {
                    const points = getTrailPoints(data, sensorCentroids);
                    trailRef.current.setAttribute('points', points);
                    trailRef.current.setAttribute('opacity', '0.6');
                }
            } else {
                if (copRef.current) copRef.current.setAttribute('opacity', '0');
                if (trailRef.current) trailRef.current.setAttribute('opacity', '0');
            }
        }
    };

    // Load and Process SVG files
    useEffect(() => {
        const loadSVG = async (url: string, ref: React.RefObject<HTMLDivElement | null>, pathsRef: React.MutableRefObject<SensorPath[]>) => {
            try {
                // Fetch SVG
                const response = await fetch(url);
                const svgText = await response.text();

                if (ref.current) {
                    ref.current.innerHTML = svgText;

                    const svgElement = ref.current.querySelector('svg');
                    if (!svgElement) return;

                    // Ensure defs exists
                    let defs = svgElement.querySelector('defs');
                    if (!defs) {
                        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                        svgElement.prepend(defs);
                    }

                    // Define CoP Glow Gradient
                    const copGradientId = `cop-glow-${url.includes('Left') ? 'L' : 'R'}`;
                    const copGradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
                    copGradient.setAttribute('id', copGradientId);
                    copGradient.setAttribute('cx', '50%');
                    copGradient.setAttribute('cy', '50%');
                    copGradient.setAttribute('r', '50%');
                    copGradient.setAttribute('fx', '50%');
                    copGradient.setAttribute('fy', '50%');

                    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                    stop1.setAttribute('offset', '0%');
                    stop1.setAttribute('stop-color', '#F44336'); // High Intensity Red
                    stop1.setAttribute('stop-opacity', '1');

                    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                    stop2.setAttribute('offset', '100%');
                    stop2.setAttribute('stop-color', '#F44336');
                    stop2.setAttribute('stop-opacity', '0');

                    copGradient.appendChild(stop1);
                    copGradient.appendChild(stop2);
                    defs.appendChild(copGradient);

                    // Inject CoP elements dynamically
                    // Trail first (so it's behind dot)
                    const trail = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
                    trail.setAttribute('fill', 'none');
                    trail.setAttribute('stroke', '#FF8A80'); // Light Red/Pink trail
                    trail.setAttribute('stroke-width', '4');
                    trail.setAttribute('stroke-linecap', 'round');
                    trail.setAttribute('opacity', '0'); // Hidden by default
                    svgElement.appendChild(trail);

                    if (url.includes('Left')) leftTrailRef.current = trail;
                    else rightTrailRef.current = trail;

                    // Dot (Glowing Red Region)
                    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    dot.setAttribute('r', '40'); // Larger radius for 'Region' effect (Way bigger)
                    dot.setAttribute('fill', `url(#${copGradientId})`);
                    dot.setAttribute('opacity', '0');
                    svgElement.appendChild(dot);

                    if (url.includes('Left')) leftCopRef.current = dot;
                    else rightCopRef.current = dot;

                    // Parse paths and identify sensors/regions ONCE
                    const paths = ref.current.querySelectorAll('path[fill]');
                    // Define mapped path type with more info
                    const mappedPaths: SensorPath[] = [];
                    const isCoP = url.includes('_CoP');

                    paths.forEach((path) => {
                        const originalFill = path.getAttribute('fill');
                        if (!originalFill) return;

                        let sensorId: string | undefined;

                        if (isCoP && originalFill === 'black') {
                            // CoP SVG: The black outline becomes the grey base
                            // We'll use 'FullSole' as the identifier
                            sensorId = 'FullSole';
                            // Set it to grey immediately
                            path.setAttribute('fill', NEUTRAL_COLOR);
                        } else if (originalFill !== 'black') {
                            // Pressure SVG: Identify region by color
                            sensorId = Object.keys(SENSOR_SVG_COLORS).find(
                                sid => SENSOR_SVG_COLORS[sid] === originalFill
                            );
                        }

                        if (sensorId) {
                            // Calculate Centroid
                            let centroid = { x: 0, y: 0 };
                            try {
                                const bbox = (path as SVGPathElement).getBBox();
                                centroid = {
                                    x: bbox.x + bbox.width / 2,
                                    y: bbox.y + bbox.height / 2
                                };
                            } catch (e) { console.warn('No bbox for', sensorId); }

                            path.setAttribute('data-sensor-id', sensorId);
                            mappedPaths.push({
                                element: path as SVGPathElement,
                                sensorId,
                                gradient: null as any, // Will be assigned in region processing
                                stops: [],
                                centroid
                            });

                            // For Pressure SVG: Store sensor-level centroids for CoP calculation
                            // Map each region's centroid to all sensors in that region
                            if (!isCoP && sensorId in SENSOR_REGIONS) {
                                const regionSensors = SENSOR_REGIONS[sensorId];
                                regionSensors.forEach(sensor => {
                                    const centroidsRef = url.includes('Left') ? leftSensorCentroidsRef : rightSensorCentroidsRef;
                                    centroidsRef.current[sensor] = centroid;
                                });
                            }
                        }
                    });


                    // --- SIMPLIFIED GRADIENT CREATION FOR 4-REGION SVG ---
                    // Skip gradient creation for CoP mode - we only need the solid grey base
                    if (!isCoP) {
                        // Each path in the Pressure SVG IS a complete region, so we create one gradient per path
                        mappedPaths.forEach(p => {
                            try {
                                const bbox = p.element.getBBox();
                                const centerX = bbox.x + bbox.width / 2;
                                const centerY = bbox.y + bbox.height / 2;
                                const radius = Math.max(bbox.width, bbox.height) * 0.8; // Cover most of the region

                                // Create radial gradient for this region
                                const gradientId = `grad-${url.includes('Left') ? 'L' : 'R'}-${p.sensorId}`;
                                const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
                                gradient.setAttribute('id', gradientId);
                                gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
                                gradient.setAttribute('cx', centerX.toString());
                                gradient.setAttribute('cy', centerY.toString());
                                gradient.setAttribute('r', radius.toString());
                                gradient.setAttribute('fx', centerX.toString());
                                gradient.setAttribute('fy', centerY.toString());

                                // Stops - solid at center, fade to transparent at edges
                                const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                                stop1.setAttribute('offset', '0%');
                                stop1.setAttribute('stop-color', NEUTRAL_COLOR);
                                stop1.setAttribute('stop-opacity', '1');

                                const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                                stop2.setAttribute('offset', '100%');
                                stop2.setAttribute('stop-color', NEUTRAL_COLOR);
                                stop2.setAttribute('stop-opacity', '0');

                                gradient.appendChild(stop1);
                                gradient.appendChild(stop2);
                                defs!.appendChild(gradient);

                                // Assign gradient to path
                                p.element.setAttribute('fill', `url(#${gradientId})`);
                                p.element.setAttribute('fill-opacity', '1');
                                p.element.setAttribute('stroke', 'none');
                                p.gradient = gradient;
                                p.stops = [stop1, stop2];
                            } catch (e) {
                                console.warn('Could not create gradient for', p.sensorId, e);
                            }
                        });
                    }

                    // No orphan handling needed - all paths should be mapped

                    pathsRef.current = mappedPaths;

                    // Trigger initial update to color frame 0 if data exists
                    if (url.includes('Left') && leftFootData.length > 0) {
                        // Will be handled by next useEffect
                    }
                }
            } catch (error) {
                console.error('Error loading SVG:', error);
            }
        };

        // Load Pressure SVG first to populate sensor centroids (needed for CoP calculation)
        // Then load the appropriate display SVG based on mode
        const loadCentroids = async () => {
            // Only load centroids once
            if (Object.keys(leftSensorCentroidsRef.current).length === 0) {
                // Load Pressure SVGs to extract sensor positions
                await loadSVG('/Left_Sole.svg', leftSvgRef, leftPathsRef);
                await loadSVG('/Right_Sole.svg', rightSvgRef, rightPathsRef);
            }

            // Now load the display SVG based on current mode
            const svgSuffix = viewMode === 'cop' ? '_CoP' : '';
            await loadSVG(`/Left_Sole${svgSuffix}.svg`, leftSvgRef, leftPathsRef);
            await loadSVG(`/Right_Sole${svgSuffix}.svg`, rightSvgRef, rightPathsRef);
        };

        loadCentroids();
    }, [viewMode]); // Reload when viewMode changes

    // Animation Loop
    useEffect(() => {
        if (!isPlaying) {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            return;
        }

        let lastTimestamp = performance.now();

        const animate = (timestamp: number) => {
            const deltaTime = timestamp - lastTimestamp;
            lastTimestamp = timestamp;

            // Update time
            setCurrentTime(prev => {
                const nextTime = prev + (deltaTime * playbackSpeed);

                if (nextTime >= maxTime) {
                    setIsPlaying(false);
                    return 0; // Reset or separate "Stop" state
                }
                return nextTime;
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isPlaying, playbackSpeed, maxTime]);

    // Update Visualizations when time or data changes
    useEffect(() => {
        if (leftPathsRef.current.length > 0) {
            updateFootVisualization(leftPathsRef.current, leftFootData, leftCopRef, leftTrailRef, leftSensorCentroidsRef.current);
        }
        if (rightPathsRef.current.length > 0) {
            updateFootVisualization(rightPathsRef.current, rightFootData, rightCopRef, rightTrailRef, rightSensorCentroidsRef.current);
        }
    }, [currentTime, leftFootData, rightFootData, viewMode]);


    return (
        <div className="card">
            <div className="flex justify-between items-center mb-md">
                <h3 className="card-title">
                    Analysis: {deliveryName}
                </h3>

                {/* Mode Toggle */}
                <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px' }}>
                    <button
                        onClick={() => setViewMode('heatmap')}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: viewMode === 'heatmap' ? 'var(--primary)' : 'transparent',
                            color: viewMode === 'heatmap' ? 'white' : 'var(--text-muted)',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                        }}
                    >
                        Pressure
                    </button>
                    <button
                        onClick={() => setViewMode('cop')}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: viewMode === 'cop' ? '#00E5FF' : 'transparent',
                            color: viewMode === 'cop' ? 'black' : 'var(--text-muted)',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                        }}
                    >
                        CoP Track
                    </button>
                </div>
            </div>

            <p className="text-sm text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>
                {viewMode === 'heatmap' ? (
                    <>
                        Animated visualization showing pressure distribution across regions.
                        <span className="ml-sm inline-block">
                            <span style={{ color: '#64B5F6', backgroundColor: '#333', padding: '2px 6px', borderRadius: '4px', margin: '0 2px' }}>Low</span>
                            →
                            <span style={{ color: '#FF9800', backgroundColor: '#333', padding: '2px 6px', borderRadius: '4px', margin: '0 2px' }}>Medium</span>
                            →
                            <span style={{ color: '#F44336', backgroundColor: '#333', padding: '2px 6px', borderRadius: '4px', margin: '0 2px' }}>High</span>
                        </span>
                    </>
                ) : (
                    <>
                        Tracking the Center of Pressure (CoP) movement.
                        <span className="ml-sm inline-block">
                            <span style={{ color: '#F44336', fontWeight: 'bold' }}>● Current CoP</span>
                            <span className="ml-xs text-muted">(Red Motion Region)</span>
                        </span>
                    </>
                )}
            </p>

            {/* Phase Markers Legend */}
            {phaseMarkers.length > 0 && (
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)', fontSize: '0.8rem' }}>
                    {phaseMarkers.map((marker, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '12px', height: '12px', backgroundColor: marker.color, borderRadius: '2px' }}></div>
                            <span>{marker.name}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* SVG Display */}
            <div style={{ display: 'flex', gap: 'var(--spacing-xl)', justifyContent: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ textAlign: 'center' }}>
                    <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Left Foot</h4>
                    <div
                        ref={leftSvgRef}
                        style={{
                            width: '200px',
                            height: '520px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    />
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Right Foot</h4>
                    <div
                        ref={rightSvgRef}
                        style={{
                            width: '200px',
                            height: '520px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    />
                </div>
            </div>

            {/* Timeline */}
            <div style={{ marginBottom: 'var(--spacing-md)', position: 'relative' }}>
                {/* Phase Marker Overlays */}
                <div style={{
                    position: 'absolute',
                    top: '-5px',
                    left: '0',
                    width: '100%',
                    height: '5px',
                    pointerEvents: 'none',
                    zIndex: 0
                }}>
                    {phaseMarkers.map((marker, idx) => {
                        // Logic now simpler: Map TIME directly to percentage
                        const leftPct = (marker.start / maxTime) * 100;
                        const widthPct = ((marker.end - marker.start) / maxTime) * 100;

                        // Clamp values
                        const safeLeft = Math.max(0, Math.min(100, leftPct));
                        const safeWidth = Math.max(0, Math.min(100 - safeLeft, widthPct));

                        return (
                            <div
                                key={idx}
                                style={{
                                    position: 'absolute',
                                    left: `${safeLeft}%`,
                                    width: `${safeWidth}%`,
                                    height: '100%',
                                    backgroundColor: marker.color,
                                    opacity: 0.7,
                                    borderRadius: '2px'
                                }}
                                title={`${marker.name}: ${marker.start}ms - ${marker.end}ms`}
                            />
                        );
                    })}
                </div>

                <input
                    type="range"
                    min="0"
                    max={maxTime} // Slider now operates on TIME
                    step="10"     // 10ms step for scrubbing
                    value={currentTime}
                    onChange={(e) => {
                        setIsPlaying(false);
                        setCurrentTime(parseInt(e.target.value));
                    }}
                    style={{ width: '100%', position: 'relative', zIndex: 2 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                    <span>{Math.round(currentTime)}ms / {Math.round(maxTime)}ms</span>
                    <span>{playbackSpeed}x Speed</span>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', justifyContent: 'center' }}>
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={{
                        padding: 'var(--spacing-sm) var(--spacing-lg)',
                        backgroundColor: isPlaying ? 'var(--warning)' : 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        minWidth: '100px'
                    }}
                >
                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
                <button
                    onClick={() => {
                        setIsPlaying(false);
                        setCurrentTime(0);
                    }}
                    style={{
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    ⏮ Reset
                </button>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem' }}>Speed:</span>
                    {[0.5, 1, 2].map(speed => (
                        <button
                            key={speed}
                            onClick={() => setPlaybackSpeed(speed)}
                            style={{
                                padding: 'var(--spacing-xs) var(--spacing-sm)',
                                backgroundColor: playbackSpeed === speed ? 'var(--primary)' : 'var(--bg-secondary)',
                                color: playbackSpeed === speed ? 'white' : 'var(--text)',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                            }}
                        >
                            {speed}x
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PressureHeatmapSVG;
