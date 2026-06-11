import { describe, it, expect } from "vitest";
import { calculatePoints } from "./scoring";

describe("calculatePoints", () => {
  describe("resultado real 2-1", () => {
    const actual = { home: 2, away: 1 };
    it("2-1 => 4 (Marcador exacto)", () => {
      expect(calculatePoints({ home: 2, away: 1 }, actual)).toEqual({
        points: 4,
        reason: "Marcador exacto",
      });
    });
    it("1-0 => 3 (Resultado acertado)", () => {
      expect(calculatePoints({ home: 1, away: 0 }, actual)).toEqual({
        points: 3,
        reason: "Resultado acertado",
      });
    });
    it("3-1 => 3 (Resultado acertado)", () => {
      expect(calculatePoints({ home: 3, away: 1 }, actual)).toEqual({
        points: 3,
        reason: "Resultado acertado",
      });
    });
    it("4-2 => 3 (Resultado acertado)", () => {
      expect(calculatePoints({ home: 4, away: 2 }, actual)).toEqual({
        points: 3,
        reason: "Resultado acertado",
      });
    });
    it("0-1 => 1 (Marcador parcial, goles visitante)", () => {
      expect(calculatePoints({ home: 0, away: 1 }, actual)).toEqual({
        points: 1,
        reason: "Marcador parcial",
      });
    });
    it("2-3 => 1 (Marcador parcial, goles local)", () => {
      expect(calculatePoints({ home: 2, away: 3 }, actual)).toEqual({
        points: 1,
        reason: "Marcador parcial",
      });
    });
    it("0-0 => 0 (Sin puntos)", () => {
      expect(calculatePoints({ home: 0, away: 0 }, actual)).toEqual({
        points: 0,
        reason: "Sin puntos",
      });
    });
  });

  describe("resultado real 1-1 (empate)", () => {
    const actual = { home: 1, away: 1 };
    it("1-1 => 4 (Marcador exacto)", () => {
      expect(calculatePoints({ home: 1, away: 1 }, actual)).toEqual({
        points: 4,
        reason: "Marcador exacto",
      });
    });
    it("0-0 => 3 (Resultado acertado, empate)", () => {
      expect(calculatePoints({ home: 0, away: 0 }, actual)).toEqual({
        points: 3,
        reason: "Resultado acertado",
      });
    });
    it("2-2 => 3 (Resultado acertado, empate)", () => {
      expect(calculatePoints({ home: 2, away: 2 }, actual)).toEqual({
        points: 3,
        reason: "Resultado acertado",
      });
    });
    it("1-0 => 1 (Marcador parcial)", () => {
      expect(calculatePoints({ home: 1, away: 0 }, actual)).toEqual({
        points: 1,
        reason: "Marcador parcial",
      });
    });
    it("0-1 => 1 (Marcador parcial)", () => {
      expect(calculatePoints({ home: 0, away: 1 }, actual)).toEqual({
        points: 1,
        reason: "Marcador parcial",
      });
    });
    it("3-2 => 0 (Sin puntos)", () => {
      expect(calculatePoints({ home: 3, away: 2 }, actual)).toEqual({
        points: 0,
        reason: "Sin puntos",
      });
    });
  });

  describe("regla clave: resultado correcto + un gol acertado => 3, no 1", () => {
    it("real 2-1, pred 2-0 => 3 (acierta ganador y goles local, prevalece resultado)", () => {
      // gana local en ambos (resultado acertado), y ph=2=ah (gol local).
      // Debe dar 3, NO 1.
      expect(calculatePoints({ home: 2, away: 0 }, { home: 2, away: 1 })).toEqual(
        { points: 3, reason: "Resultado acertado" }
      );
    });
    it("real 0-2, pred 1-2 => 3 (gana visitante y acierta gol visitante)", () => {
      expect(calculatePoints({ home: 1, away: 2 }, { home: 0, away: 2 })).toEqual(
        { points: 3, reason: "Resultado acertado" }
      );
    });
  });

  describe("casos adicionales", () => {
    it("real 0-0, pred 0-0 => 4", () => {
      expect(calculatePoints({ home: 0, away: 0 }, { home: 0, away: 0 })).toEqual(
        { points: 4, reason: "Marcador exacto" }
      );
    });
    it("real 3-0, pred 3-4 => 1 (acierta goles local pero gana visitante)", () => {
      // outcome difiere (real: gana local; pred: gana visitante), pero ph=3=ah.
      expect(calculatePoints({ home: 3, away: 4 }, { home: 3, away: 0 })).toEqual(
        { points: 1, reason: "Marcador parcial" }
      );
    });
    it("real 3-0, pred 3-2 => 3 (mismo ganador: regla clave manda sobre el ejemplo)", () => {
      // El enunciado daba este caso como 1pt, pero 3-2 acierta el ganador (local),
      // así que por la regla clave son 3 puntos, no 1.
      expect(calculatePoints({ home: 3, away: 2 }, { home: 3, away: 0 })).toEqual(
        { points: 3, reason: "Resultado acertado" }
      );
    });
    it("real 5-1, pred 0-4 => 0", () => {
      expect(calculatePoints({ home: 0, away: 4 }, { home: 5, away: 1 })).toEqual(
        { points: 0, reason: "Sin puntos" }
      );
    });
  });
});
