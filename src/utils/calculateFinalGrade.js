const calculateFinalGrade = (student, assessments) => {
  if (!student || !student.scores || !Array.isArray(assessments)) return 0;

  let totalGrade = 0;

  assessments.forEach((assessment) => {
    const score = student.scores[assessment.$id]; // assuming scores keyed by assessment ID
    const max = assessment.maxScore;
    const weight = assessment.weight;

    if (typeof score === "number" && max > 0) {
      // Normalize score: map (score/max) to a 37.5–100 scale
      const normalized = (score / max) * 62.5 + 37.5;
      const weighted = normalized * (weight / 100);
      totalGrade += weighted;

      console.log(
        `[Grade Calc] ${student.firstName} ${student.lastName} - ${
          assessment.name
        }: raw=${score}/${max}, norm=${normalized.toFixed(
          2
        )}, weighted=${weighted.toFixed(2)}`
      );
    }
  });

  const final = Math.round(totalGrade * 100) / 100;
  console.log(
    `[Final Grade] ${student.firstName} ${student.lastName}: ${final}`
  );
  return final;
};

export { calculateFinalGrade };
