import React from 'react';
import type { TrainingFocus as TrainingFocusType } from '../types/pressure-report';
import CitationPopover from './CitationPopover';
import { hasCitations } from '../data/researchCitations';

interface TrainingFocusProps {
    trainingFocus: TrainingFocusType;
}

const TrainingFocus: React.FC<TrainingFocusProps> = ({ trainingFocus }) => {
    return (
        <div className="training-focus">
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">{trainingFocus.title}</h3>
                    <p className="card-subtitle">{trainingFocus.program_name}</p>
                </div>

                <div className="mb-lg">
                    <div className="badge badge-info mb-sm">Load Guidance</div>
                    <p className="text-muted">{trainingFocus.load_guidance}</p>
                </div>

                <div className="training-sessions">
                    <h4 className="mb-md">Training Schedule</h4>
                    <div className="grid grid-2 gap-md">
                        {trainingFocus.sessions.map((session, index) => (
                            <div key={index} className="card" style={{ background: 'var(--light-bg)' }}>
                                <div className="flex items-center gap-sm mb-sm">
                                    <span className="badge badge-primary">Day {session.day}</span>
                                    <span className="font-bold">{session.focus}</span>
                                </div>

                                <div className="drills">
                                    {session.drills.map((drill, drillIndex) => (
                                        <div key={drillIndex} className="drill mb-md">
                                            <div className="font-bold text-sm mb-xs">
                                                {drill.name}
                                                {hasCitations(drill.name) && (
                                                    <CitationPopover drillName={drill.name} />
                                                )}
                                            </div>
                                            <div className="text-sm text-muted mb-xs">{drill.dosage}</div>
                                            <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                                {drill.key_points.map((point, pointIndex) => (
                                                    <li key={pointIndex} className="text-sm">{point}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="divider"></div>

                <div className="grid grid-2 gap-md">
                    <div>
                        <div className="badge badge-caution mb-sm">Progression</div>
                        <p className="text-sm text-muted">{trainingFocus.progression}</p>
                    </div>
                    <div>
                        <div className="badge badge-success mb-sm">Exit Goal</div>
                        <p className="text-sm text-muted">{trainingFocus.exit_goal}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainingFocus;
