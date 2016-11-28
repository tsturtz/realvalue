angular.module('realValue')

    .controller('navCtrl', function($mdSidenav, $mdDialog){
        var self = this;

        // right sidenav

        self.openRightMenu = function () {
            $mdSidenav('right').toggle();
        };

        // dialog

        setTimeout(self.showAlert = function () {
            console.log('got something');
            alert = $mdDialog.alert()
                .title('WELCOME!')
                .content('RealValue is an intuitive application built to assist you in finding out what a home is really worth. Want to know what resturantes are nearby? Your in the right place. Need crime data and statistics for an area before you buy a new home? Then RealValue can assist you in obtaining that peace of mind. Let us be the first to welcome you to our RealValue community, your one stop shop for area information and statistics in the Orange county area.')
                .ok('Continue');
            $mdDialog
                .show(alert)
                .finally(function() {
                    alert = undefined;
                });
        },50);
    });