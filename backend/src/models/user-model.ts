import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
    CITIZEN = 'Citizen',
    OFFICER = 'Officer',
    ADMIN = 'Admin',
    HIGHER_AUTHORITY = 'Higher Authority'
}

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    department?: string;
    location?: {
        lat: number;
        lng: number;
        address?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.CITIZEN },
    department: { type: String },
    location: {
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String }
    }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
