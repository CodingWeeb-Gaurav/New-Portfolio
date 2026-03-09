"use client";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

interface RatingPoint {
    date: string;
    rating: number;
    contestName: string;
}

interface Props {
    data: RatingPoint[];
}

export default function CodeforcesGraph({ data }: Props) {
    if (!data || data.length === 0) {
        return (
            <div style={{ height: "8rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "var(--text-dim)", fontSize: "0.875rem" }}>
                    No rating history available
                </p>
            </div>
        );
    }

    const processed = data
        .map((p) => ({ ...p, timestamp: new Date(p.date).getTime() }))
        .sort((a, b) => a.timestamp - b.timestamp);

    const getSixMonthTicks = (pts: typeof processed) => {
        if (!pts.length) return [];
        const minD = new Date(pts[0].timestamp);
        const maxD = new Date(pts[pts.length - 1].timestamp);
        minD.setDate(1);
        maxD.setMonth(maxD.getMonth() + 1);
        maxD.setDate(0);
        const ticks: number[] = [];
        const cur = new Date(minD);
        cur.setMonth(minD.getMonth() + (6 - (minD.getMonth() % 6)));
        if (cur > minD) ticks.push(cur.getTime());
        while (cur <= maxD) {
            cur.setMonth(cur.getMonth() + 6);
            if (cur <= maxD) ticks.push(cur.getTime());
        }
        return ticks;
    };

    return (
        <div style={{ width: "100%", height: "16rem" }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processed} margin={{ top: 20, right: 20, bottom: 50, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2f3e4e" />
                    <XAxis
                        dataKey="timestamp"
                        type="number"
                        domain={["dataMin", "dataMax"]}
                        ticks={getSixMonthTicks(processed)}
                        tickFormatter={(ts) =>
                            new Date(ts).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                        }
                        scale="time"
                        angle={-30}
                        textAnchor="end"
                        height={50}
                        tick={{ fill: "#ccc", fontSize: 10 }}
                    />
                    <YAxis
                        domain={["dataMin - 100", "dataMax + 100"]}
                        tick={{ fill: "#ccc", fontSize: 12 }}
                    />
                    <Tooltip
                        formatter={(v) => [`Rating: ${v}`]}
                        labelFormatter={(_, payload) => {
                            if (!payload?.length) return "";
                            const item = payload[0].payload as RatingPoint & { timestamp: number };
                            return `${item.contestName} (${new Date(item.date).toLocaleDateString()})`;
                        }}
                        contentStyle={{ backgroundColor: "#1f2937", borderRadius: 8 }}
                        labelStyle={{ color: "#93c5fd" }}
                    />
                    <Line
                        type="monotone"
                        dataKey="rating"
                        stroke="#f472b6"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#f472b6" }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
