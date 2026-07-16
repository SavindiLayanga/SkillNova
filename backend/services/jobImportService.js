import axios from 'axios';
import Parser from 'rss-parser';
import sanitizeHtml from 'sanitize-html';
import Job from '../models/Job.js';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'SkillNova-JobBot/1.0 (+https://skillnova.example.com)',
  },
});

export async function importJobsFromWeWorkRemotely() {
  const FEED_URL = 'https://weworkremotely.com/remote-jobs.rss';
  let feed;
  try {
    const response = await axios.get(FEED_URL, {
      timeout: 10000,
      headers: {
        'User-Agent': 'SkillNova-JobBot/1.0 (+https://skillnova.example.com)',
      },
    });
    feed = await parser.parseString(response.data);
  } catch (error) {
    console.error('Error fetching/parsing RSS feed:', error.message);
    throw new Error('Failed to fetch or parse job RSS feed.');
  }

  const result = {
    source: 'We Work Remotely',
    found: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  };

  if (!feed || !feed.items || feed.items.length === 0) {
    return result;
  }

  result.found = feed.items.length;

  for (const item of feed.items) {
    try {
      if (!item.title || !item.link) {
        result.skipped++;
        continue;
      }

      let company = 'Unknown Company';
      let title = item.title;
      const titleParts = item.title.split(': ');
      if (titleParts.length > 1) {
        company = titleParts[0].trim();
        title = titleParts.slice(1).join(': ').trim();
      }

      const description = sanitizeHtml(item.content || item.contentSnippet || '', {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      });

      const categories = item.categories || [];
      const category = categories.length > 0 ? categories[0] : '';
      
      const externalId = item.guid || item.id || item.link;

      const jobData = {
        title,
        company,
        description,
        category,
        source: 'RSS Imported Job',
        sourceUrl: item.link,
        externalId,
        publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
        importedAt: new Date(),
        status: 'Active',
      };

      const filter = { source: 'RSS Imported Job', externalId };

      const updateOp = {
        $set: jobData,
        $setOnInsert: {
          createdAt: new Date(),
        },
      };

      const existing = await Job.findOne(filter);
      
      await Job.updateOne(filter, updateOp, { upsert: true });

      if (existing) {
        result.updated++;
      } else {
        result.created++;
      }

    } catch (err) {
      console.error('Error processing job item:', err.message);
      result.failed++;
    }
  }

  return result;
}

export async function importJobsFromLinkedIn(keyword, location) {
  const result = {
    source: 'LinkedIn Imported Job',
    found: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  };

  const API_KEY = process.env.LINKEDIN_API_KEY;
  const API_HOST = process.env.LINKEDIN_API_HOST || 'linkedin-jobs-search.p.rapidapi.com';
  const API_URL = process.env.LINKEDIN_API_URL || 'https://linkedin-jobs-search.p.rapidapi.com/';

  let jobs = [];

  if (!API_KEY) {
    console.log('No LINKEDIN_API_KEY provided. Returning mock data.');
    // Mock response for development
    jobs = [
      {
        id: `mock-ln-${Date.now()}-1`,
        title: `${keyword || 'Software Engineer'} (Mock)`,
        company: 'Tech Corp Mock',
        location: location || 'Sri Lanka',
        jobUrl: 'https://linkedin.com/jobs/view/mock1',
        description: 'This is a mock job description for testing purposes.',
        skills: ['React', 'Node.js']
      },
      {
        id: `mock-ln-${Date.now()}-2`,
        title: `Senior ${keyword || 'Developer'} (Mock)`,
        company: 'Global Innovations Mock',
        location: location || 'Sri Lanka',
        jobUrl: 'https://linkedin.com/jobs/view/mock2',
        description: 'Another mock job for testing duplicate handling.',
        skills: ['MongoDB', 'Express']
      }
    ];
  } else {
    try {
      const response = await axios.post(API_URL, {
        search_terms: keyword || '',
        location: location || '',
        page: '1'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': API_HOST
        },
        timeout: 15000
      });
      
      jobs = response.data || [];
    } catch (error) {
      console.error('LinkedIn API Error:', error.message);
      throw new Error('Failed to fetch jobs from LinkedIn API.');
    }
  }

  if (!Array.isArray(jobs) || jobs.length === 0) {
    return result;
  }

  result.found = jobs.length;

  for (const item of jobs) {
    try {
      if (!item.title || !item.company) {
        result.skipped++;
        continue;
      }

      const externalId = item.id || item.jobUrl || `ln-${Date.now()}-${Math.random()}`;

      const jobData = {
        title: item.title,
        company: item.company,
        location: item.location || '',
        description: item.description || '',
        skills: item.skills || [],
        source: 'LinkedIn Imported Job',
        sourceUrl: item.jobUrl || '',
        externalId,
        externalSource: 'LinkedIn',
        publishedAt: new Date(),
        importedAt: new Date(),
        status: 'Active',
      };

      const filter = { externalId };

      const updateOp = {
        $set: jobData,
        $setOnInsert: {
          createdAt: new Date(),
        },
      };

      const existing = await Job.findOne(filter);
      await Job.updateOne(filter, updateOp, { upsert: true });

      if (existing) {
        result.updated++;
      } else {
        result.created++;
      }
    } catch (err) {
      console.error('Error saving LinkedIn job:', err.message);
      result.failed++;
    }
  }

  return result;
}
