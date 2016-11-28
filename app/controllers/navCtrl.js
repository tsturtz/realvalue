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
                .title('title text')
                .content('content text')
                .ok('Close');
            $mdDialog
                .show(alert)
                .finally(function() {
                    alert = undefined;
                });
        },50);
    });