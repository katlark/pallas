import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "seed@example.com";
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: {
        upsert: {
          update: { hash: passwordHash },
          create: { hash: passwordHash },
        },
      },
    },
    create: {
      email,
      password: {
        create: { hash: passwordHash },
      },
    },
  });

  await prisma.deck.deleteMany({ where: { userId: user.id } });

  const seedDecks = [
    {
      title: "Spanish Basics",
      cards: [
        { front: "Hola", back: "Hello" },
        { front: "Gracias", back: "Thank you" },
        { front: "Por favor", back: "Please" },
        { front: "Buenos dias", back: "Good morning" },
        { front: "Buenas noches", back: "Good night" },
        { front: "Como estas?", back: "How are you?" },
        { front: "Muy bien", back: "Very well" },
        { front: "Lo siento", back: "I'm sorry" },
        { front: "Donde esta el bano?", back: "Where is the bathroom?" },
        { front: "Hasta luego", back: "See you later" },
      ],
    },
    {
      title: "JavaScript Core",
      cards: [
        { front: "What is closure?", back: "A function with lexical scope." },
        { front: "=== vs ==", back: "Strict equality vs coercive equality." },
        { front: "Promise.all", back: "Waits for all promises or rejects early." },
        { front: "map()", back: "Returns a transformed array." },
        { front: "filter()", back: "Returns elements that pass a test." },
        { front: "reduce()", back: "Reduces an array to one value." },
        { front: "Event loop", back: "Coordinates call stack and task queues." },
        { front: "Hoisting", back: "Declarations processed before execution." },
        { front: "let vs const", back: "Reassignable vs not reassignable binding." },
        { front: "Optional chaining", back: "Safely access nested properties with ?." },
      ],
    },
    {
      title: "US Geography",
      cards: [
        { front: "Capital of California", back: "Sacramento" },
        { front: "Largest US state by area", back: "Alaska" },
        { front: "Great Lakes count", back: "Five" },
        { front: "River through New Orleans", back: "Mississippi River" },
        { front: "Capital of Texas", back: "Austin" },
        { front: "Capital of New York", back: "Albany" },
        { front: "Longest US river", back: "Missouri River" },
        { front: "Highest US mountain", back: "Denali" },
        { front: "State known as the Aloha State", back: "Hawaii" },
        { front: "US state with the Grand Canyon", back: "Arizona" },
      ],
    },
    {
      title: "React Essentials",
      cards: [
        { front: "useState", back: "Adds state to a function component." },
        { front: "useEffect", back: "Runs side effects after render." },
        { front: "Props", back: "Inputs passed to a component." },
        { front: "JSX", back: "Syntax extension for describing UI." },
        { front: "Key prop", back: "Helps React identify list items." },
        { front: "Controlled input", back: "Input value managed by state." },
        { front: "Lifting state up", back: "Move state to nearest shared parent." },
        { front: "Memoization", back: "Caches expensive calculations/results." },
        { front: "Context", back: "Share values without prop drilling." },
        { front: "Custom hook", back: "Reusable stateful logic function." },
      ],
    },
    {
      title: "TypeScript Fundamentals",
      cards: [
        { front: "Type inference", back: "TS derives type from value." },
        { front: "Union type", back: "Value can be one of several types." },
        { front: "Interface", back: "Contract describing object shape." },
        { front: "Type alias", back: "Name for any type." },
        { front: "Narrowing", back: "Refining a variable's type by checks." },
        { front: "unknown", back: "Safe top type requiring refinement." },
        { front: "never", back: "Represents values that never occur." },
        { front: "Generics", back: "Parameterized reusable type logic." },
        { front: "Partial<T>", back: "Makes all properties optional." },
        { front: "Readonly<T>", back: "Makes all properties immutable." },
      ],
    },
    {
      title: "SQL Basics",
      cards: [
        { front: "SELECT", back: "Read rows from a table." },
        { front: "WHERE", back: "Filter rows by condition." },
        { front: "ORDER BY", back: "Sort query results." },
        { front: "GROUP BY", back: "Aggregate rows by columns." },
        { front: "INNER JOIN", back: "Rows with matching keys in both tables." },
        { front: "LEFT JOIN", back: "All left rows plus matching right rows." },
        { front: "PRIMARY KEY", back: "Unique identifier for each row." },
        { front: "INDEX", back: "Speeds lookups at storage cost." },
        { front: "COUNT(*)", back: "Returns number of rows." },
        { front: "LIMIT", back: "Restricts number of returned rows." },
      ],
    },
    {
      title: "HTTP and APIs",
      cards: [
        { front: "GET", back: "Retrieve a resource." },
        { front: "POST", back: "Create a resource or trigger action." },
        { front: "PUT", back: "Replace a resource." },
        { front: "PATCH", back: "Partially update a resource." },
        { front: "DELETE", back: "Remove a resource." },
        { front: "200 OK", back: "Request succeeded." },
        { front: "201 Created", back: "Resource created successfully." },
        { front: "400 Bad Request", back: "Client sent invalid request." },
        { front: "401 Unauthorized", back: "Authentication required or invalid." },
        { front: "404 Not Found", back: "Requested resource does not exist." },
      ],
    },
    {
      title: "Linux CLI",
      cards: [
        { front: "pwd", back: "Print current working directory." },
        { front: "ls", back: "List files and directories." },
        { front: "cd", back: "Change directory." },
        { front: "mkdir", back: "Create a directory." },
        { front: "rm", back: "Remove files or directories." },
        { front: "cp", back: "Copy files or directories." },
        { front: "mv", back: "Move/rename files or directories." },
        { front: "cat", back: "Concatenate and print file contents." },
        { front: "grep", back: "Search text by pattern." },
        { front: "chmod", back: "Change file permissions." },
      ],
    },
    {
      title: "Git Essentials",
      cards: [
        { front: "git status", back: "Show working tree status." },
        { front: "git add", back: "Stage file changes." },
        { front: "git commit", back: "Record staged snapshot." },
        { front: "git push", back: "Upload local commits." },
        { front: "git pull", back: "Fetch and merge remote changes." },
        { front: "git branch", back: "List/manage branches." },
        { front: "git checkout", back: "Switch branches or restore files." },
        { front: "git merge", back: "Combine histories." },
        { front: "git rebase", back: "Replay commits on new base." },
        { front: "git log", back: "Show commit history." },
      ],
    },
    {
      title: "Math Quick Facts",
      cards: [
        { front: "Derivative of x^2", back: "2x" },
        { front: "Derivative of sin(x)", back: "cos(x)" },
        { front: "Integral of 1/x", back: "ln|x| + C" },
        { front: "Pi approximation", back: "3.14159" },
        { front: "Pythagorean theorem", back: "a^2 + b^2 = c^2" },
        { front: "Prime after 47", back: "53" },
        { front: "Square root of 144", back: "12" },
        { front: "7 * 8", back: "56" },
        { front: "15% of 200", back: "30" },
        { front: "2^10", back: "1024" },
      ],
    },
    {
      title: "Biology 101",
      cards: [
        { front: "Cell powerhouse", back: "Mitochondria" },
        { front: "Photosynthesis occurs in", back: "Chloroplasts" },
        { front: "DNA stands for", back: "Deoxyribonucleic acid" },
        { front: "Smallest unit of life", back: "Cell" },
        { front: "Human blood pH", back: "About 7.4" },
        { front: "Gas inhaled for respiration", back: "Oxygen" },
        { front: "Gas exhaled", back: "Carbon dioxide" },
        { front: "Basic unit of heredity", back: "Gene" },
        { front: "Organ that pumps blood", back: "Heart" },
        { front: "Largest human organ", back: "Skin" },
      ],
    },
    {
      title: "World Capitals",
      cards: [
        { front: "France", back: "Paris" },
        { front: "Japan", back: "Tokyo" },
        { front: "Canada", back: "Ottawa" },
        { front: "Australia", back: "Canberra" },
        { front: "Brazil", back: "Brasilia" },
        { front: "India", back: "New Delhi" },
        { front: "South Korea", back: "Seoul" },
        { front: "Egypt", back: "Cairo" },
        { front: "Mexico", back: "Mexico City" },
        { front: "Kenya", back: "Nairobi" },
      ],
    },
    {
      title: "Cybersecurity Basics",
      cards: [
        { front: "Phishing", back: "Fraudulent attempt to steal sensitive data." },
        { front: "MFA", back: "Multi-factor authentication." },
        { front: "Hashing", back: "One-way transformation of data." },
        { front: "Salting", back: "Adding random data before hashing." },
        { front: "Firewall", back: "Filters network traffic by rules." },
        { front: "VPN", back: "Encrypted tunnel over public networks." },
        { front: "SQL injection", back: "Injecting malicious SQL into queries." },
        { front: "XSS", back: "Injecting scripts into trusted web pages." },
        { front: "Least privilege", back: "Grant minimum required access." },
        { front: "Zero-day", back: "Unknown vulnerability with no patch yet." },
      ],
    },
  ];

  for (const seedDeck of seedDecks) {
    await prisma.deck.create({
      data: {
        title: seedDeck.title,
        userId: user.id,
        cards: {
          create: seedDeck.cards,
        },
      },
    });
  }

  console.log(
    `Seed complete: ${seedDecks.length} decks created for ${email}. Login password: password123`,
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
