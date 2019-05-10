const AWS = require('aws-sdk');

const mongoose = require('mongoose');
const router = require('express').Router({ mergeParams: true });
const auth = require('../auth');

const Project = mongoose.model('Project');

const keys = require('../../config/keys');

const s3 = new AWS.S3({
  accessKeyId: keys.awsAccessKey,
  secretAccessKey: keys.awsSecretAccessKey,
});

// POST content
router.post('/new', auth.required, async (req, res) => {
  const { body } = req;

  if (!body) {
    return res.status(400).json({
      errors: {
        body: 'does not exist',
      },
    });
  }

  try {
    // Find project
    const project = await Project.findOne({ _id: body.project._id });

    // Find a section by id
    const section = project.findSection(body.section);
    if (!section) {
      return res.status(400).json({
        errors: {
          section: 'does not exist',
        },
      });
    }

    const existingName = section.findName(body.article.name);
    if (existingName) {
      return res.status(400).json({
        errors: {
          name: 'already exists',
        },
      });
    }

    const existingSlug = project.findSlug(body.article.slug);
    if (existingSlug) {
      return res.status(400).json({
        errors: {
          slug: 'already exists',
        },
      });
    }

    const child = section.pushArticle(body.article);

    // Update in database
    try {
      await project.save();
    } catch (err) {
      return res.status(400).json({
        errors: {
          project: err.message,
        },
      });
    }
    // S3 Upload
    const params = {
      Bucket: 'soutendijk-habit-dev',
      Key: `${child._id}.md`,
      Body: body.article.content.data,
    };
    try {
      s3.upload(params, (err) => {
        if (err) throw err;
      });
    } catch (err) {
      return res.status(400).json({
        errors: {
          s3: err.message,
        },
      });
    }
    return res.send(body.article.content);
  } catch (err) {
    return res.json({
      errors: {
        article: err.message,
      },
    });
  }
});

// GET content
router.get('/:articleId', auth.optional, async (req, res) => {
  const { params: { articleId } } = req;
  try {
    const params = {
      Bucket: 'soutendijk-habit-dev',
      Key: `${articleId}.md`,
    };
    s3.getObject(params, (err, data) => {
      if (err) throw err;
      if (data) {
        res.send(data.Body.toString());
      } else {
        res.status(404).json({
          errors: {
            s3: 'Unable to find object',
          },
        });
      }
    });
  } catch (err) {
    res.status(400).json({
      errors: {
        s3: 'Unable to get object',
      },
    });
  }
});

// PATCH content
router.patch('/:articleId', auth.required, async (req, res) => {
  const { params: { articleId }, body: { article } } = req;
  if (article) {
    try {
      // Query project
      const project = await Project.findOne({ name: 'Mouseflow' });

      // Make changes to project
      const section = project.sections.find(element => element.name === article.section);
      let child = section.children.find(element => element._id.toString() === articleId);
      if (!section) {
        // Create New Section
      } else if (!child) {
        // Move Article
        // Delete old child
        const prevSection = project.sections.find(element => (
          element.children.find(innerElement => (
            innerElement._id.toString() === articleId
          ))
        ));
        prevSection.children = prevSection.children.filter(element => (
          element._id.toString() !== articleId
        ));
        // If old section is empty
        if (!prevSection.children.length) {
          // Delete the empty section
          project.sections = project.sections.filter(element => element !== prevSection);
        }
        // Create new child
        child = {
          _id: new mongoose.Types.ObjectId(),
          type: 'article',
          name: article.name,
          slug: article.slug,
        };
        section.children.push(child);
      } else {
        child.name = article.name;
        child.slug = article.slug;
      }
      // Update in database
      await Project.findOneAndUpdate({ name: 'Mouseflow' }, project, { new: true });
      // S3 Upload
      const params = {
        Bucket: 'soutendijk-habit-dev',
        Key: `${child._id}.md`,
        Body: article.content.data,
      };
      try {
        s3.upload(params, (err) => {
          if (err) throw err;
        });
      } catch (err) {
        return res.status(400).json({
          errors: {
            s3: 'Unable to save file',
          },
        });
      }
      return res.send(article.content);
    } catch (err) {
      return res.status(400).json({
        errors: {
          section: `Unable to patch ${articleId}`,
        },
      });
    }
  }
  return res.status(400).json({
    errors: {
      article: 'Invalid article object',
    },
  });
});

module.exports = router;
