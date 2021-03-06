const driver = require('../../config/db');

//for each query, end with <space> so as to add next part of query


async function studentSearch(data, id) {
    var isQuery = false; //checks if there is a query to be matched

    var session = driver.session();
    var student;
    var readTxResultPromise = await session.readTransaction(async txc => {
        var query = `MATCH (s:Student) WHERE ID(s) = ${id} RETURN s;`;
        var studentNode = await txc.run(query);
        student = studentNode.records[0]._fields[0].properties;
    });
    session.close();

    query = `MATCH (s:Student) WITH COLLECT(ID(s)) AS s_filter `;

    var student_filter = false;

    if (data.myClass === true) {
        // console.log("myclass is true");
        isQuery = true;
        student_filter = true;
        query += `OPTIONAL MATCH (s:Student) WHERE s.class = '${student.class}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) AS s_filter `
    } else {
        if (data.department.length > 0) {
            // console.log("dep is true");
            isQuery = true;
            student_filter = true;
            query += `OPTIONAL MATCH (s:Student) WHERE s.department = '${data.department}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) AS s_filter `
        }
        if (parseInt(data.semester) > 0) {
            // console.log("sem is true");
            isQuery = true;
            student_filter = true;
            query += `OPTIONAL MATCH (s:Student) WHERE s.semester = '${data.semester}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) AS s_filter  `
        }
    }

    if (student_filter) {
        query += `WITH s_filter AS res, s_filter `

        data.institutes.forEach(institute => {
            query += `OPTIONAL MATCH (s:Student)-[:STUDIED_IN]->(i:Institute) WHERE i.name CONTAINS '${institute}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) + res AS res, s_filter `
        });

        data.skills.forEach(skill => {
            query += `OPTIONAL MATCH (s:Student)-[:HAS]->(sk:Skill) WHERE sk.name CONTAINS '${skill}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) + res AS res, s_filter `
        });

        data.courses.forEach(course => {
            query += `OPTIONAL MATCH (s:Student)-[:COMPLETED]->(c:Course) WHERE c.name CONTAINS '${course}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) + res AS res, s_filter `
        });

        data.projects.forEach(project => {
            query += `OPTIONAL MATCH (s:Student)-[:HAS_DONE]->(p:Project) WHERE p.name CONTAINS '${project}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) + res AS res, s_filter `
        });

        data.achievements.forEach(achievement => {
            query += `OPTIONAL MATCH (s:Student)-[:HAS_ACHIEVED]->(a:Achievement) WHERE a.title CONTAINS '${achievement}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) + res AS res, s_filter `
        });

        data.researchPapers.forEach(researchPaper => {
            query += `OPTIONAL MATCH (s:Student)-[:PUBLISHED]->(r:ResearchPaper) WHERE r.title CONTAINS '${researchPaper}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) + res AS res, s_filter `
        });

        data.clubs.forEach(club => {
            query += `OPTIONAL MATCH (s:Student)-[:PART_OF]->(c:Club) WHERE c.name CONTAINS '${club}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) + res AS res, s_filter `
        });

        data.interests.forEach(interest => {
            query += `OPTIONAL MATCH (s:Student)-[:INTERESTED_IN]->(i:Interest) WHERE i.name CONTAINS '${interest}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) + res AS res, s_filter `
        });

        data.languages.forEach(language => {
            query += `OPTIONAL MATCH (s:Student)-[:SPEAKS]->(l:Language) WHERE l.name CONTAINS '${language}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) + res AS res, s_filter `
        });

        data.companies.forEach(company => {
            query += `OPTIONAL MATCH (s:Student)-[:WORKED_IN]->(c:Company) WHERE c.name CONTAINS '${company}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) + res AS res, s_filter OPTIONAL MATCH (s:Student)-[:WORKED_IN]->(c:Company) WHERE c.field CONTAINS '${company}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) + res AS res, s_filter `
        })

        query += `RETURN res; `
    } else {
        query = `WITH [] AS res `

        data.institutes.forEach(institute => {
            isQuery = true;
            query += `OPTIONAL MATCH (s:Student)-[:STUDIED_IN]->(i:Institute) WHERE i.name CONTAINS '${institute}' WITH COLLECT(ID(s)) + res AS res `
        });

        data.skills.forEach(skill => {
            isQuery = true;
            query += `OPTIONAL MATCH (s:Student)-[:HAS]->(sk:Skill) WHERE sk.name CONTAINS '${skill}' WITH COLLECT(ID(s)) + res AS res `
        });

        data.courses.forEach(course => {
            isQuery = true;
            query += `OPTIONAL MATCH (s:Student)-[:COMPLETED]->(c:Course) WHERE c.name CONTAINS '${course}' WITH COLLECT(ID(s)) + res AS res `
        });

        data.projects.forEach(project => {
            isQuery = true;
            query += `OPTIONAL MATCH (s:Student)-[:HAS_DONE]->(p:Project) WHERE p.name CONTAINS '${project}' WITH COLLECT(ID(s)) + res AS res `
        });

        data.achievements.forEach(achievement => {
            isQuery = true;
            query += `OPTIONAL MATCH (s:Student)-[:HAS_ACHIEVED]->(a:Achievement) WHERE a.title CONTAINS '${achievement}' WITH COLLECT(ID(s)) + res AS res `
        });

        data.researchPapers.forEach(researchPaper => {
            isQuery = true;
            query += `OPTIONAL MATCH (s:Student)-[:PUBLISHED]->(r:ResearchPaper) WHERE r.title CONTAINS '${researchPaper}' WITH COLLECT(ID(s)) + res AS res `
        });

        data.clubs.forEach(club => {
            isQuery = true;
            query += `OPTIONAL MATCH (s:Student)-[:PART_OF]->(c:Club) WHERE c.name CONTAINS '${club}' WITH COLLECT(ID(s)) + res AS res `
        });

        data.interests.forEach(interest => {
            isQuery = true;
            query += `OPTIONAL MATCH (s:Student)-[:INTERESTED_IN]->(i:Interest) WHERE i.name CONTAINS '${interest}' WITH COLLECT(ID(s)) + res AS res `
        });

        data.languages.forEach(language => {
            isQuery = true;
            query += `OPTIONAL MATCH (s:Student)-[:SPEAKS]->(l:Language) WHERE l.name CONTAINS '${language}' WITH COLLECT(ID(s)) + res AS res `
        });

        data.companies.forEach(company => {
            isQuery = true;
            query += `OPTIONAL MATCH (s:Student)-[:WORKED_IN]->(c:Company) WHERE c.name CONTAINS '${company}' WITH COLLECT(ID(s)) + res AS res OPTIONAL MATCH (s:Student)-[:WORKED_IN]->(c:Company) WHERE c.field CONTAINS '${company}' WITH COLLECT(ID(s)) + res AS res `
        })

        query += `RETURN res; `
    }
    var res = await queryNeo4j(query);
    var students = res.map(r => {
            var student = r.records.map(record => {
                return {
                    ...record._fields[0].properties,
                    ...record._fields[1].properties,
                }
            })
            return student[0];
        })
        // console.log("student inside neo", students);
    return isQuery === true ? students : [];
}


async function teacherSearch(data, id) {
    var query = `MATCH (t:Teacher) WITH COLLECT(ID(t)) AS t_filter `;

    var isQuery = false;
    var teacher_filter = false;

    if (data.department.length > 0) {
        isQuery = true;
        teacher_filter = true;
        query += `OPTIONAL MATCH (t:Teacher) WHERE t.department = '${data.department}' AND ID(t) IN t_filter WITH COLLECT(ID(t)) AS t_filter `
    }

    if (teacher_filter) {
        query += 'WITH t_filter AS res, t_filter '

        data.institutes.forEach(institute => {
            query += `OPTIONAL MATCH (t:Teacher)-[:STUDIED_IN]->(i:Institute) WHERE i.name CONTAINS '${institute}' AND ID(t) IN t_filter WITH COLLECT(ID(t)) + res AS res, t_filter `
        });

        data.skills.forEach(skill => {
            query += `OPTIONAL MATCH (t:Teacher)-[:HAS]->(sk:Skill) WHERE sk.name CONTAINS '${skill}' AND ID(t) IN t_filter WITH COLLECT(ID(t)) + res AS res, t_filter `
        });

        data.courses.forEach(course => {
            query += `OPTIONAL MATCH (t:Teacher)-[:COMPLETED]->(c:Course) WHERE c.name CONTAINS '${course}' AND ID(t) IN t_filter WITH COLLECT(ID(t)) + res AS res, t_filter `
        });

        data.projects.forEach(project => {
            query += `OPTIONAL MATCH (t:Teacher)-[:HAS_DONE]->(p:Project) WHERE p.name CONTAINS '${project}' AND ID(t) IN t_filter WITH COLLECT(ID(t)) + res AS res, t_filter `
        });

        data.achievements.forEach(achievement => {
            query += `OPTIONAL MATCH (t:Teacher)-[:HAS_ACHIEVED]->(a:Achievement) WHERE a.title CONTAINS '${achievement}' AND ID(t) IN t_filter WITH COLLECT(ID(t)) + res AS res, t_filter `
        });

        data.researchPapers.forEach(researchPaper => {
            query += `OPTIONAL MATCH (t:Teacher)-[:PUBLISHED]->(r:ResearchPaper) WHERE r.title CONTAINS '${researchPaper}' AND ID(t) IN t_filter WITH COLLECT(ID(t)) + res AS res, t_filter `
        });

        data.interests.forEach(interest => {
            query += `OPTIONAL MATCH (t:Teacher)-[:INTERESTED_IN]->(i:Interest) WHERE i.name CONTAINS '${interest}' AND ID(t) IN t_filter WITH COLLECT(ID(t)) + res AS res, t_filter `
        });

        data.languages.forEach(language => {
            query += `OPTIONAL MATCH (t:Teacher)-[:SPEAKS]->(l:Language) WHERE l.name CONTAINS '${language}' AND ID(t) IN t_filter WITH COLLECT(ID(t)) + res AS res, t_filter `
        });

        data.companies.forEach(company => {
            query += `OPTIONAL MATCH (t:Teacher)-[:WORKED_IN]->(c:Company) WHERE c.name CONTAINS '${company}' AND ID(t) IN t_filter WITH COLLECT(ID(t)) + res AS res, t_filter OPTIONAL MATCH (t:Teacher)-[:WORKED_IN]->(c:Company) WHERE c.field CONTAINS '${company}' AND ID(t) IN t_filter WITH COLLECT(ID(t)) + res AS res, t_filter `
        })

        query += `RETURN res; `

    } else {
        query = `WITH [] AS res `

        data.institutes.forEach(institute => {
            isQuery = true;
            query += `OPTIONAL MATCH (t:Teacher)-[:STUDIED_IN]->(i:Institute) WHERE i.name CONTAINS '${institute}' WITH COLLECT(ID(t)) + res AS res `
        });

        data.skills.forEach(skill => {
            isQuery = true;
            query += `OPTIONAL MATCH (t:Teacher)-[:HAS]->(sk:Skill) WHERE sk.name CONTAINS '${skill}' WITH COLLECT(ID(t)) + res AS res `
        });

        data.courses.forEach(course => {
            isQuery = true;
            query += `OPTIONAL MATCH (t:Teacher)-[:COMPLETED]->(c:Course) WHERE c.name CONTAINS '${course}' WITH COLLECT(ID(t)) + res AS res `
        });

        data.projects.forEach(project => {
            isQuery = true;
            query += `OPTIONAL MATCH (t:Teacher)-[:HAS_DONE]->(p:Project) WHERE p.name CONTAINS '${project}' WITH COLLECT(ID(t)) + res AS res `
        });

        data.achievements.forEach(achievement => {
            isQuery = true;
            query += `OPTIONAL MATCH (t:Teacher)-[:HAS_ACHIEVED]->(a:Achievement) WHERE a.title CONTAINS '${achievement}' WITH COLLECT(ID(t)) + res AS res `
        });

        data.researchPapers.forEach(researchPaper => {
            isQuery = true;
            query += `OPTIONAL MATCH (t:Teacher)-[:PUBLISHED]->(r:ResearchPaper) WHERE r.title CONTAINS '${researchPaper}' WITH COLLECT(ID(t)) + res AS res `
        });

        data.interests.forEach(interest => {
            isQuery = true;
            query += `OPTIONAL MATCH (t:Teacher)-[:INTERESTED_IN]->(i:Interest) WHERE i.name CONTAINS '${interest}' WITH COLLECT(ID(t)) + res AS res `
        });

        data.languages.forEach(language => {
            isQuery = true;
            query += `OPTIONAL MATCH (t:Teacher)-[:SPEAKS]->(l:Language) WHERE l.name CONTAINS '${language}' WITH COLLECT(ID(t)) + res AS res `
        });

        data.companies.forEach(company => {
            isQuery = true;
            query += `OPTIONAL MATCH (t:Teacher)-[:WORKED_IN]->(c:Company) WHERE c.name CONTAINS '${company}' WITH COLLECT(ID(t)) + res AS res OPTIONAL MATCH (t:Teacher)-[:WORKED_IN]->(c:Company) WHERE c.field CONTAINS '${company}' WITH COLLECT(ID(t)) + res AS res `
        })

        query += `RETURN res; `
    }
    var res = await queryNeo4j(query);
    var teachers = res.map(r => {
            var teacher = r.records.map(record => {
                return {
                    ...record._fields[0].properties,
                    ...record._fields[1].properties,
                }
            })
            return teacher[0];
        })
        // console.log("student inside neo", students);
    return isQuery === true ? teachers : [];
}


async function alumniSearch(data, id) {
    var query = `MATCH (s:Student) WHERE s.currentlyStudying = false WITH COLLECT(ID(s)) AS s_filter `;

    var isQuery = false;

    if (data.department.length > 0) {
        isQuery = true;
        query += `OPTIONAL MATCH (s:Student) WHERE s.department = '${data.department}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) AS s_filter `
    }
    if (parseInt(data.year) < 2021) {
        isQuery = true;
        query += `OPTIONAL MATCH (s:Student)-[studiedIn:STUDIED_IN]->(:Institute) WHERE studiedIn.endDate = '${data.year}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) AS s_filter `
    }

    query += `WITH s_filter AS res, s_filter `

    data.institutes.forEach(institute => {
        isQuery = true;
        query += `OPTIONAL MATCH (s:Student)-[:STUDIED_IN]->(i:Institute) WHERE i.name CONTAINS '${institute}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) + res AS res, s_filter `
    });

    data.skills.forEach(skill => {
        isQuery = true;
        query += `OPTIONAL MATCH (s:Student)-[:HAS]->(sk:Skill) WHERE sk.name CONTAINS '${skill}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) + res AS res, s_filter `
    });

    data.courses.forEach(course => {
        isQuery = true;
        query += `OPTIONAL MATCH (s:Student)-[:COMPLETED]->(c:Course) WHERE c.name CONTAINS '${course}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) + res AS res, s_filter `
    });

    data.projects.forEach(project => {
        isQuery = true;
        query += `OPTIONAL MATCH (s:Student)-[:HAS_DONE]->(p:Project) WHERE p.name CONTAINS '${project}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) + res AS res, s_filter `
    });

    data.achievements.forEach(achievement => {
        isQuery = true;
        query += `OPTIONAL MATCH (s:Student)-[:HAS_ACHIEVED]->(a:Achievement) WHERE a.title CONTAINS '${achievement}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) + res AS res, s_filter `
    });

    data.researchPapers.forEach(researchPaper => {
        isQuery = true;
        query += `OPTIONAL MATCH (s:Student)-[:PUBLISHED]->(r:ResearchPaper) WHERE r.title CONTAINS '${researchPaper}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) + res AS res, s_filter `
    });

    data.clubs.forEach(club => {
        isQuery = true;
        query += `OPTIONAL MATCH (s:Student)-[:PART_OF]->(c:Club) WHERE c.name CONTAINS '${club}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) + res AS res, s_filter `
    });

    data.interests.forEach(interest => {
        isQuery = true;
        query += `OPTIONAL MATCH (s:Student)-[:INTERESTED_IN]->(i:Interest) WHERE i.name CONTAINS '${interest}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) + res AS res, s_filter `
    });

    data.languages.forEach(language => {
        isQuery = true;
        query += `OPTIONAL MATCH (s:Student)-[:SPEAKS]->(l:Language) WHERE l.name CONTAINS '${language}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) + res AS res, s_filter `
    });

    data.companies.forEach(company => {
        isQuery = true;
        query += `OPTIONAL MATCH (s:Student)-[:WORKED_IN]->(c:Company) WHERE c.name CONTAINS '${company}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) + res AS res, s_filter OPTIONAL MATCH (s:Student)-[:WORKED_IN]->(c:Company) WHERE c.field CONTAINS '${company}' AND ID(s) IN s_filter WITH COLLECT(ID(s)) + res AS res, s_filter `
    })

    query += `RETURN res; `

    var res = await queryNeo4j(query);
    var students = res.map(r => {
        var student = r.records.map(record => {
            return {
                ...record._fields[0].properties,
                ...record._fields[1].properties,
            }
        })
        return student[0];
    })
    console.log("student inside neo", students);
    return isQuery === true ? students : [];
}

async function similarStudentSuggestion(data, id) {
    var query = `WITH [] AS res `;
    var isQuery = false;

    if (data.isSkill) {
        isQuery = true;
        query += `OPTIONAL MATCH (s1:Student)-[:HAS]->(sk:Skill)<-[:HAS]-(s2:Student) WHERE ID(s1) = ${id} WITH COLLECT(ID(s2)) + res AS res `
    }

    if (data.isCourse) {
        isQuery = true;
        query += `OPTIONAL MATCH (s1:Student)-[:COMPLETED]->(c:Course)<-[:COMPLETED]-(s2:Student) WHERE ID(s1) = ${id} WITH COLLECT(ID(s2)) + res AS res `;
    }

    if (data.isProject) {
        isQuery = true;
        query += `OPTIONAL MATCH (s1:Student)-[:HAS_DONE]->(p:Project)<-[:HAS_DONE]-(s2:Student) WHERE ID(s1) = ${id} WITH COLLECT(ID(s2)) + res AS res `;
    }

    if (data.isClub) {
        isQuery = true;
        query += `OPTIONAL MATCH (s1:Student)-[:PART_OF]->(c:Club)<-[:PART_OF]-(s2:Student) WHERE ID(s1) = ${id} WITH COLLECT(ID(s2)) + res AS res `;
    }

    if (data.isAchievement) {
        isQuery = true;
        query += `OPTIONAL MATCH (s1:Student)-[:HAS_ACHIEVED]->(a:Achievement)<-[:HAS_ACHIEVED]-(s2:Student) WHERE ID(s1) = ${id} WITH COLLECT(ID(s2)) + res AS res `;
    }

    if (data.isLanguage) {
        isQuery = true;
        query += `OPTIONAL MATCH (s1:Student)-[:SPEAKS]->(l:Language)<-[:SPEAKS]-(s2:Student) WHERE ID(s1) = ${id} WITH COLLECT(ID(s2)) + res AS res `;
    }

    if (data.isInterest) {
        isQuery = true;
        query += `OPTIONAL MATCH (s1:Student)-[:INTERESTED_IN]->(i:Interest)<-[:INTERESTED_IN]-(s2:Student) WHERE ID(s1) = ${id} WITH COLLECT(ID(s2)) + res AS res `;
    }

    if (data.isCompany) {
        isQuery = true;
        query += `OPTIONAL MATCH (s1:Student)-[:WORKED_IN]->(c:Company)<-[:WORKED_IN]-(s2:Student) WHERE ID(s1) = ${id} WITH COLLECT(ID(s2)) + res AS res `;
    }
    query += `RETURN res;`
    var res = await queryNeo4j(query);
    var students = res.map(r => {
        var student = r.records.map(record => {
            return {
                ...record._fields[0].properties,
                ...record._fields[1].properties,
            }
        })
        return student[0];
    })
    console.log("student inside neo", students);
    return isQuery === true ? students.slice(0, 50) : [];
}

async function queryNeo4j(query) {
    try {
        const session = driver.session();
        var searchResult = [];
        var readTxResultPromise = await session.readTransaction(async txc => {
            var result = await txc.run(query);

            var arrayOfIds = result.records[0]._fields[0];
            console.log('arrOfId', arrayOfIds);
            var cnts = arrayOfIds.reduce((obj, val) => {
                obj[val] = (obj[val] || 0) + 1;
                return obj;
            }, {});

            var sortedArrayOfIds = Object.keys(cnts).sort(function(a, b) {
                return cnts[b] - cnts[a];
            });

            searchResult = await Promise.all(sortedArrayOfIds.map(async id => {
                let res = await txc.run(`MATCH (n)-[:LIVES_IN]-(l) WHERE ID(n) = ${id} RETURN n, l; `);
                return res;
            }));

        });
        session.close();

        return searchResult;

    } catch (err) {
        console.log(err);
    }
}

async function studentAttributeSuggestion(data, id) {
    var session = driver.session();
    var res = {};
    var readTxResultPromise = await session.readTransaction(async txc => {
        if (data.attribute === 'skill') {
            var queryForSkill = `MATCH (s1:Student)-[:HAS]->(sk1:Skill)<-[:HAS]-(s2:Student)-[:HAS]->(sk2:Skill) WHERE ID(s1) = ${id} AND NOT EXISTS((s1)-[:HAS]->(sk2)) RETURN sk2, COUNT(s2) AS count ORDER BY count DESC LIMIT 30;`;
            var skillSuggestion = await txc.run(queryForSkill);
            
            res.name = skillSuggestion.records.map(record => {
                return record._fields[0].properties.name;
            })
            res.attribute = 'Skill you should work on.';
            console.log("skill search",res);
        }
        
        if (data.attribute === 'course') {
            var queryForCourse = `MATCH (s1:Student)-[:COMPLETED]->(c1:Course)<-[:COMPLETED]-(s2:Student)-[:COMPLETED]->(c2:Course) WHERE ID(s1) = ${id} AND NOT EXISTS((s1)-[:COMPLETED]->(c2)) RETURN c2, COUNT(s2) AS count ORDER BY count DESC LIMIT 30;`
            var courseSuggestion = await txc.run(queryForCourse);
            
            res.name = courseSuggestion.records.map(record => {
                return record._fields[0].properties.name
            })
            res.attribute = 'Courses you should take next.'
        }
        if (data.attribute === 'project') {
            var queryForProject = `MATCH (s1:Student)-[:HAS_DONE]->(p1:Project)<-[:HAS_DONE]-(s2:Student)-[:HAS_DONE]->(p2:Project) WHERE ID(s1) = ${id} AND NOT EXISTS((s1)-[:HAS_DONE]->(p2)) RETURN p2, COUNT(s2) AS count ORDER BY count DESC LIMIT 30;`
            var projectSuggestion = await txc.run(queryForProject);
            res.name = projectSuggestion.records.map(record => {
                return record._fields[0].properties.name
            })
            res.attribute = 'Projects can you work on.'
        }
        if (data.attribute === 'achievement') {
            var queryForAchievement = `MATCH (s1:Student)-[:HAS_ACHIEVED]->(a1:Achievement)<-[:HAS_ACHIEVED]-(s2:Student)-[:HAS_ACHIEVED]->(a2:Achievement) WHERE ID(s1) = ${id} AND NOT EXISTS((s1)-[:HAS_ACHIEVED]->(a2)) RETURN a2, COUNT(s2) AS count ORDER BY count DESC LIMIT 30;`
            var achievementSuggestion = await txc.run(queryForAchievement);
            res.name = achievementSuggestion.records.map(record => {
                return record._fields[0].properties.title
            })
            res.attribute = 'Achievements you can aim for.'
        }
        if (data.attribute === 'club') {
            var queryForClub = `MATCH (s1:Student)-[:PART_OF]->(c1:Club)<-[:PART_OF]-(s2:Student)-[:PART_OF]->(c2:Club) WHERE ID(s1) = ${id} AND NOT EXISTS((s1)-[:PART_OF]->(c2)) RETURN c2, COUNT(s2) AS count ORDER BY count DESC LIMIT 30;`
            var clubSuggestion = await txc.run(queryForClub);
            res.name = clubSuggestion.records.map(record => {
                return record._fields[0].properties.name
        
            })
            res.attribute = 'Club you can be a part of.'
        }
        if (data.attribute === 'company') {
            var queryForCompany = `MATCH (s1:Student)-[:WORKED_IN]->(c1:Company)<-[:WORKED_IN]-(s2:Student)-[:WORKED_IN]->(c2:Company) WHERE ID(s1) = ${id} AND NOT EXISTS((s1)-[:WORKED_IN]->(c2)) RETURN c2, COUNT(s2) AS count ORDER BY count DESC LIMIT 30;`
            var companySuggestion = await txc.run(queryForCompany);
            res.name == companySuggestion.records.map(record => {
                return record._fields[0].properties.name
                
            })
            res.attribute = 'Companies that you can apply for.'
        }
    });
    session.close();
    return res;
}


module.exports = {
    studentSearch: studentSearch,
    teacherSearch: teacherSearch,
    alumniSearch: alumniSearch,
    similarStudentSuggestion: similarStudentSuggestion,
    studentAttributeSuggestion: studentAttributeSuggestion,
}