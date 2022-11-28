
let currentIteration = 0;

window.onload

function addPosts() {
    const cardContainer = document.querySelector('.cardContainer');
    const newDiv = document.createElement('div');
    newDiv.className = 'card';
    const divP = document.createElement('p');
    divP.innerHTML = 'this is a test abbbbejjasdoifja;osdfj;lkasdjgl;kjweiorusjdhfggggggggioasjdfjo;aisdjf;oaisdfjo;aisdjf;oaisdfj;oaisjdf;alsdkgj;lh';
    newDiv.appendChild(divP);
    console.log(cardContainer)
    cardContainer.appendChild(newDiv);
}

function logger() {
    console.log('function ran');
}

document.addEventListener('scroll', () => {// lots of inspiration from here: https://www.javascripttutorial.net/javascript-dom/javascript-infinite-scroll/
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
    console.log(`scroll height ${scrollHeight}, scroll top${scrollTop}, client height ${clientHeight}`);
    if (scrollTop + clientHeight > scrollHeight - 5) {
        addPosts()
    }
})