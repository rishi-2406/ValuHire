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
  const addMcqSlot = () => setMcqSlots(s => [...s, [createEmptyMcqVariant()]]);
  const addMcqVariant = (slotIndex) => setMcqSlots(s => s.map((slot, i) => i === slotIndex ? [...slot, createEmptyMcqVariant()] : slot));
  const updateMcqVariant = (slotIndex, variantIndex, field, value) => setMcqSlots(s => s.map((slot, i) => i === slotIndex ? slot.map((v, j) => j === variantIndex ? { ...v, [field]: value } : v) : slot));
  const updateMcqOption = (slotIndex, variantIndex, optIndex, value) => setMcqSlots(s => s.map((slot, i) => i === slotIndex ? slot.map((v, j) => j === variantIndex ? { ...v, options: v.options.map((opt, k) => k === optIndex ? value : opt) } : v) : slot));
  const removeMcqVariant = (slotIndex, variantIndex) => setMcqSlots(s => {
    const newSlots = s.map((slot, i) => i === slotIndex ? slot.filter((_, j) => j !== variantIndex) : slot);
    return newSlots.filter(slot => slot.length > 0);
  });

  // Handlers for Coding
  const addCodingSlot = () => setCodingSlots(s => [...s, [createEmptyCodingVariant()]]);
  const addCodingVariant = (slotIndex) => setCodingSlots(s => s.map((slot, i) => i === slotIndex ? [...slot, createEmptyCodingVariant()] : slot));
  const updateCodingVariant = (slotIndex, variantIndex, field, value) => setCodingSlots(s => s.map((slot, i) => i === slotIndex ? slot.map((v, j) => j === variantIndex ? { ...v, [field]: value } : v) : slot));
  const addTestCase = (slotIndex, variantIndex) => setCodingSlots(s => s.map((slot, i) => i === slotIndex ? slot.map((v, j) => j === variantIndex ? { ...v, testCases: [...v.testCases, { input: "", expectedOutput: "", isHidden: false }] } : v) : slot));
  const updateTestCase = (slotIndex, variantIndex, tcIndex, field, value) => setCodingSlots(s => s.map((slot, i) => i === slotIndex ? slot.map((v, j) => j === variantIndex ? { ...v, testCases: v.testCases.map((tc, k) => k === tcIndex ? { ...tc, [field]: value } : tc) } : v) : slot));
  const removeTestCase = (slotIndex, variantIndex, tcIndex) => setCodingSlots(s => s.map((slot, i) => i === slotIndex ? slot.map((v, j) => j === variantIndex ? { ...v, testCases: v.testCases.filter((_, k) => k !== tcIndex) } : v) : slot));
  const removeCodingVariant = (slotIndex, variantIndex) => setCodingSlots(s => {
    const newSlots = s.map((slot, i) => i === slotIndex ? slot.filter((_, j) => j !== variantIndex) : slot);
    return newSlots.filter(slot => slot.length > 0);
  });

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
