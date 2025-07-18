const calculateFinalGrade = (student, assessments) => {
  let totalGrade = 0;

  assessments.forEach((assessment) => {
    const score = student?.scores?.[assessment.name];

    if (score !== undefined && assessment.maxScore > 0) {
      // Normalize score to 37.5–100 range
      const transformed = (score / assessment.maxScore) * 62.5 + 37.5;

      // Weighted contribution
      totalGrade += transformed * (assessment.weight / 100);
    }
  });

  // Round to 2 decimal places for consistency
  return Math.round(totalGrade * 100) / 100;
};

export { calculateFinalGrade };
