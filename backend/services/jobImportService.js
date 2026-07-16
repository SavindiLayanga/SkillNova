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
        source: 'We Work Remotely',
        sourceUrl: item.link,
        externalId,
        publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
        importedAt: new Date(),
        status: 'active',
      };

      const filter = { source: 'We Work Remotely', externalId };

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
