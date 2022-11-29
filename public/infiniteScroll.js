
let currentPostIndex = 10;
let lastRun = 0;
let displayedEndOfFeed = false;
function delayer(func, delay) {// prevents multiple runnings of same function
    if ((lastRun + delay) < Date.now()) {
        func();
        lastRun = Date.now()
    } else {
        return;
    }
}


function addPosts(posts) {
    if (posts) {
        for (let i = 0; i < posts.length; i++) {
            const cardContainer = document.querySelector('.cardContainer');
            const newDiv = document.createElement('div');
            newDiv.className = 'card';
            const divP = document.createElement('p');
            divP.innerHTML = posts[i].postBody;
            newDiv.appendChild(divP);
            cardContainer.appendChild(newDiv);
        }
    } else if (!displayedEndOfFeed) {
        displayedEndOfFeed = true;
        const cardContainer = document.querySelector('.cardContainer');
        const newDiv = document.createElement('div');
        newDiv.className = 'card';
        const divP = document.createElement('p');
        divP.innerHTML = "End of new feed. Go outside and play!";
        newDiv.appendChild(divP);
        cardContainer.appendChild(newDiv);
    }
}


const jqueryget = () => {
    $.ajax({
        url: '/scroll/' + currentPostIndex
    }).then(
        (data) => {
            addPosts(data)
            currentPostIndex += 10;
        },
        () => {
            console.log('bad request');
        }
    );
}


document.addEventListener('scroll', () => {// lots of inspiration from here: https://www.javascripttutorial.net/javascript-dom/javascript-infinite-scroll/
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight > scrollHeight - 5) {
        delayer(jqueryget, 500)
    }
})