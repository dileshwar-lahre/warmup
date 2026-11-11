import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const getMailboxes = () => {
  const boxes = [];
  try {
    for (let i = 1; i <= 15; i++) {
      const user = process.env[`MAIL_${i}_USER`];
      const pass = process.env[`MAIL_${i}_PASS`];

      if (user && pass && !user.startsWith('#')) {
        boxes.push({ user: user.trim(), pass: pass.trim() });
      }
    }

    if (boxes.length === 0) {
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const lines = envContent.split('\n');

        for (let i = 1; i <= 15; i++) {
          const userLine = lines.find(l => l.trim().startsWith(`MAIL_${i}_USER=`));
          const passLine = lines.find(l => l.trim().startsWith(`MAIL_${i}_PASS=`));

          if (userLine && passLine) {
            let user = userLine.split('=')[1]?.trim().replace(/^['"]|['"]$/g, '');
            let pass = passLine.split('=')[1]?.trim().replace(/^['"]|['"]$/g, '');

            if (user && pass && !user.startsWith('#')) {
              boxes.push({ user, pass });
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Error loading mailboxes:", err);
  }

  return boxes;
};

// Exact 11 Target Gmails (No extra emails)
const STRICT_TARGET_RECIPENTS = [
  'un30151@gmail.com',
  'dhhj9695@gmail.com',
  'stonenox82@gmail.com',
  'alex.stonenoxtech@gmail.com',
  'ryan.stonenoxtech@gmail.com',
  'david.stonenoxtech@gmail.com',
  'lucas.stonenoxtech@gmail.com',
  'leo.stonenoxtech@gmail.com',
  'max.stonenoxtech@gmail.com',
  'noah.stonenoxtech@gmail.com',
  'jack.stonenoxtech@gmail.com'
];

// 50+ Unique Subject Lines Pool
const subjectsPool = [
  "Quick question regarding your website", "Checking in on your latest project update",
  "Quick thought on your current tech stack", "Collaboration inquiry for Q1/Q2",
  "Following up on our previous notes", "Question about your development workflow",
  "Scaling your SaaS infrastructure safely", "Brief check-in / tech sync",
  "Exploring potential partnership", "Quick feedback on your platform",
  "Website performance check", "Inquiry regarding upcoming MVP updates",
  "Chasing a quick technical synergy", "Connecting regarding system maintenance",
  "Quick note on your app architecture", "Ideas for your platform's growth",
  "Quick tech exchange / intro", "Reviewing recent updates on your site",
  "Discussion on engineering efficiency", "Quick chat about backend solutions",
  "Thoughts on your recent product release", "Optimizing cloud hosting costs",
  "Quick query on API integrations", "Feedback on your UI/UX layout",
  "Exploring tech stack synergies", "Quick sync on software development",
  "Ideas for database performance", "Scaling microservices securely",
  "Quick note on server response times", "Checking your latest feature deployment",
  "Collaboration on modern web apps", "Quick engineering consultation",
  "Improving CI/CD pipeline speed", "Security audit thoughts for your app",
  "Quick chat on infrastructure scaling", "Exploring headless architecture options",
  "Database indexing best practices", "Quick update on serverless limits",
  "Optimizing frontend asset delivery", "Caching strategies for high traffic",
  "Quick feedback on load balancing", "API rate limiting best practices",
  "Reducing latency in cloud apps", "Monitoring server health effectively",
  "Automated backup strategies overview", "Quick sync on database migrations",
  "SSL certificate renewal checks", "DNS configuration best practices",
  "Environment variables management", "Quick check on containerization"
];

// 50+ Unique Message Bodies Pool
const bodiesPool = [
  "Hi there, I was browsing through your platform and wanted to check if you are looking to optimize your performance metrics this quarter.",
  "Hello, just dropping a quick note to see how your current engineering workflow is holding up. Would love to connect briefly.",
  "Hi, noticed your recent updates online. We are currently helping companies streamline their backend architecture securely.",
  "Hey, hope you are doing well. Just following up to see if you had a chance to look over the system scaling notes.",
  "Greetings, quick question regarding your current MVP maintenance and feature expansion plans for the upcoming months.",
  "Hi team, reviewing some interesting performance patterns on similar platforms and wanted to share a few quick thoughts.",
  "Hello, hoping your week is going great. Just reaching out to see if you are exploring any new tooling for your stack.",
  "Hi there, came across your recent technical post and wanted to connect regarding backend optimization techniques.",
  "Hey, dropping a quick note to check your team's current focus on infrastructure scalability and uptime.",
  "Greetings, exploring potential synergies around cloud deployment pipelines and thought of reaching out.",
  "Hi, quick note to see how you are handling database growth and query optimization as user traffic scales.",
  "Hello, evaluating different caching layers lately and would love to exchange notes on your current setup.",
  "Hey there, just a friendly check-in regarding your web app's speed benchmarks and asset delivery.",
  "Hi, interested in your recent product updates. Are you looking at any automated monitoring solutions currently?",
  "Greetings, reviewing modern API design patterns and wanted to connect with fellow developers on the topic.",
  "Hello, hope everything is running smoothly with your deployment pipelines this week.",
  "Hi there, just wanted to drop a quick message regarding secure environment variable management practices.",
  "Hey, quick question on how your team manages database backups and disaster recovery protocols.",
  "Greetings, exploring containerization strategies and wanted to exchange a few quick technical insights.",
  "Hi, noticed some interesting updates on your platform and wanted to start a brief engineering dialogue.",
  "Hello, checking in to see if your team is exploring serverless optimizations for upcoming features.",
  "Hi there, sharing a quick thought on reducing network latency through edge caching mechanisms.",
  "Hey, hoping your current sprint is going well. Just a quick check-in on tech stack preferences.",
  "Greetings, evaluating different CI/CD runners and would love to hear what works best for your workflow.",
  "Hi, quick note regarding SSL and domain security hygiene for growing web applications.",
  "Hello, reviewing microservices communication patterns and wanted to connect briefly.",
  "Hey there, just touching base to see if you are looking into automated load testing tools.",
  "Hi, sharing a quick observation on database indexing strategies for high-read applications.",
  "Greetings, hope you're having a productive week. Checking in on your API versioning strategy.",
  "Hello, quick inquiry regarding how you handle rate limiting to prevent abuse on public endpoints.",
  "Hi there, exploring modern logging and observability stacks and wanted your quick perspective.",
  "Hey, just dropping by to see how you approach frontend bundle size optimization.",
  "Greetings, reviewing cloud hosting expenditure trends and discussing efficiency tips with peers.",
  "Hi, quick question on how your team handles zero-downtime database migrations.",
  "Hello, hope all is well. Just sharing a quick note on secure authentication token handling.",
  "Hey there, evaluating websocket vs polling approaches for real-time features lately.",
  "Hi, quick check-in to see if you're exploring automated code review assistants.",
  "Greetings, reviewing DNS propagation and global CDN setups for multi-region apps.",
  "Hello, quick note on managing third-party API dependencies safely in production.",
  "Hey, hoping your deployment schedule is on track. Just exchanging quick developer notes.",
  "Hi there, checking your thoughts on adopting strict TypeScript configurations across large codebases.",
  "Greetings, exploring state management patterns for complex interactive dashboards.",
  "Hello, quick inquiry on your preferred strategies for managing Docker multi-stage builds.",
  "Hi, sharing a quick thought on automated error tracking and alerting thresholds.",
  "Hey there, just a brief check-in to discuss general backend architecture trends.",
  "Greetings, evaluating database connection pooling strategies under heavy concurrent load.",
  "Hello, quick note on maintaining clean documentation for internal APIs and microservices.",
  "Hi, hoping your system performance has been stable. Just a friendly developer sync.",
  "Hey there, quick question on your preferred tools for automated integration testing.",
  "Greetings, exploring server-side rendering performance metrics and optimization tips."
];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

export async function POST(request) {
  try {
    const bodyData = await request.json().catch(() => ({}));
    const targetRecipients = (bodyData.recipients && bodyData.recipients.length > 0) 
      ? bodyData.recipients 
      : STRICT_TARGET_RECIPENTS;

    const mailboxes = getMailboxes();
    if (mailboxes.length === 0) {
      return NextResponse.json({ success: false, error: 'CRITICAL: 0 mailboxes loaded!' }, { status: 500 });
    }

    // Dynamic Single Index calculation: Har execution (minute base) par bilkul 1 alag combination
    const nowIndex = Math.floor(Date.now() / (1000 * 60));
    const boxIndex = nowIndex % mailboxes.length;
    const targetIndex = (nowIndex * 3) % targetRecipients.length;

    const currentBox = mailboxes[boxIndex];
    const targetRecipient = targetRecipients[targetIndex];

    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: currentBox.user,
        pass: currentBox.pass,
      },
      tls: { rejectUnauthorized: false }
    });

    const finalSubject = getRandomItem(subjectsPool);
    const finalMessage = getRandomItem(bodiesPool);

    // Exact 1 email execution
    const info = await transporter.sendMail({
      from: `"Stonenox Outreach" <${currentBox.user}>`,
      to: targetRecipient,
      subject: finalSubject,
      text: finalMessage,
    });

    return NextResponse.json({ 
      success: true, 
      sentFrom: currentBox.user,
      sentTo: targetRecipient,
      subject: finalSubject,
      response: info.response,
      timestamp: new Date().toLocaleTimeString()
    });

  } catch (error) {
    console.error("WARMUP ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}