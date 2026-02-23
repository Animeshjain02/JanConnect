import mongoose, { Schema, Document } from 'mongoose';

export enum ComplaintStatus {
    SUBMITTED = 'Submitted',
    UNDER_REVIEW = 'Under Review',
    ASSIGNED = 'Assigned',
    IN_PROGRESS = 'In Progress',
    RESOLVED = 'Resolved',
    REOPENED = 'Reopened',
    ESCALATED = 'Escalated'
}

export interface IComplaint extends Document {
    complaintId: string;
    userId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    category?: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    department: string;
    location: {
        lat: number;
        lng: number;
        address?: string;
    };
    imageUrl?: string;
    voiceUrl?: string; // transcription or audio file link
    status: ComplaintStatus;
    priorityScore: number;
    priorityLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    slaDeadline: Date;
    assignedOfficerId?: mongoose.Types.ObjectId;
    assignedOfficerName?: string;
    escalationLevel: number;
    duplicateCount: number;
    history: Array<{
        status: ComplaintStatus;
        updatedAt: Date;
        note?: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const ComplaintSchema: Schema = new Schema({
    complaintId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String },
    severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    department: { type: String, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        address: { type: String }
    },
    imageUrl: { type: String },
    voiceUrl: { type: String },
    status: { type: String, enum: Object.values(ComplaintStatus), default: ComplaintStatus.SUBMITTED },
    priorityScore: { type: Number, default: 0 },
    priorityLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    slaDeadline: { type: Date },
    assignedOfficerId: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedOfficerName: { type: String },
    escalationLevel: { type: Number, default: 0 },
    duplicateCount: { type: Number, default: 0 },
    history: [{
        status: { type: String, enum: Object.values(ComplaintStatus) },
        updatedAt: { type: Date, default: Date.now },
        note: { type: String }
    }]
}, { timestamps: true });

export default mongoose.model<IComplaint>('Complaint', ComplaintSchema);
