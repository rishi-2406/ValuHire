import { useState, useCallback } from "react";

export function useCampaignBuilderData() {
  const [mcqDurationMinutes, setMcqDurationMinutes] = useState(30);
  const [codingDurationMinutes, setCodingDurationMinutes] = useState(60);

  const [mcqSlots, setMcqSlots] = useState([]);
  const [codingSlots, setCodingSlots] = useState([]);

  // Generators for empty variants
  const createEmptyMcqVariant = () => ({
    id: Date.now() + Math.random(),
    prompt: "",
    options: ["", "", "", ""],
    correctKey: "0",
    points: 10
  });

  const createEmptyCodingVariant = () => ({
    id: Date.now() + Math.random(),
    title: "",
    statement: "",
    language: "python",
    difficulty: "Medium",
    points: 20,
    testCases: [{ input: "", expectedOutput: "", isHidden: false }]
  });

  // Handlers for MCQ
  const addMcqSlot = () => setMcqSlots([...mcqSlots, [createEmptyMcqVariant()]]);
  const addMcqVariant = (slotIndex) => {
    const newSlots = [...mcqSlots];
    newSlots[slotIndex] = [...newSlots[slotIndex], createEmptyMcqVariant()];
    setMcqSlots(newSlots);
  };
  const updateMcqVariant = (slotIndex, variantIndex, field, value) => {
    const newSlots = [...mcqSlots];
    newSlots[slotIndex] = [...newSlots[slotIndex]];
    newSlots[slotIndex][variantIndex] = { ...newSlots[slotIndex][variantIndex], [field]: value };
    setMcqSlots(newSlots);
  };
  const updateMcqOption = (slotIndex, variantIndex, optIndex, value) => {
    const newSlots = [...mcqSlots];
    newSlots[slotIndex] = [...newSlots[slotIndex]];
    const newOptions = [...newSlots[slotIndex][variantIndex].options];
    newOptions[optIndex] = value;
    newSlots[slotIndex][variantIndex] = { ...newSlots[slotIndex][variantIndex], options: newOptions };
    setMcqSlots(newSlots);
  };
  const removeMcqVariant = (slotIndex, variantIndex) => {
    const newSlots = [...mcqSlots];
    newSlots[slotIndex] = [...newSlots[slotIndex]];
    newSlots[slotIndex].splice(variantIndex, 1);
    if (newSlots[slotIndex].length === 0) newSlots.splice(slotIndex, 1);
    setMcqSlots(newSlots);
  };

  // Handlers for Coding
  const addCodingSlot = () => setCodingSlots([...codingSlots, [createEmptyCodingVariant()]]);
  const addCodingVariant = (slotIndex) => {
    const newSlots = [...codingSlots];
    newSlots[slotIndex] = [...newSlots[slotIndex], createEmptyCodingVariant()];
    setCodingSlots(newSlots);
  };
  const updateCodingVariant = (slotIndex, variantIndex, field, value) => {
    const newSlots = [...codingSlots];
    newSlots[slotIndex] = [...newSlots[slotIndex]];
    newSlots[slotIndex][variantIndex] = { ...newSlots[slotIndex][variantIndex], [field]: value };
    setCodingSlots(newSlots);
  };
  const addTestCase = (slotIndex, variantIndex) => {
    const newSlots = [...codingSlots];
    newSlots[slotIndex] = [...newSlots[slotIndex]];
    const newTestCases = [...newSlots[slotIndex][variantIndex].testCases, { input: "", expectedOutput: "", isHidden: false }];
    newSlots[slotIndex][variantIndex] = { ...newSlots[slotIndex][variantIndex], testCases: newTestCases };
    setCodingSlots(newSlots);
  };
  const updateTestCase = (slotIndex, variantIndex, tcIndex, field, value) => {
    const newSlots = [...codingSlots];
    newSlots[slotIndex] = [...newSlots[slotIndex]];
    const newTestCases = [...newSlots[slotIndex][variantIndex].testCases];
    newTestCases[tcIndex] = { ...newTestCases[tcIndex], [field]: value };
    newSlots[slotIndex][variantIndex] = { ...newSlots[slotIndex][variantIndex], testCases: newTestCases };
    setCodingSlots(newSlots);
  };
  const removeTestCase = (slotIndex, variantIndex, tcIndex) => {
    const newSlots = [...codingSlots];
    newSlots[slotIndex] = [...newSlots[slotIndex]];
    const newTestCases = [...newSlots[slotIndex][variantIndex].testCases];
    newTestCases.splice(tcIndex, 1);
    newSlots[slotIndex][variantIndex] = { ...newSlots[slotIndex][variantIndex], testCases: newTestCases };
    setCodingSlots(newSlots);
  };
  const removeCodingVariant = (slotIndex, variantIndex) => {
    const newSlots = [...codingSlots];
    newSlots[slotIndex] = [...newSlots[slotIndex]];
    newSlots[slotIndex].splice(variantIndex, 1);
    if (newSlots[slotIndex].length === 0) newSlots.splice(slotIndex, 1);
    setCodingSlots(newSlots);
  };

  const initializeData = useCallback((assessment) => {
    if (!assessment) return;

    if (assessment.mcqDurationMinutes !== undefined) setMcqDurationMinutes(assessment.mcqDurationMinutes);
    if (assessment.codingDurationMinutes !== undefined) setCodingDurationMinutes(assessment.codingDurationMinutes);

    if (assessment.mcqQuestions && assessment.mcqQuestions.length > 0) {
      const slots = [];
      assessment.mcqQuestions.forEach(q => {
        const slotIdx = q.slotIndex || 0;
        if (!slots[slotIdx]) slots[slotIdx] = [];
        slots[slotIdx].push({ ...q, id: q.id || Date.now() + Math.random() });
      });
      // Fill any gaps with empty arrays if needed
      for (let i = 0; i < slots.length; i++) {
        if (!slots[i]) slots[i] = [];
      }
      setMcqSlots(slots);
    } else {
      setMcqSlots([]);
    }

    if (assessment.codingQuestions && assessment.codingQuestions.length > 0) {
      const slots = [];
      assessment.codingQuestions.forEach(q => {
        const slotIdx = q.slotIndex || 0;
        if (!slots[slotIdx]) slots[slotIdx] = [];
        slots[slotIdx].push({ ...q, id: q.id || Date.now() + Math.random(), testCases: Array.isArray(q.testCases) ? q.testCases : [] });
      });
      for (let i = 0; i < slots.length; i++) {
        if (!slots[i]) slots[i] = [];
      }
      setCodingSlots(slots);
    } else {
      setCodingSlots([]);
    }
  }, []);

  return {
    mcqDurationMinutes, setMcqDurationMinutes,
    codingDurationMinutes, setCodingDurationMinutes,
    mcqSlots, codingSlots,
    initializeData,
    addMcqSlot, addMcqVariant, updateMcqVariant, updateMcqOption, removeMcqVariant,
    addCodingSlot, addCodingVariant, updateCodingVariant, removeCodingVariant,
    addTestCase, updateTestCase, removeTestCase
  };
}
