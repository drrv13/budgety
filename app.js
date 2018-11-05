//Budget controller
var budgetController = (function() {
    var Expence = function(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
  };
    Expence.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    Expence.prototype.getPercentage = function() {
        return this.percentage;
    }
    var Income = function(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    };
    var allExpences = [];
    var allIncomes = [];
    var totalExpences = 0;
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    }
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            
            //create new ID
            if ( data.allItems[type].length > 0   ) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            
            //create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expence(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // push it onto our data structure
            data.allItems[type].push(newItem);
            
            //return new element
            return newItem;
            
        },
        deleteItem: function(type, id) {
            var ids, index;
            // id = 6
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function() {
            //calculate total income and expences
            calculateTotal('exp');
            calculateTotal('inc');
            //calculate the budget: inc - exp
            data.budget = data.totals.inc - data.totals.exp;
            // calculate percentage of income that we spent
            if (data.totals.inc > 0) {
                 data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
           
        },
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
               cur.calcPercentage(data.totals.inc); 
            });
        },
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function() {
            console.log(data);
        }
    }
    
})();




//The UI controller
var UIController = (function() {
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
       var formatNumber = function(num, type) {
            var numSplit, int, dec;
            /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands
            
            2310.456 -> + 2,310.46
            2000 -> + 2,000.00
            */
            num = Math.abs(num);
            num = num.toFixed(2);
            numSplit = num.split('.');
            int = numSplit[0];
            dec = numSplit[1];
            if (int.length > 3){
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
            
        };
      var nodeListForEach = function(list, callback) {
                for(var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };
    return {
        getInput: function() {
            return {
                 type: document.querySelector(DOMStrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
           
        },
        addListItem: function(obj, type) {
            var html, newHtml, element;
            //create html string with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                 html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
           
            
            
            
            
            //replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type)) ;
            
            
            //insert the html into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
        },
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel). textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel). textContent = '---';
            }
            
        },
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
          
            
            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
                
            });
        },
        displayMonth: function() {
            var now, year, month, months;
            now = new Date();
            //var christmas = new Date(2016, 11, 25);
            months = [
                'Январь',
                'Февраль',
                'Март',
                'Апрель',
                'Май',
                'Июнь',
                'Июль',
                'Август',
                'Сентябрь',
                'Октябрь',
                'Ноябрь',
                'Декабрь'
            ];
            month = months[now.getMonth()];
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent =month + ' ' + year;
        },
        changeType: function(){
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' + 
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue);
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },
        getDOMStrings: function() {
            return DOMStrings;
        }
    }
})();






// Global app controller
var controller = (function(budgetCtrl, UICtrl){
    var DOM = UICtrl.getDOMStrings();
    var setupEventListeners = function() {
         document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
    document.addEventListener('keypress', function(event) {
        if(event.keyCode === 13 || event.which === 13) {
            ctrlAddItem();
        }
    });
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };
    var updateBudget = function() {
        //1. calculate the budget
        budgetCtrl.calculateBudget();
        //2. return the budget
        var budget = budgetCtrl.getBudget();
        //3. display the budget on the UI
        UICtrl.displayBudget(budget);
        
        
              
    };
    var updatePercentages = function() {
        // 1. calculate percentages
        budgetCtrl.calculatePercentages();
        // 2. read percentages from the budget controller
        var percentages = 
        budgetCtrl.getPercentages();
        console.log(percentages);
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };
    var ctrlAddItem = function() {
        var input, newItem
        // 1. get the field input data
       input = UICtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2. add the item tothe budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
       
            //3. add the item to the UI
            UICtrl.addListItem(newItem, input.type);
        
            //4. clear the fields
            UIController.clearFields();
        }
       
        
        //5. calculate and update budget
        updateBudget();
        
        //6. update percentages
        updatePercentages();
      
    };
    var ctrlDeleteItem = function(event) {
        var itemId, splitId, type, ID;
       itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemId) {
            splitID = itemId.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            // 2. delete item from the UI
            UICtrl.deleteListItem(itemId);
            // 3. Update and show the new budget
            updateBudget();
            // 4. update percentages
            updatePercentages();
        }
    }  
   return {
       init: function(){
           console.log('app has started');
           UICtrl.displayMonth();
            setupEventListeners();
           UICtrl.displayBudget({
               budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
           });
           
       }
      
   };
    
})(budgetController, UIController);
controller.init();

