
let currentIteration = 0;
let lastRun = 0;
function delayer(func, delay) {// prevents multiple runnings of same function
    if ((lastRun + delay) < Date.now()) {
        func();
        lastRun = Date.now()
    } else {
        return;
    }
}


function addPosts(posts) {
    console.log('inside addPosts' + posts);

    for (let i = 0; i < posts.length; i++) {
        const cardContainer = document.querySelector('.cardContainer');
        const newDiv = document.createElement('div');
        newDiv.className = 'card';
        const divP = document.createElement('p');
        divP.innerHTML = posts[i].postBody;
        newDiv.appendChild(divP);
        console.log(cardContainer)
        cardContainer.appendChild(newDiv);
    }
}

// async function fetchPosts() {
//     console.log('fetching posts');
//     await fetch('/scroll/5', {
//         body: JSON.stringify(),
//     })
//         .then((results) => {
//             console.log('about to add posts' + results);
//             addPosts(results.body.readableStream);
//         }).catch((err) => {
//             console.log(err);
//         })
// }
const jqueryget = () => {
    $.ajax({
        url: '/scroll/5'
    }).then(
        (data) => {
            addPosts(data)
        },
        () => {
            console.log('bad request');
        }
    );
}

function logger() {
    console.log('function ran');
}

document.addEventListener('scroll', () => {// lots of inspiration from here: https://www.javascripttutorial.net/javascript-dom/javascript-infinite-scroll/
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
    console.log(`scroll height ${scrollHeight}, scroll top ${scrollTop}, client height ${clientHeight}`);
    if (scrollTop + clientHeight > scrollHeight - 5) {
        delayer(jqueryget, 1000)
    }
})