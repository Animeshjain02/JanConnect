import mongoose, { Schema, Document } from 'mongoose';

export enum PublicWorkStatus {
    STARTED = 'Started',
    ONGOING = 'Ongoing',
    COMPLETED = 'Completed'
}

export interface IPublicWork extends Document {
    title: string;
    description: string;
    budget: number;
    status: PublicWorkStatus;
    location: {
        lat: number;
        lng: number;
        address?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const PublicWorkSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    status: { type: String, enum: Object.values(PublicWorkStatus), default: PublicWorkStatus.STARTED },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        address: { type: String }
    }
}, { timestamps: true });

export default mongoose.model<IPublicWork>('PublicWork', PublicWorkSchema);
