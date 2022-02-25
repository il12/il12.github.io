let today = new Date();
let birthday = new Date('1998-04-05');
let age = Math.floor((today-birthday)/1000/60/60/24/365)
let word = getRightWord(age);
let fullAge = `${age} ${word}`

let fullAgeElement = document.getElementById('age');
fullAgeElement.innerHTML = fullAge;

function getRightWord(age){
    let arr1 = [2,3,4];
    let lastNumber = age % 10;
    if(age > 5 && age < 20){
        return 'лет';
    } else {
        if(arr1.includes(lastNumber)){
            return 'года'
        } else if(lastNumber===1){
            return "год"
        } else {
            return "лет"
        }
    }
}
