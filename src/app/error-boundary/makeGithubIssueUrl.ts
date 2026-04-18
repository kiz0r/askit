const newIssueUrl = 'https://github.com/kiz0r/askit/issues/new';

export const makeGithubIssueUrl = (error: Error): string => {
  const title = `Bug: ${error.message || 'Unexpected error'}`;
  const body = `## Error Details\n\n**Message:** ${error.message || 'No message provided'}\n\n**Stack Trace:**\n\`\`\`\n${error.stack || 'No stack trace available'}\n\`\`\`\n\n## Environment\n- **Browser:** ${typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'}\n- **Time:** ${new Date().toISOString()}\n\n---\n\n*Please provide any additional context about what you were doing when this error occurred.*`;
  const labels = 'bug';

  const params = new URLSearchParams({ title, body, labels });

  return `${newIssueUrl}?${params.toString()}`;
};
