"use client";
import React from "react";

type Team = {
  name: string;
  logo: string;
  odds: number;
  handicap: number;
};

type Match = {
  id: number;
  league: string;
  date: string;
  time: string;
  status?: string;
  teams: [Team, Team];
  total: number;
  xpBoost?: boolean;
};

const mockMatches: Match[] = [
  {
    id: 1,
    league: "NBA",
    date: "17 OCT 2025",
    time: "07:00",
    teams: [
      { name: "Detroit Pistons", logo: "/logos/pistons.webp", odds: 1.4, handicap: -6.5 },
      { name: "Washington Wizards", logo: "/logos/wizards.webp", odds: 2.93, handicap: 6.5 },
    ],
    total: 231.5,
  },
  {
    id: 2,
    league: "NBA",
    date: "17 OCT 2025",
    time: "07:30",
    status: "GAME OF THE DAY",
    xpBoost: true,
    teams: [
      { name: "Atlanta Hawks", logo: "/logos/hawks.webp", odds: 1.32, handicap: -7.5 },
      { name: "Houston Rockets", logo: "/logos/rockets.webp", odds: 3.37, handicap: 7.5 },
    ],
    total: 235.5,
  },
  {
    id: 3,
    league: "NBA",
    date: "17 OCT 2025",
    time: "08:00",
    status: "GAME OF THE DAY",
    xpBoost: true,
    teams: [
      { name: "Chicago Bulls", logo: "/logos/bulls.webp", odds: 2.86, handicap: 5.5 },
      { name: "Minnesota Timberwolves", logo: "/logos/timberwolves.webp", odds: 1.41, handicap: -5.5 },
    ],
    total: 235.5,
  },
];

export default function SportsCardTemp() {
  return (
    <div className="space-y-4 p-4 bg-[#0a0b1a] text-white rounded-xl">
      {mockMatches.map((match) => (
        <div
          key={match.id}
          className={`rounded-xl border ${
            match.status ? "border-yellow-500" : "border-[#1c1d2e]"
          } p-4`}
        >
          {/* Header */}
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>
              {match.status ? (
                <span className="text-yellow-500 font-semibold">{match.status}</span>
              ) : (
                "PRESEASON"
              )}
            </span>
            <span>
              {match.date} {match.time}
            </span>
          </div>

          {/* Teams */}
          {match.teams.map((team, i) => (
            <div key={i} className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <img
                  src={team.logo}
                  alt={team.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="font-medium">{team.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-[#1c1d2e] px-3 py-1 rounded-lg text-sm font-semibold">
                  {team.odds.toFixed(2)}
                </div>
                <div className="bg-[#1c1d2e] px-3 py-1 rounded-lg text-sm">
                  {team.handicap > 0 ? `+${team.handicap}` : team.handicap}
                </div>
              </div>
            </div>
          ))}

          {/* Totals */}
          <div className="flex justify-between items-center mt-3 text-sm">
            <span className="text-gray-400">TOTAL</span>
            <div className="flex gap-2">
              <button className="bg-[#1c1d2e] px-3 py-1 rounded-lg">Over {match.total}</button>
              <button className="bg-[#1c1d2e] px-3 py-1 rounded-lg">Under {match.total}</button>
            </div>
          </div>

          {/* XP Boost */}
          {match.xpBoost && (
            <div className="mt-2 text-xs text-yellow-400 font-semibold flex items-center gap-1">
              <span>🔥 +10% XP</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
