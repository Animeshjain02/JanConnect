import { useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';

// ─── Lightbox Overlay ────────────────────────────────────────────────────────

interface ImageLightboxProps {
    src: string;
    alt?: string;
    onClose: () => void;
}

const ImageLightbox = ({ src, alt = '', onClose }: ImageLightboxProps) => {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={onClose}
        >
            {/* Close */}
            <button
                className="absolute top-4 right-4 bg-white/10 hover:bg-red-500 text-white rounded-full p-2.5 border border-white/20 transition-all z-10"
                onClick={onClose}
                title="Close (Esc)"
            >
                <X size={20} />
            </button>

            {/* Image */}
            <img
                src={src}
                alt={alt}
                className="max-w-full max-h-[88vh] object-contain rounded-2xl shadow-2xl border border-white/10 transition-transform duration-300"
                onClick={(e) => e.stopPropagation()}
            />

            {/* Caption */}
            {alt && (
                <p className="absolute bottom-6 text-white/50 text-sm bg-black/40 px-4 py-1.5 rounded-full text-center max-w-sm">
                    {alt}
                </p>
            )}
        </div>
    );
};

// ─── Clickable Thumbnail ──────────────────────────────────────────────────────

interface ClickableImageProps {
    src: string;
    alt?: string;
    className?: string;
    onClick: () => void;
}

export const ClickableImage = ({ src, alt = '', className = '', onClick }: ClickableImageProps) => (
    <div
        className={`relative cursor-zoom-in group overflow-hidden ${className}`}
        onClick={onClick}
        title="Click to enlarge"
    >
        <img src={src} alt={alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
            <ZoomIn size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
        </div>
    </div>
);

export default ImageLightbox;
