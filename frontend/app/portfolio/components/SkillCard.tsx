"use client";

import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

interface SkillCardProps {
    logo: string;
    text: string;
    hoverColors?: [string, string?];
}

const SkillCard: React.FC<SkillCardProps> = ({ logo, text, hoverColors = ["#ffd43b", "#ff8c00"] }) => {
    const [imageError, setImageError] = useState(false);
    const controls = useAnimation();

    // Reset image error state if logo URL changes
    useEffect(() => {
        setImageError(false);
    }, [logo]);

    // Animation variants
    const cardVariants = {
        hidden: {
            rotateY: 0,
            opacity: 0,
            scale: 0.8
        },
        visible: {
            rotateY: 0,
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring" as const,
                stiffness: 80,
                damping: 15,
                mass: 0.7
            }
        },
        hover: {
            scale: 1.15,
            y: -10,
            transition: { duration: 0.3 }
        }
    };

    // Parse hex color to RGB
    const parseColor = (hex?: string) => {
        if (!hex || !hex.startsWith("#")) return "255, 212, 59";
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r}, ${g}, ${b}`;
    };

    const rgbColor = parseColor(hoverColors[0]);

    return (
        <motion.div
            className="skill-card-3d relative rounded-lg p-6 w-32 h-32 shadow-lg cursor-pointer flex-shrink-0"
            style={{
                "--hover-color-1": hoverColors[0],
                "--hover-color-2": hoverColors[1] || hoverColors[0] || "#ffd43b",
                "--rgb-color": rgbColor,
                transformStyle: "preserve-3d",
                perspective: "1000px",
                isolation: "isolate",
                overflow: "hidden"
            } as React.CSSProperties}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
            viewport={{
                once: false,
                margin: "0px 0px -50px 0px"
            }}
            animate={controls}
        >
            {/* Front of the card */}
            <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-lg backface-hidden bg-transparent backdrop-blur-md"
                style={{
                    backfaceVisibility: "hidden",
                    background: "rgba(18, 18, 30, 0.4)",
                    border: "2px solid rgba(255, 255, 255, 0.1)"
                }}
            >
                {imageError || !logo ? (
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-600/30 text-white font-bold text-2xl shadow-inner border border-white/20">
                        {text.charAt(0).toUpperCase()}
                    </div>
                ) : (
                    <img
                        src={logo}
                        alt={`${text} Logo`}
                        className="w-16 h-16 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                        onError={() => setImageError(true)}
                    />
                )}
                <h2 className="card-text text-sm font-bold text-white mt-1 text-center whitespace-nowrap overflow-hidden text-ellipsis w-full px-2" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
                    {text}
                </h2>
            </motion.div>

            {/* Back of the card (gold-brown burst) */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center rounded-lg backface-hidden"
                style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    background: "linear-gradient(135deg, #D4AF37 0%, #F5D78E 50%, #D4AF37 100%)",
                    boxShadow: "0 4px 20px rgba(212, 175, 55, 0.6)"
                }}
            >
                <div className="text-center p-2">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-1 shadow-inner">
                        {imageError || !logo ? (
                            <span className="text-yellow-900 font-bold text-2xl" style={{ color: "#3B2F00" }}>{text.charAt(0).toUpperCase()}</span>
                        ) : (
                            <img
                                src={logo}
                                alt={`${text} Logo`}
                                className="w-10 h-10 object-contain drop-shadow-md"
                                onError={() => setImageError(true)}
                            />
                        )}
                    </div>
                    <h2 className="font-bold text-xs" style={{ color: "#3B2F00" }}>{text}</h2>
                </div>
            </motion.div>

            <style>{`
                .skill-card-3d::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle, rgba(var(--rgb-color), 0.35) 0%, transparent 70%);
                    opacity: 0;
                    transition: opacity 0.4s ease;
                    z-index: 0;
                }
                .skill-card-3d:hover::before {
                    opacity: 1;
                }
                .skill-card-3d::after {
                    content: '';
                    position: absolute;
                    width: 200%;
                    height: 200%;
                    top: 50%;
                    left: 50%;
                    background: conic-gradient(from 0deg, var(--hover-color-1), var(--hover-color-2), var(--hover-color-1));
                    animation: rotateShadow 3s linear infinite;
                    z-index: -1;
                    transform: translate(-50%, -50%);
                    opacity: 0;
                    transition: opacity 0.4s ease;
                }
                .skill-card-3d:hover::after {
                    opacity: 0.25;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                }
                .card-text {
                    opacity: 0.7;
                    transition: opacity 0.4s ease, transform 0.2s ease;
                }
                .skill-card-3d:hover .card-text {
                    opacity: 1;
                    transform: translateY(-2px);
                }
                @keyframes rotateShadow {
                    0% { transform: translate(-50%, -50%) rotate(0deg); }
                    100% { transform: translate(-50%, -50%) rotate(360deg); }
                }
            `}</style>
        </motion.div>
    );
};

export default SkillCard;
