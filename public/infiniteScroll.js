
let currentPostIndex = 10;
let lastRun = 0;
let displayedEndOfFeed = false;
let userObj = null


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
    if (posts) {
        for (let i = 0; i < posts.length; i++) {
            const cardDiv = $('<div>').addClass('card');
            const headerDiv = $('<div>').addClass('card-header');
            const authorText = $('<h4>');
            const authorLink = $('<a>').text(posts[i].author).attr("href", `/profile/${posts[i].author}`)
            const contentDiv = $('<div>').addClass('card-content');
            const postBodyP = $('<p>').text(posts[i].postBody);
            const tagsP = $('<p>').text("Tags: ");
            const mentionsP = $('<p>').text("Mentions: ");
            for (let z = 0; z < posts[i].tags.length; z++) {
                const currentTag = $('<a>').text(posts[i].tags[z]).attr("href", `/feed/search/%23${posts[i].tags[z].slice(1)}`)
                $(tagsP).append(currentTag)
            }
            for (let z = 0; z < posts[i].mentions.length; z++) {
                const currentMention = $('<a>').text(posts[i].mentions[z]).attr("href", `/profile/${posts[i].mentions[z].slice(1)}`)
                $(mentionsP).append(currentMention)
            }
            $(authorText).append(authorLink);
            $(headerDiv).append(authorText);
            $(postBodyP).append(tagsP, mentionsP)
            $(contentDiv).append(postBodyP);
            if (userObj._id === posts[i].posterID || userObj.isModerator) {
                const editLinkP = $('<p>')
                const editLink = $('<a>').text("Edit this post").attr("href", `/posts/${posts[i]._id}`)
                $(editLinkP).append(editLink);
                $(contentDiv).append(editLinkP);
            }
            if (posts[i].createdAt.toString() == posts[i].updatedAt.toString()) {
                // add normal date
                const dateP = $('<p>').text(`Posted: ${posts[i].createdAt.toString().slice(0, 16)}`).addClass('date');
                $(contentDiv).append(dateP);
            } else {
                // add updated date and "edited" text
                const dateP = $('<p>').text(`Posted: ${posts[i].updatedAt.toString().slice(0, 16)} (edited)`).addClass('date');
                $(contentDiv).append(dateP);
            }
            $(cardDiv).append(headerDiv, contentDiv);
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

// const getUser = () => {
//     $.ajax({
//         url: '/userauth'
//     }).then(
//         (data) => {
//             addPosts(data)
//             currentPostIndex += 10;// advance posts by 10
//         },
//         () => {
//             console.log('bad request');
//         }
//     );
// }


$(document).ready(() => {
    $.ajax({
        url: '/userauth'
    }).then(
        (currentUser) => {
            userObj = currentUser
        },
        () => {
            console.log('bad request');
        }
    );
});

// keeping listener as "vanilla" JS so we don't need the jquery event handler - will refactor if there is extra time
document.addEventListener('scroll', () => {// lots of inspiration from here: https://www.javascripttutorial.net/javascript-dom/javascript-infinite-scroll/
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight > scrollHeight - 5) {
        delayer(jqueryget, 500)
    }
})