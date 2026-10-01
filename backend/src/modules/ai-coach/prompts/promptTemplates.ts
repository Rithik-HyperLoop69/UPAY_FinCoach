import { StructuredFinancialContext } from '../ai.types';

export const buildPromptFromTemplate = (
  userMessage: string,
  context: StructuredFinancialContext
): string => {
  const contextStr = JSON.stringify(context, null, 2);

  return `
[STRUCTURED USER FINANCIAL CONTEXT]
${contextStr}

[USER QUESTION]
"${userMessage}"

[INSTRUCTIONS]
Provide a thoughtful, clear response strictly grounded in the context above.
Format your response using Markdown, ensuring clear headers for **Observed:**, **Forecast:**, and **Suggestion:**.
Never invent any numbers outside the context.
`;
};
