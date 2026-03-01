'use strict';

const https = require('https');
const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

function isCacheStale(lastFetchedAt) {
  if (!lastFetchedAt) return true;
  return Date.now() - new Date(lastFetchedAt).getTime() > CACHE_TTL_MS;
}

/**
 * Tiny promise-based HTTPS GET helper (no external deps).
 * Returns parsed JSON body.
 */
function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'EvolvEd-App/1.0',
        Accept: 'application/json',
        ...headers,
      },
    };
    https.get(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode === 404) return reject(AppError.notFound('Profile not found on the external platform.'));
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new AppError(`External API error: HTTP ${res.statusCode}`, res.statusCode));
        }
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new AppError('Failed to parse external API response.', 502));
        }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * POST JSON via HTTPS (used for GraphQL).
 */
function httpsPost(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'User-Agent': 'EvolvEd-App/1.0',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        Accept: 'application/json',
        ...headers,
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new AppError(`External API error: HTTP ${res.statusCode}`, res.statusCode));
        }
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new AppError('Failed to parse external API response.', 502));
        }
      });
      res.on('error', reject);
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ─────────────────────────────────────────────────────────────────
// LEETCODE — FETCH FROM API
// ─────────────────────────────────────────────────────────────────

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';

async function fetchLeetCodeData(username) {
  const query = `
    query getUserData($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          ranking
          reputation
          starRating
        }
        submitStats {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
          totalSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        languageProblemCount {
          languageName
          problemsSolved
        }
        badges {
          id
          displayName
          icon
        }
        userCalendar(year: ${new Date().getFullYear()}) {
          streak
          totalActiveDays
          submissionCalendar
        }
        activeBadge {
          displayName
        }
      }
      userContestRanking(username: $username) {
        rating
        globalRanking
        totalParticipants
        topPercentage
        attendedContestsCount
      }
      allQuestionsCount {
        difficulty
        count
      }
    }
  `;

  let data;
  try {
    data = await httpsPost(
      LEETCODE_GRAPHQL,
      { query, variables: { username } },
      { Referer: 'https://leetcode.com' }
    );
  } catch (err) {
    throw new AppError(`LeetCode API unreachable: ${err.message}`, 502);
  }

  if (data.errors) {
    throw AppError.notFound(`LeetCode user "${username}" not found.`);
  }

  const user = data.data?.matchedUser;
  if (!user) throw AppError.notFound(`LeetCode user "${username}" not found.`);

  const contestData = data.data?.userContestRanking;
  const allQ = data.data?.allQuestionsCount || [];

  // Parse submission stats
  const acStats = user.submitStats?.acSubmissionNum || [];
  const getCount = (diff) => acStats.find((s) => s.difficulty === diff)?.count || 0;

  const totalSolved = getCount('All');
  const easySolved = getCount('Easy');
  const mediumSolved = getCount('Medium');
  const hardSolved = getCount('Hard');

  // Acceptance rate: All AC / All total submissions
  const totalAcSubs = user.submitStats?.acSubmissionNum?.find((s) => s.difficulty === 'All')?.submissions || 0;
  const totalAllSubs = user.submitStats?.totalSubmissionNum?.find((s) => s.difficulty === 'All')?.submissions || 0;
  const acceptanceRate = totalAllSubs > 0 ? (totalAcSubs / totalAllSubs) * 100 : 0;

  // Total question counts
  const getTotal = (diff) => allQ.find((q) => q.difficulty === diff)?.count || 0;
  const easyTotal = getTotal('Easy');
  const mediumTotal = getTotal('Medium');
  const hardTotal = getTotal('Hard');
  const totalQuestions = getTotal('All');

  // Calendar & streak
  const calendar = user.userCalendar;
  const streak = calendar?.streak || 0;
  let submissionCalendar = null;
  if (calendar?.submissionCalendar) {
    try {
      submissionCalendar = JSON.parse(calendar.submissionCalendar);
    } catch {
      submissionCalendar = null;
    }
  }

  // Top languages (top 5 by problems solved)
  const topLanguages = (user.languageProblemCount || [])
    .sort((a, b) => b.problemsSolved - a.problemsSolved)
    .slice(0, 5)
    .map((l) => ({ name: l.languageName, count: l.problemsSolved }));

  // Badges
  const badges = (user.badges || []).slice(0, 10).map((b) => ({
    id: b.id,
    name: b.displayName,
    icon: b.icon,
  }));

  return {
    username,
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    totalQuestions,
    easyTotal,
    mediumTotal,
    hardTotal,
    acceptanceRate: Math.round(acceptanceRate * 100) / 100,
    contestRating: contestData?.rating ? Math.round(contestData.rating) : null,
    contestRanking: contestData?.globalRanking || null,
    streak,
    submissionCalendar,
    topLanguages,
    badges,
    ranking: user.profile?.ranking || null,
  };
}

// ─────────────────────────────────────────────────────────────────
// LEETCODE — SERVICE LAYER
// ─────────────────────────────────────────────────────────────────

async function getLeetCodeProfile(studentId, forceRefresh = false) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { leetcodeUsername: true, leetcodeProfile: true },
  });

  if (!student) throw AppError.notFound('Student not found.');
  if (!student.leetcodeUsername) {
    return { connected: false, message: 'No LeetCode username set. Update your profile to connect.' };
  }

  const cached = student.leetcodeProfile;

  // Return cache if still fresh
  if (!forceRefresh && cached && !isCacheStale(cached.lastFetchedAt)) {
    return { connected: true, cached: true, data: formatLeetCodeProfile(cached) };
  }

  // Fetch fresh data
  let fresh;
  try {
    fresh = await fetchLeetCodeData(student.leetcodeUsername);
  } catch (err) {
    // If fetch fails, fall back to stale cache if available; otherwise signal a fetch error
    if (cached) {
      return { connected: true, cached: true, stale: true, data: formatLeetCodeProfile(cached), fetchError: err.message };
    }
    return { connected: true, fetchError: err.message, username: student.leetcodeUsername };
  }

  const upserted = await prisma.leetCodeProfile.upsert({
    where: { studentId },
    create: { studentId, ...fresh, lastFetchedAt: new Date() },
    update: { ...fresh, lastFetchedAt: new Date() },
  });

  return { connected: true, cached: false, data: formatLeetCodeProfile(upserted) };
}

function formatLeetCodeProfile(p) {
  return {
    username: p.username,
    totalSolved: p.totalSolved,
    easySolved: p.easySolved,
    mediumSolved: p.mediumSolved,
    hardSolved: p.hardSolved,
    totalQuestions: p.totalQuestions,
    easyTotal: p.easyTotal,
    mediumTotal: p.mediumTotal,
    hardTotal: p.hardTotal,
    acceptanceRate: parseFloat(p.acceptanceRate) || 0,
    contestRating: p.contestRating ? parseFloat(p.contestRating) : null,
    contestRanking: p.contestRanking,
    streak: p.streak,
    submissionCalendar: p.submissionCalendar,
    topLanguages: p.topLanguages,
    badges: p.badges,
    ranking: p.ranking,
    lastFetchedAt: p.lastFetchedAt,
  };
}

// ─────────────────────────────────────────────────────────────────
// GITHUB — FETCH FROM API
// ─────────────────────────────────────────────────────────────────

async function fetchGitHubData(username) {
  // 1. User profile
  let userProfile;
  try {
    userProfile = await httpsGet(`https://api.github.com/users/${encodeURIComponent(username)}`);
  } catch (err) {
    if (err.statusCode === 404) throw AppError.notFound(`GitHub user "${username}" not found.`);
    throw new AppError(`GitHub API unreachable: ${err.message}`, 502);
  }

  // 2. Repos (top 100 by stars, public only)
  let repos = [];
  try {
    repos = await httpsGet(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?type=public&sort=stars&per_page=100`
    );
    if (!Array.isArray(repos)) repos = [];
  } catch {
    repos = [];
  }

  // Compute total stars & forks
  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);

  // Top languages: aggregate from non-forked repos
  const langCount = {};
  for (const repo of repos) {
    if (repo.fork) continue;
    const lang = repo.language;
    if (lang) langCount[lang] = (langCount[lang] || 0) + 1;
  }
  const topLanguages = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  // Top 10 repos by stars (non-forked first, then forked)
  const topRepos = repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 10)
    .map((r) => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      fork: r.fork,
      updatedAt: r.updated_at,
    }));

  // 3. Contribution count (last year) — use the events API as approximation
  // GitHub doesn't expose contribution graph publicly via REST without auth
  // Use PushEvents from the events API (max 300 events = 10 pages * 30)
  let contributionCount = 0;
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const eventsPage1 = await httpsGet(
      `https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=100&page=1`
    );
    if (Array.isArray(eventsPage1)) {
      const recentEvents = eventsPage1.filter(
        (e) => new Date(e.created_at) >= oneYearAgo && e.type === 'PushEvent'
      );
      // Count commits from PushEvents
      contributionCount = recentEvents.reduce((sum, e) => sum + (e.payload?.commits?.length || 1), 0);
    }
  } catch {
    contributionCount = 0;
  }

  return {
    username,
    name: userProfile.name || null,
    avatarUrl: userProfile.avatar_url || null,
    bio: userProfile.bio || null,
    publicRepos: userProfile.public_repos || 0,
    followers: userProfile.followers || 0,
    following: userProfile.following || 0,
    totalStars,
    totalForks,
    topLanguages,
    contributionCount,
    repos: topRepos,
  };
}

// ─────────────────────────────────────────────────────────────────
// GITHUB — SERVICE LAYER
// ─────────────────────────────────────────────────────────────────

async function getGitHubProfile(studentId, forceRefresh = false) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { githubUsername: true, githubProfile: true },
  });

  if (!student) throw AppError.notFound('Student not found.');
  if (!student.githubUsername) {
    return { connected: false, message: 'No GitHub username set. Update your profile to connect.' };
  }

  const cached = student.githubProfile;

  // Return cache if still fresh
  if (!forceRefresh && cached && !isCacheStale(cached.lastFetchedAt)) {
    return { connected: true, cached: true, data: formatGitHubProfile(cached) };
  }

  // Fetch fresh data
  let fresh;
  try {
    fresh = await fetchGitHubData(student.githubUsername);
  } catch (err) {
    // If fetch fails, fall back to stale cache if available; otherwise signal a fetch error
    if (cached) {
      return { connected: true, cached: true, stale: true, data: formatGitHubProfile(cached), fetchError: err.message };
    }
    return { connected: true, fetchError: err.message, username: student.githubUsername };
  }

  const upserted = await prisma.gitHubProfile.upsert({
    where: { studentId },
    create: { studentId, ...fresh, lastFetchedAt: new Date() },
    update: { ...fresh, lastFetchedAt: new Date() },
  });

  return { connected: true, cached: false, data: formatGitHubProfile(upserted) };
}

function formatGitHubProfile(p) {
  return {
    username: p.username,
    name: p.name,
    avatarUrl: p.avatarUrl,
    bio: p.bio,
    publicRepos: p.publicRepos,
    followers: p.followers,
    following: p.following,
    totalStars: p.totalStars,
    totalForks: p.totalForks,
    topLanguages: p.topLanguages,
    contributionCount: p.contributionCount,
    repos: p.repos,
    lastFetchedAt: p.lastFetchedAt,
  };
}

module.exports = {
  getLeetCodeProfile,
  getGitHubProfile,
  // expose raw fetchers so scoring service can call them
  fetchLeetCodeData,
  fetchGitHubData,
  isCacheStale,
};
