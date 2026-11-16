/**
 * Browse-by-topic guides.
 *
 * Everything here is editorial content written for this site. Topic names are
 * NOT chapter titles of the Constitution. Every statement about what the
 * Constitution says is tied to a provision id, and tests/topics.test.ts checks
 * that each referenced provision exists in the dataset.
 */
export interface TopicPoint {
  /** Plain-language statement. */
  text: string;
  /** Provision ids that support it. */
  refs: string[];
}

export interface Topic {
  slug: string;
  title: string;
  summary: string;
  /** Provisions a reader should start with. */
  keyProvisions: string[];
  /** Further provisions worth reading. */
  alsoSee: string[];
  points: TopicPoint[];
  limits: TopicPoint[];
  scenario: { title: string; situation: string; whatTheTextSays: TopicPoint[]; notSettledHere: string };
  questions: string[];
}

const a = (...n: (number | string)[]) => n.map((x) => `article-${String(x).toLowerCase()}`);

export const topics: Topic[] = [
  {
    slug: "fundamental-rights",
    title: "Fundamental Rights",
    summary:
      "Chapter III, Part I of the Constitution is the Seychellois Charter of Fundamental Human Rights and Freedoms. It sets out the rights every person has and the conditions under which a right may be limited.",
    keyProvisions: a(15, 16, 18, 19, 22, 27),
    alsoSee: a(17, 20, 21, 23, 24, 25, 26, 28, 29, 33, 35, 38, 40, 45, 47, 48),
    points: [
      { text: "The Charter runs from the right to life to the right to take part in cultural life.", refs: a(15, 39) },
      { text: "It protects life, dignity and freedom from slavery and forced labour.", refs: a(15, 16, 17) },
      { text: "It includes rights the State undertakes to work towards, such as health care, education, shelter, work and social security.", refs: a(29, 33, 34, 35, 37) },
      { text: "Citizens also have duties, including to uphold and defend the Constitution and the law.", refs: a(40) },
    ],
    limits: [
      { text: "Where a right is subject to a limitation, the limitation must have no wider effect than is strictly necessary and must not be used for another purpose.", refs: a(47) },
      { text: "The Charter does not give anyone a right to engage in activity aimed at suppressing the rights of others.", refs: a(45) },
      { text: "During a declared public emergency a law may take measures strictly required by the situation, but some rights cannot be overridden even then.", refs: a(43) },
    ],
    scenario: {
      title: "A new law seems to restrict a right",
      situation:
        "Marie reads that a new law limits something she believes is protected by the Charter. She wants to know whether a right can be limited at all.",
      whatTheTextSays: [
        { text: "Many Charter rights say in their own text when a law may restrict them, usually only where that is necessary in a democratic society.", refs: a(22, 23) },
        { text: "Any limitation must go no further than strictly necessary.", refs: a(47) },
        { text: "A person who claims the Charter has been or is likely to be contravened may apply to the Constitutional Court.", refs: a(46) },
      ],
      notSettledHere:
        "Whether a particular law is a permitted restriction is decided by the courts on the facts and the wording of that law. This site cannot tell you how a court would rule.",
    },
    questions: ["What rights does the Constitution protect?", "Can my rights be limited during a state of emergency?", "What are my duties as a citizen?"],
  },
  {
    slug: "freedom-of-expression",
    title: "Freedom of Expression",
    summary:
      "Article 22 protects the freedom to hold opinions and to seek, receive and impart ideas and information without interference, and lists the purposes for which a law may restrict it.",
    keyProvisions: a(22),
    alsoSee: a(21, 23, 28, 102, 168),
    points: [
      { text: "Every person has a right to freedom of expression, including holding opinions and seeking, receiving and sharing ideas and information.", refs: a(22) },
      { text: "Freedom of conscience, including thought and religion, is protected separately.", refs: a(21) },
      { text: "Peaceful assembly and association, including forming or joining political parties and trade unions, is protected separately.", refs: a(23) },
      { text: "State-owned or publicly funded broadcasting media must be constituted and managed so that they can operate independently of the State and of political or other influence.", refs: a(168) },
    ],
    limits: [
      { text: "The right may be restricted by a law that is necessary in a democratic society for listed purposes, such as public order, protecting the reputation, rights and private lives of others, and maintaining the authority and independence of the courts or the National Assembly.", refs: a(22) },
    ],
    scenario: {
      title: "Criticising a public decision online",
      situation: "Jean posts a strongly worded opinion about a government decision on social media and wonders whether the Constitution protects that.",
      whatTheTextSays: [
        { text: "Holding and sharing opinions falls within the freedom described in article 22(1).", refs: a(22) },
        { text: "Article 22(2) allows restrictions prescribed by law for purposes that include protecting the reputation and private lives of other people.", refs: a(22) },
      ],
      notSettledHere:
        "Whether a specific post is protected, or is caught by a law such as one on defamation, depends on that law and on the facts. That is outside the text of the Constitution.",
    },
    questions: ["Do I have freedom of speech in Seychelles?", "When can freedom of expression be restricted?", "Can I join a peaceful protest?"],
  },
  {
    slug: "equality-and-discrimination",
    title: "Equality and Discrimination",
    summary:
      "Article 27 gives every person the right to equal protection of the law, including enjoying Charter rights without discrimination on any ground, except as is necessary in a democratic society.",
    keyProvisions: a(27),
    alsoSee: a(16, 24, 30, 31, 36, 47),
    points: [
      { text: "Every person has a right to equal protection of the law and to enjoy the Charter's rights and freedoms without discrimination on any ground.", refs: a(27) },
      { text: "Laws, programmes or activities aimed at improving the conditions of disadvantaged persons or groups are expressly allowed.", refs: a(27) },
      { text: "The State recognises particular protections for working mothers, for children and young persons, and for the aged and the disabled.", refs: a(30, 31, 36) },
    ],
    limits: [
      { text: "Article 27 itself contains the qualification \"except as is necessary in a democratic society\".", refs: a(27) },
      { text: "The article does not list specific prohibited grounds; it says \"on any ground\".", refs: a(27) },
    ],
    scenario: {
      title: "Being treated differently",
      situation: "Anil believes a public body treated him less favourably than others in the same position and asks what the Constitution says.",
      whatTheTextSays: [
        { text: "Article 27(1) is the starting point: equal protection of the law without discrimination on any ground.", refs: a(27) },
        { text: "A claim that a Charter right has been contravened can be taken to the Constitutional Court.", refs: a(46) },
      ],
      notSettledHere:
        "Whether a difference in treatment amounts to unlawful discrimination, and what other laws (for example employment law) apply, cannot be answered from the Constitution alone.",
    },
    questions: ["What does the Constitution say about discrimination?", "Are programmes for disadvantaged groups allowed?", "What protection do people with disabilities have?"],
  },
  {
    slug: "privacy",
    title: "Privacy",
    summary:
      "Article 20 protects people against searches of their person, property or premises without consent, and against interception of their correspondence or communications without consent or an order of the Supreme Court.",
    keyProvisions: a(20),
    alsoSee: a(28, 16, 47),
    points: [
      { text: "No search of your person, property or premises, and no entry onto your premises, without your consent, unless a law that meets the conditions of article 20(2) allows it.", refs: a(20) },
      { text: "No interception of your correspondence or other means of communication without your consent or an order of the Supreme Court.", refs: a(20) },
      { text: "The State recognises a right of access to information about yourself held by a public authority, and to have it corrected if inaccurate.", refs: a(28) },
    ],
    limits: [
      { text: "A law may allow searches and entry where reasonably required for listed interests such as defence, public safety, public order and public health, or to protect the rights of others, unless shown not to be necessary in a democratic society.", refs: a(20) },
      { text: "Access to information is subject to limitations and procedures prescribed by law.", refs: a(28) },
    ],
    scenario: {
      title: "Officers want to search a home",
      situation: "Officers arrive at Lisette's home and say they need to search it. She does not consent and asks what the Constitution says.",
      whatTheTextSays: [
        { text: "Article 20(1)(a) states the right not to be searched, or have premises entered, without consent.", refs: a(20) },
        { text: "Article 20(2) allows a law to authorise searches for specified purposes, provided the law is necessary in a democratic society.", refs: a(20) },
      ],
      notSettledHere:
        "Whether a particular search is lawful depends on the law the officers rely on (for example, whether a warrant is required and was obtained). Those rules are in other legislation, not in the Constitution.",
    },
    questions: ["Can the police search my house without permission?", "Can my phone calls be intercepted?", "Can I see information the government holds about me?"],
  },
  {
    slug: "arrest-and-detention",
    title: "Arrest and Detention",
    summary:
      "Article 18 protects liberty and security of the person and sets out the rights of anyone who is arrested or detained. Article 19 sets out the right to a fair hearing for anyone charged with an offence.",
    keyProvisions: a(18, 19),
    alsoSee: a(16, 17, 43, 46),
    points: [
      { text: "A person who is arrested or detained has a right to be told the reason, as far as practicable in a language they understand, a right to remain silent, and a right to be defended by a legal practitioner of their choice. A minor has a right to communicate with a parent or guardian.", refs: a(18) },
      { text: "The person must be informed of those rights at the time of arrest or as soon as reasonably practicable afterwards.", refs: a(18) },
      { text: "If not released, the person must be produced before a court within twenty-four hours, or as soon as reasonably practicable where the article's stated circumstances apply.", refs: a(18) },
      { text: "A person charged with an offence is innocent until proved or pleaded guilty and has the right to a fair hearing within a reasonable time before an independent and impartial court.", refs: a(19) },
      { text: "Every person has a right to be treated with dignity and not to be subjected to torture or cruel, inhuman or degrading treatment or punishment.", refs: a(16) },
    ],
    limits: [
      { text: "Article 18(2) lists cases in which restricting liberty under fair procedures established by law is not an infringement, such as arrest on reasonable suspicion of an offence or detention under a court order.", refs: a(18) },
      { text: "A court may refuse release before trial in the circumstances listed in article 18(7), for example the seriousness of the offence or substantial grounds to believe the suspect will not appear.", refs: a(18) },
      { text: "A legal practitioner at public expense is provided for \"where a law so provides\".", refs: a(19) },
    ],
    scenario: {
      title: "A relative is arrested on Friday evening",
      situation: "Daniel's brother is arrested on a Friday evening. The family want to know what must happen next.",
      whatTheTextSays: [
        { text: "He must be told why he was arrested and told of his rights, including silence and a legal practitioner of his choice.", refs: a(18) },
        { text: "If he is not released he must be brought before a court within twenty-four hours, or as soon as reasonably practicable having regard to distance, non-availability of a judge or magistrate, or force majeure.", refs: a(18) },
        { text: "A detained person has the right to ask the Supreme Court to decide whether the detention is lawful.", refs: a(18) },
      ],
      notSettledHere:
        "How the twenty-four hour rule applies over a weekend, and whether release on conditions will be granted, depends on the circumstances and on the court. A lawyer can advise on the specific case.",
    },
    questions: ["What are my rights if I am arrested?", "How long can the police hold me before I see a court?", "Do I have the right to a lawyer?"],
  },
  {
    slug: "citizenship",
    title: "Citizenship",
    summary:
      "Chapter II sets out who is a citizen of Seychelles by birth, descent, marriage or other eligibility, and allows Acts of the National Assembly to make further provision.",
    keyProvisions: a(7, 8, 9, 11, 12),
    alsoSee: a(10, "10A", 13, 14),
    points: [
      { text: "People who were citizens immediately before the Constitution came into force continue to be citizens.", refs: a(7) },
      { text: "A person born in Seychelles becomes a citizen at birth, subject to article 9.", refs: a(8) },
      { text: "A person born outside Seychelles becomes a citizen at birth if their father or mother is a citizen of Seychelles at that date.", refs: a(11) },
      { text: "A person who marries a citizen of Seychelles is, subject to any Act, eligible to become a citizen by naturalization.", refs: a(12) },
    ],
    limits: [
      { text: "A person born in Seychelles does not become a citizen by birth if, at the date of birth, neither parent is a citizen of Seychelles.", refs: a(9) },
      { text: "Acquisition in other cases, deprivation where citizenship was unlawfully acquired, and renunciation are left to an Act.", refs: a(13) },
    ],
    scenario: {
      title: "A child born abroad",
      situation: "Nadia, a Seychellois citizen living overseas, has a baby there and asks whether the child is Seychellois.",
      whatTheTextSays: [
        { text: "Article 11 says a person born outside Seychelles becomes a citizen at birth if the father or mother is a citizen of Seychelles at that date.", refs: a(11) },
      ],
      notSettledHere:
        "Registration, documents and proof of citizenship are handled under citizenship legislation and by the relevant government office, not by the Constitution's text.",
    },
    questions: ["Who is a citizen of Seychelles?", "Is a child born abroad to a Seychellois parent a citizen?", "Can I become a citizen through marriage?"],
  },
  {
    slug: "elections",
    title: "Elections",
    summary:
      "The Constitution gives citizens aged eighteen and over the right to vote, establishes the Electoral Commission, and sets out how the President and National Assembly are elected.",
    keyProvisions: a(24, 113, 114, 115, 116),
    alsoSee: [...a(79, 112, "115A", 117, 118, 164), "schedule-3--para-1", "schedule-4--para-2"],
    points: [
      { text: "Every citizen aged eighteen or over has a right to be registered as a voter and to vote by secret ballot at public elections.", refs: a(24) },
      { text: "A registered voter who has attained eighteen years is entitled to vote in presidential elections, National Assembly elections and referendums.", refs: a(113) },
      { text: "A citizen who will turn eighteen in a year in which an election is to be held is entitled to be registered as a voter, unless otherwise disqualified.", refs: a(114) },
      { text: "The Electoral Commission is responsible for the conduct and supervision of voter registration, elections and referendums.", refs: a(115, 116) },
    ],
    limits: [
      { text: "An Act may disqualify a person from registration on the grounds of infirmity of mind, criminality, or residence outside Seychelles.", refs: a(114) },
      { text: "The exercise of the right to participate in government may be regulated by a law necessary in a democratic society.", refs: a(24) },
    ],
    scenario: {
      title: "Turning eighteen in an election year",
      situation: "Kevin will turn eighteen later in a year in which an election is to be held and asks whether he can register.",
      whatTheTextSays: [
        { text: "The proviso to article 114(1) says such a citizen is entitled to be registered as a voter unless otherwise disqualified.", refs: a(114) },
        { text: "Article 113 entitles a registered voter \"who has attained the age of eighteen years\" to vote.", refs: a(113) },
      ],
      notSettledHere:
        "Registration deadlines and procedures are set by electoral legislation and the Electoral Commission. Check with the Commission for the current process.",
    },
    questions: ["Who can vote in Seychelles?", "At what age can I register as a voter?", "What does the Electoral Commission do?"],
  },
  {
    slug: "the-presidency",
    title: "The Presidency",
    summary:
      "Chapter IV establishes the President as Head of State, Head of Government and Commander-in-Chief, and sets out election, term of office, removal and succession.",
    keyProvisions: a(50, 51, 52, 53, 54, 55),
    alsoSee: [...a(56, 59, 60, 66, "66A", 67, 110), "schedule-3--para-5"],
    points: [
      { text: "The President is Head of State, Head of Government and Commander-in-Chief of the Seychelles Defence Forces.", refs: a(50) },
      { text: "To qualify for election a person must be a citizen of Seychelles and not disqualified from registration as a voter.", refs: a(51) },
      { text: "The term of office is five years, and a person may hold office as President for not more than two terms.", refs: a(52) },
      { text: "The executive authority of the Republic vests in the President and is exercised in accordance with the Constitution and the laws.", refs: a(66) },
    ],
    limits: [
      { text: "The President can be removed for mental or physical incapacity, or for violation of the Constitution or gross misconduct, following the procedures in articles 53 and 54.", refs: a(53, 54) },
      { text: "The Constitutional Court has jurisdiction to decide whether a person has been validly elected President.", refs: a(51) },
    ],
    scenario: {
      title: "If the office of President becomes vacant",
      situation: "A student asks what happens if a President resigns or dies during a term.",
      whatTheTextSays: [
        { text: "Article 55 sets out different rules for a vacancy caused by resignation or removal and for one caused by death or incapacity, including the role of the Vice-President.", refs: a(55) },
      ],
      notSettledHere: "How these rules would apply to a real situation would depend on the exact circumstances and could require a court ruling.",
    },
    questions: ["How long can a President serve?", "How can the President be removed from office?", "Who takes over if the President resigns?"],
  },
  {
    slug: "national-assembly",
    title: "National Assembly",
    summary:
      "Chapter VI establishes the National Assembly, vests legislative power in it, and sets out its membership, procedures, and how the Constitution itself can be altered.",
    keyProvisions: a(77, 78, 85, 86, 91),
    alsoSee: [...a(80, 81, 83, 84, 97, 102, 104, 110, 111), "schedule-4--para-2"],
    points: [
      { text: "The National Assembly consists of members directly elected for each electoral area, plus not more than ten members elected by proportional representation.", refs: a(78) },
      { text: "The legislative power of Seychelles is vested in the National Assembly.", refs: a(85) },
      { text: "That power is exercised by Bills passed by the Assembly and assented to, or deemed to have been assented to, by the President.", refs: a(86) },
      { text: "Subject to the Standing Orders, meetings of the Assembly are open to the public and may be broadcast.", refs: a(97) },
    ],
    limits: [
      { text: "A Bill to alter the Constitution needs the votes of not less than two-thirds of the members; altering certain parts also needs approval by at least sixty percent of votes in a referendum.", refs: a(91) },
      { text: "The President may refer a Bill to the Constitutional Court if of the opinion that it infringes or may infringe the Constitution.", refs: a(87) },
    ],
    scenario: {
      title: "Changing the Charter of rights",
      situation: "A civic group asks whether the National Assembly could change Chapter III on its own.",
      whatTheTextSays: [
        { text: "Article 91(1) says the Assembly shall not proceed on a Bill to alter Chapter III unless the alteration has been approved in a referendum by not less than sixty percent of the votes cast.", refs: a(91) },
      ],
      notSettledHere: "Whether a particular Bill counts as altering a protected chapter can itself be a legal question for the courts.",
    },
    questions: ["How are members of the National Assembly elected?", "How is a law made?", "How can the Constitution be amended?"],
  },
  {
    slug: "judiciary",
    title: "Judiciary",
    summary:
      "Chapter VIII vests judicial power in the Judiciary: the Court of Appeal, the Supreme Court and subordinate courts and tribunals. It protects judicial independence and sets out appointment and removal of judges.",
    keyProvisions: a(119, 120, 125, 129, 134),
    alsoSee: a(121, 123, 127, 130, 131, 133, 137, 139),
    points: [
      { text: "Judicial power is vested in the Judiciary, which is independent and subject only to the Constitution and the other laws of Seychelles.", refs: a(119) },
      { text: "The Court of Appeal hears appeals from the Supreme Court.", refs: a(120) },
      { text: "When the Supreme Court deals with constitutional matters it sits with not less than two judges and is referred to as the Constitutional Court.", refs: a(129) },
      { text: "Justices of Appeal and Judges are appointed by the President from candidates proposed by the Constitutional Appointments Authority.", refs: a(123, 127) },
    ],
    limits: [
      { text: "A Justice of Appeal or Judge may be removed only for inability to perform the functions of the office or for misbehaviour, and only under the procedure in article 134.", refs: a(134) },
    ],
    scenario: {
      title: "Which court hears a constitutional question?",
      situation: "During an ordinary court case, a party argues that a Charter right has been breached.",
      whatTheTextSays: [
        { text: "Article 46(7) says that, unless the question is frivolous or vexatious or already decided, the court shall adjourn and refer the question to the Constitutional Court.", refs: a(46) },
        { text: "For provisions outside Chapter III, article 130 provides the route to the Constitutional Court.", refs: a(130) },
      ],
      notSettledHere: "Court procedure, time limits and costs are set by rules of court and legislation. A lawyer can advise on these.",
    },
    questions: ["What courts does Seychelles have?", "What is the Constitutional Court?", "How are judges appointed and removed?"],
  },
  {
    slug: "constitutional-remedies",
    title: "Constitutional Remedies",
    summary:
      "The Constitution is the supreme law. Article 46 lets a person apply to the Constitutional Court when a Charter right is contravened; article 130 does the same for other provisions. The Ombudsman can investigate complaints about public authorities.",
    keyProvisions: a(5, 46, 130),
    alsoSee: [...a(129, 143, 45, 47), "schedule-5--para-1"],
    points: [
      { text: "Any law found to be inconsistent with the Constitution is void to the extent of the inconsistency.", refs: a(5) },
      { text: "A person who claims a Charter provision has been or is likely to be contravened in relation to them may apply to the Constitutional Court for redress.", refs: a(46) },
      { text: "The Court may declare an act or law to be a contravention, declare a law void, make orders, and award damages.", refs: a(46) },
      { text: "Once the person establishes a prima facie case against the State, the burden of proving there was no contravention is on the State.", refs: a(46) },
      { text: "There is an Ombudsman, whose powers of investigation are set out in Schedule 5.", refs: ["article-143", "schedule-5--para-1"] },
    ],
    limits: [
      { text: "The Constitutional Court may decline an application where the applicant has already obtained redress under another law, or transfer it where adequate redress is available in another court.", refs: a(46) },
      { text: "Rules of court may set the time within which an application must be made.", refs: a(46) },
    ],
    scenario: {
      title: "Believing a right was breached",
      situation: "Rita believes a decision by a public authority breached one of her Charter rights and asks where she can turn.",
      whatTheTextSays: [
        { text: "Article 46(1) allows her to apply to the Constitutional Court for redress.", refs: a(46) },
        { text: "Article 46(2) allows another person to apply on someone's behalf where that person is unable to do so.", refs: a(46) },
      ],
      notSettledHere:
        "Whether her claim would succeed, what time limits apply and whether another remedy should be tried first are questions for a lawyer and, ultimately, the Court.",
    },
    questions: ["What can I do if my constitutional rights are violated?", "What can the Constitutional Court order?", "What does the Ombudsman do?"],
  },
];

export function getTopic(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug);
}

export function allTopicRefs(t: Topic): string[] {
  return [
    ...t.keyProvisions,
    ...t.alsoSee,
    ...t.points.flatMap((p) => p.refs),
    ...t.limits.flatMap((p) => p.refs),
    ...t.scenario.whatTheTextSays.flatMap((p) => p.refs),
  ];
}
