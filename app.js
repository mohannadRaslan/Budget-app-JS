var budgetController = (function() {


    var Expense = function(id, description, value){
        this.id = id
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function(id, description, value){
        this.id = id
        this.description = description;
        this.value = value;
    };

    var incomes = [];
    var expenses = [];

    var data = {
        allItems:{
            exp: [],
            inc: []
        },
        totals:{
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(item){
            sum += item.value;
        });
        data.totals[type] = sum;
    };

    return {
        addItem: function(type, desc, val ){
            var newItem, ID;

            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }
            

            if(type === 'inc'){
                newItem= new Income(ID, desc, val)
            }else if (type === 'exp'){
                newItem = new Expense(ID, desc, val)
            }

            data.allItems[type].push(newItem);
 
            return newItem;
        },

        calculateBudget: function(){
            
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;

            data.percentage = data.totals.inc > 0 ? 
            Math.round((data.totals.exp / data.totals.inc) * 100) : -1;
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(curr){
                return curr.getPercentage();
            });
            return allPerc;
        },

        deleteItem: function(typeID){
            data.allItems[typeID[0]] = data.allItems[typeID[0]].filter(function(ele){
                return ele.id !== parseInt(typeID[1]);
            });
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function(){
            console.log(data);
        }
    }

})();


var UIController = (function(){

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        btnAdd: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        totalBudget: '.budget__value',
        incVal: '.budget__income--value',
        expVal: '.budget__expenses--value',
        percentage: '.budget__expenses--percentage',
        container: '.container',
        deleteButton: '.item__delete--btn',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var formateNumber = function(num, type){
        var numSplit, int, dec, sign; 

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];

        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        type == 'exp' ? sign = '-' : sign = '+';

        return sign + '' + int + '.' + dec;
    };

    var nodeListForEach = function (list, callback){
        for(var i=0; i<list.length; i++){
            callback(list[i], i);
        }
    };

    return{
        getInput: function(){
            var type = document.querySelector(DOMStrings.inputType).value;
            var description = document.querySelector(DOMStrings.inputDescription).value;
            var value = parseFloat(document.querySelector(DOMStrings.inputValue).value);

            return {
                type: type,
                description: description,
                value: value
            }
        },

        addListItem: function(obj, type){
            var html, containerClass, element, newHtml;

            if(type === 'inc'){
                containerClass = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === 'exp'){
                containerClass = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formateNumber(obj.value, type));

            element = document.querySelector(containerClass);

            element.insertAdjacentHTML('beforeend', newHtml);         

        },

        deleteListItem: function(itemID){
            var ele;
            ele = document.getElementById(itemID);
            ele.parentNode.removeChild(ele);
        },
        
        clearFields: function(){
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function(current, index, array){
                current.value = '';
            });
            fieldsArray[0].focus();
        },

        budget: function(obj){

            obj.budget > 0? type= 'inc': type= 'exp';
            document.querySelector(DOMStrings.totalBudget).textContent = formateNumber(obj.budget, type);
            document.querySelector(DOMStrings.incVal).textContent = formateNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expVal).textContent = formateNumber(obj.totalExp, 'exp');
            var val = obj.percentage + "%";
            document.querySelector(DOMStrings.percentage).textContent = 
            obj.percentage > 0 ? val: '---' ;
        },
        percentages: function(perceArray){

            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index){
                current.textContent = perceArray[index] > 0 ? 
                perceArray[index] + '%': '---';
            });
        },
        displayMonth: function(){
            var now, year, month;
            now = new Date();

            const monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMStrings.dateLabel).textContent = monthNames[month] + " " + year;
        },
        changedType: function(){
            var fields = document.querySelectorAll(DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            
            nodeListForEach(fields, function(curr){
                curr.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.btnAdd).classList.toggle('red');
        
        },

        getDOMStrings: function(){
            return DOMStrings;
        }
    }
})();


var controller = (function(budgetCtr, UICtrl){

    var setupEventListener = function() {

        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.btnAdd).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
    };

    var ctrlDeleteItem = function(event){
        var itemID, splitID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
            
            splitID = itemID.split('-');

            budgetCtr.deleteItem(splitID);

            UICtrl.deleteListItem(itemID);

            updateBudget();

            updatePercentages();
        }
     };

    var updateBudget = function() {

        budgetCtr.calculateBudget();

        var budget = budgetCtr.getBudget();

        UICtrl.budget(budget);
    };

    var updatePercentages = function(){

        budgetCtr.calculatePercentages();

        var percentages = budgetCtr.getPercentages();

        UICtrl.percentages(percentages);
    };

    var ctrlAddItem = function () {
        var inputs, newItem;
        inputs = UICtrl.getInput();

        if(inputs.description !== "" && !isNaN(inputs.value) && inputs.value > 0){
            newItem = budgetCtr.addItem(inputs.type, inputs.description, inputs.value);
            UICtrl.addListItem(newItem, inputs.type);    
            UICtrl.clearFields();  
        }else{
            swal({
                title: "Inputs Error!",
                text: "Please, check your inputs!",
                icon: "warning",
                button: "Got it!",
              });
        };

        updateBudget();

        updatePercentages();
    };


    return {
        iniit: function(){
            console.log('started');
            UICtrl.displayMonth();
            setupEventListener();
            UICtrl.budget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    }

})(budgetController, UIController);



controller.iniit();