import { ScreenerQuestion, LibraryPassage } from './types';

export const SCREENER_QUESTIONS: ScreenerQuestion[] = [
  {
    id: 1,
    text: "Has difficulty with spelling",
    subtext: "Child frequently misspells words, reverses letters, or struggles to remember spelling patterns taught in school."
  },
  {
    id: 2,
    text: "Has/had difficulty learning letter names",
    subtext: "Struggled or struggles with associating letter shapes (A, B, C...) with their visual names and recognition."
  },
  {
    id: 3,
    text: "Has/had difficulty learning phonics (sounding out words)",
    subtext: "Struggles to blend individual sounds together to form a word, or to sound out new, unfamiliar words."
  },
  {
    id: 4,
    text: "Reads slowly",
    subtext: "Reading speed is visibly slow, requiring high mental effort or causing frequent pauses within sentences."
  },
  {
    id: 5,
    text: "Reads below grade level",
    subtext: "Compared to other children of the same age/grade in Indian schools, the reading level is lower."
  },
  {
    id: 6,
    text: "Requires extra help in school because of problems in reading and spelling",
    subtext: "Needs tuition, extra sessions, remedial classes, or special attention from parents/teachers to keep up with schoolwork."
  }
];

export const RATING_LABELS = {
  0: { label: "Never / Not at all", desc: "No difficulty seen" },
  1: { label: "Rarely / A little", desc: "Occasional minor struggles" },
  2: { label: "Sometimes", desc: "Noticeable, occurs about half the time" },
  3: { label: "Frequently / Quite a bit", desc: "Regular difficulty, causes frustration" },
  4: { label: "Always / A great deal", desc: "Severe, constant difficulty on a daily basis" }
};

export const LIBRARY_PASSAGES: LibraryPassage[] = [
  {
    id: 'thirsty-crow',
    title: "The Thirsty Crow (Panchatantra)",
    source: "Ancient Indian Fable",
    gradeLevel: "Grades 1-2 (Age 6-8)",
    description: "A short, simple story about a clever crow, utilizing short sentences and simple phonetic combinations.",
    content: "Once, on a hot summer day, a thirsty crow flew all over the fields looking for water. For a long time, he could not find any. He felt very weak and tired. He was about to lose hope. Suddenly, he saw a water jug on the ground. He flew straight down to it. He looked inside the jug. There was only a little water at the very bottom. The crow tried to put his beak inside the jug. But the neck of the jug was too narrow. He could not reach the water. Then, he had a clever plan. He saw some small stones on the dry ground. He picked up one stone in his beak. He dropped it into the jug. The water rose a little. He picked up another stone and dropped it in. He did this again and again. The water rose higher and higher. Soon, it reached the top of the jug. The happy crow drank the cold water and flew away, feeling strong again!"
  },
  {
    id: 'birbal-wit',
    title: "Akbar and Birbal: Counting the Crows",
    source: "Mughal Court Folklore",
    gradeLevel: "Grades 3-4 (Age 8-10)",
    description: "An amusing story of Birbal's wisdom, excellent for intermediate reading flow and narrative comprehension.",
    content: "One beautiful sunny day, Emperor Akbar took a walk in his royal gardens with Birbal. The sky was clear, and many birds were singing. Akbar looked up and saw a flock of black crows flying around. He smiled and wanted to test Birbal's famous quick wit. 'Birbal,' Akbar said thoughtfully, 'tell me, how many crows are there in our city of Agra?' Birbal did not hesitate for even a single second. He bowed gracefully and replied, 'Your Majesty, there are exactly ninety-five thousand, four hundred and sixty-three crows in Agra!' Akbar was surprised by this instant and precise answer. 'What if there are more crows than that?' Akbar asked with a twinkle in his eye. Birbal smiled warmly and said, 'In that case, sire, some crows from neighboring cities must be visiting their relatives here.' 'And what if there are fewer crows?' asked Akbar. 'Then, some of our crows must have gone on a holiday to visit their relatives outside Agra!' Akbar laughed out loud, pleased with Birbal's clever answer."
  },
  {
    id: 'mango-orchard',
    title: "Summer Days at the Mango Orchard",
    source: "Scribl Originals",
    gradeLevel: "Grades 5-6 (Age 10-12)",
    description: "A rich narrative with sensory details of summer holidays in an Indian village, perfect for reading comprehension.",
    content: "The summer holidays had finally begun. Rahul and his sister Priya packed their canvas bags and caught the afternoon train to their grandparents' village in Karnataka. The village was famous for its vast, ancient mango orchards. The air there always smelled of sweet ripening fruit, dry red earth, and fresh wet hay. Every morning at six, before the sun grew too hot, their grandfather would take them into the groves. The trees were massive, with green leaves forming a thick umbrella that shaded the ground. Grandfather taught them how to spot the perfect mangoes. 'Look for the golden-yellow blush near the stem,' he would whisper, pointing into the branches. Rahul climbed the low branches, his fingers sticky with sweet sap. They sat on the wooden swing tied to an old banyan tree, eating juicy mangoes, letting the cold juice run down their elbows. It was a world far away from the noisy traffic of Bengaluru, filled only with the rustling of leaves and the distant, melodic call of the koel bird."
  },
  {
    id: 'isro-journey',
    title: "India's Journey to the Moon",
    source: "Science & Space for Kids",
    gradeLevel: "Grades 7-8 (Age 12-14)",
    description: "An informative science reading about India's space program, introducing scientific vocabulary in a structured way.",
    content: "In August 2023, India made history by landing its Chandrayaan-three spacecraft near the south pole of the Moon. This was a monumental achievement for the Indian Space Research Organisation, known as ISRO. The south pole is a very difficult region to land on because it is covered in deep craters, steep mountains, and permanent dark shadows. Scientists are extremely interested in this area because they believe vast deposits of water ice are hidden deep inside these dark craters. Water ice is highly valuable; in the future, it can be melted into drinking water, or split into oxygen for breathing and hydrogen for rocket fuel. This would turn the Moon into a natural cosmic gas station for voyages to Mars and beyond. The robotic lander, named Vikram, touched down safely on the gray lunar dust, sending back breathtaking photographs. A tiny six-wheeled rover named Pragyan then rolled down a ramp to study the chemical composition of the soil. This historic mission filled millions of school children across India with pride and inspired a new generation of scientists."
  }
];
