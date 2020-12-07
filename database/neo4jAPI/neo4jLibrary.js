const driver = require('../../config/db');

//for each query, end with <space> so as to add next part of query

async function interestBased() {
    var query = `MATCH (s:Student) -[:INTERESTED_IN_CATEGORY]-> (c:Category) WHERE ID(s) = 3129 (s) -[:READ]-> (b:Book) -[:ABOUT]-> (c) WITH s, c, COUNT(*) AS score, MATCH (b:Book) -[:ABOUT]-> (c) WHERE NOT EXISTS((s) -[:READ]-> (b)) RETURN b, ID(b), SUM(score) AS score ORDER BY score DESC;`
    var books = await queryNeo4j(query);
    var res = books.records.map(record => {
        return {
            ...record._fields[0].properties,
            id: record._fields[1],
        }
    })
    return res;
}

async function bookBased() {
    var query = `MATCH (s1:Student) -[:READ]-> (b:Book) <-[:READ]- (s2:Student) WHERE ID(s1) = 3129 AND ID(s1) <> ID(s2) WITH s1, s2, COUNT(b) AS score ORDER BY score, MATCH (s2) -[:READ]-> (b:Book) WHERE NOT EXISTS((s1) -[:READ]-> (b)) RETURN b, ID(b);`;
    var books = await queryNeo4j(query);
    var res = books.records.map(record => {
        return {
            ...record._fields[0].properties,
            id: record._fields[1],
        }
    })
    return res;
}

async function categoryBased() {
    var query = `MATCH (s1:Student) -[:INTERESTED_IN_CATEGORY]-> (c:Category) <-[:INTERESTED_IN_CATEGORY]- (s2:Student) WHERE ID(s1) = 3129 AND ID(s1) <> ID(s2) WITH s1, s2, COUNT(c) AS score ORDER BY score, MATCH (s2) -[:READ]-> (b:Book) WHERE NOT EXISTS((s1) -[:READ]-> (b)) RETURN b, ID(b);`;
    var books = await queryNeo4j(query);
    var res = books.records.map(record => {
        return {
            ...record._fields[0].properties,
            id: record._fields[1],
        }
    })
    return res;
}

async function authorBased() {
    var query = `MATCH (s1:Student) -[:AUTHOR_READ]-> (a:Author) <-[:AUTHOR_READ]- (s2:Student) WHERE ID(s1) = 3129 AND ID(s1) <> ID(s2) WITH s1, s2, COUNT(a) AS score ORDER BY score, MATCH (s2) -[:READ]-> (b:Book) WHERE NOT EXISTS((s1) -[:READ]-> (b)) RETURN b, ID(b);`;
    var books = await queryNeo4j(query);
    var res = books.records.map(record => {
        return {
            ...record._fields[0].properties,
            id: record._fields[1],
        }
    })
    return res;
}

async function issueBook(book_id) {
    var query = `MATCH (b:Book) WHERE ID(b) = ${book_id} RETURN b.isIssued;`
    var issue_book = await queryNeo4j(query);
    if (issue_book.records._fields[0] === 'true') return false;
    else {
        query = `MATCH (b:Book) WHERE ID(b) = ${book_id} SET isIssued = 'true RETURN b.isIssued;`
        issue_book = await queryNeo4j(query);
        return true;
    }
}

async function returnBook(book_id) {
    var query = `MATCH (b:Book) WHERE ID(b) = ${book_id} SET b.isIssued = 'false' RETURN b;`
    var return_book = await queryNeo4j(query);
    return return_book;
}

async function queryNeo4j(query) {
    try {
        const session = driver.session();
        var res;
        var writeTxResultPromise = await session.writeTransaction(async txc => {
            res = await txc.run(query);
        });
        session.close();
        return res;
    } catch (err) {
        console.log(err);
    }
}


module.exports = {
    interestBased: interestBased,
    bookBased: bookBased,
    categoryBased: categoryBased,
    authorBased: authorBased,
}