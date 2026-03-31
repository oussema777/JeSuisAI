export function computeGlobalScore(scores: any) {
  const {
    description_coherence,
    impact_coherence,
    contribution_coherence,
    feasibility_realism,
    diaspora_alignment,
  } = scores;

  // Compute description-related coherence as average
  const descriptionScore = (
    description_coherence +
    impact_coherence +
    contribution_coherence
  ) / 3;

  // Updated weighted scoring system
  const global =
    descriptionScore * 0.4 +            // Description coherence composite (40%)
    feasibility_realism * 0.3 +         // Realistic missions (30%)
    diaspora_alignment * 0.3;           // Core platform mission (30%)

  return Math.round(global * 10) / 10;
}

export function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-600';
  if (score >= 6) return 'text-yellow-600';
  if (score >= 4) return 'text-orange-600';
  return 'text-red-600';
}

export function getScoreLabel(score: number): string {
  if (score >= 8) return 'Excellent';
  if (score >= 6) return 'Bon';
  if (score >= 4) return 'Moyen';
  return 'À améliorer';
}
