import { useState } from "react";

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
    newSlots[slotIndex][variantIndex] = { ...newSlots[slotIndex][variantIndex], [field]: value };
    setMcqSlots(newSlots);
  };
  const updateMcqOption = (slotIndex, variantIndex, optIndex, value) => {
    const newSlots = [...mcqSlots];
    newSlots[slotIndex][variantIndex].options[optIndex] = value;
    setMcqSlots(newSlots);
  };
  const removeMcqVariant = (slotIndex, variantIndex) => {
    const newSlots = [...mcqSlots];
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
    newSlots[slotIndex][variantIndex] = { ...newSlots[slotIndex][variantIndex], [field]: value };
    setCodingSlots(newSlots);
  };
  const addTestCase = (slotIndex, variantIndex) => {
    const newSlots = [...codingSlots];
    newSlots[slotIndex][variantIndex].testCases.push({ input: "", expectedOutput: "", isHidden: false });
    setCodingSlots(newSlots);
  };
  const updateTestCase = (slotIndex, variantIndex, tcIndex, field, value) => {
    const newSlots = [...codingSlots];
    newSlots[slotIndex][variantIndex].testCases[tcIndex] = { ...newSlots[slotIndex][variantIndex].testCases[tcIndex], [field]: value };
    setCodingSlots(newSlots);
  };
  const removeTestCase = (slotIndex, variantIndex, tcIndex) => {
    const newSlots = [...codingSlots];
    newSlots[slotIndex][variantIndex].testCases.splice(tcIndex, 1);
    setCodingSlots(newSlots);
  };
  const removeCodingVariant = (slotIndex, variantIndex) => {
    const newSlots = [...codingSlots];
    newSlots[slotIndex].splice(variantIndex, 1);
    if (newSlots[slotIndex].length === 0) newSlots.splice(slotIndex, 1);
    setCodingSlots(newSlots);
  };

  return {
    mcqDurationMinutes, setMcqDurationMinutes,
    codingDurationMinutes, setCodingDurationMinutes,
    mcqSlots, codingSlots,
    addMcqSlot, addMcqVariant, updateMcqVariant, updateMcqOption, removeMcqVariant,
    addCodingSlot, addCodingVariant, updateCodingVariant, removeCodingVariant,
    addTestCase, updateTestCase, removeTestCase
  };
}
