const driver = require('../../config/db');
const fs = require('fs');
const faker = require('faker');
const bcrypt = require('bcryptjs');

try {
    fs.readdir('../../DATA/Students/', async(err, files) => {
        if (err) {
            console.error("Could not list the directory.", err);
            process.exit(1);
        }

        let session = driver.session();
        var dbConstraints = await session.writeTransaction(async txc => {
            var existsStudentName = await txc.run('CREATE CONSTRAINT exists_student_name IF NOT EXISTS ON (s:Student) ASSERT EXISTS (s.name)')
            var existsStudentEmail = await txc.run('CREATE CONSTRAINT exists_student_email IF NOT EXISTS ON (s:Student) ASSERT EXISTS (s.email)')
            var existsStudentPassword = await txc.run('CREATE CONSTRAINT exists_student_password IF NOT EXISTS ON (s:Student) ASSERT EXISTS (s.password)')
            var existsInstituteName = await txc.run('CREATE CONSTRAINT exists_institute_name IF NOT EXISTS ON (i:Institute) ASSERT EXISTS (i.name)')
            var existsSkillName = await txc.run('CREATE CONSTRAINT exists_skill_name IF NOT EXISTS ON (s:Skill) ASSERT EXISTS (s.name)')
            var existsCourseName = await txc.run('CREATE CONSTRAINT exists_course_name IF NOT EXISTS ON (c:Course) ASSERT EXISTS (c.name)')
            var existsSubjectName = await txc.run('CREATE CONSTRAINT exists_subject_name IF NOT EXISTS ON (s:Subject) ASSERT EXISTS (s.name)')
            var existsInterestName = await txc.run('CREATE CONSTRAINT exists_interest_name IF NOT EXISTS ON (i:Interest) ASSERT EXISTS (i.name)')
            var existsLanguageName = await txc.run('CREATE CONSTRAINT exists_language_name IF NOT EXISTS ON (l:Language) ASSERT EXISTS (l.name)')
            var existsClubName = await txc.run('CREATE CONSTRAINT exists_club_name IF NOT EXISTS ON (c:Club) ASSERT EXISTS (c.name)')
            var existsAchievementTitle = await txc.run('CREATE CONSTRAINT exists_achievement_title IF NOT EXISTS ON (a:Achievement) ASSERT EXISTS (a.title)')
            var existsProjectName = await txc.run('CREATE CONSTRAINT exists_project_name IF NOT EXISTS ON (p:Project) ASSERT EXISTS (p.name)')
            var existsResearchPaperTitle = await txc.run('CREATE CONSTRAINT exists_researchPaper_title IF NOT EXISTS ON (r:ResearchPaper) ASSERT EXISTS (r.title)')
            var existsCompanyName = await txc.run('CREATE CONSTRAINT exists_company_name IF NOT EXISTS ON (c:Company) ASSERT EXISTS (c.name)')
            var uniqueStudentEmail = await txc.run('CREATE CONSTRAINT unique_student_email IF NOT EXISTS ON (s:Student) ASSERT s.email IS UNIQUE');
            var uniqueStudentPhone = await txc.run('CREATE CONSTRAINT unique_student_phone IF NOT EXISTS ON (s:Student) ASSERT s.phone IS UNIQUE');
        });
        session.close();

        for (var i = 0; i < files.length; i++) {
            var res = await create_db(files[i]);
            console.log(i);
        }

        var cleanUp = await cleanUpQueries();
        console.log("Clean up done");
        driver.close();
    });

} catch (err) {
    console.log(err);
}

async function cleanUpQueries() {
    let session = driver.session();
    var cleanUp = await session.writeTransaction(async txc => {
        var comp = `MATCH(s:Student) WHERE s.department CONTAINS "Comp" OR s.department CONTAINS "comp" SET s.department = "Computer Engineering";`
        var it = `MATCH(s:Student) WHERE s.department CONTAINS "IT" OR s.department CONTAINS "I T" OR s.department CONTAINS "It" OR s.department CONTAINS "Information technology" SET s.department = "Information Technology";`
        var production = `MATCH(s:Student) WHERE s.department CONTAINS "Prod" OR s.department CONTAINS "prod" SET s.department = "Production Engineering";`
        var textile = `MATCH(s:Student) WHERE s.department CONTAINS "Textile" OR s.department CONTAINS "textile" SET s.department = "Textile Engineering";`
        var extc = `MATCH(s:Student) WHERE s.department CONTAINS "Communications" OR s.department CONTAINS "Telecommunications" OR s.department CONTAINS "Telecommunication" OR s.department CONTAINS "telecommunication" OR s.department CONTAINS "Communication" OR s.department CONTAINS "Extc" OR s.department CONTAINS "EXTC" OR s.department CONTAINS "electronics and telecom engineering" SET s.department = "Electronics and Telecommunications Engineering";`
        var electrical = `MATCH(s:Student) WHERE s.department CONTAINS "Electrical Engineering" OR s.department CONTAINS "Electrical engineering" OR s.department CONTAINS "Electrical and Electronics Engineering" OR s.department CONTAINS "Electrical Engineering Technologies/Technicians" OR s.department CONTAINS "Industrial Electronics Technology/Technician" OR s.department CONTAINS "Electronics Engineering" OR s.department CONTAINS "electrical engineering" OR s.department CONTAINS "Electronics" OR s.department CONTAINS "Electonics" OR s.department CONTAINS "Electrical" OR s.department CONTAINS "Mobile Sensing and Robotics" OR s.department CONTAINS "Electrical Power System" OR s.department CONTAINS "electronics" OR s.department CONTAINS "electrical" OR s.department CONTAINS "electronics engineering" OR s.department CONTAINS "Electrical Engineering - Control System" OR s.department CONTAINS "electrical" SET s.department = "Electrical Engineering";`
        var res = txc.run(comp);
        var res = txc.run(it);
        var res = txc.run(production);
        var res = txc.run(textile);
        var res = txc.run(extc);
        var res = txc.run(electrical);
    });
    session.close();
    return cleanUp;
}
async function create_db(file_name) {
    let session = driver.session();

    //parsing data of each file as json object
    var obj = JSON.parse(fs.readFileSync('../../DATA/Students/' + file_name, 'utf8'));

    //formatting data for neo4j queries

    //array for randomisng domain name for the email ids
    let domainName = ['@yahoo.com', '@gmail.com', '@rediffmail.com', '@outlook.com'];
    let age = '',
        dept = '',
        password = 'password',
        hashed_password = '';

    if (obj.experiences.education.length > 0) {
        if (obj.experiences.education[0].date_range !== null) {
            age = 2020 - parseInt(obj.experiences.education[0].date_range.split(" \u2013 ")[0]) + 18;
        }
        dept = obj.experiences.education[0].field_of_study === null ? '' : obj.experiences.education[0].field_of_study;
    }

    hashed_password = await bcrypt.hash(password, 10);

    var studentData = {
        studentData_name: obj.personal_info.name,
        studentData_age: age,
        studentData_email: obj.personal_info.name.split(" ")[0].toLowerCase() + '_' + obj.personal_info.name.split(" ")[1].toLowerCase() + domainName[Math.floor(Math.random() * domainName.length)],
        studentData_password: hashed_password,
        studentData_phone: faker.phone.phoneNumber('9########'),
        studentData_currentlyStudying: obj.currently_studying,
        studentData_department: dept,
        studentData_semester: Object.keys(obj.current_courses).length === 0 ? '' : (Object.keys(obj.completed_college_courses).length + 1).toString(),
        studentData_class: obj.class_name === undefined ? '' : obj.class_name,
        studentData_isAlumni: Object.keys(obj.current_courses).length === 0,
    };

    var studentLocation = {
        studentLocation_latitude: obj.latitude,
        studentLocation_longitude: obj.longitude,
        studentLocation_address: obj.fake_address,
        // studentLocation_city: ,
        // studentLocation_postalCode: ,
        // studentLocation_state: ,
        // studentLocation_country: 
    };

    //institutes
    var institutes = obj.experiences.education.map(institute => {
        return {
            institute_name: institute.name,
            institute_degree: institute.degree === null ? '' : institute.degree,
        }
    });

    //instituteLocation
    var instituteLocations = obj.experiences.education.map(institute => {

        let instituteLocation = {
            instituteLocation_latitude: institute.latitude,
            instituteLocation_longitude: institute.longitude,
            instituteLocation_address: institute.fake_address,
            // instituteLocation_district:,
            // instituteLocation_postalCode:,
            // instituteLocation_city:,
            // instituteLocation_state:,
            // instituteLocation_country:
        };
        return instituteLocation;
    });


    //subjects --format {name: , credits: , sem:}
    var completedSubjects = [];
    Object.entries(obj.completed_college_courses).map(entry => {
        let key = entry[0];
        let value = entry[1];
        let valueWithSem = value.map(val => {
            val.sem = parseInt(key.charAt(3)); //sem number
            return val;
        })
        completedSubjects = completedSubjects.concat(valueWithSem);
    });

    var enrolledSubjects = [];
    Object.entries(obj.current_courses).map(entry => {
        let key = entry[0];
        let value = entry[1];
        let valueWithSem = value.map(val => {
            val.sem = parseInt(key.charAt(3)); //sem number
            return val;
        })
        enrolledSubjects = enrolledSubjects.concat(valueWithSem);
    });

    //skills
    var skills = obj.skills.map(skill => {
        return {
            skill_name: skill.name
        }
    })

    //courses
    var courses = obj.accomplishments.courses.map(course => {
        return {
            course_name: course,
        }
    });

    //interests
    var interests = obj.interests.map(interest => {
        return {
            interest_name: interest,
        }
    });

    //clubs -in volunteering and organization
    var clubs1 = obj.experiences.volunteering.map(volunteer => {
        return {
            club_name: volunteer.company,
        }
    });
    var clubs2 = obj.accomplishments.organizations.map(organization => {
        return {
            club_name: organization,
        }
    });
    var clubs = [...clubs1, ...clubs2];

    //projects
    var projects = obj.accomplishments.projects.map(project => {
        return {
            project_name: project,
            project_description: ''
        }
    });

    //languages
    var languages = obj.accomplishments.languages.map(language => {
        return {
            language_name: language,
        }
    });

    //Achievements
    var achievements = obj.accomplishments.honors.map(honor => {
        return {
            achievement_title: honor,
            achievement_description: '',
        }
    });

    //ResearchPapers
    var researchPapers = obj.accomplishments.publications.map(publication => {
        return {
            researchPaper_title: publication,
            researchPaper_description: '',
        }
    });

    //Companies
    var companies = obj.experiences.jobs.map(job => {
        return {
            company_name: job.company.split("\n")[0],
            company_field: job.description === null ? '' : job.description,
            company_website: job.li_company_url === null ? '' : job.li_company_url,
        }
    });

    //companyLocation
    var companyLocations = obj.experiences.jobs.map(job => {

        let companyLocation = {
            companyLocation_latitude: job.latitude,
            companyLocation_longitude: job.longitude,
            companyLocation_address: job.fake_address,
            // companyLocation_district:,
            // companyLocation_postalCode:,
            // companyLocation_city:,
            // companyLocation_state:,
            // companyLocation_country:
        };
        return companyLocation;
    });

    //relationship data --'rel' prefix

    //institute studied in
    var relStudiedIn = obj.experiences.education.map(studiedIn => {
        let score = (Math.random() * (10 - 7) + 7).toFixed(2);
        let res = {
            relStudiedIn_startDate: '',
            relStudiedIn_endDate: '',
            relStudiedIn_score: studiedIn.grades === null ? '' : score,
        }
        if (studiedIn.date_range !== null) {
            let date = studiedIn.date_range.split(" \u2013 ");
            res.relStudiedIn_startDate = date[0] === undefined ? '' : date[0];
            res.relStudiedIn_endDate = date[1] === undefined ? '' : date[1];
        }
        return res;
    });

    //enrolled in a subject (current subject) --no properties
    //completed a subject (past subject) --no properties


    //part of club
    var relPartOfClub1 = obj.experiences.volunteering.map(volunteer => {
        let res = {
            relPartOfClub_startDate: '',
            relPartOfClub_endDate: '',
            relPartOfClub_position: volunteer.title === null ? '' : volunteer.title,
        }
        if (volunteer.date_range !== null) {
            let date = volunteer.date_range.split(" \u2013 ");
            res.relPartOfClub_startDate = date[0] === undefined ? '' : date[0];
            res.relPartOfClub_endDate = date[1] === undefined ? '' : date[1];
        }
        return res;
    });
    var relPartOfClub2 = obj.accomplishments.organizations.map(organization => {
        let res = {
            relPartOfClub_startDate: '',
            relPartOfClub_endDate: '',
            relPartOfClub_position: 'Intern',
        }
        return res;
    });
    var relPartOfClub = [...relPartOfClub1, ...relPartOfClub2];

    //worked in company
    var relWorkedInCompany = obj.experiences.jobs.map(job => {
        let res = {
            workedInCompany_startDate: '',
            workedInCompany_endDate: '',
            workedInCompany_position: job.title === null ? '' : job.title,
        }
        if (job.date_range !== null) {
            let date = job.date_range.split(" \u2013 ");
            res.workedInCompany_startDate = date[0] === undefined ? '' : date[0];
            res.workedInCompany_endDate = date[1] === undefined ? '' : date[1];
        }
        return res;
    });


    //library
    var books_names = [];
    obj.books_read.map(book => {
        books_names.push(book.title);
    })

    var author_names_set = new Set();
    obj.books_read.map(book => {
        author_names_set.add(book.title);
    })
    var author_names = [...author_names_set];

    var category_names_set = new Set();
    obj.books_read.map(book => {
        book.category.map(cateogry_name => {
            category_names_set.add(cateogry_name);
        });
    })
    var category_names = [...category_names_set];



    var writeTxResultPromise = await session.writeTransaction(async txc => {

        var studentLivesInLocationData = {
            ...studentData,
            ...studentLocation,
        }
        var studentLivesInLocation = await txc.run('MERGE (s:Student { name : $studentData_name, age : $studentData_age, email : $studentData_email, password : $studentData_password, phone : $studentData_phone, currentlyStudying : $studentData_currentlyStudying, department : $studentData_department, semester : $studentData_semester, isAlumni : $studentData_isAlumni, class : $studentData_class}) MERGE (l:Location { latitude : $studentLocation_latitude, longitude : $studentLocation_longitude, address : $studentLocation_address}) MERGE (s) - [:LIVES_IN] -> (l);', studentLivesInLocationData);

        for (var j = 0; j < institutes.length; j++) {
            var studentStudiedInInstituteData = {
                ...studentData,
                ...institutes[j],
                ...relStudiedIn[j]
            }

            var studentStudiedInInstitute = await txc.run('MATCH (s:Student { name : $studentData_name, age : $studentData_age, email : $studentData_email, password : $studentData_password, phone : $studentData_phone, currentlyStudying : $studentData_currentlyStudying, department : $studentData_department, semester : $studentData_semester, isAlumni : $studentData_isAlumni, class : $studentData_class}) MERGE (i:Institute { name : $institute_name, degree : $institute_degree } ) MERGE (s) - [:STUDIED_IN { startDate : $relStudiedIn_startDate, endDate : $relStudiedIn_endDate, score : $relStudiedIn_score }] -> (i);', studentStudiedInInstituteData);
        };

        for (var j = 0; j < institutes.length; j++) {
            var instituteLocatedInLocationData = {
                ...institutes[j],
                ...instituteLocations[j],
            };
            var instituteLocatedInLocation = await txc.run('MATCH (i:Institute { name : $institute_name, degree : $institute_degree }) MERGE (l:Location { latitude : $instituteLocation_latitude, longitude : $instituteLocation_longitude, address : $instituteLocation_address}) MERGE (i) - [:LOCATED_IN] -> (l);', instituteLocatedInLocationData)
        }

        completedSubjects.map(async completedSubject => {
            var studentCompletedSubjectData = {
                ...studentData,
                ...completedSubject,
            }
            var studentCompletedSubject = await txc.run('MATCH (s:Student { name : $studentData_name, age : $studentData_age, email : $studentData_email, password : $studentData_password, phone : $studentData_phone, currentlyStudying : $studentData_currentlyStudying, department : $studentData_department, semester : $studentData_semester, isAlumni : $studentData_isAlumni, class : $studentData_class}) MERGE (sub:Subject { name : $name, credits : $credits, sem : $sem}) MERGE (s) - [:COMPLETED] -> (sub);', studentCompletedSubjectData);
        });

        enrolledSubjects.map(async enrolledSubject => {
            var studentEnrolledSubjectData = {
                ...studentData,
                ...enrolledSubject,
            }
            var studentEnrolledSubject = await txc.run('MATCH (s:Student { name : $studentData_name, age : $studentData_age, email : $studentData_email, password : $studentData_password, phone : $studentData_phone, currentlyStudying : $studentData_currentlyStudying, department : $studentData_department, semester : $studentData_semester, isAlumni : $studentData_isAlumni, class : $studentData_class}) MERGE (sub:Subject { name : $name, credits : $credits, sem : $sem}) MERGE (s) - [:ENROLLED] -> (sub);', studentEnrolledSubjectData);
        });

        skills.map(async skill => {
            var studentHasSkillData = {
                ...studentData,
                ...skill,
            }
            var studentHasSkill = await txc.run('MATCH (s:Student { name : $studentData_name, age : $studentData_age, email : $studentData_email, password : $studentData_password, phone : $studentData_phone, currentlyStudying : $studentData_currentlyStudying, department : $studentData_department, semester : $studentData_semester, isAlumni : $studentData_isAlumni, class : $studentData_class}) MERGE (sk:Skill { name : $skill_name}) MERGE (s) - [:HAS] -> (sk);', studentHasSkillData);
        });

        courses.map(async course => {
            var studentCompletedCourseData = {
                ...studentData,
                ...course,
            }
            var studentCompletedCourse = await txc.run('MATCH (s:Student { name : $studentData_name, age : $studentData_age, email : $studentData_email, password : $studentData_password, phone : $studentData_phone, currentlyStudying : $studentData_currentlyStudying, department : $studentData_department, semester : $studentData_semester, isAlumni : $studentData_isAlumni, class : $studentData_class}) MERGE (c:Course { name : $course_name}) MERGE (s) - [:COMPLETED] -> (c);', studentCompletedCourseData);
        });

        interests.map(async interest => {
            var studentHasInterestData = {
                ...studentData,
                ...interest,
            }
            var studentHasInterest = await txc.run('MATCH (s:Student { name : $studentData_name, age : $studentData_age, email : $studentData_email, password : $studentData_password, phone : $studentData_phone, currentlyStudying : $studentData_currentlyStudying, department : $studentData_department, semester : $studentData_semester, isAlumni : $studentData_isAlumni, class : $studentData_class}) MERGE (i:Interest { name : $interest_name}) MERGE (s) - [:INTERESTED_IN] -> (i);', studentHasInterestData);
        });

        languages.map(async language => {
            var studentSpeakslanguageData = {
                ...studentData,
                ...language,
            };
            var studentSpeakslanguage = await txc.run('MATCH (s:Student { name : $studentData_name, age : $studentData_age, email : $studentData_email, password : $studentData_password, phone : $studentData_phone, currentlyStudying : $studentData_currentlyStudying, department : $studentData_department, semester : $studentData_semester, isAlumni : $studentData_isAlumni, class : $studentData_class}) MERGE (l:Language { name : $language_name}) MERGE (s) - [:SPEAKS] -> (l);', studentSpeakslanguageData);
        });

        achievements.map(async achievement => {
            var studentHasAchievedAchievementData = {
                ...studentData,
                ...achievement,
            };
            var studentHasAchievedAchievement = await txc.run('MATCH (s:Student { name : $studentData_name, age : $studentData_age, email : $studentData_email, password : $studentData_password, phone : $studentData_phone, currentlyStudying : $studentData_currentlyStudying, department : $studentData_department, semester : $studentData_semester, isAlumni : $studentData_isAlumni, class : $studentData_class}) MERGE (a:Achievement { title : $achievement_title, description : $achievement_description}) MERGE (s) - [:HAS_ACHIEVED] -> (r);', studentHasAchievedAchievementData)
        });

        researchPapers.map(async researchPaper => {
            var studentPublishedResearchPaperData = {
                ...studentData,
                ...researchPaper,
            };
            var studentPublishedResearchPaper = await txc.run('MATCH (s:Student { name : $studentData_name, age : $studentData_age, email : $studentData_email, password : $studentData_password, phone : $studentData_phone, currentlyStudying : $studentData_currentlyStudying, department : $studentData_department, semester : $studentData_semester, isAlumni : $studentData_isAlumni, class : $studentData_class}) MERGE (r:ResearchPaper {title : $researchPaper_title, description : $researchPaper_description}) MERGE (s) - [:PUBLISHED] -> (r);', studentPublishedResearchPaperData)
        });

        projects.map(async project => {
            var studentHasDoneProjectData = {
                ...studentData,
                ...project,
            };
            var studentHasDoneProject = await txc.run('MATCH (s:Student { name : $studentData_name, age : $studentData_age, email : $studentData_email, password : $studentData_password, phone : $studentData_phone, currentlyStudying : $studentData_currentlyStudying, department : $studentData_department, semester : $studentData_semester, isAlumni : $studentData_isAlumni, class : $studentData_class}) MERGE (p:Project { name : $project_name, description : $project_description}) MERGE (s) - [:HAS_DONE] -> (p);', studentHasDoneProjectData)
        });

        for (var j = 0; j < clubs.length; j++) {
            var studentPartOfClubData = {
                ...studentData,
                ...clubs[j],
                ...relPartOfClub[j],
            };
            var studentPartOfClub = await txc.run('MERGE (s:Student { name : $studentData_name, age : $studentData_age, email : $studentData_email, password : $studentData_password, phone : $studentData_phone, currentlyStudying : $studentData_currentlyStudying, department : $studentData_department}) MERGE (c:Club { name : $club_name}) MERGE (s) - [:PART_OF { startDate : $relPartOfClub_startDate, endDate : $relPartOfClub_endDate, position : $relPartOfClub_position }] -> (c);', studentPartOfClubData);
        }

        for (var j = 0; j < companies.length; j++) {
            var studentWorkedInCompanyData = {
                ...studentData,
                ...companies[j],
                ...relWorkedInCompany[j],
            };
            var studentWorkedInCompany = await txc.run('MATCH (s:Student { name : $studentData_name, age : $studentData_age, email : $studentData_email, password : $studentData_password, phone : $studentData_phone, currentlyStudying : $studentData_currentlyStudying, department : $studentData_department, semester : $studentData_semester, isAlumni : $studentData_isAlumni, class : $studentData_class}) MERGE (c:Company { name : $company_name, field : $company_field, website : $company_website}) MERGE (s) - [:WORKED_IN { startDate : $workedInCompany_startDate , endDate : $workedInCompany_endDate, position : $workedInCompany_position }] -> (c);', studentWorkedInCompanyData);
        }

        for (var j = 0; j < companies.length; j++) {
            var companyLocatedInLocationData = {
                ...companies[j],
                ...companyLocations[j],
            };
            var companyLocatedInLocation = await txc.run('MATCH (c:Company { name : $company_name, field : $company_field, website : $company_website}) MERGE (l:Location { latitude : $companyLocation_latitude, longitude : $companyLocation_longitude, address : $companyLocation_address}) MERGE (c) - [:LOCATED_IN] -> (l);', companyLocatedInLocationData)
        }

        books_names.map(async name => {
            var booksReadData = {
                ...studentData,
                name: name,
            }
            var booksRead = await txc.run('MATCH (s:Student { name : $studentData_name, age : $studentData_age, email : $studentData_email, password : $studentData_password, phone : $studentData_phone, currentlyStudying : $studentData_currentlyStudying, department : $studentData_department, semester : $studentData_semester, isAlumni : $studentData_isAlumni, class : $studentData_class}) WITH s MATCH (b:Book {name : $name}) MERGE (s) -[:READ]-> (b);', booksReadData);
        })

        author_names.map(async name => {
            var authorReadData = {
                ...studentData,
                name: name,
            }
            var authorRead = await txc.run('MATCH (s:Student { name : $studentData_name, age : $studentData_age, email : $studentData_email, password : $studentData_password, phone : $studentData_phone, currentlyStudying : $studentData_currentlyStudying, department : $studentData_department, semester : $studentData_semester, isAlumni : $studentData_isAlumni, class : $studentData_class}) WITH s MATCH (a:Author {name : $name}) MERGE (s) -[:AUTHOR_READ]-> (a);', authorReadData);
        })

        category_names.map(async name => {
            var categoryReadData = {
                ...studentData,
                name: name,
            }
            var categoryRead = await txc.run('MATCH (s:Student { name : $studentData_name, age : $studentData_age, email : $studentData_email, password : $studentData_password, phone : $studentData_phone, currentlyStudying : $studentData_currentlyStudying, department : $studentData_department, semester : $studentData_semester, isAlumni : $studentData_isAlumni, class : $studentData_class}) WITH s MATCH (c:Category {name : $name}) MERGE (s) -[:INTERESTED_IN_CATEGORY]-> (c);', categoryReadData);
        })
    });
    session.close();
}