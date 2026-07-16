import Job from '../models/Job.js';
import { importJobsFromWeWorkRemotely, importJobsFromLinkedIn } from '../services/jobImportService.js';

export async function importJobs(req, res) {
  try {
    const result = await importJobsFromWeWorkRemotely();
    return res.status(200).json({
      message: 'Job import completed.',
      ...result
    });
  } catch (error) {
    console.error('Job import error:', error.message);
    return res.status(500).json({ error: 'Failed to import jobs. Please try again later.' });
  }
}

export async function getJobs(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || 'all';
    const source = req.query.source || 'all';

    const query = { status: { $ne: 'deleted' } };

    if (status !== 'all') {
      query.status = status;
    }

    if (source !== 'all') {
      query.source = source;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      jobs,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error.message);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
}

export async function createJob(req, res) {
  try {
    const { 
      title, company, description, skills, category, jobType, 
      contactEmail, companyLogo, experienceRequired, salaryRange, 
      numberOfOpenings, applicationDeadline, source, status, location
    } = req.body;
    
    if (!title || !company) {
      return res.status(400).json({ error: 'Title and company are required.' });
    }

    const newJob = new Job({
      title,
      company,
      contactEmail,
      companyLogo,
      description: description || '',
      location: location || '',
      skills: Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map(s=>s.trim()) : []),
      category: category || '',
      jobType: jobType || '',
      experienceRequired,
      salaryRange,
      numberOfOpenings,
      applicationDeadline,
      source: source || 'SkillNova Verified Vacancy',
      status: status || 'Pending Approval',
      publishedAt: new Date()
    });

    await newJob.save();
    res.status(201).json({ message: 'Job created successfully', job: newJob });
  } catch (error) {
    console.error('Error creating job:', error.message);
    res.status(500).json({ error: 'Failed to create job' });
  }
}

export async function updateJob(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const allowedUpdates = [
      'title', 'company', 'description', 'skills', 'category', 'jobType', 'status',
      'contactEmail', 'companyLogo', 'experienceRequired', 'salaryRange', 
      'numberOfOpenings', 'applicationDeadline', 'source', 'location'
    ];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});
      
    if (filteredUpdates.skills && typeof filteredUpdates.skills === 'string') {
        filteredUpdates.skills = filteredUpdates.skills.split(',').map(s=>s.trim());
    }

    const job = await Job.findByIdAndUpdate(id, filteredUpdates, { new: true });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.status(200).json({ message: 'Job updated successfully', job });
  } catch (error) {
    console.error('Error updating job:', error.message);
    res.status(500).json({ error: 'Failed to update job' });
  }
}

export async function deleteJob(req, res) {
  try {
    const { id } = req.params;
    
    const job = await Job.findByIdAndUpdate(id, { status: 'archived' }, { new: true });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.status(200).json({ message: 'Job archived successfully' });
  } catch (error) {
    console.error('Error deleting job:', error.message);
    res.status(500).json({ error: 'Failed to delete job' });
  }
}

export async function importLinkedInJobs(req, res) {
  try {
    const { keyword, location } = req.body;
    const result = await importJobsFromLinkedIn(keyword, location);
    return res.status(200).json({
      message: 'LinkedIn job import completed.',
      success: true,
      ...result
    });
  } catch (error) {
    console.error('LinkedIn Job import error:', error.message);
    return res.status(500).json({ 
      error: error.message || 'Failed to import LinkedIn jobs. Please try again later.',
      success: false
    });
  }
}
