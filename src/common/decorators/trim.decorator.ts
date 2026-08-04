import { Transform } from 'class-transformer';

export const Trim = () =>
  Transform(({ value }) => {
    const candidate: unknown = value;
    return typeof candidate === 'string' ? candidate.trim() : candidate;
  });
