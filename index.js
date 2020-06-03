const express = require('express');
const fetch = require("node-fetch");

const app = express();
const PORT = 3000;
const UP_LINK_HOST = 'https://jsonplaceholder.typicode.com';

app.get("/top-post", async (req, res) => {
    const numberOfPost = parseInt(req.query.limitTo) || 1;

    console.log(`fetching all comments`);

    const comments = await fetch(`${UP_LINK_HOST}/comments`).then(res => res.json());

    console.log(`Hashing to find top Post`);

    postIdToCountMap = {};
    comments.forEach(comment => {
        if (postIdToCountMap[comment.postId] === undefined) {
            postIdToCountMap[comment.postId] = 0;
        }
        postIdToCountMap[comment.postId] = postIdToCountMap[comment.postId] + 1;
    });

    let topPost = await Promise.all(
        Object.keys(postIdToCountMap)
            .map(key => ({
                id: key,
                commentsCount: postIdToCountMap[key]
            }))
            .sort((a, b) => a.commentsCount <= b.commentsCount ? 1 : -1) // Sorting the postIds based on comments count
            .slice(0, numberOfPost)
            .map(
                post => fetch(`${UP_LINK_HOST}/posts/${post.id}`)
                    .then(res => res.json())
                    .then(res => {
                        console.log(`fetched data for /posts/${post.id}`);
                        return { ...res, total_number_of_comments: post.commentsCount }
                    })
            )
    );

    res.send(topPost)
});

app.get("/comment-search", async (req, res) => {
    const searchText = req.query.searchText || '';

    console.log(`fetching all comments`);

    const comments = await fetch(`${UP_LINK_HOST}/comments`).then(res => res.json());

    console.log(`filtering comments for text ${searchText}`);

    const filteredComments = comments.filter(c => 
        searchText == '' ||
        contains(c.name, searchText) ||
        contains(c.email, searchText) ||
        contains(c.body, searchText)
    );

    res.send(filteredComments)
});

contains = function(str, serachText){
    return str.toLowerCase().indexOf(serachText.toLowerCase()) > -1
}

app.listen(PORT, () => console.log(`Listening at Post ${PORT}`))