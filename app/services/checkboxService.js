angular.module('realValue')

    .service('checkboxService', function () {
        var self = this;

        self.checkboxObj = {};

        self.checkboxObj.list = [];

        self.rating = 0;

        self.updateSelections = function (data) {
            console.log(data.weight);
            self.rating += data.weight;
            console.log('logging the data as it is added to the checkboxService: ', data);
            console.log(self.rating);
            self.checkboxObj.list.push(self.rating);
        };

        //return self.checkboxObj;

    });