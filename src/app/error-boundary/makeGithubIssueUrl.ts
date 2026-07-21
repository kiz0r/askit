const newIssueUrl = 'https://github.com/kiz0r/askit/issues/new';

const userBrowser = typeof window === 'undefined' ? 'Unknown' : window.navigator.userAgent;

export const makeGithubIssueUrl = (error: Error): string => {
  const title = `Bug: ${error.message ?? 'Unexpected error'}`;

  const sections = [
    '## Error Details',
    `**Message:** ${error.message ?? 'No message provided'}`,
    `**Stack Trace:**\n\`\`\`\n${error.stack ?? 'No stack trace available'}\n\`\`\``,
    '## Environment',
    `- **Browser:** ${userBrowser}`,
    `- **Time:** ${new Date().toISOString()}`,
    '---',
    '*Please provide any additional context about what you were doing when this error occurred.*',
  ];

  const body = sections.join('\n\n');
  const labels = 'bug';

  const params = new URLSearchParams({ title, body, labels });

  return `${newIssueUrl}?${params.toString()}`;
};
