const express = require("express");
const router = express.Router();

var neo4jApi = require('../database/neo4jAPI/neo4jProfile');


router.get('/', async(req, res) => {
    var teacher = await neo4jApi.getSkills(req);
    var skills = await neo4jApi.getSkills(req);
    var courses = await neo4jApi.getCourses(req);
    var languages = await neo4jApi.getLanguages(req);
    var interests = await neo4jApi.getInterests(req);
    var projects = await neo4jApi.getProjects(req);
    var researchPapers = await neo4jApi.getResearchPapers(req);
    var achievements = await neo4jApi.getAchievements(req);
    var institutes = await neo4jApi.getInstitutes(req);
    var companies = await neo4jApi.getCompanies(req);

    var data = {
        teacher: teacher,
        skills: skills,
        courses: courses,
        languages: languages,
        interests: interests,
        projects: projects,
        researchPapers: researchPapers,
        achievements: achievements,
        institutes: institutes,
        companies: companies,
    }
    res.send(data);
})

router.post('/institutes', async(req, res) => {
    await neo4jApi.addInstitutes(req);
    res.send('hello')
});

router.post('/skills', async(req, res) => {
    await neo4jApi.addSkills(req);
    res.send('hello')
});

router.post('/courses', async(req, res) => {
    await neo4jApi.addCourses(req);
    res.send('hello')
});

router.post('/projects', async(req, res) => {
    console.log("project", req.user);
    await neo4jApi.addProjects(req);
    // res.send('hello')
    res.json(req.user)
});

router.post('/achievements', async(req, res) => {
    await neo4jApi.addAchievements(req);
    res.send('hello')
});

router.post('/researchPapers', async(req, res) => {
    await neo4jApi.addResearchPapers(req);
    res.send('hello')
});

router.post('/interests', async(req, res) => {
    await neo4jApi.addInterests(req);
    res.send('hello')
});

router.post('/languages', async(req, res) => {
    await neo4jApi.addLanguages(req);
    res.send('hello')
});

router.post('/comapanies', async(req, res) => {
    await neo4jApi.addCompanies(req);
    res.send('hello')
});

module.exports = router;