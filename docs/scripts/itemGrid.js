// @ts-nocheck I like doing weird things in js, vscode does not
Array.prototype.random = function () {
    return this[Math.floor((Math.random()*this.length))];
}
let gridWidth = 3;
let gridHeight = 3;
let maxGridSize = 18;
let selected;
let money =0;
const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const alphabet = ["A","B","C","D","E","F","G","H","I","J"]
const greek = ["α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ"]
const series = [romanNumerals,alphabet,greek]
const colors = ["red","blue","yellow"]
const unselectedColor = 'silver'
const selectedColor = 'teal'
let boughtSort = false;
let itemGrid;
function resetGame(){
    //Very simple when I put in default values
    localStorage.clear()
    window.onload()
    window.location.reload()
}
window.onbeforeunload = function(event){
    localStorage.setItem("money",money)
    localStorage.setItem("boughtSort",boughtSort)
    localStorage.setItem("gridWidth",gridWidth)
    localStorage.setItem("gridHeight",gridHeight)
    localStorage.setItem("itemGrid",getGrid())
}
// Gets the itemgrid as a string for storage doesn't need to be a function but it is
function getGrid(){
    let out = "";
    Array.from(itemGrid.children).forEach((node)=>{
        if(node.innerText != ""){
            let ser = colors.indexOf(node.style.color)
            let value = series[ser].indexOf(node.innerText)
            out += ser + " " + value + ","
        }else{
            out += -1 + " " + -1 + ","

        }
    })
    return out.slice(0,out.length-1)
}
window.onload = function(event){
    itemGrid = document.getElementById("item-grid");
    boughtSort = localStorage.getItem("boughtSort") == 'true'
    if(boughtSort == true){
        let button = document.getElementById("sortGrid");
        button.parentNode.childNodes[1].remove()
        button.parentNode.childNodes[1].remove()
    }
    money = parseInt(localStorage.getItem("money")) || 0
    document.getElementById('money').innerText = money
    gridWidth = localStorage.getItem("gridWidth") || 3
    gridHeight = localStorage.getItem("gridHeight") || 3
    updateUpgrade('width')
    updateUpgrade('height')
    itemGrid.innerHTML =""
    let data = localStorage.getItem("itemGrid")  || '0 0'
    data.split(",").forEach((item)=>{
        let itemData = item.split(" ")
        itemGrid.appendChild(createItemSlot(itemData[0],itemData[1]))
    })
    resizeGrid()
}

function resizeGrid () {
    let maxHeight = document.getElementById("middle-panel").offsetHeight * .9;
    let maxWidth = document.getElementById("middle-panel").offsetWidth * .9;
    let minItemSize = 40; // Minimum item size
    let maxItemSize = 100; // Maximum item size

    let itemHeight = Math.min(Math.floor(maxHeight / (gridHeight * 1.12)), maxItemSize);
    let itemWidth = Math.min(Math.floor(maxWidth / (gridWidth * 1.12)), maxItemSize);
    //#TODO disble the buttons one step earlier
    if (itemHeight < minItemSize || gridHeight > maxGridSize) {
        gridHeight--;
        document.getElementById("upgradeHeight").disabled = true;
        return;
    }
    if (itemWidth < minItemSize|| gridWidth > maxGridSize) {
        gridWidth--;
        document.getElementById("upgradeWidth").disabled = true;
        return;
    }
    // Set the grid size
    itemGrid.style.gridTemplateColumns = `repeat(${ gridWidth }, ${ Math.min(itemWidth, itemHeight) }px)`;
    itemGrid.style.gridTemplateRows = `repeat(${ gridHeight }, ${ Math.min(itemWidth, itemHeight) }px)`;

    for (let i = itemGrid.childElementCount; i < gridWidth * gridHeight; i++) {
        let itemSlot = createItemSlot();
        itemGrid.appendChild(itemSlot);
    }
    document.getElementById("gridSize").textContent = `${ gridWidth }x${ gridHeight }`
}
function createItemSlot(ser, val) {
    let itemSlot = document.createElement('div');
    itemSlot.className = 'item-slot';
    //A nice little random filling when you expand the grid
    if(ser != -1){
        let inputSeries = ser == null ? Math.floor(Math.random() * series.length) : ser;
        itemSlot.innerText = series[inputSeries][val==null ? 0:val];
        itemSlot.style.color = colors[inputSeries];
    }

    itemSlot.style.backgroundColor = unselectedColor;
    itemSlot.onclick = function () {
        //Merge Calculations
        //No reason to click on empty tiles so don't allow it
        if(itemSlot.innerText == ''){
            return;
        }
        if (selected == null) {
            selected = itemSlot;
            itemSlot.style.backgroundColor = itemSlot.style.backgroundColor == unselectedColor ? selectedColor : unselectedColor;
            return;
        } else if (itemSlot == selected) {
            selected = null;
            itemSlot.style.backgroundColor = itemSlot.style.backgroundColor == unselectedColor ? selectedColor : unselectedColor;
            return;
        }
        if (itemSlot.innerText == selected.innerText) {
            let result = getMergeResult(itemSlot, selected);
            selected.innerText = "";
            selected.style.backgroundColor = unselectedColor;
            itemSlot.innerText = series[result.newSeries][result.value];
            itemSlot.color = colors[result.newSeries];
            selected = null;
            addMoney(Math.pow(2, result.value + 1));
        }
    };
    return itemSlot;
}

function getMergeResult(one, two){
    if(one.innerText == two.innerText){
        let matchedSeries = colors.findIndex((val) => val == one.style.color); 
        let index = series[matchedSeries].findIndex((val) => val == one.innerText); 
        if(index == 9){
            //#TODO what do when out of merges
            throw new Error("PANIC")
        }
        return {newSeries: matchedSeries,value: index+1}
    }
}
function addMoney(value){
    money += value;
    document.getElementById('money').innerText = money
}
//#TODO Change cost of each upgrade to be based on both upgrades, because going upgrading height on 3x3 and 4x3 is a different number of squares 
function buyUpgrade(name){
    let cost = Math.floor(10 * 1.5 ** ((name == 'width'?gridWidth:gridHeight)-3))
    if(money > cost){
        addMoney(cost *-1)
        name == 'width'?gridWidth++:gridHeight++
        document.getElementById(name+"Cost").innerText = Math.floor(cost * 1.5)
        resizeGrid();
    }
}
//#TODO After a certain grid size, turn this into create max
function buyItem(){
    if(money<1){
        return;
    }
    for (let i = 0; i < itemGrid.childElementCount; i++) {
        if(itemGrid.children[i].innerText ==""){
            itemGrid.replaceChild(createItemSlot(),itemGrid.children[i])
            addMoney(-1)
            return
        }
    }
}
function updateUpgrade(name){
    let cost = Math.floor(10 * 1.5 ** ((name == 'width'?gridWidth:gridHeight)-3))
    document.getElementById(name+"Cost").innerText = Math.floor(cost)
}
document.getElementById("sortGrid").onclick = clickSort;
function clickSort() {
    if(!boughtSort){
        if(money <= 20)
            return
        addMoney(-20)
        let button = document.getElementById("sortGrid");
        button.parentNode.childNodes[1].remove()
        button.parentNode.childNodes[1].remove()
        boughtSort = true
    }
    sortGrid()
}
function sortGrid(){
    const itemGrid = document.querySelector("#item-grid");
    for(let i = 0; i < series.length;i++){
        //Lamda functions are fun
        //In order this, gets the itemgrid as a htmlcollection, turns it into an array, filters it for each series, then sorts based on that series, then appends it to the itemgrid thus moving them to all be in order
        // Interestingly enough because I am sorting it by just moving the elements around on the page, the currently selected grid also accurately moves without me having to do anything extra
        Array.from(itemGrid.children).filter((item)=>item.style.color == colors[i] && item.innerText != "").sort((a,b)=>series[i].indexOf(a.innerText)-series[i].indexOf(b.innerText)).forEach((item)=> itemGrid.appendChild(item))
    }
    // A last one for the empty spaces
    let emptyChildren = Array.from(itemGrid.children).filter((item)=>item.innerText == "").forEach((item)=> itemGrid.appendChild(item))
}


