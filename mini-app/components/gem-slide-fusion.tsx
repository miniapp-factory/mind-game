"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const GRID_SIZE = 5;
const TIER_POINTS = [0, 1, 3, 9, 27, 81];
const TIER_COLORS = [
  "",
  "#f0e68c", // Tier 1
  "#add8e6", // Tier 2
  "#ffb6c1", // Tier 3
  "#dda0dd", // Tier 4
  "#ffd700", // Tier 5
];

type Tile = {
  tier: number;
  merged: boolean;
};

function emptyGrid(): Tile[][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({ tier: 0, merged: false }))
  );
}

function spawnTile(grid: Tile[][]): Tile[][] {
  const emptyCells: [number, number][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c].tier === 0) emptyCells.push([r, c]);
    }
  }
  if (emptyCells.length === 0) return grid;
  const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const rand = Math.random();
  let tier = 1;
  if (rand < 0.7) tier = 1;
  else if (rand < 0.95) tier = 2;
  else tier = 3;
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  newGrid[r][c] = { tier, merged: false };
  return newGrid;
}

function moveLine(line: Tile[], dir: "left" | "right"): Tile[] {
  const tiles = line.filter(t => t.tier > 0);
  const result: Tile[] = [];
  let i = 0;
  while (i < tiles.length) {
    if (i + 1 < tiles.length && tiles[i].tier === tiles[i + 1].tier && !tiles[i].merged && !tiles[i + 1].merged) {
      result.push({ tier: tiles[i].tier + 1, merged: true });
      i += 2;
    } else {
      result.push({ ...tiles[i], merged: false });
      i += 1;
    }
  }
  while (result.length < GRID_SIZE) {
    result.push({ tier: 0, merged: false });
  }
  return dir === "left" ? result : result.reverse();
}

function moveGrid(grid: Tile[][], dir: "up" | "down" | "left" | "right"): Tile[][] {
  let newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  if (dir === "left" || dir === "right") {
    for (let r = 0; r < GRID_SIZE; r++) {
      newGrid[r] = moveLine(newGrid[r], dir);
    }
  } else {
    for (let c = 0; c < GRID_SIZE; c++) {
      const col = newGrid.map(row => row[c]);
      const moved = moveLine(col, dir === "up" ? "left" : "right");
      for (let r = 0; r < GRID_SIZE; r++) {
        newGrid[r][c] = moved[r];
      }
    }
  }
  return newGrid;
}

function hasMoves(grid: Tile[][]): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c].tier === 0) return true;
      const tier = grid[r][c].tier;
      if (c + 1 < GRID_SIZE && grid[r][c + 1].tier === tier) return true;
      if (r + 1 < GRID_SIZE && grid[r + 1][c].tier === tier) return true;
    }
  }
  return false;
}

export default function GemSlideFusion() {
  const [grid, setGrid] = useState<Tile[][]>(emptyGrid());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    let g = emptyGrid();
    g = spawnTile(g);
    g = spawnTile(g);
    g = spawnTile(g);
    setGrid(g);
  }, []);

  const updateScore = (newGrid: Tile[][]) => {
    let s = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const tier = newGrid[r][c].tier;
        if (tier > 0) s += TIER_POINTS[tier];
      }
    }
    setScore(s);
  };

  const handleMove = (dir: "up" | "down" | "left" | "right") => {
    if (gameOver || won) return;
    const moved = moveGrid(grid, dir);
    if (JSON.stringify(moved) === JSON.stringify(grid)) return; // no change
    const newGrid = spawnTile(moved);
    setGrid(newGrid);
    updateScore(newGrid);
    if (newGrid.some(row => row.some(cell => cell.tier === 5))) setWon(true);
    if (!hasMoves(newGrid)) setGameOver(true);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="grid grid-cols-5 gap-1">
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className="w-12 h-12 flex items-center justify-center rounded-md border"
                style={{
                  backgroundColor: TIER_COLORS[cell.tier],
                  color: cell.tier > 0 ? "#000" : "#000",
                }}
              >
                {cell.tier > 0 && cell.tier}
              </div>
            ))
          )}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleMove("up")}
              className="mb-1"
            >
              ▲
            </Button>
            <div className="flex">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleMove("left")}
                className="mr-1"
              >
                ◀
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleMove("right")}
                className="ml-1"
              >
                ▶
              </Button>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleMove("down")}
              className="mt-1"
            >
              ▼
            </Button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xl">Score: {score}</span>
        {won && <span className="text-green-600 font-bold">Legendary Gem Achieved!</span>}
        {gameOver && !won && <span className="text-red-600 font-bold">Game Over</span>}
      </div>
      {(won || gameOver) && (
        <Share text={`I scored ${score} points in GemSlide Fusion! ${url}`} />
      )}
    </div>
  );
}
