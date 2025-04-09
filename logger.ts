import { appendFileSync } from 'fs';

const getTimestamp = (): string => {
  return new Date().toISOString().replace('T', ' ').split('.')[0];
};

export const logToFile = (message: string) => {
  const timestamp = getTimestamp();
  const fullMessage = `[${timestamp}] ${message}\n`;
  appendFileSync('log_pacman.txt', fullMessage, 'utf-8');
};