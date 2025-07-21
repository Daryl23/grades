const calculateSampleGrade = () => {
  if (
    !scores ||
    !assessments ||
    scores.length === 0 ||
    assessments.length === 0
  ) {
    return "0.00";
  }

  let totalWeight = 0;
  let weightedScoreSum = 0;

  for (const score of scores) {
    const assessment = assessments.find(
      (a) => a.$id === score.assessmentId?.$id || score.assessmentId
    );

    if (assessment && assessment.weight) {
      const numericScore = parseFloat(score.value); // Ensure it's numeric
      if (!isNaN(numericScore)) {
        weightedScoreSum += numericScore * (assessment.weight / 100);
        totalWeight += assessment.weight;
      }
    }
  }

  if (totalWeight === 0) return "0.00";

  const grade = (weightedScoreSum / totalWeight) * 100;
  return grade.toFixed(2);
};

export default calculateSampleGrade;
