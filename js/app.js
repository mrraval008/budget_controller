
// Budget Controller
let budgetController = (function () {

    //Item Object Contructor
    function Item(id,desc,value){
        this.id = id;
        this.desc = desc;
        this.value = value
    }
    //Income Object Contructor
    function Income(id, desc, value) {
        Item.call(this,id, desc, value)
    }

    //Expense Object Contructor
    function Expense(id, desc, value) {
        Item.call(this,id, desc, value)
        this.expPerc = -1;
    }

    Expense.prototype.calcPerc = function (totalIncome) {
        if(totalIncome > 0){
            this.expPerc = Math.round((this.value/totalIncome)*100)
        }else{
            this.expPerc = -1;
        }
    }

    let data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        budgetPerc: -1,
        currentUpdatingItem: ""
    }

    let _getAllData = function(){
        return data;
    }

    let _addItem = function (type, desc, value) {
        let newItem, ID;
        let itemTypes = data.allItems[type];
        if (itemTypes.length == 0) {
            ID = 0;
        } else {
            ID = itemTypes[itemTypes.length - 1].id + 1;
        }
        if (type === "inc") {
            newItem = new Income(ID, desc, value);
        } else {
            newItem = new Expense(ID, desc, value);
        }
        data.allItems[type].push(newItem);
        return newItem;
    }


    let _deleteItem = function (id, type) {
        data.allItems[type].splice(id, 1);
    }

    let _getItem = function (id, type) {
        return data.allItems[type].find(item => item.id == id);
    }

    let _calculateTotal = function (type) {
        let sum = 0;
        data.allItems[type].forEach(item => {
            sum = sum + item.value
        })
        data.totals[type] = sum;
        return sum;
    }

    let _updateBudget = function () {

        //calculate Totals for inc and exp
        let incTotal = _calculateTotal("inc");
        let expTotal = _calculateTotal("exp");

        data.budget = incTotal - expTotal;
        if (incTotal > 0) {
            data.budgetPerc = Math.round((expTotal / incTotal) * 100)
        } else {
            data.budgetPerc = -1;
        }
    }

    let _getBudget = function () {
        return {
            incTotal: data.totals["inc"],
            expTotal: data.totals["exp"],
            budget: data.budget,
            budgetPerc: data.budgetPerc,
        }

    }

    let _setCurrentUpdatingItem = function (itemId) {
        data.currentUpdatingItem = itemId;
    }

    let _getCurrentUpdatingItem = function (itemId) {
        return data.currentUpdatingItem;
    }

    let _resetCurrentUpdatingItem = function (itemId) {
        data.currentUpdatingItem = ""
    }

    let _updateItem = function (itemId, input) {
        let splittedVal = itemId.split("-");
        let type = splittedVal[0]
        let ID = splittedVal[1];
        let item = _getItem(ID, type)
        item.desc = input.desc;
        item.value = input.value;
    }

    let _calcPercentages = function(){
        let items = data.allItems["exp"];
        let totalIncome = data.totals["inc"];
        items.forEach(item => item.calcPerc(totalIncome));
    }
    
    let _getItemsByType = function(type){
        return data.allItems[type];
    }



    return {
        addItem: _addItem,
        updateBudget: _updateBudget,
        getBudget: _getBudget,
        deleteItem: _deleteItem,
        getItem: _getItem,
        updateItem: _updateItem,
        setCurrentUpdatingItem: _setCurrentUpdatingItem,
        getCurrentUpdatingItem: _getCurrentUpdatingItem,
        resetCurrentUpdatingItem: _resetCurrentUpdatingItem,
        calcPercentages:_calcPercentages,
        getItemsByType:_getItemsByType,
        getAllData:_getAllData
    }


})()


//UI Controller
let UIController = (function (budgetCtrl) {

    let DOMString = {
        type: ".add__type",
        desc: ".add__desc",
        value: ".add__value",
        addBtn: ".add__btn",
        totalInc: ".budget__income--value",
        totalExp: ".budget__expense--value",
        budgetHeader: ".budget__heading__value",
        budgetPerc: ".budget__expense--perc",
        deleteBtn: ".deleteBtn",
        editBtn: ".editBtn",
        incomeItems: ".incomeItems",
        expenseItems: ".expenseItems",
        itemVal: ".item__valbtn",
        itemContainer: ".itemContainer",
        updatebtn: ".update__btn",
        headerButtons: ".header__btns",
        updateButtonIcon: "#updateItem",
        itemDesc: ".item__desc",
        itemValue: ".item__value",
        undobtn: ".undo__btn",
        expItem:".expItem",
        itemExpPerc:".item__expense--perc",
        budgetDate:".budget__date",
        headerBtn:".headerBtn"
    }

    let _getInput = function () {
        let inputObj = {
            type: document.querySelector(DOMString.type).value,
            desc: document.querySelector(DOMString.desc).value,
            value: parseFloat(document.querySelector(DOMString.value).value),
        }
        return inputObj;
    }

    let _clearFields = function () {
        let fields = document.querySelectorAll(DOMString.desc + ',' + DOMString.value);
        //convert list into Array
        fields = Array.prototype.slice.call(fields);
        // You can do that by fields = Array.from(fields);
        fields.forEach(field => {
            field.value = "";
        });
        fields[0].focus()
    }

    let _formatNumber = function(number,type){
        number = number.toFixed(2);

        let splittedNum = number.split(".");
        let intPart = splittedNum[0];
        let decPart = splittedNum[1];
        if(intPart.length > 3){
            intPart = intPart.substr(0,intPart.length - 3) + "," + intPart.substr(intPart.length - 3,intPart.length)
        }
        number = intPart + "." + decPart;
        if(type == "inc"){
            number = "+"+number;
        }else if(type == "exp"){
            number = "-"+number; 
        }
        return number;
    }

    let _addItemToUI = function (obj, type) {
        let html;
        let htmlContainer = "";
        if (type === "inc") {
            html = `<div class="add__item" id="inc-${obj.id}"> 
                   <span class="item__desc">${obj.desc}</span>
                   <div class="item__valbtn">
                           <span class="item__value">${_formatNumber(obj.value,type)}</span>
                            <button class="btn deleteBtn">
                                <ion-icon id="delete" name="close-circle-outline"></ion-icon>
                            </button>
                            <button class="btn editBtn">
                                <ion-icon id="edit" name="create"></ion-icon>
                            </button>
                   </div>
               </div>`
            htmlContainer = document.querySelector(DOMString.incomeItems)
        } else {
            html = `<div class="add__item expItem" id="exp-${obj.id}">
                            <span class="item__desc">${obj.desc}</span>
                            <div class="item__valbtn">
                                    <span class="item__value">${_formatNumber(obj.value,type)}</span>
                                    <span class="item__expense--perc">${obj.expPerc}</span>
                                    <button class="btn deleteBtn">
                                        <ion-icon id="delete" name="close-circle-outline"></ion-icon>
                                    </button>
                                    <button class="btn editBtn">
                                        <ion-icon id="edit" name="create"></ion-icon>
                                    </button>
                            </div>
                    </div>`
            htmlContainer = document.querySelector(DOMString.expenseItems)
        }
        htmlContainer.insertAdjacentHTML("beforeend", html)
    }

    let _updateBudgetToUI = function (obj) {
        document.querySelector(DOMString.totalInc).textContent = "+" + obj.incTotal;
        document.querySelector(DOMString.totalExp).textContent = "-" + obj.expTotal;
        document.querySelector(DOMString.budgetHeader).textContent = obj.budget > 0 ? "+" + obj.budget : obj.budget;
        document.querySelector(DOMString.budgetPerc).textContent = obj.budgetPerc + "%";
    }
    let _deleteItem = function (id) {
        let elem = document.querySelector('#' + id);
        elem.parentNode.removeChild(elem)
    }

    let _updateInput = function (id, type) {
        let item = budgetCtrl.getItem(id, type);
        if (item) {
            document.querySelector(DOMString.type).value = type
            document.querySelector(DOMString.desc).value = item.desc;
            document.querySelector(DOMString.value).value = item.value
        }
    }
    let _disableItem = function (item) {
        item.classList.add("disabled");
    }
    let _enableAllItems = function () {
        let disableItems = document.querySelectorAll('.disabled')
        if (disableItems && disableItems.length > 0) {
            disableItems = Array.from(disableItems);
            disableItems.forEach(item => item.classList.remove("disabled"));
        }
    }
    let _showUpdateBtns = function (id) {
        document.querySelector(DOMString.updatebtn).style.display = 'initial';
        document.querySelector(DOMString.undobtn).style.display = 'initial';
        document.querySelector(DOMString.addBtn).style.display = 'none';
    }
    let _hideUpdateBtns = function (id) {
        document.querySelector(DOMString.updatebtn).style.display = 'none';
        document.querySelector(DOMString.undobtn).style.display = 'none';
        document.querySelector(DOMString.addBtn).style.display = 'initial';
    }

    let _updateItem = function (itemId, input) {
        if (itemId) {
            let item = document.querySelector("#" + itemId);
            let type = itemId.split("-")[0];
            if (item) {
                document.querySelector(DOMString.itemDesc).textContent = input.desc;
                document.querySelector(DOMString.itemValue).textContent = _formatNumber(input.value,type);
            }
        }
    }

    let _updatePerc = function(expItems){
        if(expItems.length > 0){
            expItems.forEach(item=>{
                let itemId = "exp-"+item.id;
                let domItem = document.querySelector("#"+itemId + " " + DOMString.itemExpPerc);
                domItem.textContent = item.expPerc + "%";
            })
        }
    }

    let _typeChange = function(){
        document.querySelector(DOMString.desc).classList.toggle("exp__inputs");
        document.querySelector(DOMString.value).classList.toggle("exp__inputs");
        document.querySelector(DOMString.type).classList.toggle("exp__inputs");
        document.querySelector(DOMString.addBtn).classList.toggle("red__color")
     }
    return {
        DOMString: DOMString,
        getInput: _getInput,
        addItemToUI: _addItemToUI,
        clearFields: _clearFields,
        updateBudgetToUI: _updateBudgetToUI,
        deleteItem: _deleteItem,
        updateInput: _updateInput,
        disableItem: _disableItem,
        enableAllItems: _enableAllItems,
        showUpdateBtns: _showUpdateBtns,
        hideUpdateBtns: _hideUpdateBtns,
        updateItem: _updateItem,
        updatePerc:_updatePerc,
        typeChange:_typeChange
    };


})(budgetController)

//App Controller
let controller = (function (budgetCtrl, UICtrl) {

    function displayMonth(){
        let date = new Date();
        let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        let month = date.getMonth();
        let year = date.getFullYear();

        document.querySelector(UICtrl.DOMString.budgetDate).textContent = months[month].toUpperCase() + " " + year;
    }

    function updateLocalStorage(){
        let data  = budgetCtrl.getAllData();
        this.localStorage.setItem("budgetData",JSON.stringify(data.allItems))
    }

    function getDataFromLocalStorage(key){
        return JSON.parse(this.localStorage.getItem(key));
    }

    function showDataFromLocalStorage(){
        let data = getDataFromLocalStorage("budgetData");
        
        if(data){
            // Here we get all inc and exp items,
            for(let key in data){
                //key will be either inc or exp
                let items = data[key];
                items.forEach(item =>{
                    let input = {
                        type:key,
                        desc:item.desc,
                        value:item.value
                    }
                    addItem(input);
                })
            }
        }
    }


    function addEventListeners() {
        let DOM = UICtrl.DOMString;
        document.querySelector(DOM.headerButtons).addEventListener("click", onHeaderButtonsClick);

        document.addEventListener("keypress", function (event) {
            if (event.keyCode == 13) {
                enterClickEventHandler();
            }
        })
        document.querySelector(DOM.itemContainer).addEventListener("click", onItemClick);

        document.querySelector(DOM.type).addEventListener("change",typeChange);
    }

    function typeChange(event){
        UICtrl.typeChange();
    }

    function enterClickEventHandler() {
        let itemId = budgetCtrl.getCurrentUpdatingItem();
        let input = UICtrl.getInput();
        if (itemId) {
            updateItem(itemId, input)
        } else {
            addItem(input);
        }
    }

    function onHeaderButtonsClick(event) {
        let id = event.target.id;
        let input = UICtrl.getInput();
        if (input.desc !== "" && !isNaN(input.value) && input.value > 0) {
            let itemId = budgetCtrl.getCurrentUpdatingItem();
            if (itemId) {
                if (id == "updateItem") {
                    updateItem(itemId, input);
                } else if (id == "undoItem") {
                    undoItem();
                }
            } else {
                addItem(input)
            }
        } else {
            alert("Please Give Inputs");
        }
    }

    function undoItem(){
        //clear fields
        UICtrl.clearFields();

        //enable all UI items
         UICtrl.enableAllItems();

        // hide update Buttons
        UICtrl.hideUpdateBtns();

        //reset current updating item
        budgetCtrl.resetCurrentUpdatingItem();
    }

    function addItem(input) {
        if (input.desc !== "" && !isNaN(input.value) && input.value > 0) {
            // Add new item to budget controller
            let newItem = budgetCtrl.addItem(input.type, input.desc, input.value);

            //Add new item to UI
            UICtrl.addItemToUI(newItem, input.type);

            //Clear input fields
            UICtrl.clearFields();

            //update Budget
            updateBudget();

            //update perce
            calcPerce();

            //update local storage
            updateLocalStorage();
        } else {
            alert("Please Give Inputs");
        }
    }

    function updateItem(itemId, input) {
        // update budget Ctrl data with updated Data
        budgetCtrl.updateItem(itemId, input);

        //Update UI with updated Data
        UICtrl.updateItem(itemId, input);

        //update Budget
        updateBudget();

        //clear fields
        UICtrl.clearFields();

        //enable all UI items
        UICtrl.enableAllItems();

        // hide update Buttons
        UICtrl.hideUpdateBtns();

        //reset current updating item
        budgetCtrl.resetCurrentUpdatingItem();

        // calculate precenatages
        calcPerce();

        //update local storage
        updateLocalStorage()
    }

    function calcPerce(){

        //calc budget for each exp item
        budgetCtrl.calcPercentages();

        // get all exp items
        let expItems = budgetCtrl.getItemsByType("exp");

        //Update UI
       UICtrl.updatePerc(expItems);
    }

    function updateBudget() {
        //1. Update Budget
        let updateBudget = budgetCtrl.updateBudget()


        //2. Get Budget
        let budget = budgetCtrl.getBudget();


        //3. Update UI with budget 
        UICtrl.updateBudgetToUI(budget);
    }

    function onItemClick(event) {

        let item = event.target.parentNode.parentNode.parentNode;
        let id = item.id;
        if (id) {
            let splittedVal = id.split("-");
            let type = splittedVal[0]
            let ID = splittedVal[1];
            if (event.target.id == "delete") {

                //delete item from budget
                budgetCtrl.deleteItem(id, type);

                //update budget
                updateBudget();

                //delete item from Ui
                UICtrl.deleteItem(id);

                // calculate precenatages
                calcPerce()

                //update local storage
                updateLocalStorage()
            } else if (event.target.id == "edit") {
                //update input with values
                UICtrl.updateInput(ID, type)

                //Enable if any previous disable item
                UICtrl.enableAllItems();

                //disable selected item
                UICtrl.disableItem(item);

                //enable edit buttons on header
                UICtrl.showUpdateBtns(id);

                //store current Updating Item
                budgetCtrl.setCurrentUpdatingItem(id)

            }
        }
    }

    function init() {
        displayMonth();
        showDataFromLocalStorage();
        addEventListeners();
    }

    return {
        init: init
    }
})(budgetController, UIController)

controller.init();