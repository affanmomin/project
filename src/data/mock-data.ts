import {
  CompetitorData,
  Comment,
  Lead,
  ClusterPainPoint,
  MentionPoint,
} from "@/types";
import { getRandomInt } from "@/lib/utils";

// Generate random date within last 3 months
function randomDate(start: Date, end: Date): string {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  ).toISOString();
}

// Generate dates array for the last 30 days
function getLast30Days(): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }

  return dates;
}

// Generate mentions over time data
function generateMentionsOverTime(): MentionPoint[] {
  const dates = getLast30Days();

  return dates.map((date) => ({
    date,
    value: getRandomInt(5, 50),
    sentiment: Math.random(),
  }));
}

// Competitors data
export const competitorsData: CompetitorData[] = [
  {
    id: "1",
    name: "CompetitorX",
    totalMentions: 1243,
    negativeSentiment: 0.68,
    trendingComplaints: [
      "Slow performance",
      "Expensive",
      "Poor customer support",
    ],
    mentionsOverTime: generateMentionsOverTime(),
    alternativesMentioned: [
      { name: "Alternative A", count: 42 },
      { name: "Alternative B", count: 28 },
      { name: "Alternative C", count: 17 },
    ],
  },
  {
    id: "2",
    name: "SoftCorp",
    totalMentions: 876,
    negativeSentiment: 0.45,
    trendingComplaints: [
      "Buggy interface",
      "Limited features",
      "Confusing pricing",
    ],
    mentionsOverTime: generateMentionsOverTime(),
    alternativesMentioned: [
      { name: "Alternative D", count: 35 },
      { name: "Alternative E", count: 22 },
      { name: "Alternative F", count: 14 },
    ],
  },
  {
    id: "3",
    name: "TechGiant",
    totalMentions: 1567,
    negativeSentiment: 0.72,
    trendingComplaints: ["Privacy concerns", "Data loss", "Price increases"],
    mentionsOverTime: generateMentionsOverTime(),
    alternativesMentioned: [
      { name: "Alternative G", count: 56 },
      { name: "Alternative H", count: 33 },
      { name: "Alternative I", count: 27 },
    ],
  },
  {
    id: "4",
    name: "CloudSystems",
    totalMentions: 732,
    negativeSentiment: 0.38,
    trendingComplaints: [
      "API changes",
      "Complex setup",
      "Inadequate documentation",
    ],
    mentionsOverTime: generateMentionsOverTime(),
    alternativesMentioned: [
      { name: "Alternative J", count: 21 },
      { name: "Alternative K", count: 18 },
      { name: "Alternative L", count: 12 },
    ],
  },
];

// Comment data
export const commentsData: Comment[] = [
  {
    id: "1",
    competitorId: "1",
    platform: "Reddit",
    username: "user123",
    content:
      "Their product is so slow, I can't believe I'm paying for this. It takes forever to load basic features.",
    date: randomDate(
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      new Date()
    ),
    sentiment: 0.2,
    url: "https://reddit.com/r/softwarereviews/123",
  },
  {
    id: "2",
    competitorId: "1",
    platform: "Twitter",
    username: "tech_user",
    content:
      "Just canceled my CompetitorX subscription. The customer support is non-existent and there are too many bugs.",
    date: randomDate(
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      new Date()
    ),
    sentiment: 0.15,
    url: "https://twitter.com/tech_user/status/123456",
  },
  {
    id: "3",
    competitorId: "1",
    platform: "G2",
    username: "marketing_pro",
    content:
      "Great features but way too expensive for what you get. Looking for alternatives that offer better value.",
    date: randomDate(
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      new Date()
    ),
    sentiment: 0.4,
    url: "https://g2.com/products/competitorx/reviews/123",
  },
  {
    id: "4",
    competitorId: "2",
    platform: "Reddit",
    username: "dev_expert",
    content:
      "SoftCorp has a very confusing interface. It took our team weeks to figure out basic workflows.",
    date: randomDate(
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      new Date()
    ),
    sentiment: 0.3,
    url: "https://reddit.com/r/devtools/456",
  },
  {
    id: "5",
    competitorId: "2",
    platform: "Twitter",
    username: "startup_founder",
    content:
      "We're migrating away from SoftCorp because of their new pricing model. It's ridiculously expensive for startups.",
    date: randomDate(
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      new Date()
    ),
    sentiment: 0.25,
    url: "https://twitter.com/startup_founder/status/789012",
  },
  {
    id: "6",
    competitorId: "3",
    platform: "G2",
    username: "enterprise_admin",
    content:
      "TechGiant recently had a major outage that affected our business for days. Their support was unresponsive.",
    date: randomDate(
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      new Date()
    ),
    sentiment: 0.1,
    url: "https://g2.com/products/techgiant/reviews/345",
  },
  {
    id: "7",
    competitorId: "3",
    platform: "Reddit",
    username: "security_expert",
    content:
      "Concerned about TechGiant's data practices. They've had multiple breaches this year and haven't been transparent.",
    date: randomDate(
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      new Date()
    ),
    sentiment: 0.2,
    url: "https://reddit.com/r/infosec/789",
  },
  {
    id: "8",
    competitorId: "4",
    platform: "Twitter",
    username: "cloudarchitect",
    content:
      "CloudSystems documentation is so lacking. Spent hours trying to integrate with their API.",
    date: randomDate(
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      new Date()
    ),
    sentiment: 0.35,
    url: "https://twitter.com/cloudarchitect/status/345678",
  },
];

// Leads data
export const leadsData: Lead[] = [
  {
    id: "1",
    competitorId: "1",
    platform: "Reddit",
    username: "growth_hacker",
    content:
      "Looking for alternatives to CompetitorX. Their performance issues are killing our productivity. Any recommendations?",
    issue: "Performance",
    date: randomDate(
      new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      new Date()
    ),
    status: "new",
    url: "https://reddit.com/r/saastools/234",
  },
  {
    id: "2",
    competitorId: "1",
    platform: "Twitter",
    username: "startup_cto",
    content:
      "CompetitorX just raised prices by 30%. Anyone using a more affordable alternative with similar features?",
    issue: "Pricing",
    date: randomDate(
      new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      new Date()
    ),
    status: "contacted",
    url: "https://twitter.com/startup_cto/status/567890",
  },
  {
    id: "3",
    competitorId: "2",
    platform: "G2",
    username: "product_manager",
    content:
      "After 2 years with SoftCorp, we're looking to switch. Their support has gone downhill and the product is buggy.",
    issue: "Support",
    date: randomDate(
      new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      new Date()
    ),
    status: "new",
    url: "https://g2.com/products/softcorp/reviews/456",
  },
  {
    id: "4",
    competitorId: "3",
    platform: "Reddit",
    username: "data_analyst",
    content:
      "TechGiant's latest update broke our entire workflow. Looking for recommendations on similar tools with better stability.",
    issue: "Reliability",
    date: randomDate(
      new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      new Date()
    ),
    status: "responded",
    url: "https://reddit.com/r/datatools/890",
  },
  {
    id: "5",
    competitorId: "4",
    platform: "Twitter",
    username: "devops_lead",
    content:
      "Done with CloudSystems. Their API changes without notice, and docs are always out of date. What are others using?",
    issue: "Documentation",
    date: randomDate(
      new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      new Date()
    ),
    status: "new",
    url: "https://twitter.com/devops_lead/status/123789",
  },
];

// Pain points clusters data
export const painPointsData: ClusterPainPoint[] = [
  {
    id: "1",
    competitorId: "1",
    label: "Slow Performance",
    count: 187,
    examples: [
      "Pages take forever to load",
      "API requests timeout frequently",
      "Dashboard becomes unresponsive with large datasets",
    ],
  },
  {
    id: "2",
    competitorId: "1",
    label: "Expensive Pricing",
    count: 142,
    examples: [
      "Too expensive compared to alternatives",
      "Hidden fees for basic features",
      "Price increases without added value",
    ],
  },
  {
    id: "3",
    competitorId: "1",
    label: "Poor Support",
    count: 98,
    examples: [
      "Takes days to get a response",
      "Support staff lacks technical knowledge",
      "Critical bugs remain unfixed for months",
    ],
  },
  {
    id: "4",
    competitorId: "2",
    label: "Confusing UI",
    count: 156,
    examples: [
      "Too many clicks to perform basic tasks",
      "Inconsistent navigation patterns",
      "Important features are hidden in submenus",
    ],
  },
  {
    id: "5",
    competitorId: "2",
    label: "Limited Features",
    count: 89,
    examples: [
      "Missing export options",
      "Basic automation is lacking",
      "Can't customize reports",
    ],
  },
  {
    id: "6",
    competitorId: "3",
    label: "Data Privacy",
    count: 201,
    examples: [
      "Unclear data handling practices",
      "No way to export and delete user data",
      "Sharing data with third parties",
    ],
  },
  {
    id: "7",
    competitorId: "3",
    label: "Unreliable Service",
    count: 178,
    examples: [
      "Frequent outages",
      "Data loss during updates",
      "Inconsistent performance",
    ],
  },
  {
    id: "8",
    competitorId: "4",
    label: "Poor Documentation",
    count: 113,
    examples: [
      "Outdated API docs",
      "Missing examples for common use cases",
      "Inconsistent terminology",
    ],
  },
];
