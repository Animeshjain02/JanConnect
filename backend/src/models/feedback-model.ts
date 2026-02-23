import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
    userId: mongoose.Types.ObjectId;
    publicWorkId: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    proofImages: string[];
    reportDelay: boolean;
    createdAt: Date;
}

const FeedbackSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    publicWorkId: { type: Schema.Types.ObjectId, ref: 'PublicWork', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    proofImages: [{ type: String }],
    reportDelay: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);
