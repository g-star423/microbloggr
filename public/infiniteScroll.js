
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
    const cardContainer = $('.cardContainer').first();
    console.log(cardContainer);
    if (posts) {
        for (let i = 0; i < posts.length; i++) {
            const cardDiv = $('<div>').addClass('card');
            const headerDiv = $('<div>').addClass('card-header');
            const authorText = $('<h4>');
            const authorLink = $('<a>').text(posts[i].author).attr("href", `/profile/${posts[i].author}`)
            $(authorText).append(authorLink);
            $(headerDiv).append(authorText);
            $(cardDiv).append(headerDiv);
            $(cardContainer).append(cardDiv);
        }
    } else if (!displayedEndOfFeed) {
        displayedEndOfFeed = true;
        const cardDiv = $('<div>').addClass('card');
        const headerDiv = $('<div>').addClass('card-header');
        const message = $('<h4>').text("Reached end of feed. Go outside and play!");
        $(headerDiv).append(message);
        $(cardDiv).append(headerDiv);
        $(cardContainer).append(cardDiv);
    }
}


const jqueryget = () => {
    $.ajax({
        url: '/scroll/' + currentPostIndex // send the index to the server to let it know where the page is
    }).then(
        (data) => {
            addPosts(data)
            currentPostIndex += 10;// advance posts by 10
        },
        () => {
            console.log('bad request');
        }
    );
}

// keeping listener as "vanilla" JS so we don't need the jquery event handler - will refactor if there is extra time
document.addEventListener('scroll', () => {// lots of inspiration from here: https://www.javascripttutorial.net/javascript-dom/javascript-infinite-scroll/
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight > scrollHeight - 5) {
        delayer(jqueryget, 500)
    }
})