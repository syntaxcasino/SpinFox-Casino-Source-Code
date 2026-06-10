"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";

interface Segment {
    label: string;
    value: number;
    weight: number; // chance percentage
    color?: string;
}

const segments: Segment[] = [
    { label: "$1", value: 1, weight: 25, color: "#4ADE80" },
    { label: "$2", value: 2, weight: 20, color: "#22D3EE" },
    { label: "$5", value: 5, weight: 15, color: "#FACC15" },
    { label: "$10", value: 10, weight: 10, color: "#FB923C" },
    { label: "$20", value: 20, weight: 10, color: "#F472B6" },
    { label: "$50", value: 50, weight: 8, color: "#60A5FA" },
    { label: "$100", value: 100, weight: 7, color: "#C084FC" },
    { label: "$500", value: 500, weight: 5, color: "#F87171" },
];

export default function CasinoWheel() {
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState<Segment | null>(null);

    // Weighted random selection
    const getRandomSegment = (): Segment => {
        const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);
        const rand = Math.random() * totalWeight;
        let cumulative = 0;
        for (const seg of segments) {
            cumulative += seg.weight;
            if (rand <= cumulative) return seg;
        }
        return segments[segments.length - 1];
    };

    const spinWheel = () => {
        if (spinning) return;
        setSpinning(true);
        setResult(null);

        const segmentAngle = 360 / segments.length;
        const chosen = getRandomSegment();
        const chosenIndex = segments.indexOf(chosen);

        // Middle of the chosen segment
        const targetSegmentAngle = chosenIndex * segmentAngle + segmentAngle / 2;

        // Add random full spins
        const spins = 360 * (5 + Math.floor(Math.random() * 2));

        // Final rotation
        const finalRotation = rotation + spins + (360 - targetSegmentAngle);

        setRotation(finalRotation);

        setTimeout(() => {
            setSpinning(false);
            setResult(chosen);
        }, 3200);
    };

    // Build conic gradient
    const gradient = segments
        .map((seg, i) => {
            const start = (360 / segments.length) * i;
            const end = (360 / segments.length) * (i + 1);
            return `${seg.color} ${start}deg ${end}deg`;
        })
        .join(", ");

    const radius = 115; // distance from center to label

    return (
        <div className="flex flex-col items-center justify-center space-y-6 py-8">
            <div className="relative w-72 h-72">
                {/* Wheel */}
                <motion.div
                    animate={{ rotate: rotation }}
                    transition={{ duration: 3, ease: [0.1, 0.8, 0.2, 1] }}
                    className="relative w-full h-full rounded-full border-[6px] border-yellow-400 shadow-[0_0_30px_rgba(255,215,0,0.4)] flex items-center justify-center"
                    style={{ background: `conic-gradient(${gradient})` }}
                >
                    {/* Segment Labels */}
                    {segments.map((seg, i) => {
                        const segmentAngle = 360 / segments.length;
                        const middleAngle = segmentAngle * i + segmentAngle / 2;
                        return (
                            <div
                                key={i}
                                className="absolute font-bold text-lg text-center"
                                style={{
                                    transform: `rotate(${middleAngle}deg) translateY(-${radius}px) rotate(-${middleAngle}deg)`,
                                    color: "#1A1A1A",
                                    width: "60px",
                                    left: "50%",
                                    marginLeft: "-30px",
                                }}
                            >
                                {seg.label}
                            </div>
                        );
                    })}

                    {/* Spin Button */}
                    <Button
                        color="warning"
                        variant="shadow"
                        size="lg"
                        className="font-bold text-lg px-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                        onClick={spinWheel}
                        isDisabled={spinning}
                    >
                        {spinning ? "Spinning..." : "SPIN"}
                    </Button>
                </motion.div>

                {/* Pointer */}
                <div
                    className="absolute w-1 bg-red-500 rounded"
                    style={{
                        height: "90px",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -100%)",
                        transformOrigin: "bottom",
                    }}
                />
            </div>

            {/* Result */}
            {result && !spinning && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-yellow-400 font-poppins text-xl font-semibold mt-4"
                >
                    You won <span className="text-green-400">{result.label}</span>! 🎉
                </motion.div>
            )}
        </div>
    );
}
