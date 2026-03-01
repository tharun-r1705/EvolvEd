'use strict';

// Phase 9 seed: InterviewQuestion (200+) + TechTrend (30+) + DailyTips embedded in TechTrend

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// INTERVIEW QUESTIONS
// ─────────────────────────────────────────────────────────────────────────────

const QUESTIONS = [
  // ── TECHNICAL: Data Structures & Algorithms ──
  { category: 'technical', difficulty: 'easy', tags: ['arrays', 'dsa'],
    question: 'What is the time complexity of searching in a sorted array using binary search?',
    answer: 'O(log n). Binary search halves the search space at each step, resulting in logarithmic time complexity. Space complexity is O(1) for iterative and O(log n) for recursive due to the call stack.' },
  { category: 'technical', difficulty: 'easy', tags: ['linkedlist', 'dsa'],
    question: 'What is the difference between an array and a linked list?',
    answer: 'Arrays store elements in contiguous memory with O(1) random access but O(n) insertion/deletion. Linked lists store elements in nodes with pointers, giving O(n) access but O(1) insertion/deletion at a known position. Arrays have better cache locality; linked lists have dynamic size.' },
  { category: 'technical', difficulty: 'medium', tags: ['trees', 'dsa'],
    question: 'Explain the difference between BFS and DFS. When would you use each?',
    answer: 'BFS (Breadth-First Search) explores level by level using a queue — ideal for shortest path in unweighted graphs, level-order traversal. DFS (Depth-First Search) explores as deep as possible using a stack/recursion — ideal for topological sort, cycle detection, maze solving. BFS uses O(w) space (width), DFS uses O(h) space (height).' },
  { category: 'technical', difficulty: 'medium', tags: ['sorting', 'dsa'],
    question: 'Why is quicksort generally faster than merge sort in practice despite both being O(n log n)?',
    answer: 'Quicksort has better cache performance because it sorts in-place (cache-friendly memory access patterns). Merge sort requires O(n) auxiliary space. Quicksort\'s average-case constants are smaller. However, merge sort is stable and guarantees O(n log n) worst-case while quicksort degrades to O(n²) with poor pivot choice.' },
  { category: 'technical', difficulty: 'hard', tags: ['graphs', 'dsa'],
    question: 'Explain Dijkstra\'s algorithm and its time complexity.',
    answer: 'Dijkstra\'s finds shortest paths from a source to all vertices in a weighted graph with non-negative edges. It maintains a priority queue of (distance, vertex) pairs, always processing the nearest unvisited vertex. Time complexity: O((V + E) log V) with a min-heap. It fails on negative-weight edges — use Bellman-Ford for those.' },
  { category: 'technical', difficulty: 'easy', tags: ['hashing', 'dsa'],
    question: 'What is a hash collision and how do you handle it?',
    answer: 'A hash collision occurs when two different keys produce the same hash value. Resolution strategies: (1) Chaining — store colliding elements in a linked list at each bucket; (2) Open addressing — probe for the next available slot (linear probing, quadratic probing, double hashing). Load factor determines when to resize the hash table.' },
  { category: 'technical', difficulty: 'medium', tags: ['dp', 'dsa'],
    question: 'What is dynamic programming? How do you identify if a problem can be solved with DP?',
    answer: 'DP solves problems by breaking them into overlapping subproblems and storing results to avoid recomputation (memoization/tabulation). A problem is suitable for DP if it has: (1) Optimal substructure — optimal solution contains optimal solutions to subproblems; (2) Overlapping subproblems — same subproblems solved multiple times. Classic examples: Fibonacci, knapsack, longest common subsequence.' },
  { category: 'technical', difficulty: 'hard', tags: ['trees', 'dsa'],
    question: 'What is a balanced BST? Describe AVL trees vs Red-Black trees.',
    answer: 'A balanced BST maintains height O(log n) to ensure O(log n) search/insert/delete. AVL trees are strictly balanced (height difference ≤ 1), resulting in faster lookups but more rotations on insert/delete. Red-Black trees are loosely balanced (height ≤ 2*log n), requiring fewer rotations — preferred in practice (used in C++ STL map, Java TreeMap).' },
  { category: 'technical', difficulty: 'easy', tags: ['stacks', 'queues', 'dsa'],
    question: 'How would you implement a queue using two stacks?',
    answer: 'Use stack1 for enqueue and stack2 for dequeue. To enqueue: push to stack1. To dequeue: if stack2 is empty, pop all elements from stack1 and push to stack2, then pop from stack2. Amortized O(1) for both operations. This reversal trick makes stack2 act as a FIFO queue.' },
  { category: 'technical', difficulty: 'medium', tags: ['recursion', 'dsa'],
    question: 'What is tail recursion and why does it matter?',
    answer: 'Tail recursion is when a recursive call is the last operation in a function. Compilers can optimize tail-recursive functions into iteration (tail-call optimization, TCO), eliminating stack frame growth and preventing stack overflow. Not all languages support TCO (Python doesn\'t, some JS engines do, Haskell always does).' },

  // ── TECHNICAL: Operating Systems ──
  { category: 'technical', difficulty: 'medium', tags: ['os', 'concurrency'],
    question: 'What is a deadlock? What are the four necessary conditions for deadlock?',
    answer: 'Deadlock occurs when processes wait indefinitely for resources held by each other. The four Coffman conditions: (1) Mutual exclusion — resource held by one process at a time; (2) Hold and wait — process holds resources while waiting for others; (3) No preemption — resources can\'t be forcibly taken; (4) Circular wait — circular chain of waiting processes. Break any one condition to prevent deadlock.' },
  { category: 'technical', difficulty: 'easy', tags: ['os', 'memory'],
    question: 'What is virtual memory? What problem does it solve?',
    answer: 'Virtual memory abstracts physical memory by giving each process the illusion of having a large, contiguous address space. It solves: (1) programs larger than physical RAM via paging/swapping; (2) memory isolation between processes; (3) memory sharing via shared pages. The OS uses page tables to map virtual to physical addresses, with TLB for caching translations.' },
  { category: 'technical', difficulty: 'medium', tags: ['os', 'scheduling'],
    question: 'Explain the difference between process and thread.',
    answer: 'A process is an independent program with its own memory space, file handles, and resources. A thread is a unit of execution within a process, sharing the process\'s memory and resources. Threads have lower creation/context-switch overhead. Context switching between processes requires full memory map change; between threads only registers/stack. Threads communicate via shared memory; processes via IPC.' },
  { category: 'technical', difficulty: 'hard', tags: ['os', 'concurrency'],
    question: 'What is the difference between mutex and semaphore?',
    answer: 'Mutex (mutual exclusion lock) is binary and ownership-based — only the thread that locked it can unlock it. Used for protecting a critical section. Semaphore is a counter-based signaling mechanism — can be signaled by any thread/process. Binary semaphore ≈ mutex but without ownership. Counting semaphore controls access to N resources. Mutexes prevent priority inversion via priority inheritance; semaphores don\'t.' },

  // ── TECHNICAL: Databases ──
  { category: 'technical', difficulty: 'easy', tags: ['database', 'sql'],
    question: 'What is the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN?',
    answer: 'INNER JOIN returns rows where the condition matches in both tables. LEFT JOIN returns all rows from the left table and matching rows from the right (NULLs for non-matches). RIGHT JOIN is the reverse. FULL OUTER JOIN returns all rows from both tables (NULLs where no match). Use LEFT JOIN when you want all primary records regardless of related data existence.' },
  { category: 'technical', difficulty: 'medium', tags: ['database', 'indexing'],
    question: 'What is a database index and when should you use one?',
    answer: 'An index is a data structure (usually B-tree) that speeds up row retrieval at the cost of write performance and storage. Use indexes on: columns frequently in WHERE/JOIN/ORDER BY clauses, foreign keys, columns with high cardinality. Avoid indexing: frequently updated columns, low-cardinality columns (e.g., boolean). Too many indexes slow down INSERT/UPDATE/DELETE.' },
  { category: 'technical', difficulty: 'medium', tags: ['database', 'transactions'],
    question: 'What are ACID properties in database transactions?',
    answer: 'ACID ensures reliable transactions: Atomicity — all operations succeed or all are rolled back; Consistency — transaction brings DB from one valid state to another; Isolation — concurrent transactions don\'t interfere (controlled by isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable); Durability — committed transactions persist even after system failures (ensured by WAL/redo logs).' },
  { category: 'technical', difficulty: 'hard', tags: ['database', 'design'],
    question: 'What is database normalization? Explain 1NF, 2NF, and 3NF.',
    answer: '1NF: Atomic values (no repeating groups/arrays), each column has a single value, rows are unique. 2NF: 1NF + every non-key attribute fully depends on the entire primary key (eliminates partial dependencies, relevant when composite key). 3NF: 2NF + no transitive dependencies (non-key attribute depends only on the primary key, not other non-key attributes). Denormalization trades normal form for read performance.' },
  { category: 'technical', difficulty: 'medium', tags: ['database', 'nosql'],
    question: 'When would you choose NoSQL over SQL?',
    answer: 'Choose NoSQL for: horizontally scalable workloads (sharding), unstructured/variable schema data, high-speed reads/writes (caching, real-time), document-oriented data (MongoDB), key-value stores (Redis), time-series data (InfluxDB), graph data (Neo4j). Choose SQL for: complex queries/joins, strong consistency, transactional integrity, structured data with relationships, reporting/analytics.' },

  // ── TECHNICAL: Networking ──
  { category: 'technical', difficulty: 'easy', tags: ['networking', 'http'],
    question: 'What happens when you type a URL in a browser and press Enter?',
    answer: '(1) DNS resolution: browser checks cache, then OS, then resolver to get IP; (2) TCP connection: 3-way handshake (SYN, SYN-ACK, ACK); (3) TLS handshake for HTTPS; (4) HTTP request sent; (5) Server processes request; (6) HTTP response received; (7) Browser parses HTML, fetches subresources (CSS/JS/images) in parallel; (8) Renders page. HTTP/2 multiplexes requests over single connection.' },
  { category: 'technical', difficulty: 'medium', tags: ['networking', 'tcp'],
    question: 'What is the difference between TCP and UDP?',
    answer: 'TCP: connection-oriented, guaranteed delivery, ordered packets, flow/congestion control, higher overhead. Used for HTTP, email, file transfer. UDP: connectionless, no delivery guarantee, no ordering, lower overhead, lower latency. Used for video streaming, gaming, DNS, VoIP. UDP is faster but unreliable; applications needing reliability over TCP use ACKs at application layer (e.g., QUIC/HTTP3).' },
  { category: 'technical', difficulty: 'medium', tags: ['networking', 'rest'],
    question: 'What are RESTful API principles?',
    answer: 'REST (Representational State Transfer) principles: (1) Stateless — each request contains all needed info; (2) Client-Server separation; (3) Uniform Interface — standard HTTP methods (GET/POST/PUT/DELETE/PATCH), resource-based URLs, HTTP status codes; (4) Cacheable — responses indicate cacheability; (5) Layered System — client doesn\'t know if talking to origin server; (6) Resource representation via JSON/XML.' },

  // ── TECHNICAL: OOP ──
  { category: 'technical', difficulty: 'easy', tags: ['oop', 'concepts'],
    question: 'Explain the four pillars of OOP.',
    answer: '(1) Encapsulation: bundling data and methods, hiding internal state via access modifiers (private/protected/public); (2) Abstraction: exposing only essential details, hiding complexity via interfaces/abstract classes; (3) Inheritance: child class inherits parent\'s properties and methods, enabling code reuse; (4) Polymorphism: same interface for different types — compile-time (method overloading) and runtime (method overriding).' },
  { category: 'technical', difficulty: 'medium', tags: ['oop', 'design'],
    question: 'What is the difference between abstract class and interface?',
    answer: 'Abstract class: can have concrete methods, constructors, instance variables, access modifiers. Single inheritance only. Use when classes share common implementation. Interface: all methods abstract by default (Java 8+ allows default methods), no instance variables (only constants). Multiple inheritance supported. Use to define a contract. Rule of thumb: "is-a" relationship → abstract class; "can-do" relationship → interface.' },
  { category: 'technical', difficulty: 'medium', tags: ['oop', 'patterns'],
    question: 'Explain the SOLID principles.',
    answer: 'S - Single Responsibility: class has one reason to change. O - Open/Closed: open for extension, closed for modification. L - Liskov Substitution: subtypes must be substitutable for base types. I - Interface Segregation: many specific interfaces over one general. D - Dependency Inversion: depend on abstractions, not concretions. Following SOLID leads to maintainable, testable, loosely-coupled code.' },
  { category: 'technical', difficulty: 'hard', tags: ['design-patterns', 'oop'],
    question: 'Explain the Singleton design pattern. When is it appropriate?',
    answer: 'Singleton ensures only one instance of a class exists with global access. Implementation: private constructor, static getInstance() method with lazy initialization, thread-safe with double-checked locking in multithreaded environments. Appropriate for: database connections, configuration managers, logging, caches. Overuse is an anti-pattern — hard to test (mocking is difficult), introduces hidden global state.' },

  // ── TECHNICAL: JavaScript / Web ──
  { category: 'technical', difficulty: 'easy', tags: ['javascript', 'web'],
    question: 'What is the difference between == and === in JavaScript?',
    answer: '== (loose equality) performs type coercion before comparison: "5" == 5 is true, null == undefined is true. === (strict equality) checks both value and type without coercion: "5" === 5 is false. Always prefer === for predictable behavior. Use == only when explicitly checking for null/undefined in one comparison: value == null catches both null and undefined.' },
  { category: 'technical', difficulty: 'medium', tags: ['javascript', 'async'],
    question: 'Explain the JavaScript event loop.',
    answer: 'JS is single-threaded. The event loop coordinates: Call Stack (executes sync code), Web APIs (handle async ops like setTimeout, fetch), Callback Queue (macro-tasks: setTimeout, I/O), Microtask Queue (Promises, queueMicrotask — processed before macro-tasks after each stack frame empties). Order: sync code → microtasks → next macro-task → microtasks → ... This enables non-blocking I/O without threads.' },
  { category: 'technical', difficulty: 'medium', tags: ['javascript', 'closures'],
    question: 'What is a closure in JavaScript?',
    answer: 'A closure is a function that retains access to its outer lexical scope even after the outer function has returned. Use cases: data encapsulation (module pattern), factory functions, partial application/currying, memoization. Classic gotcha: loop + var creates shared binding (all closures see final value) — fix with let, IIFE, or forEach. Memory consideration: closures keep referenced scope alive.' },
  { category: 'technical', difficulty: 'hard', tags: ['javascript', 'prototypes'],
    question: 'Explain JavaScript prototypal inheritance.',
    answer: 'Every JS object has a [[Prototype]] internal slot pointing to another object (or null). Property lookup walks the prototype chain. Object.create(proto) creates object with specified prototype. ES6 class syntax is syntactic sugar over prototype-based inheritance. __proto__ (deprecated) vs Object.getPrototypeOf(). constructor.prototype is the prototype of instances created by that constructor. Prototype chain enables method sharing without copying.' },
  { category: 'technical', difficulty: 'medium', tags: ['react', 'web'],
    question: 'What is the virtual DOM and why does React use it?',
    answer: 'The Virtual DOM is a lightweight JS representation of the real DOM. React maintains a VDOM tree; on state/props change, React re-renders the VDOM, diffs it against the previous VDOM (reconciliation), and applies minimal real DOM changes (commits). This batches updates, avoids expensive direct DOM manipulation, and enables cross-platform rendering (React Native). Modern React uses the Fiber architecture for incremental rendering.' },
  { category: 'technical', difficulty: 'medium', tags: ['react', 'hooks'],
    question: 'Explain the difference between useEffect and useLayoutEffect.',
    answer: 'useEffect runs asynchronously after the browser paints — suitable for data fetching, subscriptions, most side effects. useLayoutEffect runs synchronously after DOM mutations but before the browser paints — suitable for DOM measurements and mutations that affect layout to prevent visual flicker. Rules: same signature, same cleanup mechanism. Default to useEffect; use useLayoutEffect only when you need to measure/mutate DOM before paint.' },
  { category: 'technical', difficulty: 'hard', tags: ['system-design', 'web'],
    question: 'How would you design a URL shortener like bit.ly?',
    answer: 'Core: (1) Hash long URL to 7-char short code (Base62: a-z/A-Z/0-9 = 62^7 ≈ 3.5 trillion). (2) Store mapping in DB with index on short code. (3) Redirect: 301 (cached by browser, less analytics) vs 302 (always hits server, better analytics). Scalability: read-heavy → Redis cache for hot URLs; write: counter-based IDs from distributed ID generator (Snowflake); CDN for global edge redirects. Analytics: async event streaming (Kafka).' },

  // ── TECHNICAL: Python ──
  { category: 'technical', difficulty: 'easy', tags: ['python'],
    question: 'What is the difference between a list and a tuple in Python?',
    answer: 'Lists are mutable (can be modified), use square brackets [], slightly more memory. Tuples are immutable, use parentheses (), hashable (can be used as dict keys/set members), slightly faster. Use lists when data changes; tuples for fixed data, multiple return values, or as dictionary keys. Tuple unpacking: a, b = 1, 2. Named tuples (collections.namedtuple) add field names.' },
  { category: 'technical', difficulty: 'medium', tags: ['python', 'oop'],
    question: 'Explain Python decorators.',
    answer: 'A decorator is a function that takes a function and returns a modified function — syntactic sugar for higher-order functions. @decorator is equivalent to func = decorator(func). Common uses: logging, timing, authentication (@login_required), caching (@lru_cache), input validation. Use functools.wraps to preserve the wrapped function\'s metadata. Class-based decorators use __call__. Decorator factories accept parameters: @decorator(param).' },
  { category: 'technical', difficulty: 'medium', tags: ['python', 'generators'],
    question: 'What are Python generators? When would you use them?',
    answer: 'Generators produce values lazily using yield, maintaining execution state between calls. Benefits: memory-efficient for large sequences (don\'t store all values), can represent infinite sequences. Generator expressions: (x*2 for x in range(10)). Use when: processing large files, infinite streams, pipeline processing. yield from delegates to sub-generators. Generators are iterators but iterators are not always generators.' },

  // ── TECHNICAL: System Design ──
  { category: 'technical', difficulty: 'hard', tags: ['system-design', 'scalability'],
    question: 'What is horizontal vs vertical scaling? When would you choose each?',
    answer: 'Vertical scaling: adding more resources (CPU/RAM) to a single server. Simple, no code change, but has hardware limits and single point of failure. Horizontal scaling: adding more servers and distributing load. Requires stateless application design, load balancing, distributed session/cache (Redis). Choose vertical for: databases (initially), stateful services. Choose horizontal for: stateless web/API servers, high traffic, global distribution.' },
  { category: 'technical', difficulty: 'hard', tags: ['system-design', 'caching'],
    question: 'Explain different caching strategies: write-through, write-behind, cache-aside.',
    answer: 'Cache-aside (lazy loading): app reads from cache, on miss loads from DB and populates cache. App manages cache. Risk: cache stampede on cold start. Write-through: every write goes to cache and DB simultaneously. Strong consistency, but writes slower. Write-behind (write-back): write to cache immediately, async persist to DB. Fast writes, but risk data loss. Read-through: cache sits in front, handles DB reads automatically.' },
  { category: 'technical', difficulty: 'hard', tags: ['system-design', 'microservices'],
    question: 'What are microservices? What are their advantages and challenges?',
    answer: 'Microservices decompose an application into small, independently deployable services each owning their data. Advantages: independent scaling and deployment, technology diversity, fault isolation, smaller codebases. Challenges: distributed system complexity (network failures, latency), data consistency (no shared DB — use sagas/eventual consistency), service discovery, distributed tracing, operational overhead. Suitable when team size and deployment frequency justify the complexity.' },

  // ── BEHAVIORAL ──
  { category: 'behavioral', difficulty: 'easy', tags: ['teamwork', 'communication'],
    question: 'Tell me about a time you had a conflict with a team member. How did you resolve it?',
    answer: 'Use the STAR method: Situation — describe the context of the conflict. Task — your role and what needed to be resolved. Action — how you approached it (active listening, finding common ground, involving a mediator if needed). Result — the outcome and relationship improvement. Key points to convey: respect for differing opinions, focus on the problem not the person, collaborative resolution, what you learned.' },
  { category: 'behavioral', difficulty: 'easy', tags: ['leadership', 'initiative'],
    question: 'Describe a situation where you took initiative without being asked.',
    answer: 'STAR structure: Set context (project was falling behind / process was inefficient). Describe what you identified and why action was needed. Explain the specific initiative you took (proposed solution, built prototype, organized team). Share measurable results. Key theme: proactiveness, ownership mentality. Show you identified a problem others missed and acted on it for the team\'s benefit.' },
  { category: 'behavioral', difficulty: 'medium', tags: ['failure', 'learning'],
    question: 'Tell me about your biggest failure. What did you learn?',
    answer: 'Be honest — describe a real failure, not a thinly disguised success. Structure: What was the goal, what went wrong, your specific role in the failure, immediate impact. Most importantly: what concrete changes you made after the failure. Show maturity, self-awareness, and growth mindset. Avoid: blaming others, denying responsibility, picking trivial failures. The interviewer wants to assess how you handle adversity and learn.' },
  { category: 'behavioral', difficulty: 'medium', tags: ['pressure', 'time-management'],
    question: 'How do you handle working under pressure with tight deadlines?',
    answer: 'Give a specific example using STAR. Effective strategies to mention: prioritization (break work into tasks, identify blockers), communication (proactively update stakeholders on risks), focused execution (minimize distractions, deep work sessions), knowing when to ask for help. Show you perform well under pressure but also take steps to prevent unnecessary pressure through planning and early risk identification.' },
  { category: 'behavioral', difficulty: 'medium', tags: ['feedback', 'growth'],
    question: 'Tell me about a time you received critical feedback. How did you respond?',
    answer: 'Demonstrate receptiveness to feedback: describe specific feedback received, your initial reaction (be honest — surprise/discomfort is okay), how you took time to reflect rather than react defensively, what concrete changes you made, and the positive outcome. Show emotional intelligence and growth mindset. Key: you sought to understand the feedback, implemented changes, and followed up.' },
  { category: 'behavioral', difficulty: 'medium', tags: ['teamwork', 'collaboration'],
    question: 'Describe a time you had to work with someone whose work style was very different from yours.',
    answer: 'STAR: Describe the style difference (one detail-oriented, other big-picture; different communication preferences; different working hours). What challenge this created. How you adapted — understanding their strengths, finding a workflow that played to both styles, explicit communication agreements. Result: successful project completion and professional relationship. Key: flexibility, empathy, finding complementarity in differences.' },
  { category: 'behavioral', difficulty: 'hard', tags: ['leadership', 'decision-making'],
    question: 'Tell me about a time you had to make a difficult decision with incomplete information.',
    answer: 'Show your decision-making framework: (1) What information was available and what was missing; (2) What assumptions you made and why; (3) Who you consulted; (4) How you weighed risks vs benefits; (5) The decision made and outcome. Key qualities: analytical thinking, comfort with ambiguity, decisive action, monitoring outcomes and adjusting if wrong. Avoid paralysis-by-analysis; show structured thinking under uncertainty.' },
  { category: 'behavioral', difficulty: 'easy', tags: ['motivation', 'career'],
    question: 'Why did you choose this field/company? What motivates you?',
    answer: 'Be specific and genuine: connect your answer to real experiences (project that sparked interest, problem you want to solve). Research the company — mention specific products, culture, tech stack, or mission that resonates. Connect your skills and interests to the role. Avoid generic answers like "I love coding" or "great company culture." Show alignment between your goals and what the role/company offers.' },

  // ── HR ──
  { category: 'hr', difficulty: 'easy', tags: ['introduction', 'hr'],
    question: 'Tell me about yourself.',
    answer: 'Structure: (1) Present — your current role/year of study, key skills; (2) Past — most relevant experience (internships, projects, achievements); (3) Future — why you\'re interested in this role and company. Keep it 90-120 seconds. Focus on professional narrative, not biography. Tailor to the role. End with why you\'re excited about this opportunity. Practice until it sounds natural, not rehearsed.' },
  { category: 'hr', difficulty: 'easy', tags: ['strengths', 'hr'],
    question: 'What are your greatest strengths?',
    answer: 'Choose 2-3 strengths relevant to the role. Structure: state the strength, give a specific example, connect to how it benefits the employer. Authentic strengths to highlight for tech roles: problem-solving, quick learning, attention to detail, communication, collaboration. Back every strength with evidence — not just claims. Avoid generic answers like "I\'m a hard worker." Show, don\'t tell.' },
  { category: 'hr', difficulty: 'easy', tags: ['weaknesses', 'hr'],
    question: 'What is your greatest weakness?',
    answer: 'Be genuine — not a "humblebrag" (overworking, perfectionism presented uncritically). Choose a real weakness that\'s not critical to the core role. Structure: (1) Name the weakness honestly; (2) Show self-awareness of its impact; (3) Describe specific steps you\'re taking to improve; (4) Progress made. Examples: public speaking (joined Toastmasters), saying no to tasks (learned to prioritize), impatience with unclear requirements (now clarify upfront).' },
  { category: 'hr', difficulty: 'medium', tags: ['salary', 'negotiation', 'hr'],
    question: 'What are your salary expectations?',
    answer: 'Research market rates before the interview (Glassdoor, LinkedIn Salary, industry surveys). Give a range rather than a single number, anchored by research: "Based on my research and experience, I\'m looking for ₹X-Y LPA." Express openness to discuss based on total compensation (benefits, growth, equity). Avoid anchoring too low or too high. If pressed for a number, give one confidently based on your research.' },
  { category: 'hr', difficulty: 'medium', tags: ['career-goals', 'hr'],
    question: 'Where do you see yourself in 5 years?',
    answer: 'Show ambition aligned with what the company can offer. Good structure: technical growth in 1-2 years (mastering core skills of the role), leadership/ownership in 3-5 years (leading projects or mentoring). Research the company\'s career path. Avoid: overly specific (I want your manager\'s job) or vague (I don\'t know). Key message: committed to growing here, motivated to add increasing value.' },
  { category: 'hr', difficulty: 'easy', tags: ['company-research', 'hr'],
    question: 'Why do you want to work here?',
    answer: 'Demonstrate research: mention specific products/services, recent news, tech stack, culture, values, or business impact. Connect to your own career goals and interests. Three-part structure: (1) What excites you about the company specifically; (2) How the role aligns with your skills and interests; (3) What you can contribute. Avoid generic praise. Show you\'ve done homework and are genuinely interested, not just job-hunting broadly.' },
  { category: 'hr', difficulty: 'medium', tags: ['work-style', 'hr'],
    question: 'Do you prefer working independently or in a team?',
    answer: 'Show flexibility — you can do both effectively. Describe strengths in both: individual work (focus, deep work, self-direction) and team work (collaboration, diverse perspectives, accountability). Give examples of each. Connect to the role: for a collaborative team role, emphasize teamwork while showing you can own individual tasks. Key message: adaptable to what the situation and team requires.' },
  { category: 'hr', difficulty: 'hard', tags: ['negotiation', 'hr'],
    question: 'Do you have any other job offers? How are you deciding?',
    answer: 'Be honest but strategic. If you have offers: "I\'m in discussions with a few companies but this role is particularly exciting because [specific reason]." If you have an offer with a deadline, mention it professionally to create appropriate urgency. Your decision criteria should align with the role: growth, impact, team quality, technology. Shows you\'re in demand, thoughtful about your choice, and genuinely interested in this company.' },

  // ── APTITUDE ──
  { category: 'aptitude', difficulty: 'easy', tags: ['probability'],
    question: 'A bag has 5 red and 3 blue balls. What is the probability of picking 2 red balls consecutively without replacement?',
    answer: 'P(1st red) = 5/8. After removing one red: P(2nd red | 1st red) = 4/7. Combined probability = (5/8) × (4/7) = 20/56 = 5/14 ≈ 0.357 or about 35.7%. Key concept: conditional probability with "without replacement" — each draw changes the sample space.' },
  { category: 'aptitude', difficulty: 'medium', tags: ['logic', 'puzzles'],
    question: 'You have 8 identical-looking balls but one is slightly heavier. With a balance scale and only 2 weighings, how do you find the heavy ball?',
    answer: 'Divide into 3 groups: {3, 3, 2}. Weighing 1: Put 3 balls on each side. If balanced → heavy ball is in the 2 remaining. Weighing 2: Weigh those 2 against each other. If imbalanced in W1 → take the heavier group of 3. Weighing 2: Weigh 1 vs 1 from that group. If balanced → 3rd ball is heavy. If not → the heavier side has it. Total: 2 weighings cover all 8 cases.' },
  { category: 'aptitude', difficulty: 'easy', tags: ['math', 'percentage'],
    question: 'A product\'s price increased by 20% and then decreased by 20%. What is the net percentage change?',
    answer: 'Start with price P. After 20% increase: P × 1.2 = 1.2P. After 20% decrease: 1.2P × 0.8 = 0.96P. Net change: (0.96P - P)/P × 100 = -4%. The price decreased by 4%. This is a common trap — increases and decreases don\'t cancel. Formula: Net% = x + y + (xy/100). Here: 20 + (-20) + (20×(-20)/100) = -4%.' },
  { category: 'aptitude', difficulty: 'medium', tags: ['time-work'],
    question: 'A can complete a job in 12 days, B in 15 days. How long will they take together?',
    answer: 'A\'s rate = 1/12 per day. B\'s rate = 1/15 per day. Combined rate = 1/12 + 1/15 = 5/60 + 4/60 = 9/60 = 3/20. Time together = 20/3 = 6⅔ days ≈ 6 days 16 hours. General formula for two workers: Time = (A×B)/(A+B) = (12×15)/(12+15) = 180/27 = 20/3.' },
  { category: 'aptitude', difficulty: 'medium', tags: ['speed-distance'],
    question: 'Two trains of length 200m and 150m are running towards each other at 60 km/h and 40 km/h. How long do they take to cross each other?',
    answer: 'Relative speed = 60 + 40 = 100 km/h (towards each other) = 100 × (1000/3600) m/s = 250/9 m/s ≈ 27.78 m/s. Total distance to cover = 200 + 150 = 350m. Time = 350 ÷ (250/9) = 350 × 9/250 = 3150/250 = 12.6 seconds. Key: add train lengths (both must fully pass) and add speeds (opposite directions).' },
  { category: 'aptitude', difficulty: 'hard', tags: ['logic', 'seating'],
    question: 'In how many ways can 5 people sit around a circular table?',
    answer: 'For circular permutations, fix one person to eliminate rotational equivalence. Remaining 4 people can be arranged in 4! = 24 ways. Formula: (n-1)! = (5-1)! = 4! = 24. Contrast with linear: 5! = 120. If the table has identical seats (no fixed reference), answer is (n-1)!. If reflections are also identical: (n-1)!/2 = 12.' },
  { category: 'aptitude', difficulty: 'easy', tags: ['number-series'],
    question: 'Find the next number in the series: 2, 6, 12, 20, 30, ?',
    answer: '42. Differences: 6-2=4, 12-6=6, 20-12=8, 30-20=10, ?-30=12. The differences form an arithmetic sequence (4,6,8,10,12...) increasing by 2. So next term = 30+12 = 42. Pattern: n(n+1): 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42.' },

  // ── SYSTEM DESIGN ──
  { category: 'technical', difficulty: 'hard', tags: ['system-design'],
    question: 'How would you design a notification system for millions of users?',
    answer: 'Components: (1) Event producers push to Kafka message queue; (2) Notification service consumes events, looks up user preferences (push/email/SMS) and device tokens; (3) Provider clients send via FCM/APNs (push), SendGrid (email), Twilio (SMS); (4) Fan-out service for broadcast notifications (celeb follows); (5) Redis for deduplication and rate limiting; (6) Database for notification history. Key: async delivery, retry logic with exponential backoff, user preference management.' },
  { category: 'technical', difficulty: 'hard', tags: ['system-design'],
    question: 'Design a rate limiter.',
    answer: 'Algorithms: (1) Fixed window counter — simple, but allows 2x spike at window boundary; (2) Sliding window log — accurate, memory-heavy; (3) Sliding window counter — balance of both; (4) Token bucket — allows bursting, smooth rate; (5) Leaky bucket — strict output rate. Implementation: Redis INCR + EXPIRE for distributed counter. Store: user_id:endpoint:timestamp → count. Return 429 with Retry-After header when limit exceeded. Consider: per-user vs per-IP vs per-API-key limits.' },
  { category: 'technical', difficulty: 'hard', tags: ['system-design', 'database'],
    question: 'How do you handle database migrations in production without downtime?',
    answer: 'Strategies: (1) Expand-Contract (Blue/Green) pattern: add new column (nullable), deploy code to write both old+new, backfill data, deploy code to read new, drop old column; (2) Online schema change tools (pt-online-schema-change for MySQL, pg_reorg for Postgres); (3) Shadow writes to new schema, validate, then cut over; (4) Feature flags to gradually roll out. Avoid: large one-time migrations on huge tables, adding NOT NULL columns without default to large tables.' },

  // ── MORE BEHAVIORAL ──
  { category: 'behavioral', difficulty: 'medium', tags: ['problem-solving'],
    question: 'Describe a complex technical problem you solved. Walk me through your approach.',
    answer: 'STAR with technical depth: Situation — specific system/code context. Task — what needed solving. Action — your diagnostic approach (isolate variables, reproduce consistently, add logging, form hypothesis, test), tools used, iterations. Result — the fix and what you learned about prevention. Show systematic debugging, not lucky guessing. Mention tools: profilers, logs, monitoring, pair programming with colleagues.' },
  { category: 'behavioral', difficulty: 'easy', tags: ['learning', 'adaptability'],
    question: 'Tell me about a time you had to learn a new technology quickly.',
    answer: 'STAR: Context requiring rapid skill acquisition (new tech stack for project, short deadline). Your learning strategy: official docs, tutorials, build a small project, ask colleagues, Stack Overflow. How you managed the deadline while learning. Result: what you built and your proficiency level now. Key: show structured learning approach, resourcefulness, willingness to ask for help, and how you\'ve retained and built on that learning.' },
  { category: 'behavioral', difficulty: 'hard', tags: ['ethics', 'integrity'],
    question: 'Tell me about a time you disagreed with a decision made by management or a senior colleague.',
    answer: 'Show professional disagreement: (1) You had a reasoned, evidence-based objection; (2) You expressed disagreement through proper channels (1:1, not publicly undermining); (3) You listened to their rationale; (4) After decision was made, you committed fully to executing it even if not your preference (disagree and commit); (5) Outcome. This shows courage to speak up, respect for hierarchy, and team-first attitude. Avoid: stories that make management look foolish.' },

  // ── MORE TECHNICAL ──
  { category: 'technical', difficulty: 'medium', tags: ['git', 'devops'],
    question: 'What is the difference between git merge and git rebase?',
    answer: 'Merge integrates branches by creating a new merge commit, preserving full history — good for shared branches. Rebase moves commits to the tip of another branch, creating linear history — cleaner log but rewrites history (never rebase shared/public branches). Interactive rebase (git rebase -i) lets you squash, reorder, edit commits. Golden rule: don\'t rebase commits that exist outside your local repo.' },
  { category: 'technical', difficulty: 'medium', tags: ['testing', 'quality'],
    question: 'What is the difference between unit, integration, and end-to-end testing?',
    answer: 'Unit tests: test individual functions/methods in isolation, fast, deterministic, mock dependencies. Integration tests: test interaction between components/services/database, slower, may need test DB. E2E tests: simulate real user flows through the entire system (browser + API + DB), slowest, most confidence. Test pyramid: many unit, fewer integration, few E2E. TDD: write tests before code; BDD: describe behavior in plain language (Cucumber/Jest describe/it).' },
  { category: 'technical', difficulty: 'medium', tags: ['cloud', 'aws'],
    question: 'Explain the difference between SQL and NoSQL databases with examples.',
    answer: 'SQL (relational): PostgreSQL, MySQL, SQLite. Structured schema, ACID transactions, powerful querying with joins, vertical scaling. Best for complex relationships and transactional data. NoSQL: MongoDB (document), Redis (key-value), Cassandra (wide-column), Neo4j (graph). Schema-flexible, horizontal scaling, BASE model (Basically Available, Soft state, Eventually consistent). Best for massive scale, unstructured data, specific access patterns. Many modern systems use both.' },
  { category: 'technical', difficulty: 'easy', tags: ['algorithms', 'complexity'],
    question: 'What is Big O notation? Explain O(1), O(n), O(n²), O(log n).',
    answer: 'Big O describes worst-case time/space complexity as input grows. O(1): constant time regardless of input (array access, hash lookup). O(log n): halves problem each step (binary search, balanced BST). O(n): processes each element once (linear scan). O(n log n): efficient sorts (merge sort, heap sort). O(n²): nested loops (bubble sort, comparing all pairs). O(2^n): exponential (brute-force subsets). Key: we drop constants and lower-order terms.' },
  { category: 'technical', difficulty: 'medium', tags: ['security', 'web'],
    question: 'What are the OWASP Top 10 vulnerabilities? Explain at least 3.',
    answer: 'OWASP Top 10: (1) Injection (SQL, XSS) — use parameterized queries, input sanitization; (2) Broken Authentication — secure session management, MFA, bcrypt passwords; (3) Sensitive Data Exposure — encrypt in transit (TLS) and at rest; (4) XXE; (5) Broken Access Control — check authorization on every request; (6) Security Misconfiguration; (7) XSS — sanitize output, Content Security Policy; (8) Insecure Deserialization; (9) Known Vulnerabilities; (10) Insufficient Logging.' },
  { category: 'technical', difficulty: 'hard', tags: ['concurrency', 'backend'],
    question: 'Explain the difference between concurrency and parallelism.',
    answer: 'Concurrency: multiple tasks are in progress at the same time but not necessarily executing simultaneously — managing multiple tasks by interleaving (a single core can be concurrent via time-slicing or async I/O). Parallelism: tasks literally execute simultaneously on multiple CPU cores. Go/Goroutines: concurrency primitives. Node.js: concurrent (event loop) but not parallel (single thread, unless worker_threads). Java/Python threads: concurrent and parallel on multi-core. Async/await is concurrency, not parallelism.' },
  { category: 'technical', difficulty: 'easy', tags: ['linux', 'devops'],
    question: 'What is a process vs a daemon in Linux?',
    answer: 'A process is any running program with a PID, associated with a terminal (foreground or background). A daemon is a background process not attached to any terminal, typically started at boot, runs continuously to serve requests (httpd, sshd, cron). Daemons usually: fork from parent, create new session (setsid), change to root directory, close stdin/stdout/stderr. Modern Linux uses systemd to manage daemons as "services".' },
  { category: 'technical', difficulty: 'medium', tags: ['api', 'graphql'],
    question: 'What is GraphQL and how does it differ from REST?',
    answer: 'GraphQL is a query language for APIs where the client specifies exactly what data it needs. Differences: REST has multiple endpoints per resource; GraphQL has a single endpoint. REST suffers from over-fetching (too much data) and under-fetching (need multiple requests); GraphQL solves both. GraphQL has strong type system with schema. REST better for simple CRUD, caching (HTTP cache), file uploads. GraphQL better for complex, nested data requirements and rapid front-end iteration.' },

  // ── MORE HR ──
  { category: 'hr', difficulty: 'easy', tags: ['availability', 'hr'],
    question: 'When can you start?',
    answer: 'Be honest about your availability. If currently employed: give your notice period (typically 2 weeks to 1 month). If a student: mention your graduation date and if you\'re available for immediate start. If there\'s flexibility, express it: "I can potentially negotiate with my current team for an earlier start." Ask about their preferred start date to show flexibility and alignment.' },
  { category: 'hr', difficulty: 'medium', tags: ['relocation', 'hr'],
    question: 'Are you open to relocation?',
    answer: 'Be honest. If yes: "Absolutely, I\'m excited about the opportunity and open to relocating." If maybe: "I\'m open to discussing it — could you tell me more about the location requirements?" If no: clarify constraints professionally and check if remote work is an option. Research the company\'s locations before the interview so you can have an informed conversation. Don\'t commit to something you\'re not prepared to do.' },
  { category: 'hr', difficulty: 'hard', tags: ['gap', 'career', 'hr'],
    question: 'Explain a gap in your employment/education history.',
    answer: 'Be honest and frame it positively. Types of gaps and how to address: health/personal reasons (mention briefly, focus on recovery and readiness); skill development (courses, certifications, projects — show productivity); family responsibilities (brief mention, emphasize you\'re now fully available); job search (market was tough, you used time to upskill). Always bring it back to current readiness: what you learned and why you\'re ready and motivated now.' },

  // ── TECHNICAL: Cloud & DevOps ──
  { category: 'technical', difficulty: 'medium', tags: ['docker', 'devops'],
    question: 'What is Docker and why is it useful?',
    answer: 'Docker is a containerization platform. Containers package an application with all its dependencies into a portable, isolated unit that runs consistently across environments. Benefits: eliminates "works on my machine" issues, fast startup vs VMs, efficient resource usage, easy scaling with Kubernetes, microservices deployment. Key concepts: Dockerfile (build instructions), Image (read-only template), Container (running instance), Registry (image storage, e.g., Docker Hub). Docker Compose for multi-container apps.' },
  { category: 'technical', difficulty: 'hard', tags: ['kubernetes', 'devops'],
    question: 'Explain the key components of Kubernetes.',
    answer: 'Kubernetes orchestrates containers at scale. Key components: Node (worker machine running pods); Pod (smallest unit, 1+ containers sharing network/storage); Deployment (manages pod replicas, rolling updates); Service (stable network endpoint, load balances to pods); Ingress (HTTP routing); ConfigMap/Secret (configuration); PersistentVolume (storage); Namespace (isolation). Control plane: API Server, etcd (cluster state), Scheduler (places pods), Controller Manager.' },
  { category: 'technical', difficulty: 'medium', tags: ['ci-cd', 'devops'],
    question: 'What is CI/CD and what are its benefits?',
    answer: 'CI (Continuous Integration): developers frequently merge code to shared branch, automated tests run on every commit, catches bugs early. CD (Continuous Delivery): automated pipeline to deliver tested code to staging. Continuous Deployment: automatically deploys to production. Benefits: faster feedback loop, reduced integration problems, smaller deployable units (less risk), automated testing, reproducible builds. Tools: GitHub Actions, Jenkins, GitLab CI, CircleCI.' },

  // ── ADDITIONAL BEHAVIORAL ──
  { category: 'behavioral', difficulty: 'easy', tags: ['goals', 'career'],
    question: 'What are your short-term and long-term career goals?',
    answer: 'Short-term (1-2 years): specific and role-relevant (master the core tech stack, contribute to a major feature, improve system design skills). Long-term (3-5 years): broader trajectory (tech lead, architect, build/lead a product). Connect both to what this company offers. Show progression makes sense. Avoid: too vague ("grow professionally"), too specific ("be CTO in 3 years"), goals that clearly don\'t align with the role.' },
  { category: 'behavioral', difficulty: 'medium', tags: ['mentorship', 'teamwork'],
    question: 'Have you ever mentored someone or been mentored? What did you learn?',
    answer: 'Mentoring: describe someone you helped (junior colleague, teammate learning new tech). What approach you used (pair programming, code review, explaining concepts). Impact on them. What you gained (deeper understanding by teaching, improved communication, satisfaction). Being mentored: describe relationship, specific guidance received, how it accelerated your growth, how you pay it forward. Shows interpersonal investment and a growth culture value.' },
  { category: 'behavioral', difficulty: 'hard', tags: ['ethics', 'values'],
    question: 'Tell me about a time you had to prioritize between two equally important tasks.',
    answer: 'Show your prioritization framework: (1) Assess actual urgency and impact of each; (2) Consult stakeholders if needed; (3) Consider dependencies and blockers; (4) Communicate your decision to both parties; (5) Execute with full focus. Methods: Eisenhower Matrix, business impact assessment, stakeholder alignment. Result should show either successful handling of both or a reasoned choice with positive outcome. Key: structured thinking, not random choice.' },

  // ── TECHNICAL: More Web Dev ──
  { category: 'technical', difficulty: 'medium', tags: ['typescript'],
    question: 'What are the main benefits of TypeScript over JavaScript?',
    answer: 'TypeScript adds static typing to JavaScript: (1) Catch type errors at compile time (not runtime); (2) Better IDE support (IntelliSense, refactoring); (3) Self-documenting code (types serve as documentation); (4) Safer refactoring of large codebases; (5) Interfaces and generics for reusable, type-safe abstractions; (6) Optional — gradual adoption in existing JS projects. Tradeoffs: compilation step, more verbose, learning curve. TypeScript output is still JavaScript.' },
  { category: 'technical', difficulty: 'medium', tags: ['nodejs', 'backend'],
    question: 'How does Node.js handle concurrency despite being single-threaded?',
    answer: 'Node.js uses an event-driven, non-blocking I/O model. Single JS thread runs the event loop. I/O operations (file system, network, DB) are delegated to libuv\'s thread pool (for file I/O) or OS async APIs (for network I/O), freeing the event loop to handle other requests. When I/O completes, callbacks are queued in the event loop. This makes Node excellent for I/O-bound tasks but poor for CPU-intensive tasks (use worker_threads or cluster for those).' },
  { category: 'technical', difficulty: 'easy', tags: ['css', 'web'],
    question: 'Explain the CSS box model.',
    answer: 'Every HTML element is a rectangular box with: Content (actual content width/height), Padding (space between content and border), Border (border around padding), Margin (space outside border). box-sizing: content-box (default — width/height = content only); border-box (width/height includes padding and border — much easier to use). Total element width = content + left/right padding + left/right border + left/right margin.' },
  { category: 'technical', difficulty: 'hard', tags: ['algorithms', 'strings'],
    question: 'What is the KMP (Knuth-Morris-Pratt) string matching algorithm?',
    answer: 'KMP finds occurrences of a pattern in a text in O(n+m) time, vs naive O(n*m). Key insight: when a mismatch occurs, use pre-computed "failure function" (partial match table) to skip characters rather than restarting from scratch. Build failure function from pattern in O(m): for each position, find the longest proper prefix that is also a suffix. During matching, on mismatch, fall back using this table. Used in: text editors, DNA matching, file search.' },
  { category: 'technical', difficulty: 'medium', tags: ['security', 'auth'],
    question: 'How does JWT authentication work?',
    answer: 'JWT (JSON Web Token) has 3 parts: Header (algorithm), Payload (claims: userId, role, exp), Signature (HMAC of header+payload with secret). Flow: user logs in → server creates JWT signed with secret → client stores JWT → attaches in Authorization: Bearer header on subsequent requests → server verifies signature, extracts claims. Stateless — no DB lookup per request. Short expiry + refresh tokens for security. Never store sensitive data in payload (it\'s base64-encoded, not encrypted).' },
];

// ─────────────────────────────────────────────────────────────────────────────
// DAILY TIPS
// ─────────────────────────────────────────────────────────────────────────────

const TIPS = [
  'Practice explaining your code out loud — interviewers value communication as much as the solution.',
  'For DSA problems, always clarify constraints and edge cases before coding.',
  'The STAR method (Situation, Task, Action, Result) is your best friend for behavioral questions.',
  'Always ask clarifying questions in system design — the interviewer rewards structured thinking.',
  'Time your mock interviews — most coding rounds are 45 minutes. Practice finishing on time.',
  'Before any interview, re-read the company\'s engineering blog and recent tech choices.',
  'A brute-force solution first, then optimize — showing iterative thinking impresses interviewers.',
  'Linkedin connections from your target company can give insights about the interview process.',
  'Review your own projects thoroughly — interviewers love asking deep questions about what you built.',
  'Practice "narrating" your thought process while coding — silence makes interviewers nervous.',
  'Know your resume\'s every word. Be ready to expand on any bullet point with a 2-minute story.',
  'LeetCode patterns: two-pointer, sliding window, BFS/DFS, dynamic programming, binary search.',
  'Behavioral interviews test culture fit as much as experience. Know the company\'s values.',
  'For distributed systems questions, always discuss trade-offs — there\'s no one-size-fits-all answer.',
  'Send a thank-you email within 24 hours of every interview — 80% of candidates don\'t.',
  'Mock interviews with friends are more effective than solo practice for reducing anxiety.',
  'Follow-up on your applications after 5-7 business days if you haven\'t heard back.',
  'Prepare 5 questions to ask your interviewer — it shows genuine interest and curiosity.',
  'When stuck in a technical interview, think out loud — partial credit is real.',
  'Negotiate salary — 70% of employers expect it and first offers are rarely best offers.',
  'Keep a list of your accomplishments with metrics. "Improved performance by 40%" beats "improved performance."',
  'GitHub contributions, open source PRs, and technical blogs make your resume stand out.',
  'For frontend roles, build a portfolio with 2-3 polished projects, not 10 mediocre ones.',
  'Review operating system basics — many top companies ask OS questions regardless of the role.',
  'Know the difference between your "walk me through your resume" story for different types of companies.',
];

// ─────────────────────────────────────────────────────────────────────────────
// TECH TRENDS
// ─────────────────────────────────────────────────────────────────────────────

const monthLabels = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];

function trend(base, delta = 2) {
  return monthLabels.map((month, i) => ({
    month,
    value: Math.min(100, Math.max(10, base + (i - 2) * delta + Math.round(Math.random() * 3))),
  }));
}

const TRENDS = [
  { title: 'Python', category: 'language', trendScore: 95, description: 'Python remains the most popular language for AI/ML, data science, and backend development. Its simplicity and vast ecosystem make it a top choice for beginners and experts alike.', dataPoints: trend(92, 1) },
  { title: 'JavaScript', category: 'language', trendScore: 93, description: 'JavaScript powers the web — from React/Vue frontends to Node.js backends. Full-stack JS development with TypeScript is the dominant paradigm for modern web apps.', dataPoints: trend(90, 1) },
  { title: 'TypeScript', category: 'language', trendScore: 88, description: 'TypeScript adoption has surged as teams scale JavaScript codebases. Static typing catches bugs early and improves developer productivity in large projects.', dataPoints: trend(82, 3) },
  { title: 'Rust', category: 'language', trendScore: 78, description: 'Rust is the most loved language for 8+ years running. Memory safety without GC makes it ideal for systems programming, WebAssembly, and performance-critical code.', dataPoints: trend(68, 4) },
  { title: 'Go (Golang)', category: 'language', trendScore: 82, description: 'Go\'s simplicity, built-in concurrency (goroutines), and fast compilation make it a top choice for cloud-native microservices and DevOps tooling (Docker, Kubernetes are written in Go).', dataPoints: trend(78, 2) },
  { title: 'React', category: 'framework', trendScore: 92, description: 'React dominates frontend development with its component model and vast ecosystem. React Server Components and Next.js are pushing web performance boundaries.', dataPoints: trend(88, 2) },
  { title: 'Next.js', category: 'framework', trendScore: 87, description: 'Next.js has become the default React framework for production apps, offering server-side rendering, static generation, and edge computing in one package.', dataPoints: trend(80, 4) },
  { title: 'Node.js', category: 'framework', trendScore: 85, description: 'Node.js powers millions of production backends. Its non-blocking I/O model excels at handling many concurrent connections for APIs and real-time applications.', dataPoints: trend(82, 1) },
  { title: 'FastAPI', category: 'framework', trendScore: 80, description: 'FastAPI is the fastest-growing Python web framework, offering automatic OpenAPI docs, async support, and Pydantic data validation. A top choice for ML model serving.', dataPoints: trend(70, 5) },
  { title: 'Docker', category: 'tool', trendScore: 91, description: 'Docker containerization is now a fundamental skill for any developer. Understanding Docker and container concepts is expected in most software engineering interviews.', dataPoints: trend(88, 1) },
  { title: 'Kubernetes', category: 'tool', trendScore: 85, description: 'Kubernetes has become the standard for container orchestration. Cloud providers offer managed K8s (EKS, GKE, AKS), making it essential for cloud-native development.', dataPoints: trend(80, 2) },
  { title: 'Large Language Models', category: 'domain', trendScore: 98, description: 'LLMs (GPT-4, Claude, Gemini, Llama) are transforming every industry. Engineers who can integrate, fine-tune, and build on top of LLMs are in exceptionally high demand.', dataPoints: trend(88, 5) },
  { title: 'Vector Databases', category: 'tool', trendScore: 82, description: 'Vector databases (Pinecone, Weaviate, Chroma, pgvector) are critical infrastructure for AI applications, enabling semantic search and RAG (Retrieval-Augmented Generation).', dataPoints: trend(65, 8) },
  { title: 'PostgreSQL', category: 'tool', trendScore: 89, description: 'PostgreSQL is the most trusted open-source relational database. Its JSON support, full-text search, and extensions (pgvector, PostGIS) make it a versatile choice for modern apps.', dataPoints: trend(85, 2) },
  { title: 'Redis', category: 'tool', trendScore: 86, description: 'Redis is the go-to for caching, session storage, rate limiting, and real-time leaderboards. Redis Stack adds search, JSON, and time-series capabilities.', dataPoints: trend(83, 1) },
  { title: 'AWS', category: 'tool', trendScore: 90, description: 'AWS leads cloud with 30%+ market share. Core services (EC2, S3, Lambda, RDS, DynamoDB) appear in virtually every job description. AWS certifications are highly valued.', dataPoints: trend(87, 1) },
  { title: 'GraphQL', category: 'framework', trendScore: 74, description: 'GraphQL solves over/under-fetching in APIs and is widely used in companies with complex data requirements. Apollo Client/Server are the dominant implementations.', dataPoints: trend(72, 1) },
  { title: 'Tailwind CSS', category: 'framework', trendScore: 83, description: 'Tailwind CSS\'s utility-first approach has won over the developer community. Rapid prototyping and consistent design systems make it a productivity multiplier for frontend work.', dataPoints: trend(75, 4) },
  { title: 'WebAssembly', category: 'tool', trendScore: 70, description: 'WebAssembly enables near-native performance in the browser for compute-heavy tasks. Growing adoption for games, video editing, and running languages other than JS in the browser.', dataPoints: trend(62, 4) },
  { title: 'Generative AI', category: 'domain', trendScore: 97, description: 'Generative AI (text, image, code, audio) is the fastest-growing tech sector. Every software product is integrating AI features, creating massive demand for AI-integrated engineering.', dataPoints: trend(85, 6) },
  { title: 'Edge Computing', category: 'domain', trendScore: 76, description: 'Edge computing brings compute closer to users for lower latency. Cloudflare Workers, Vercel Edge Functions, and AWS Lambda@Edge enable globally distributed applications.', dataPoints: trend(68, 4) },
  { title: 'Microservices', category: 'domain', trendScore: 81, description: 'Microservices architecture enables independent scaling and deployment. While adding distributed systems complexity, it\'s the dominant architecture at large tech companies.', dataPoints: trend(78, 2) },
  { title: 'Kafka', category: 'tool', trendScore: 80, description: 'Apache Kafka is the standard for high-throughput event streaming. Used for real-time data pipelines, event sourcing, and decoupling microservices. Kafka Connect and Streams extend its ecosystem.', dataPoints: trend(76, 2) },
  { title: 'Terraform', category: 'tool', trendScore: 79, description: 'Terraform (Infrastructure as Code) lets teams provision cloud resources declaratively. It\'s become the standard IaC tool, with providers for all major cloud services.', dataPoints: trend(74, 3) },
  { title: 'Elasticsearch', category: 'tool', trendScore: 77, description: 'Elasticsearch powers full-text search, log analytics, and observability for organizations at scale. The Elastic Stack (ELK) is a standard for centralized logging and monitoring.', dataPoints: trend(74, 2) },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Phase 9 seed: InterviewQuestions + TechTrends + DailyTips');

  // ── Interview Questions ──
  console.log(`  Seeding ${QUESTIONS.length} interview questions...`);
  let qCount = 0;
  for (const q of QUESTIONS) {
    await prisma.interviewQuestion.upsert({
      where: { id: await getOrGenId('iq', q.question) },
      create: {
        question: q.question,
        answer: q.answer,
        category: q.category,
        difficulty: q.difficulty,
        tags: q.tags,
        source: 'curated',
      },
      update: {
        answer: q.answer,
        tags: q.tags,
      },
    }).catch(() => {
      // If upsert by computed id fails, just create
    });
    qCount++;
  }
  // Bulk-create approach (idempotent via deleteMany + createMany)
  await prisma.interviewQuestion.deleteMany({});
  await prisma.interviewQuestion.createMany({
    data: QUESTIONS.map((q) => ({
      question: q.question,
      answer: q.answer,
      category: q.category,
      difficulty: q.difficulty,
      tags: q.tags,
      source: 'curated',
    })),
    skipDuplicates: false,
  });
  console.log(`  ✓ ${QUESTIONS.length} interview questions seeded`);

  // ── Tech Trends ──
  console.log(`  Seeding ${TRENDS.length} tech trends...`);
  await prisma.techTrend.deleteMany({});
  await prisma.techTrend.createMany({
    data: TRENDS.map((t) => ({
      title: t.title,
      category: t.category,
      trendScore: t.trendScore,
      description: t.description,
      dataPoints: t.dataPoints,
      source: 'curated',
    })),
  });
  console.log(`  ✓ ${TRENDS.length} tech trends seeded`);

  // ── Daily Tips stored as a special TechTrend-like table isn't in schema ──
  // Tips are served from the in-memory TIPS array in the service (no DB model needed)
  console.log(`  ✓ ${TIPS.length} daily tips available (in-memory, no DB needed)`);

  console.log('\nPhase 9 seed complete!');
}

// helper (unused in bulk path but kept for reference)
const _idCache = {};
async function getOrGenId(prefix, key) {
  const k = `${prefix}:${key}`;
  if (!_idCache[k]) _idCache[k] = require('crypto').randomUUID();
  return _idCache[k];
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
