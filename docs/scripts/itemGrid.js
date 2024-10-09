// @ts-nocheck I like doing weird things in js, vscode does not
Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
}
let gridWidth = 3;
let gridHeight = 3;
let maxGridSize = 18;
let selected;
let money = 0;
let crystal = 0;
const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
const greek = ["α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ"]
const series = [romanNumerals, alphabet, greek]
const colors = ["red", "blue", "yellow", 'purple', 'green', 'orange']
const unselectedColor = 'silver'
const selectedColor = 'teal'
let boughtSort = false;
let itemGrid;
let buyMax = false
let order;
let completedOrders = 0;
function resetGame () {
    //Very simple when I put in default values
    localStorage.clear()
    window.onload()
    window.location.reload()
}
window.onbeforeunload = function (event) {
    localStorage.setItem("money", money)
    localStorage.setItem("crystal", crystal)
    localStorage.setItem("orderCount",completedOrders);
    localStorage.setItem("boughtSort", boughtSort)
    localStorage.setItem("gridWidth", gridWidth)
    localStorage.setItem("gridHeight", gridHeight)
    localStorage.setItem("buyMax", buyMax)
    localStorage.setItem("itemGrid", getGrid())
    localStorage.setItem('currentOrder', order.color + " " + order.value);
}
// Gets the itemgrid as a string for storage doesn't need to be a function but it is
function getGrid () {
    let out = "";
    Array.from(itemGrid.children).forEach((node) => {
        if (node.innerText != "") {
            let ser = node.color;
            let value = node.value;
            out += ser + " " + value + ","
        } else {
            out += -1 + " " + -1 + ","

        }
    })
    return out.slice(0, out.length - 1)
}
window.onload = function (event) {
    itemGrid = document.getElementById("item-grid");
    boughtSort = localStorage.getItem("boughtSort") == 'true'
    if (boughtSort == true) {
        let button = document.getElementById("sortGrid");
        button.parentNode.childNodes[1].remove()
        button.parentNode.childNodes[1].remove()
    }
    money = parseInt(localStorage.getItem("money")) || 0
    document.getElementById('money').innerText = money
    crystal = parseInt(localStorage.getItem("crystal")) || 0
    document.getElementById('crystal').innerText = crystal
    completedOrders = parseInt(localStorage.getItem("orderCount"))|| 0;
    document.getElementById('orderCount').innerText = completedOrders;
    gridWidth = localStorage.getItem("gridWidth") || 3
    gridHeight = localStorage.getItem("gridHeight") || 3
    buyMax = localStorage.getItem("buyMax") == 'true'
    if (buyMax) {
        let button = document.getElementById('createItem');
        button.innerText = 'Create Max'
        button.parentElement.children[1].innerText = '1 Each'
    }
    updateUpgrades()
    itemGrid.innerHTML = ""
    let data = localStorage.getItem("itemGrid") || '0 0'
    data.split(",").forEach((item) => {
        let itemData = item.split(" ")
        itemGrid.appendChild(createItemSlot(itemData[0], itemData[1]))
    })
    let recoverOrder = localStorage.getItem("currentOrder");
    if(recoverOrder == null){
        createOrder();
    }else{
        recoverOrder = recoverOrder.split(" ");
        createOrder(recoverOrder[0],recoverOrder[1])
    }
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
    if (itemWidth < minItemSize || gridWidth > maxGridSize) {
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
function sellItem () {
    if (selected != null) {
        if(selected.value == order.value && order.color == selected.color){
            addCrystal(Math.pow(2, selected.value) *(2));
            completedOrders++;
            document.getElementById("orderCount").innerText = completedOrders;
            createOrder();
        }else{
            addMoney(Math.pow(2, selected.value) * (selected.color > 2 ? 2 : 1));
        }
        selected.replaceWith(createItemSlot(-1, -1))
        document.getElementById("itemCost").innerText = ""
        selected = null;
    }
}
function createOrder (col = -1, val = -1) {
    let targetColor = col == -1 ? Math.floor(Math.random() * 3) + 3 : col;
    let maxValue = val;
    if(val == -1){
        maxValue = Array.from(itemGrid.children).filter((node) => node.value >= 0).reduce(function (prev, current) {return (prev && current.value && prev.value > current.value) ? prev : current}).value;
        if (maxValue < 9) {
            maxValue += Math.floor(Math.random(2))
        }
        if (maxValue > 0) {
            maxValue -= Math.floor(Math.random(2))
        }
    }
    let node = createItemSlot(targetColor, maxValue);
    node.onclick = null;
    if (document.getElementById("orderDisplay").childElementCount > 0) {
        document.getElementById("orderDisplay").children[0].replaceWith(node)
    } else {
        document.getElementById("orderDisplay").appendChild(node)
    }
    order = node;
}
function createItemSlot (ser, val) {
    let itemSlot = document.createElement('div');
    itemSlot.className = 'item-slot';
    //A nice little random filling when you expand the grid
    if (ser != -1) {
        let inputSeries = ser == null ? Math.floor(Math.random() * series.length) : ser;
        if (ser > 2) {
            if (ser == 3) {
                itemSlot.innerText = series[0][val];
                itemSlot.innerText += series[1][val];
            }
            if (ser == 4) {
                itemSlot.innerText = series[1][val];
                itemSlot.innerText += series[2][val];
            }
            if (ser == 5) {
                itemSlot.innerText = series[0][val];
                itemSlot.innerText += series[2][val];
            }
        } else {
            // itemSlot.innerText = series[result.newSeries][result.value];
            itemSlot.innerText = series[inputSeries][val == null ? 0 : val];
        }
        itemSlot.style.color = colors[inputSeries];
        itemSlot.color = parseInt(inputSeries);
        itemSlot.value = parseInt(val == null ? 0 : val);
    }

    itemSlot.style.backgroundColor = unselectedColor;
    itemSlot.onclick = function () {
        //Merge Calculations
        //No reason to click on empty tiles so don't allow it
        if (itemSlot.innerText == '') {
            return;
        }
        if (selected == null) {
            selected = itemSlot;
            itemSlot.style.backgroundColor = itemSlot.style.backgroundColor == unselectedColor ? selectedColor : unselectedColor;
            if(selected.value == order.value && selected.color == order.color){
                document.getElementById("itemCost").innerText = Math.pow(2, itemSlot.value) * 2 + " Crystals"
            }else{
                document.getElementById("itemCost").innerText = "$" +Math.pow(2, itemSlot.value) * (itemSlot.color > 2 ? 2 : 1)
            }
            return;
        } else if (itemSlot == selected) {
            selected = null;
            itemSlot.style.backgroundColor = itemSlot.style.backgroundColor == unselectedColor ? selectedColor : unselectedColor;
            document.getElementById("itemCost").innerText = ""
            return;
        }
        if (itemSlot.value == selected.value && (selected.color < 3 && itemSlot.color < 3)) {
            let result = getMergeResult(itemSlot, selected);
            selected.replaceWith(createItemSlot(-1, -1))
            itemSlot.replaceWith(createItemSlot(result.newSeries, result.value))
            selected = null;
            document.getElementById("itemCost").innerText = ""
            addMoney(Math.pow(2, result.value + 1) * result.newSeries > 2 ? 2 : 1);
        }

    };
    return itemSlot;
}

function getMergeResult (one, two) {
    if (one.value == two.value) {
        let matchedSeries = one.color;
        if (one.value == 9) {
            //#TODO what do when out of merges
            throw new Error("PANIC")
        }
        // #TODO can clean this up now with one.color being just the number
        if (one.style.color != two.style.color) {
            let red = one.style.color == colors[0] || two.style.color == colors[0];
            let blue = one.style.color == colors[1] || two.style.color == colors[1];
            let yellow = one.style.color == colors[2] || two.style.color == colors[2];
            if (red && blue) {
                matchedSeries = 3;//Purple
            }
            if (blue && yellow) {
                matchedSeries = 4;//Green
            }
            if (red && yellow) {
                matchedSeries = 5;//Orange
            }
            return {newSeries: matchedSeries, value: one.value}
        }
        return {newSeries: matchedSeries, value: one.value + 1}
    }
}
function addMoney (value) {
    money += value;
    document.getElementById('money').innerText = money
}
function addCrystal (value) {
    crystal += value;
    document.getElementById('crystal').innerText = crystal
}
function getUpgradeCost (name) {
    return Math.floor(10 * 1.5 ** (((name == 'height' ? gridHeight : gridWidth) - 3) + ((name == 'width' ? gridHeight : gridWidth) - 3) / 2));
}
//#TODO Change cost of each upgrade to be based on both upgrades, because going upgrading height on 3x3 and 4x3 is a different number of squares 
function buyUpgrade (name) {
    let cost = getUpgradeCost(name)
    if (money > cost) {
        addMoney(cost * -1)
        name == 'width' ? gridWidth++ : gridHeight++
        updateUpgrades()
        resizeGrid();
        if (gridHeight * gridWidth >= 25) {
            buyMax = true
        }
        if (buyMax) {
            let button = document.getElementById('createItem');
            button.innerText = 'Create Max'
            button.parentElement.children[1].innerText = '1 Each'
        }
    }
}
//#TODO After a certain grid size, turn this into create max
function buyItem () {
    if (buyMax) {
        let button = document.getElementById('createItem');
        button.innerText = 'Create Max'
        button.parentElement.children[1].innerText = '1 Each'
    }
    if (money < 1) {
        return;
    }
    for (let i = 0; i < itemGrid.childElementCount; i++) {
        if (itemGrid.children[i].innerText == "") {
            if (money < 1)
                break
            addMoney(-1)
            itemGrid.children[i].replaceWith(createItemSlot())
            if (!buyMax)
                break
        }
    }
}
function updateUpgrades () {
    document.getElementById("widthCost").innerText = getUpgradeCost('width')
    document.getElementById("heightCost").innerText = getUpgradeCost('height')
}
function clickSort () {
    if (!boughtSort) {
        if (crystal <= 20)
            return
        addCrystal(-20)
        let button = document.getElementById("sortGrid");
        button.parentNode.childNodes[1].remove()
        button.parentNode.childNodes[1].remove()
        boughtSort = true
    }
    sortGrid()
}
function sortGrid () {
    const itemGrid = document.querySelector("#item-grid");
    for (let i = 0; i < series.length; i++) {
        //Lamda functions are fun
        //In order this, gets the itemgrid as a htmlcollection, turns it into an array, filters it for each series, then sorts based on that series, then appends it to the itemgrid thus moving them to all be in order
        // Interestingly enough because I am sorting it by just moving the elements around on the page, the currently selected grid also accurately moves without me having to do anything extra
        Array.from(itemGrid.children).filter((item) => item.style.color == colors[i] && item.innerText != "").sort((a, b) => series[i].indexOf(a.innerText) - series[i].indexOf(b.innerText)).forEach((item) => itemGrid.appendChild(item))
    }
    // A last one for the empty spaces
    let emptyChildren = Array.from(itemGrid.children).filter((item) => item.innerText == "").forEach((item) => itemGrid.appendChild(item))
}


