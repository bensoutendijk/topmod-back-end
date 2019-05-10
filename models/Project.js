/* eslint-disable func-names */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const articleSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    unique: true,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    required: true,
  },
});

const sectionSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  children: [articleSchema],
});

const projectSchema = new Schema({
  name: {
    type: String,
    index: true,
    unique: true,
    required: true,
  },
  sections: [sectionSchema],
});

sectionSchema.methods.pushArticle = function (article) {
  const child = {
    _id: new mongoose.Types.ObjectId(),
    type: 'article',
    name: article.name,
    slug: article.slug,
  };
  this.children.push(child);
  return child;
};

sectionSchema.methods.findName = function (name) {
  return this.children.find(child => child.name === name);
};

projectSchema.methods.findSection = function (section) {
  return this.sections.find(element => element._id.toString() === section._id);
};

projectSchema.methods.findSlug = function (slug) {
  return this.sections.find(section => section.children.find(child => child.slug === slug));
};

mongoose.model('Project', projectSchema);
