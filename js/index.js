let root = document.documentElement;
let btnRight = document.getElementById('btnRight')
let btnLeft = document.getElementById('btnLeft')
let projectList = document.getElementById('projectList')

let projectCount = Array.from(projectList.children).length

let currentPosition = 0;
let itemWidth = window
    .getComputedStyle(projectList.children[0])
    .flexBasis.match(/\d+\.?\d+/g)[0];
let limitPosition = itemWidth * (projectCount - Math.floor(100 / itemWidth));

btnRight.addEventListener('click',nextProject)
btnLeft.addEventListener('click',previousProject)


function nextProject(){
    console.log(currentPosition);
    currentPosition += parseFloat(itemWidth);
    if (currentPosition > limitPosition) {
        currentPosition = 0;
    }
    projectList.style.right = currentPosition + 'vw';
}

function previousProject(){
    console.log(currentPosition);
    currentPosition -= parseFloat(itemWidth);
    if (currentPosition < 0) {
        currentPosition = limitPosition;
    }
    projectList.style.right = currentPosition + 'vw';
}
