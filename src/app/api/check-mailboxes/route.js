import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Helper: Directly read and parse .env.local safely
const getMailboxes = () => {
  const boxes = [];
  try {
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
  } catch (err) {
    console.error("Error reading .env.local directly:", err);
  }

  console.log(`Total Successfully Loaded Mailboxes via Direct Reader: ${boxes.length}`);
  return boxes;
};

// Delay generator (Minutes to Milliseconds)
const getRandomDelay = (minMin, maxMin) => {
  const minMs = minMin * 60 * 1000;
  const maxMs = maxMin * 60 * 1000;
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 50+ Massive Rotational Subject Lines Pool
const subjectsPool = [
  "Quick question regarding your website",
  "Checking in on your latest project update",
  "Quick thought on your current tech stack",
  "Collaboration inquiry for Q1/Q2",
  "Following up on our previous notes",
  "Question about your development workflow",
  "Scaling your SaaS infrastructure safely",
  "Brief check-in / tech sync",
  "Exploring potential partnership",
  "Quick feedback on your platform",
  "Website performance check",
  "Inquiry regarding upcoming MVP updates",
  "Chasing a quick technical synergy",
  "Connecting regarding system maintenance",
  "Quick note on your app architecture",
  "Ideas for your platform's growth",
  "Quick tech exchange / intro",
  "Reviewing recent updates on your site",
  "Discussion on engineering efficiency",
  "Quick chat about backend solutions",
  "Exploring mutual tech opportunities",
  "Query regarding your project roadmap",
  "Brief note on server performance",
  "Syncing up on tech integration",
  "Quick hello / project thought",
  "Platform scalability discussion",
  "Quick note on digital workflow",
  "Ideas around cloud infrastructure",
  "Brief check on your development pipeline",
  "Exploring new tech solutions together",
  "Quick question on system integration",
  "Thoughts on your recent product release",
  "Connecting for a quick tech review",
  "Quick inquiry about your web services",
  "Brief exchange on platform security",
  "Exploring API integration options",
  "Quick note on backend performance",
  "Checking your current tech roadmap",
  "Brief discussion on code quality",
  "Quick thought on infrastructure scaling",
  "Exploring tech collaboration",
  "Quick question on software updates",
  "Brief sync regarding web development",
  "Checking in on system optimizations",
  "Quick feedback on technical layout",
  "Exploring digital partnership scope",
  "Quick note on app performance metrics",
  "Brief check on software architecture",
  "Quick discussion on modern tech stacks",
  "Exploring future technical synergies"
];

// 50+ Massive Rotational Email Bodies Pool
const bodiesPool = [
  "Hi there, I was browsing through your platform and wanted to check if you are looking to optimize your performance metrics this quarter.",
  "Hello, just dropping a quick note to see how your current engineering workflow is holding up. Would love to connect briefly.",
  "Hi, noticed your recent updates online. We are currently helping companies streamline their backend architecture securely.",
  "Hey, hope you are doing well. Just following up to see if you had a chance to look over the system scaling notes.",
  "Greetings, quick question regarding your current MVP maintenance and feature expansion plans for the upcoming months.",
  "Hi, reviewing some tech stacks today and came across your ecosystem. Let me know if you are open to exploring new optimizations.",
  "Hello, hope your week is going smoothly. I wanted to touch base regarding modern infrastructure practices.",
  "Hi there, just connecting to see if you are exploring any backend updates or performance tuning this month.",
  "Greetings, came across your digital setup and thought of sharing a quick note on cloud scalability.",
  "Hi, quick note to see how your engineering team manages database loads during peak hours.",
  "Hello, exploring potential synergies in software development and wanted to drop a quick introductory line.",
  "Hi there, just following up on how your application handles automated workflows and scaling.",
  "Greetings, checking in to see if you are looking for secure backend integrations for your projects.",
  "Hi, I was analyzing some new tech architectures and wanted to get your brief perspective.",
  "Hello, hope you're having a productive week. Let me know if you'd be open to a quick technical chat.",
  "Hi there, dropping a friendly note to see how your latest product deployment went.",
  "Greetings, reviewing web performance strategies today and wanted to connect with fellow developers.",
  "Hi, just checking in to see if your team is exploring new tools for backend optimization.",
  "Hello, hope all is well with your ongoing projects and development cycles.",
  "Hi there, quick inquiry regarding how you manage server-side security and caching.",
  "Greetings, just thought of sharing a brief note on how modern apps scale safely across regions.",
  "Hi, exploring digital collaboration opportunities and wanted to say hello.",
  "Hello, checking in to see if you have any questions regarding automated pipeline setups.",
  "Hi there, reviewing code optimization techniques and wanted to connect briefly.",
  "Greetings, hope your platform updates are rolling out smoothly this season.",
  "Hi, just a quick note to see if you are open to discussing cloud infrastructure enhancements.",
  "Hello, exploring web architecture trends and thought of dropping a line.",
  "Hi there, checking in to see how your current software deployment pipeline is performing.",
  "Greetings, quick question on how you handle database management and scaling.",
  "Hi, hope your engineering milestones are on track for this quarter.",
  "Hello, dropping by to see if you're interested in reviewing some modern tech stacks.",
  "Hi there, just following up on potential engineering collaborations.",
  "Greetings, exploring ways to streamline API integrations and wanted your thoughts.",
  "Hi, quick note regarding system maintenance and automated backups.",
  "Hello, hope you're having a great week. Let's connect if you're exploring tech upgrades.",
  "Hi there, checking in to see how your web application handles traffic spikes.",
  "Greetings, reviewing software scalability models and wanted to touch base.",
  "Hi, quick thought on optimizing cloud server costs and performance.",
  "Hello, hope your development pipeline is running smoothly.",
  "Hi there, just dropping a line to discuss modern engineering practices.",
  "Greetings, exploring potential tech partnerships for upcoming projects.",
  "Hi, quick check-in regarding your platform's user experience metrics.",
  "Hello, reviewing API response times today and thought of connecting.",
  "Hi there, just seeing if you need any assistance with backend architecture.",
  "Greetings, exploring secure data management practices with tech peers.",
  "Hi, quick question on how you manage continuous deployment cycles.",
  "Hello, hope your recent feature rollouts are performing exceptionally well.",
  "Hi there, just dropping a quick note to share some technical insights.",
  "Greetings, exploring innovative approaches to web hosting and infrastructure.",
  "Hi, final check-in for the week to see if you're open to a brief tech chat."
];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

export async function POST(request) {
  try {
    const bodyData = await request.json();
    const { 
      recipients, 
      customSubject, 
      customMessage, 
      maxPerBox = 3,  
      minDelay = 30,  
      maxDelay = 35   
    } = bodyData;

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ success: false, error: 'Recipients list is empty' }, { status: 400 });
    }

    const mailboxes = getMailboxes();
    
    if (mailboxes.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'CRITICAL: 0 mailboxes loaded!' 
      }, { status: 500 });
    }

    let results = [];
    let mailboxIndex = 0;
    let mailboxCounts = {};
    let deadMailboxes = new Set();

    for (const recipient of recipients) {
      let activeMailboxes = mailboxes.filter(b => !deadMailboxes.has(b.user));

      if (activeMailboxes.length === 0) {
        results.push({
          email: recipient,
          status: 'Failed',
          error: 'All mailboxes are exhausted or dead.'
        });
        break;
      }

      mailboxIndex = mailboxIndex % activeMailboxes.length;
      const currentBox = activeMailboxes[mailboxIndex];

      if (!mailboxCounts[currentBox.user]) {
        mailboxCounts[currentBox.user] = 0;
      }

      if (mailboxCounts[currentBox.user] >= Number(maxPerBox)) {
        mailboxIndex = (mailboxIndex + 1) % activeMailboxes.length;
        continue;
      }

      const transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: currentBox.user,
          pass: currentBox.pass,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Automatically pick random subject and body from the 50+ pools if fields are left blank
      const finalSubject = customSubject?.trim() ? customSubject : getRandomItem(subjectsPool);
      const finalMessage = customMessage?.trim() ? customMessage : getRandomItem(bodiesPool);

      try {
        const info = await transporter.sendMail({
          from: `"Stonenox Outreach" <${currentBox.user}>`,
          to: recipient,
          subject: finalSubject,
          text: finalMessage,
        });

        mailboxCounts[currentBox.user]++;

        results.push({
          email: recipient,
          status: 'Success',
          sentFrom: currentBox.user,
          usedSubject: finalSubject,
          response: info.response,
          boxSentCount: mailboxCounts[currentBox.user],
          timestamp: new Date().toLocaleTimeString(),
        });
      } catch (err) {
        console.error(`SMTP Error on ${currentBox.user}:`, err.message);
        
        if (err.message.includes('535') || err.message.includes('Authentication') || err.message.includes('Invalid login')) {
          deadMailboxes.add(currentBox.user);
          console.warn(`[Auto-Shield] Bypassing dead/failing mailbox: ${currentBox.user}`);
        }

        results.push({
          email: recipient,
          status: 'Failed',
          sentFrom: currentBox.user,
          error: err.message,
          timestamp: new Date().toLocaleTimeString(),
        });
      }

      mailboxIndex = (mailboxIndex + 1) % activeMailboxes.length;

      // Safe Delay Execution between sends
      const delayMs = getRandomDelay(Number(minDelay), Number(maxDelay));
      if (recipients.indexOf(recipient) !== recipients.length - 1) {
        await sleep(delayMs);
      }
    }

    return NextResponse.json({ success: true, results, mailboxCounts, deadMailboxes: Array.from(deadMailboxes) });
  } catch (error) {
    console.error("CRITICAL WARMUP API ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}