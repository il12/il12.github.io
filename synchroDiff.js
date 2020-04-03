let openModalSliceButton = document.getElementsByClassName('newSlice')[0];
let openModalModifierButton = document.getElementsByClassName('modifierAdder');
let closeModalSliceButtons = document.getElementsByClassName('closeAddNewSlice');
let modalSlice = document.getElementById("modalAddNewSlice");
let modalModifier = document.getElementById('modalAddNewModifier');
let closeModalModifierButtons = document.getElementsByClassName('closeAddNewModifier');
let saveSliceButton = document.getElementsByClassName('saveSlice')[0];
let setProgramButton = document.getElementById('setProgram');
let saveProgramButton = document.getElementById('saveProgram');
let videoInput = document.getElementById('video');
let teamUniqueCheckbox = document.getElementById('team-unique');

const handleVideo = function(){
    let videoPlayer = document.getElementById('videoPlayer');
    console.log(this.files);
    videoPlayer.hidden = false;
    videoPlayer.src = URL.createObjectURL(this.files[0]);
    videoPlayer.load();
};

teamUniqueCheckbox.addEventListener('change', ()=>{
    if(teamUniqueCheckbox.checked){
        document.getElementById('sumMark').value = (Number(document.getElementById('sumMark').value) + 0.3).toFixed(2);
    } else {
        document.getElementById('sumMark').value = (Number(document.getElementById('sumMark').value) - 0.3).toFixed(2);
    }
})

videoInput.addEventListener('change',handleVideo,false);

saveProgramButton.addEventListener('click',()=>{
    let contentList = document.getElementById('content-list');
    let lastElement = JSON.parse(contentList.lastElementChild.dataset.fragment);
    if(lastElement.type === 'hybrid'){
        let duration = (lastElement.endTime - lastElement.startTime);
        let durationType = duration < 16 ? (duration < 10 ? 0.1 : 0.2) : 0.3;
        lastElement.basicMark = (Number(lastElement.basicMark)+durationType).toFixed(2);
    }
    contentList.lastElementChild.dataset.fragment = JSON.stringify(lastElement);
    let programLength = contentList.childNodes.length;
    sessionStorage.setItem(`fragment${programLength}`,JSON.stringify(lastElement));
    let sliceArray = [];
    for (let i=1;i<=programLength;i++){
        let item = JSON.parse(sessionStorage.getItem(`fragment${i}`));
        sliceArray.push(item);
    }
    let name = document.getElementById('name').value;
    let programType = document.getElementById('program').value;
    let program = {
        type: programType,
        name: name,
        fragments: sliceArray
    };

    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(program));
    let dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", `${name}.asd`);
    dlAnchorElem.click();
});

setProgramButton.addEventListener('click', ()=>{
    setProgramButton.disabled = true;
    document.getElementById('fileBlock').hidden = false;
    document.getElementById('resBlock').hidden = false;
    document.getElementById('addFragmentBlock').hidden = false;
    document.getElementById('program').disabled = true;
    if(document.getElementById('program').value === 'team'){
        Array.from(document.getElementsByClassName('team-only')).forEach(item=>{
            item.hidden = false;
        })
    }
    openModalSliceButton.disabled = false;
})

saveSliceButton.addEventListener('click', ()=>{
    let baseMark;
    let sumDurationString = document.getElementById('sumDuration').value;
    let contentList = document.getElementById('content-list');
    let number = contentList.childNodes.length;
    let sumDuration = Number(sumDurationString.split(":")[0])*60+Number(sumDurationString.split(":")[1]);
    let list = Array.from(document.getElementById('modifier-list').childNodes).map(item=>{
        return item.firstChild.dataset.modifier
    });
    let fragmentType = document.getElementById('fragmentType').value;
    let uniqueModifiers = Array.from(new Set(list.filter(item=>{
        return JSON.parse(item).unique && !JSON.parse(item).multiplier
    })));
    let modifiers = list.filter(item=>{
        return !JSON.parse(item).unique
    });
    let multipliers = list.filter(item=>{
        return JSON.parse(item).multiplier
    });
    modifiers = modifiers.map(item=>JSON.parse(item));
    uniqueModifiers = uniqueModifiers.map(item=>JSON.parse(item));
    multipliers = multipliers.map(item=>JSON.parse(item));
    let duration = Number(document.getElementById('sliceDuration').value);
    if (fragmentType === 'hybrid') {
        let legs = Number(document.getElementById('legs').value);
        let durationType = duration < 16 ? (duration < 10 ? 0.1 : 0.2) : 0.3;
        baseMark = (durationType * legs).toFixed(2);
    } else {
        baseMark = 0.1;
    }
    let startTime = sumDuration+1;
    let endTime = startTime+duration;
    let slice = {
        number: number+1,
        type: fragmentType,
        startTime: startTime,
        endTime: endTime,
        basicMark: baseMark,
        modifiers: modifiers,
        uniqueModifiers: uniqueModifiers,
        multipliers: multipliers
    };
    console.log(reduceSliceToDiffMark(slice));
    document.getElementById('sumDuration').value = createTimeStringFromSeconds(endTime);
    let sumMark = Number(document.getElementById('sumMark').value);
    sumMark += Number(reduceSliceToDiffMark(slice).toFixed(2));
    document.getElementById('sumMark').value = sumMark.toFixed(2);
    let fragment = document.createElement("div");
    let fragment_header = document.createElement('div');
    let fragment_body = document.createElement('div');
    let fragment_footer = document.createElement('div');
    let fragment_type = document.createElement('div');
    let fragment_number = document.createElement('div');
    let fragment_time = document.createElement('div');
    let fragment_mark = document.createElement('div');
    let fragment_delete = document.createElement('button');
    let fragment_delete_icon = document.createElement('span');
    fragment.dataset.fragment = JSON.stringify(slice);
    sessionStorage.setItem(`fragment${number+1}`, JSON.stringify(slice));
    fragment_number.innerHTML = number+1;
    fragment_time.innerHTML = `${createTimeStringFromSeconds(startTime)}-${createTimeStringFromSeconds(endTime)}`;
    fragment_type.innerHTML = fragmentType;
    fragment_mark.innerHTML = reduceSliceToDiffMark(slice).toFixed(2);
    fragment_delete_icon.innerHTML= "&times;";
    fragment_delete.addEventListener('click',function (){
        let slice = JSON.parse(this.parentNode.parentNode.dataset.fragment);
        let number = slice.number;
        let duration = slice.endTime - slice.startTime+1;
        let sumDurationString = document.getElementById('sumDuration').value;
        let sumDuration = Number(sumDurationString.split(":")[0])*60+Number(sumDurationString.split(":")[1]);
        document.getElementById('sumDuration').value = createTimeStringFromSeconds(sumDuration-duration);
        let mark = Number(this.parentNode.parentNode.lastChild.lastChild.innerHTML);
        console.log("mark", mark);
        let sumMark = Number(document.getElementById('sumMark').value);
        sumMark -= mark;
        document.getElementById('sumMark').value = sumMark.toFixed(2);
        sessionStorage.removeItem(`fragment${number}`);
        this.parentNode.parentNode.remove();
    });
    fragment.classList.add('card');
    fragment.classList.add('mb-3');
    fragment_header.classList.add('card-header');
    fragment_header.classList.add('d-flex');
    fragment_header.classList.add('flex-row');
    fragment_header.classList.add('justify-content-between');
    fragment_footer.classList.add('card-footer');
    fragment_footer.classList.add('d-flex');
    fragment_footer.classList.add('flex-row');
    fragment_footer.classList.add('justify-content-between');
    fragment_number.classList.add('badge');
    fragment_number.classList.add('badge-success');
    fragment_time.classList.add('fragment-time');
    fragment_time.classList.add('badge');
    fragment_time.classList.add('badge-light');
    fragment_type.classList.add('fragment-type');
    fragment_mark.classList.add('badge');
    fragment_mark.classList.add('badge-primary');
    fragment_delete.classList.add('close');
    fragment_delete.appendChild(fragment_delete_icon);
    fragment_header.appendChild(fragment_number);
    fragment_header.appendChild(fragment_delete);
    fragment_footer.appendChild(fragment_time);
    fragment_footer.appendChild(fragment_mark);
    fragment.appendChild(fragment_header);
    fragment.appendChild(fragment_type);
    fragment.appendChild(fragment_footer);
    contentList.appendChild(fragment);
    modalSlice.style.display = 'none';
});

document.getElementById('fragmentType').addEventListener('change',()=>{
    document.getElementById('modifier-list').innerHTML = '';
    Array.from(document.getElementsByClassName('hybrid-only')).forEach(item=>{
        item.hidden = document.getElementById('fragmentType').value !== "hybrid";
    })
});

openModalSliceButton.addEventListener('click', () => {
    document.getElementById('modifier-list').innerHTML = '';
    modalSlice.style.display = "block";
});

Array.from(closeModalSliceButtons).forEach(item => {
    item.addEventListener('click', () => {
        modalSlice.style.display = 'none';
    });
});

Array.from(closeModalModifierButtons).forEach(item => {
    item.addEventListener('click', () => {
        modalModifier.style.display = 'none';
    });
});

Array.from(openModalModifierButton).forEach(item => {
    let modifierType = item.dataset.type;
    item.addEventListener('click', async () => {
        document.getElementById('modifiers').innerHTML = '';
        let fragmentType = document.getElementById('fragmentType').value;
        let programType = document.getElementById('program').value;
        let modifiers = await getModifiers(modifierType,fragmentType,programType);
        modifiers.forEach(modifier=>{
            let programType = document.getElementById('program').value;
            let card = document.createElement("div");
            let cardBody = document.createElement("div");
            let cardFooter = document.createElement("div");
            let mark = document.createElement('span');
            card.classList.add('card');
            card.classList.add('bg-info');
            card.classList.add('text-white');
            card.classList.add('my-2');
            card.classList.add('mx-2');
            card.classList.add('col-2');
            cardBody.innerHTML = modifier.name;
            cardBody.classList.add('card-body');
            cardFooter.classList.add('card-footer');
            mark.innerHTML = `Modifier: ${modifier.values[programType]}`;
            mark.classList.add('badge');
            mark.classList.add('badge-light');
            cardFooter.appendChild(mark);
            card.appendChild(cardBody);
            card.appendChild(cardFooter);
            card.dataset.modifier = JSON.stringify(modifier);
            document.getElementById('modifiers').appendChild(card);
            card.addEventListener('click',()=>{
                card.classList.remove('col-2');
                let div = document.createElement('div');
                div.appendChild(card);
                document.getElementById('modifier-list').appendChild(div);
                modalModifier.style.display = 'none';
            })
        });
        modalModifier.style.display = 'block';
    })
});

const getModifiers = async function(modifierType,fragmentType,programType){
    let data = await fetch('./modifiers.json').then(res=>res.json());
    let modifiers = data.filter(item=>{
        return item.type === fragmentType && item["values"][programType] !== null
    });
    return modifiers;
};

const createTimeStringFromSeconds = function (number) {
    let seconds = String(number % 60).padStart(2,'0');
    let minutes = String(Math.floor(number/60)).padStart(2,'0');
    return `${minutes}:${seconds}`
};

const reduceSliceToDiffMark = function (slice){
    let baseMark = Number(slice.basicMark);
    let modifiersArray = Array.from(slice.modifiers);
    let uniqueModifiersArray = Array.from(slice.uniqueModifiers);
    let multipliers = Array.from(slice.multipliers);
    let programType = document.getElementById('program').value;
    let modifiersMark = modifiersArray.reduce((accumulator,currentValue)=>{
        return accumulator+=currentValue.values[programType];
    }, 0);
    let uniqueModifiersMark = uniqueModifiersArray.reduce((accumulator,currentValue)=>{
        return accumulator+=currentValue.values[programType];
    }, 0);
    let mark = baseMark + modifiersMark + uniqueModifiersMark;
    console.log(mark);
    if(multipliers.length !== 0){
        let multipliersArray = multipliers.map((item)=>item.values[programType]);
        console.log(multipliersArray);
        for(let multiplier of multipliersArray){
            mark*=multiplier;
        }
        return mark
    }
    return mark
};
