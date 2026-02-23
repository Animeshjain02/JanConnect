import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn } from 'lucide-react';

// ─── Lightbox Overlay (renders via Portal into document.body) ─────────────────

interface ImageLightboxProps {
    src: string;
    alt?: string;
    onClose: () => void;
}

const ImageLightbox = ({ src, alt = '', onClose }: ImageLightboxProps) => {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden'; // lock scroll
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const overlay = (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 99999,
                background: 'rgba(0,0,0,0.92)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                cursor: 'zoom-out',
            }}
            onClick={onClose}
        >
            {/* Close button */}
            <button
                style={{
                    position: 'absolute', top: 16, right: 16, zIndex: 1,
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '50%', padding: '10px',
                    cursor: 'pointer', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.8)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                onClick={e => { e.stopPropagation(); onClose(); }}
                title="Close (Esc)"
            >
                <X size={20} />
            </button>

            {/* Image — stop propagation so clicking it doesn't close */}
            <img
                src={src}
                alt={alt}
                style={{
                    maxWidth: '100%',
                    maxHeight: '88vh',
                    objectFit: 'contain',
                    borderRadius: '12px',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'default',
                    animation: 'lightbox-in 0.25s ease',
                }}
                onClick={e => e.stopPropagation()}
            />

            {/* Caption */}
            {alt && (
                <p style={{
                    position: 'absolute', bottom: 24,
                    color: 'rgba(255,255,255,0.5)', fontSize: '13px',
                    background: 'rgba(0,0,0,0.4)', padding: '6px 14px', borderRadius: '999px',
                }}>
                    {alt}
                </p>
            )}

            {/* Keyframe animation injected once */}
            <style>{`
                @keyframes lightbox-in {
                    from { opacity: 0; transform: scale(0.92); }
                    to   { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );

    // Render directly into document.body, bypassing all parent stacking contexts
    return createPortal(overlay, document.body);
};

// ─── Clickable Thumbnail ──────────────────────────────────────────────────────

interface ClickableImageProps {
    src: string;
    alt?: string;
    className?: string;
    onClick: () => void;
}

export const ClickableImage = ({ src, alt = '', className = '', onClick }: ClickableImageProps) => {
    const handle = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
    };

    return (
        <div
            className={`relative cursor-zoom-in group overflow-hidden ${className}`}
            onClick={handle}
            title="Click to enlarge"
        >
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onClick={handle}
                draggable={false}
            />
            {/* Hover overlay — pointer-events-none so it doesn't intercept clicks */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center pointer-events-none">
                <ZoomIn size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
            </div>
        </div>
    );
};

export default ImageLightbox;
