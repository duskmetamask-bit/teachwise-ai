export interface Ac9Descriptor {
  code: string;
  subject: string;
  yearLevel: string;
  descriptor: string;
  elaboration: string;
}

export const ac9Seed: Ac9Descriptor[] = [
  {
    code: 'AC9EFLA01',
    subject: 'English',
    yearLevel: 'F',
    descriptor: 'recognise and name letters of the alphabet and know there are sounds associated with each letter',
    elaboration: 'Use magnetic letters, sound hunts, and phoneme cards in daily literacy warm-ups.',
  },
  {
    code: 'AC9EFLA03',
    subject: 'English',
    yearLevel: 'F',
    descriptor: 'identify, blend and segment phonemes in single-syllable spoken words',
    elaboration: 'Blend oral sounds before moving to decodable word reading and writing.',
  },
  {
    code: 'AC9M1N01',
    subject: 'Mathematics',
    yearLevel: '1',
    descriptor: 'quantify sets using skip counting and partitioning',
    elaboration: 'Use counters, ten-frames and classroom objects to build number sense.',
  },
  {
    code: 'AC9M4M02',
    subject: 'Mathematics',
    yearLevel: '4',
    descriptor: 'solve problems involving the four operations with natural numbers',
    elaboration: 'Set up weekly problem-solving routines using authentic classroom contexts.',
  },
  {
    code: 'AC9S4U01',
    subject: 'Science',
    yearLevel: '4',
    descriptor: 'identify and describe the roles of the sun and moon in Earth systems',
    elaboration: 'Connect to visual models, inquiry tasks and observation journals.',
  },
  {
    code: 'AC9HS3K02',
    subject: 'HASS',
    yearLevel: '3',
    descriptor: 'describe the features and purposes of local government',
    elaboration: 'Use classroom and community map-making to anchor discussion.',
  },
  {
    code: 'AC9TDI5P01',
    subject: 'Digital Technologies',
    yearLevel: '5',
    descriptor: 'design algorithms that represent a sequence of steps and decisions',
    elaboration: 'Model debugging and algorithm refinement with block-based coding tasks.',
  },
];

export function findAc9Matches(subject: string, yearLevel: string, query: string) {
  const normalised = `${subject} ${yearLevel} ${query}`.toLowerCase();
  return ac9Seed.filter((item) => {
    const haystack = `${item.subject} ${item.yearLevel} ${item.code} ${item.descriptor} ${item.elaboration}`.toLowerCase();
    return normalised.includes(item.yearLevel.toLowerCase()) || normalised.includes(item.subject.toLowerCase()) || haystack.includes(normalised);
  });
}

